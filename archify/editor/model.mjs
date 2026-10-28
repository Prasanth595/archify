import { parse, serializeOuter } from '../story/vendor/html-parser.mjs';
import { captureWorkflowLayout } from '../renderers/workflow/workflow-migration-geometry.mjs';
import { segmentIntersectsRect, properSegmentIntersection } from '../renderers/shared/geometry.mjs';

const collections = { architecture: 'connections', workflow: 'edges', dataflow: 'flows', class: 'relationships', erd: 'relationships' };
const attr = (node, name) => node.attrs?.find(a => a.name === name)?.value;
const walk = node => [node, ...(node.childNodes || []).flatMap(walk)];
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const rect = node => {
  const box = Object.fromEntries(['x','y','width','height'].map(k => [k, Number(attr(node, k))]));
  if (!Object.values(box).every(Number.isFinite)) throw Error('A rendered box has no finite geometry.');
  return box;
};
const text = node => (node.childNodes || []).map(n => n.value || text(n)).join('');

export function editableCollection(type) {
  if (!collections[type]) throw Error(`Connection adjustment is not supported for ${type}.`);
  return collections[type];
}

export function readEditScene(html) {
  const all = walk(parse(String(html)));
  const diagrams = all.filter(n => n.tagName === 'svg' && attr(n, 'data-quality-profile'));
  if (diagrams.length !== 1) throw Error('Connection adjustment requires one native diagram.');
  const svg = diagrams[0], elements = walk(svg);
  const nodes = elements.filter(n => attr(n, 'data-node-id')).map(n => {
    const box = walk(n).find(child => child.tagName === 'rect');
    if (!box) throw Error('A node has no editable rectangle.');
    return { id: attr(n, 'data-node-id'), label:attr(n,'data-node-label')||attr(n,'data-node-id'), box: rect(box) };
  });
  const frames = elements.filter(n => attr(n, 'data-composition-frame-id')).flatMap(n => {
    const id = attr(n, 'data-composition-frame-kind') + ':' + attr(n, 'data-composition-frame-id');
    if (n.tagName === 'rect') return [{ id, role: 'box', box: rect(n) }];
    if (n.tagName === 'text') return [{ id, role: 'label', x: attr(n,'x') || null, y: attr(n,'y') || null, transform: attr(n,'transform') || null, text: text(n) }];
    return [];
  });
  const edges = [], auxiliaryRoutes = [];
  for (const n of elements.filter(n => attr(n, 'data-composition-points'))) {
    const key = attr(n, 'data-edge-key');
    const points = attr(n, 'data-composition-points').split(';').map(p => p.split(',').map(Number));
    if (points.some(p => p.length !== 2 || p.some(v => !Number.isFinite(v)))) throw Error('A relationship has no stable geometry.');
    if (!key) { auxiliaryRoutes.push({ points, style: attr(n,'class') || '' }); continue; }
    const duplicate = edges.find(e => e.key === key);
    if (duplicate) { if (!same(duplicate.points, points)) throw Error('Ambiguous relationship geometry.'); continue; }
    const labelNode = elements.find(e => e.tagName === 'g' && attr(e, 'data-edge-key') === key && walk(e).some(c => c.tagName === 'text'));
    const labelRect = labelNode && walk(labelNode).find(e => e.tagName === 'rect');
    const labelText = labelNode && walk(labelNode).find(e => e.tagName === 'text');
    edges.push({ key, id: attr(n, 'data-edge-id') || '', from: attr(n, 'data-edge-from'), to: attr(n, 'data-edge-to'),
      label: attr(n, 'data-edge-label') || '', points, ...(labelRect ? { labelBox: rect(labelRect) } : {}),
      ...(labelText ? { labelAnchor: [Number(attr(labelText,'x')),Number(attr(labelText,'y'))] } : {}) });
  }
  const titleBoxes=elements.filter(n=>attr(n,'data-graph-role')==='structural-frame-label-mask').map(rect);
  return { nodes, frames, edges, auxiliaryRoutes, titleBoxes, viewBox: attr(svg, 'viewBox') };
}

export function sameNativePage(left, right) {
  function canonical(html) {
    const tree = walk(parse(String(html)));
    const primary = tree.filter(n => n.tagName === 'svg' && attr(n,'data-quality-profile'));
    if (primary.length !== 1) return null;
    primary[0].attrs = primary[0].attrs.filter(a => a.name !== 'data-quality-gates');
    return serializeOuter(tree.find(n => n.tagName === 'html'));
  }
  const first = canonical(left), second = canonical(right);
  return first !== null && first === second;
}

export function appendEditorControls(html, addon) {
  const source = String(html), tree = walk(parse(source, { sourceCodeLocationInfo: true }));
  const at = tree.find(n => n.tagName === 'body')?.sourceCodeLocation?.endTag?.startOffset;
  if (at === undefined) throw Error('The native page has no closing body.');
  return source.slice(0, at) + addon + source.slice(at);
}

function binding(source, type, edge) {
  const collection = editableCollection(type), list = source[collection];
  const matches = list.map((item, index) => ({ item, index })).filter(({ item }) => edge.id
    ? item.id === edge.id
    : item.from === edge.from && item.to === edge.to && (item.label || '') === edge.label);
  if (matches.length !== 1) throw Error('The selected relationship does not map uniquely to the source.');
  return { ...matches[0], collection };
}

function finitePoint(p) { return Array.isArray(p) && p.length === 2 && p.every(v => Number.isFinite(v) && Math.abs(v) <= 1e7); }
function endpointSide(a, b) {
  if (same(a,b)) throw Error('A connection segment must have nonzero length.');
  if (a[0] === b[0]) return b[1] > a[1] ? 'bottom' : 'top';
  if (a[1] === b[1]) return b[0] > a[0] ? 'right' : 'left';
  throw Error('The connection must have orthogonal endpoint segments.');
}

export function applyConnectionEdit(source, type, scene, command) {
  const edge = scene.edges.find(e => e.key === command.key);
  if (!edge) throw Error('Select a current relationship.');
  const next = type === 'workflow' ? captureWorkflowLayout(source) : structuredClone(source);
  const { item } = binding(next, type, edge);
  if (command.field === 'labelAt') {
    if (!edge.label || !finitePoint(edge.labelAnchor) || !finitePoint(command.value)) throw Error('A label position requires two finite coordinates and an existing label.');
    if (item.labelAt || command.pin) {
      item.labelAt = [...command.value];
      for (const field of ['labelDx','labelDy','labelSegment']) delete item[field];
    } else {
      item.labelDx = (item.labelDx || 0) + command.value[0] - edge.labelAnchor[0];
      item.labelDy = (item.labelDy || 0) + command.value[1] - edge.labelAnchor[1];
    }
  } else if (command.field === 'via') {
    const points = command.value;
    if (!Array.isArray(points) || points.length < 2 || points.length > 64 || !points.every(finitePoint)) throw Error('A route requires 2–64 finite points.');
    if (!same(points[0], edge.points[0]) || !same(points.at(-1), edge.points.at(-1))) throw Error('Connection adjustment cannot change endpoint anchors.');
    for (let i = 1; i < points.length; i++) endpointSide(points[i - 1], points[i]);
    for (const field of ['route','channelX','channelY','bias']) delete item[field];
    item.via = points.slice(1, -1).map(p => [...p]);
    item.fromSide = endpointSide(points[0], points[1]);
    item.toSide = endpointSide(points.at(-1), points.at(-2));
  } else throw Error('Only route and label positions can be adjusted.');
  return next;
}

function side(edge, end) {
  const pts = end === 'from' ? edge.points : [...edge.points].reverse();
  if ((pts[0][0] !== pts[1][0] && pts[0][1] !== pts[1][1]) || same(pts[0],pts[1])) return null;
  return endpointSide(pts[0], pts[1]);
}
function sharesPort(a, b) {
  return ['from','to'].some(aEnd => ['from','to'].some(bEnd =>
    a[aEnd] === b[bEnd] && side(a, aEnd) !== null && side(a, aEnd) === side(b, bEnd)));
}
function segments(edge) { return edge.points.slice(1).map((end, i) => ({ start: edge.points[i], end })); }
function routeShape(points) {
  const result = [];
  for (const point of points) {
    if (result.length && same(result.at(-1), point)) continue;
    while (result.length > 1) {
      const a = result.at(-2), b = result.at(-1);
      if (!((a[0] === b[0] && b[0] === point[0] && (b[1]-a[1])*(point[1]-b[1]) >= 0)
        || (a[1] === b[1] && b[1] === point[1] && (b[0]-a[0])*(point[0]-b[0]) >= 0))) break;
      result.pop();
    }
    result.push(point);
  }
  return result;
}
function touches(a, b) {
  if (sharesPort(a, b)) return 'shared-port';
  if (a.labelBox && segments(b).some(segment => segmentIntersectsRect(segment, a.labelBox, 4))) return 'label-clearance';
  for (const segment of segments(a)) {
    if (b.labelBox && segmentIntersectsRect(segment, b.labelBox, 4)) return 'label-clearance';
    for (const other of segments(b)) {
      if (properSegmentIntersection(segment.start, segment.end, other.start, other.end)) return 'route-crossing';
      const box = { x: Math.min(other.start[0], other.end[0]), y: Math.min(other.start[1], other.end[1]),
        width: Math.abs(other.end[0] - other.start[0]), height: Math.abs(other.end[1] - other.start[1]) };
      if (segmentIntersectsRect(segment, box, 8)) return 'shared-corridor';
    }
  }
  return null;
}

export function checkEditScope(source, type, before, after, command) {
  const commands = Array.isArray(command) ? command : [command];
  const additions=commands.filter(c=>c.field==='create');
  if(additions.length){
    const edits=commands.filter(c=>c.field!=='create'),addedKeys=new Set(additions.map(c=>c.key));
    const oldAfter={...after,edges:after.edges.filter(e=>!addedKeys.has(e.key))};
    const result=checkEditScope(source,type,before,oldAfter,edits);
    for(const old of before.edges){const next=oldAfter.edges.find(e=>e.key===old.key);if(!edits.some(c=>c.key===old.key)&&(!same(old.points,next.points)||!same(old.labelBox,next.labelBox)))throw Error('Adding a connection would change an existing route or label.');}
    if(after.edges.length!==before.edges.length+additions.length)throw Error('Unexpected connection count after rebuilding.');
    for(const addition of additions){
      const next=after.edges.find(e=>e.key===addition.key),value=addition.value;
      if(!next||next.id!==value.id||next.from!==value.from||next.to!==value.to||next.label!==value.label||!same(routeShape(next.points),routeShape(value.points)))throw Error('The renderer did not preserve the new connection.');
      if(value.label&&(!next.labelAnchor||next.labelAnchor.some((v,i)=>Math.abs(v-value.labelAt[i])>1e-6)))throw Error('The renderer moved the new label.');
    }
    return {...result,added:additions.map(c=>c.value.id)};
  }
  const selectedKeys = new Set(commands.map(edit => edit.key));
  if (!same(before.nodes, after.nodes) || !same(before.frames, after.frames)) throw Error('This edit would move a node or a structural region. The draft was not accepted.');
  if (!same(before.auxiliaryRoutes || [], after.auxiliaryRoutes || [])) throw Error('This edit would change a shared structural route. Adjustments to shared trunks require their own source binding.');
  if (before.viewBox !== after.viewBox) throw Error('This edit would change the canvas and its display scale. Keep the route inside the existing canvas.');
  if (!same(before.edges.map(e => [e.key,e.id,e.from,e.to,e.label]), after.edges.map(e => [e.key,e.id,e.from,e.to,e.label]))) throw Error('This edit changed the diagram relationships.');
  const [left, top, width, height] = after.viewBox.split(/[ ,]+/).map(Number);
  for (const edit of commands) {
    const selected = after.edges.find(e => e.key === edit.key);
    if (edit.field === 'via') {
      const requested = routeShape(edit.value), rendered = routeShape(selected.points);
      if (requested.length !== rendered.length || requested.some((point,i) => point.some((v,j) => Math.abs(v-rendered[i][j])>1e-6))) throw Error('The native router did not retain the requested route. The draft was not accepted.');
    }
    const label = selected?.labelBox;
    if (label && (label.x < left || label.y < top || label.x + label.width > left + width || label.y + label.height > top + height)) throw Error('Keep the relationship label inside the existing canvas.');
    if (edit.field === 'labelAt') {
      const old = before.edges.find(e => e.key === edit.key);
      if (!commands.some(e => e.key === edit.key && e.field === 'via') && !same(old.points, selected.points)) throw Error('Moving this label would also change its route. The draft was not accepted.');
      if (!selected.labelAnchor || selected.labelAnchor.some((value,i) => Math.abs(value-edit.value[i])>1e-6)) throw Error('The rendered label did not reach the requested position.');
    }
  }
  const nextEdges = new Map(after.edges.map(e => [e.key, e]));
  const changedEdges = before.edges.filter(edge => {
    const next = nextEdges.get(edge.key);
    return !same(edge.points, next.points) || !same(edge.labelBox, next.labelBox);
  });
  const allowed = new Set(selectedKeys), witnesses = [], frontier = [...selectedKeys];
  for (let index = 0; index < frontier.length; index++) {
    const key = frontier[index], prior = before.edges.find(e => e.key === key), next = nextEdges.get(key);
    for (const edge of changedEdges) {
      if (allowed.has(edge.key)) continue;
      const witness = touches(prior, edge) || touches(next, edge);
      if (witness) { allowed.add(edge.key); frontier.push(edge.key); witnesses.push({ key: edge.key, via: key, reason: witness }); }
    }
  }
  const changed = [];
  for (const old of before.edges) {
    const next = nextEdges.get(old.key);
    if (same(old.points, next.points) && same(old.labelBox, next.labelBox)) continue;
    const { item } = binding(source, type, old);
    if (!allowed.has(old.key)) throw Error('The native router changed a relationship outside the visual constraint scope.');
    if (!commands.some(e => e.key === old.key && e.field === 'via') && (item.via || item.channelX !== undefined || item.channelY !== undefined || (item.route && item.route !== 'auto')) && !same(old.points, next.points)) throw Error('This edit would change another authored route.');
    if (!commands.some(e => e.key === old.key && e.field === 'labelAt') && item.labelAt && !same(old.labelBox, next.labelBox)) throw Error('This edit would change another authored label position.');
    changed.push(old.key);
  }
  return { changed, witnesses: witnesses.filter(w => changed.includes(w.key)) };
}
