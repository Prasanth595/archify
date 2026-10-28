import { createHash } from 'node:crypto';
import { validateSchema } from '../../archify/renderers/shared/validator.mjs';
import { prepareExplainerDiagrams } from '../../archify/explainer/diagrams.mjs';

function reject(code, message) {
  throw Object.assign(new Error(message), { code });
}

// One BFS per seed. Native edge order breaks equal-hop ties reproducibly.
// Upstream traversal is reversed internally; witnesses retain original arrows.
export function querySemantic(semantic, { a, b, direction }) {
  if (!['upstream', 'downstream'].includes(direction)) reject('query/direction', 'Direction must be upstream or downstream.');
  const ids = semantic.nodes.map(node => node.id);
  if (a === b) reject('query/same-node', 'Choose two different existing nodes.');
  if (!ids.includes(a) || !ids.includes(b)) reject('query/unknown-node', 'Both node IDs must exist in the complete native graph.');
  const adjacency = new Map(ids.map(id => [id, []]));
  for (const edge of semantic.edges) adjacency.get(direction === 'upstream' ? edge.to : edge.from).push(edge);
  function visit(seed) {
    const paths = new Map([[seed, { nodes: [seed], edges: [] }]]), queue = [seed];
    for (let cursor = 0; cursor < queue.length; cursor++) {
      const current = queue[cursor];
      for (const edge of adjacency.get(current)) {
        const next = direction === 'upstream' ? edge.from : edge.to;
        if (paths.has(next)) continue;
        const previous = paths.get(current);
        paths.set(next, direction === 'upstream'
          ? { nodes: [next, ...previous.nodes], edges: [edge, ...previous.edges] }
          : { nodes: [...previous.nodes, next], edges: [...previous.edges, edge] });
        queue.push(next);
      }
    }
    paths.delete(a); paths.delete(b); // Origins never count, even through cycles.
    return paths;
  }
  const left = visit(a), right = visit(b);
  const reachableA = ids.filter(id => left.has(id)), reachableB = ids.filter(id => right.has(id));
  const common = reachableA.filter(id => right.has(id));
  const witness = (paths, id) => ({ ...paths.get(id), hops: paths.get(id).edges.length });
  return { query: { a, b, direction, excludeOrigins: true, tieBreak: 'native connection order' }, reachableA, reachableB, common,
    onlyA: reachableA.filter(id => !right.has(id)), onlyB: reachableB.filter(id => !left.has(id)),
    witnesses: common.map(id => ({ node: id, a: witness(left, id), b: witness(right, id) })) };
}

export async function analyzeArchitecture(bytes, query, { baseDir } = {}) {
  let spec;
  try { spec = JSON.parse(bytes.toString('utf8')); } catch { reject('input/json', 'Input must be valid JSON.'); }
  if (spec?.diagram_type !== 'architecture') reject('input/type', 'Input must be a complete native Architecture JSON.');
  if (Array.isArray(spec.connections) && spec.connections.some(edge => edge?.direction !== undefined)) {
    reject('input/unsupported-direction', 'The current native Architecture schema does not support connection.direction (including forward, both and none). Omit direction; traversal uses authored from → to.');
  }
  validateSchema('architecture', spec);
  const expectedIds = spec.connections.map((edge, index) => edge.id || String(index));
  if (new Set(expectedIds).size !== expectedIds.length) reject('input/edge-identity', 'Native semantic edge identities collide (id || key); refusing a partial graph.');
  const prepared = await prepareExplainerDiagrams({ blocks: [{ id: 'full-graph', type: 'diagram', diagramType: 'architecture', spec }] }, { baseDir, quality: 'standard' });
  const entry = prepared.diagrams['full-graph'], semantic = entry.semantic;
  const nodes = new Set(semantic.nodes.map(node => node.id));
  if (nodes.size !== spec.components.length || !spec.components.every(node => nodes.has(node.id))
    || semantic.edges.length !== spec.connections.length
    || !spec.connections.every((edge, index) => semantic.edges.some(actual => actual.key === String(index)
      && actual.id === expectedIds[index] && actual.from === edge.from && actual.to === edge.to))) {
    reject('input/semantic-coverage', 'Native semantic extraction lost or changed authored nodes/edges; refusing a partial graph.');
  }
  const result = querySemantic(semantic, query);
  const usedIds = new Set(spec.connections.map(edge => edge.id).filter(Boolean));
  const edgeTargets = semantic.edges.map(edge => {
    const originalId = spec.connections[Number(edge.key)].id ?? null;
    let presentationId = originalId;
    if (!presentationId) {
      const base = `e-${edge.key}`;
      presentationId = base;
      for (let suffix = 1; usedIds.has(presentationId); suffix++) presentationId = `${base}-${suffix}`;
      usedIds.add(presentationId);
    }
    return { key: edge.key, originalId, semanticId: edge.id, presentationId };
  });
  return { format: 'shared-reach-experiment-v1', status: 'ok', input: { sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length },
    semantics: 'Directed topology reachability only; no runtime dependency or failure inference.',
    presentation: { description: 'Complete topology copy: only missing connection IDs are annotated for existing Explainer exact edge targets. Original semantic IDs and keys remain unchanged in this answer.', edgeTargets },
    semantic, ...result };
}

export function makeExplainer(answer, spec) {
  const { a, b, direction } = answer.query;
  const presentationSpec = structuredClone(spec);
  const targets = new Map(answer.presentation.edgeTargets.map(edge => [edge.key, edge.presentationId]));
  for (const [index, edge] of presentationSpec.connections.entries()) if (!edge.id) edge.id = targets.get(String(index));
  const blocks = [
    { type: 'callout', id: 'identity-note', level: 'note', text: 'Complete input topology, with missing edge IDs annotated only for exact witness selection. All nodes and all relationships are retained. Original input and native HTML remain alongside this page; answer.json maps original edge keys and IDs to these presentation IDs.' },
    { type: 'diagram', id: 'full-graph', diagramType: 'architecture', spec: presentationSpec }
  ];
  if (answer.common.length) {
    blocks.push({ type: 'comparison', id: 'witness-table', labelColumn: 'Common node', columns: [`${a} witness`, `${b} witness`],
      rows: answer.witnesses.map((item, index) => ({ id: `result-${index}`, label: item.node,
        cells: [item.a, item.b].map(witness => ({ text: `${witness.nodes.join(' → ')} (${witness.hops} hops)` })) })) });
    blocks.push({ type: 'steps', id: 'exact-witnesses', items: answer.witnesses.flatMap((item, index) => ['a', 'b'].map(side => {
      const witness = item[side];
      return { id: `path-${index}-${side}`, text: `${item.node}: ${side === 'a' ? a : b} — ${witness.hops} hops`,
        detail: `${witness.nodes.join(' → ')}. Exact native edge keys: ${witness.edges.map(edge => edge.key).join(', ')}. Select to highlight this witness in the complete graph.`,
        target: { diagram: 'full-graph', edges: witness.edges.map(edge => targets.get(edge.key)) } };
    })) });
  } else blocks.push({ type: 'callout', id: 'empty-answer', level: 'note', text: 'Success: no shared reachable nodes after excluding both origins.' });
  return { schema_version: 1, diagram_type: 'explainer', meta: { id: 'shared-reach', title: 'Shared reach', locale: 'en-US', quality_profile: 'standard' },
    answer: { summary: `${a} and ${b} have **${answer.common.length} common ${direction} nodes**.`,
      reasons: [`Common: ${answer.common.join(', ') || 'none'}.`, `Only ${a}: ${answer.onlyA.join(', ') || 'none'}; only ${b}: ${answer.onlyB.join(', ') || 'none'}.`],
      scope: `Directed topology only. Both origins excluded. Each witness minimizes hop count; ties use native connection order. Upstream witnesses preserve original arrows, common node → seed. Input SHA-256: ${answer.input.sha256}. No runtime or failure inference.` },
    sources: [], panels: [{ id: 'graph-and-witnesses', title: 'Complete graph and exact shortest witnesses', blocks }] };
}
