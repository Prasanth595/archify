import { createHash } from 'node:crypto';
import { validateSchema } from '../../archify/renderers/shared/validator.mjs';
import { prepareExplainerDiagrams } from '../../archify/explainer/diagrams.mjs';

function reject(code, message) {
  throw Object.assign(new Error(message), { code });
}

// Independently authored ignore-one-node BFS; native edge order breaks hop ties.
export function querySemantic(semantic, { s, t }) {
  const ids = semantic.nodes.map(node => node.id);
  if (s === t) reject('query/same-node', 'Choose two different existing nodes.');
  if (!ids.includes(s) || !ids.includes(t)) reject('query/unknown-node', 'Both node IDs must exist in the complete native graph.');
  const adjacency = new Map(ids.map(id => [id, []]));
  for (const edge of semantic.edges) adjacency.get(edge.from).push(edge);
  function pathAvoiding(ignored) {
    const queue = [s], predecessor = new Map([[s, null]]);
    for (let cursor = 0; cursor < queue.length; cursor++) {
      const current = queue[cursor];
      if (current === t) {
        const nodes = [t], edges = [];
        for (let next = t; next !== s;) {
          const edge = predecessor.get(next);
          edges.push(edge); next = edge.from; nodes.push(next);
        }
        return { nodes: nodes.reverse(), edges: edges.reverse(), hops: edges.length };
      }
      for (const edge of adjacency.get(current)) {
        if (edge.to === ignored || predecessor.has(edge.to)) continue;
        predecessor.set(edge.to, edge); queue.push(edge.to);
      }
    }
    return null;
  }
  const query = { s, t, excludeEndpoints: true, tieBreak: 'native connection order' };
  const baselinePath = pathAvoiding(null);
  if (!baselinePath) return { status: 'unreachable', query, baselinePath: null, requiredInternalNodes: [], nonmandatoryNodes: [], bypassPaths: {} };
  const requiredInternalNodes = [], nonmandatoryNodes = [], bypassPaths = Object.create(null);
  for (const id of ids) {
    if (id === s || id === t) continue;
    const bypass = pathAvoiding(id);
    if (bypass) { nonmandatoryNodes.push(id); bypassPaths[id] = bypass; }
    else requiredInternalNodes.push(id);
  }
  return { status: 'reachable', query, baselinePath, requiredInternalNodes, nonmandatoryNodes, bypassPaths };
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
  return { format: 'mandatory-paths-experiment-v1', input: { sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length },
    semantics: 'Directed topology reachability only; no runtime dependency or failure inference.',
    presentation: { description: 'Complete topology copy: only missing connection IDs are annotated for existing Explainer exact edge targets. Original semantic IDs and keys remain unchanged in this answer.', edgeTargets },
    semantic, ...result };
}

export function makeExplainer(answer, spec) {
  const { s, t } = answer.query;
  const presentationSpec = structuredClone(spec);
  const targets = new Map(answer.presentation.edgeTargets.map(edge => [edge.key, edge.presentationId]));
  for (const [index, edge] of presentationSpec.connections.entries()) if (!edge.id) edge.id = targets.get(String(index));
  const reachable = answer.status === 'reachable';
  const blocks = [
    { type: 'callout', id: 'result', level: 'note', text: reachable
      ? `Required internal nodes: ${answer.requiredInternalNodes.join(', ') || 'none'}. Endpoints ${s} and ${t} are excluded.`
      : `No directed path from ${s} to ${t}. Required-node classification does not apply.` },
    { type: 'diagram', id: 'full-graph', diagramType: 'architecture', spec: presentationSpec }
  ];
  if (reachable && answer.semantic.nodes.length > 2) {
    blocks.push({ type: 'comparison', id: 'node-results', labelColumn: 'Internal node', columns: ['Answer', 'Evidence'], rows:
      answer.semantic.nodes.filter(node => node.id !== s && node.id !== t).map((node, index) => {
        const bypass = Object.hasOwn(answer.bypassPaths, node.id) ? answer.bypassPaths[node.id] : null;
        return { id: `node-${index}`, label: node.id, cells: [
          { text: bypass ? 'Nonmandatory' : 'Required' },
          { text: bypass ? `Avoiding it: ${bypass.nodes.join(' → ')}` : `Ignoring ${node.id} makes ${t} unreachable from ${s}.` }
        ] };
      }) });
    if (answer.nonmandatoryNodes.length) blocks.push({ type: 'steps', id: 'bypass-witnesses', items: answer.nonmandatoryNodes.map((id, index) => {
      const witness = answer.bypassPaths[id];
      return { id: `bypass-${index}`, text: `Avoid ${id}: ${witness.nodes.join(' → ')}`,
        detail: `${witness.hops} hops. Original edge keys: ${witness.edges.map(edge => edge.key).join(', ')}. Select to inspect this exact bypass.`,
        target: { diagram: 'full-graph', edges: witness.edges.map(edge => targets.get(edge.key)) } };
    }) });
  }
  blocks.push({ type: 'callout', id: 'identity-note', level: 'note', text: 'The complete graph is retained. Only missing connection IDs are annotated for exact selection; answer.json maps original keys and IDs. A nonmandatory node need not lie on any route to the endpoint.' });
  return { schema_version: 1, diagram_type: 'explainer', meta: { id: 'mandatory-paths', title: 'Mandatory paths', locale: 'en', quality_profile: 'standard' },
    answer: { summary: reachable ? `${s} → ${t}: **${answer.requiredInternalNodes.length} required internal nodes**.` : `${s} → ${t}: **unreachable**.`,
      reasons: reachable ? [`Required: ${answer.requiredInternalNodes.join(', ') || 'none'}.`, 'Each nonmandatory node has an exact bypass witness below.'] : ['No directed path exists in the complete authored graph.'],
      scope: 'Directed topology only; no runtime dependency, fault or causality inference. Endpoints excluded. Each bypass minimizes hops, with native connection order breaking ties.' },
    sources: [], panels: [{ id: 'graph-and-results', title: 'Complete graph and inspectable answers', blocks }] };
}
