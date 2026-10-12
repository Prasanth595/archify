// Hierarchy renderer: a single-parent tree with progressive expand/collapse.
// Reads `diagram_type: "hierarchy"` JSON, validates the parent/child graph,
// and emits the standard viewer head/foot wrapper around an interactive SVG.
//
// Interactive behaviour ships inline as an IIFE inside the SVG: every
// branch button owns its subtree via `data-node-id`, and the helpers below
// carry `data-hierarchy-subtree` / `data-hierarchy-open` attributes that
// the script toggles to animate `max-height`. Keyboard focus moves back to
// the parent's button when a subtree collapses with focus inside it; the
// top-level expand/collapse tool pair is gated by `meta.allow_view_all`.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { esc, renderDefinitions } from '../shared/utils.mjs';
import { loadDiagramWithBrandMarks, svgAccessibleText, svgRootAttrs, writeDiagram } from '../shared/cli.mjs';
import { throwDiagnosticProblems } from '../shared/diagnostics.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { diagram: hierarchy, template, outPath, sourceEvidence } = await loadDiagramWithBrandMarks({
  rendererDir: __dirname,
  diagramType: 'hierarchy',
  defaultExample: 'hierarchy-simple.json',
});

const AUTHORED_VIEW_BOX = Array.isArray(hierarchy.meta?.viewBox) && hierarchy.meta.viewBox.length === 2
  ? hierarchy.meta.viewBox.slice()
  : null;
const DEFAULT_VIEW_BOX = [960, 640];

// Layout constants mirror the other renderers' rhythm: a fixed node height,
// a repeated level pitch for vertical breathing room, and a per-leaf slot
// that scales against the authored canvas.
const LAYOUT = {
  nodeHeight: 64,
  descriptionExtraHeight: 30,
  levelPitch: 132,
  rootTop: 64,
  sidePad: 32,
  minLeafWidth: 196,
  maxLeafWidth: 260,
};

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

// Build the id-keyed node map. Returns the node table plus any
// duplicate-id problems collected during the index pass; the validator
// below surfaces them.
function indexNodes() {
  const byId = new Map();
  const dupProblems = [];
  for (const raw of asArray(hierarchy.nodes)) {
    if (byId.has(raw.id)) {
      dupProblems.push(`Duplicate node id "${raw.id}".`);
      continue;
    }
    byId.set(raw.id, {
      id: raw.id,
      label: raw.label,
      description: raw.description,
      sources: raw.sources,
      icon: raw.icon,
      parent: raw.parent === null ? null : raw.parent,
      children: [],
    });
  }
  return { byId, dupProblems };
}

// Validate the parent graph: root existence, the exactly-one-null-parent
// invariant tied to meta.root, dangling parent refs, default_expand ids,
// and cycle detection across the parent pointer chain.
function validateHierarchy({ byId, dupProblems }) {
  const problems = [...dupProblems];
  if (!byId.has(hierarchy.root)) {
    problems.push(`meta.root "${hierarchy.root}" is not present in nodes[].`);
  }
  const nullParents = [];
  for (const node of byId.values()) {
    if (node.parent === null) {
      nullParents.push(node.id);
    } else if (!byId.has(node.parent)) {
      problems.push(`Node "${node.id}" references unknown parent "${node.parent}".`);
    }
  }
  if (nullParents.length === 0) {
    problems.push(`No node has parent: null — the root ("${hierarchy.root}") must declare parent: null.`);
  } else if (nullParents.length > 1) {
    problems.push(`Multiple nodes claim parent: null (${nullParents.map((id) => JSON.stringify(id)).join(', ')}). Exactly one (the meta.root) may.`);
  } else if (nullParents[0] !== hierarchy.root) {
    problems.push(`Node with parent: null is "${nullParents[0]}", but meta.root is "${hierarchy.root}" — they must agree.`);
  }

  // Cycle detection via three-color DFS — sufficient for a strictly
  // single-parent tree where every node has exactly one parent slot.
  const WHITE = 0, GREY = 1, BLACK = 2;
  const color = new Map();
  for (const id of byId.keys()) color.set(id, WHITE);
  function visit(id, chain) {
    const node = byId.get(id);
    if (!node) return;
    const parentId = node.parent;
    if (parentId === null) {
      color.set(id, BLACK);
      return;
    }
    if (!byId.has(parentId)) return;
    const c = color.get(parentId);
    if (c === GREY) {
      problems.push(`Cycle in parent chain: ${chain.concat(parentId).join(' → ')}.`);
      color.set(id, BLACK);
      return;
    }
    if (c === BLACK) return;
    color.set(parentId, GREY);
    visit(parentId, chain.concat(parentId));
    color.set(parentId, BLACK);
  }
  for (const id of byId.keys()) if (color.get(id) === WHITE) visit(id, [id]);

  for (const id of asArray(hierarchy.default_expand)) {
    if (!byId.has(id)) problems.push(`default_expand references unknown node "${id}".`);
  }

  if (problems.length) {
    throwDiagnosticProblems('Hierarchy layout validation failed', problems, { subject: { diagramType: 'hierarchy' } });
  }
}

// Wire children arrays and sort by label so output is stable regardless of
// authoring order.
function buildChildren(byId) {
  for (const node of byId.values()) {
    if (node.parent && byId.has(node.parent)) {
      byId.get(node.parent).children.push(node);
    }
  }
  for (const node of byId.values()) {
    node.children.sort((a, b) => a.label.localeCompare(b.label));
  }
  return byId.get(hierarchy.root);
}

// Count leaves to size the leaf slot against the canvas.
function countLeaves(node, accumulator) {
  if (!node.children.length) { accumulator.count += 1; return; }
  for (const child of node.children) countLeaves(child, accumulator);
}

function computeSubtreeWidth(node, leafWidth) {
  if (!node.children.length) {
    node.subtreeWidth = leafWidth;
    return leafWidth;
  }
  const childTotal = node.children.reduce((sum, child) => sum + computeSubtreeWidth(child, leafWidth), 0);
  node.subtreeWidth = Math.max(LAYOUT.minLeafWidth, childTotal);
  return node.subtreeWidth;
}

// Layout pass: walk the tree DFS, computing SVG coordinates for every node
// frame. Connectors are emitted by the renderer so they live inside their
// parent's subtree group and hide when the subtree collapses.
function layoutTree(root) {
  const accumulator = { count: 0 };
  countLeaves(root, accumulator);
  const authored = AUTHORED_VIEW_BOX || DEFAULT_VIEW_BOX;
  const usableWidth = authored[0] - LAYOUT.sidePad * 2;
  const leafWidth = Math.max(
    LAYOUT.minLeafWidth,
    Math.min(LAYOUT.maxLeafWidth, Math.floor(usableWidth / Math.max(accumulator.count, 1))),
  );
  computeSubtreeWidth(root, leafWidth);

  const frames = [];
  let maxDepth = 0;
  function walk(node, depth, leftX) {
    const width = node.subtreeWidth || leafWidth;
    const cx = leftX + width / 2;
    const hasChildren = node.children.length > 0;
    const hasDescription = Boolean(node.description);
    const totalHeight = LAYOUT.nodeHeight + (hasDescription ? LAYOUT.descriptionExtraHeight : 0);
    const cy = LAYOUT.rootTop + depth * LAYOUT.levelPitch;
    const frame = {
      id: node.id,
      label: node.label,
      description: node.description,
      sources: node.sources,
      icon: node.icon,
      parent: node.parent,
      hasChildren,
      children: node.children,
      cx,
      cy,
      width,
      height: LAYOUT.nodeHeight,
      descHeight: hasDescription ? LAYOUT.descriptionExtraHeight : 0,
      totalHeight,
      x: cx - width / 2,
      y: cy - totalHeight / 2,
      depth,
    };
    frames.push(frame);
    if (depth > maxDepth) maxDepth = depth;
    let childCursor = leftX;
    for (const child of node.children) {
      const childWidth = child.subtreeWidth || leafWidth;
      walk(child, depth + 1, childCursor);
      childCursor += childWidth;
    }
  }
  walk(root, 0, LAYOUT.sidePad);

  // Expand the working viewBox if the computed tree grows past the
  // authored canvas. Widen to fit the root subtree width; grow the height
  // to fit the deepest level + node footprint + bottom pad.
  const usedWidth = root.subtreeWidth || leafWidth;
  const usedHeight = LAYOUT.rootTop + maxDepth * LAYOUT.levelPitch + LAYOUT.nodeHeight + LAYOUT.sidePad;
  const viewBox = AUTHORED_VIEW_BOX
    ? [Math.max(authored[0], usedWidth + LAYOUT.sidePad * 2), Math.max(authored[1], usedHeight)]
    : [Math.max(DEFAULT_VIEW_BOX[0], usedWidth + LAYOUT.sidePad * 2), Math.max(DEFAULT_VIEW_BOX[1], usedHeight)];

  return { frames, leafWidth, viewBox };
}

// Initial open set: every node in `default_expand` plus the root. The root
// is forced open so the very first paint always shows the top of the tree.
function computeInitialOpen() {
  const set = new Set();
  set.add(hierarchy.root);
  for (const id of asArray(hierarchy.default_expand)) {
    set.add(id);
  }
  return set;
}

function nodeBoxClass(frame) {
  if (frame.parent === null) return 'c-frontend';
  if (frame.hasChildren) return 'c-backend';
  return 'c-cloud';
}

function renderConnector(connector) {
  // Right-angle connector from parent bottom to child top via a short
  // vertical drop, a horizontal pitch, and a vertical rise.
  const dy = Math.max(8, connector.y2 - connector.y1 - 16);
  const midY = connector.y1 + dy / 2;
  const d = `M ${connector.x1} ${connector.y1} L ${connector.x1} ${midY} L ${connector.x2} ${midY} L ${connector.x2} ${connector.y2}`;
  return `        <path d="${d}" class="a-default" fill="none" stroke-width="1.1"/>`;
}

function renderNode(frame) {
  // The chevron is its own focusable button; clicking (or pressing
  // Enter/Space while it has focus) flips the subtree group open/closed.
  const chevronX = frame.cx + frame.width / 2 - 14;
  const chevron = frame.hasChildren
    ? `
          <g class="hierarchy-chevron" data-hierarchy-toggle="${esc(frame.id)}" tabindex="0" role="button" aria-label="Toggle ${esc(frame.label)} subtree" aria-controls="hierarchy-subtree-${esc(frame.id)}" aria-expanded="${frame.initialOpen ? 'true' : 'false'}">
            <circle cx="${chevronX}" cy="${frame.y + 14}" r="9" class="c-mask"/>
            <text x="${chevronX}" y="${frame.y + 18}" font-size="12" text-anchor="middle" class="hierarchy-chevron-icon">${frame.initialOpen ? '−' : '+'}</text>
          </g>`
    : '';
  const description = frame.description
    ? `
          <text x="${frame.cx}" y="${frame.y + frame.height + 22}" class="t-muted" font-size="10" text-anchor="middle">${esc(frame.description)}</text>`
    : '';
  return `        <g id="node-${esc(frame.id)}" data-node-id="${esc(frame.id)}" data-node-label="${esc(frame.label)}" class="hierarchy-node">
          <rect x="${frame.x}" y="${frame.y}" width="${frame.width}" height="${frame.height}" rx="8" class="${nodeBoxClass(frame)}" stroke-width="1.5"/>
          <text x="${frame.cx}" y="${frame.cy + 4}" font-size="12" text-anchor="middle" class="t-default">${esc(frame.label)}</text>${description}${chevron}
        </g>`;
}

function renderSubtreeOpen(frame) {
  if (!frame.hasChildren) return '';
  const open = frame.initialOpen ? 'true' : 'false';
  // Closed-by-default subtrees must hide — the runtime script alone only
  // toggles the boolean on click, so the static HTML needs `display:none`.
  const hidden = frame.initialOpen ? '' : ' style="display:none"';
  return `\n        <g id="hierarchy-subtree-${esc(frame.id)}" data-hierarchy-subtree="${esc(frame.id)}" data-hierarchy-open="${open}"${hidden}>`;
}

function renderSubtreeClose(frame) {
  return frame.hasChildren ? `\n        </g>` : '';
}

function renderToolPair() {
  if (!hierarchy.meta?.allow_view_all) return '';
  const bx = viewBox[0] - LAYOUT.sidePad - 200;
  return `
        <g class="hierarchy-tools" data-hierarchy-tools="all">
          <rect x="${bx}" y="14" width="92" height="22" rx="11" class="c-mask"/>
          <text x="${bx + 46}" y="29" text-anchor="middle" font-size="10" class="t-default" data-hierarchy-expand-all="1" tabindex="0" role="button">Expand all</text>
          <rect x="${bx + 100}" y="14" width="92" height="22" rx="11" class="c-mask"/>
          <text x="${bx + 146}" y="29" text-anchor="middle" font-size="10" class="t-default" data-hierarchy-collapse-all="1" tabindex="0" role="button">Collapse all</text>
        </g>`;
}

// Inline IIFE: behaviour lives inside the SVG so the standalone artifact
// works without any external assets. The script is plain DOM, no
// third-party runtime, no escaping tricks.
function renderScript() {
  return `        <script type="application/ecmascript"><![CDATA[
(function () {
  var prefersReduced = typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function setOpen(subtree, open) {
    if (!subtree) return;
    subtree.setAttribute('data-hierarchy-open', open ? 'true' : 'false');
    var id = subtree.getAttribute('data-hierarchy-subtree');
    var chevron = document.querySelector('[data-hierarchy-toggle="' + id + '"]');
    if (chevron) {
      chevron.setAttribute('aria-expanded', open ? 'true' : 'false');
      var icon = chevron.querySelector('.hierarchy-chevron-icon');
      if (icon) icon.textContent = open ? '−' : '+';
    }
    if (prefersReduced) {
      subtree.style.transition = 'none';
    } else {
      subtree.style.transition = 'none';
      // Force layout so the next transition runs from the current height.
      void subtree.offsetHeight;
      subtree.style.transition = '';
    }
  }
  function descendantFocusInside(subtree) {
    return subtree && subtree.contains(document.activeElement);
  }
  function focusParentToggle(subtreeId) {
    var btn = document.querySelector('[data-hierarchy-toggle="' + subtreeId + '"]');
    if (btn) btn.focus();
  }
  function toggle(subtreeId, force) {
    var subtree = document.getElementById('hierarchy-subtree-' + subtreeId);
    if (!subtree) return;
    var currentOpen = subtree.getAttribute('data-hierarchy-open') === 'true';
    var nextOpen = typeof force === 'boolean' ? force : !currentOpen;
    if (nextOpen === currentOpen) return;
    if (!nextOpen && descendantFocusInside(subtree)) focusParentToggle(subtreeId);
    setOpen(subtree, nextOpen);
  }
  function toggleAll(open) {
    var subs = document.querySelectorAll('[data-hierarchy-subtree]');
    for (var i = 0; i < subs.length; i += 1) toggle(subs[i].getAttribute('data-hierarchy-subtree'), open);
  }
  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!target || !target.closest) return;
    var chevron = target.closest('[data-hierarchy-toggle]');
    if (chevron) {
      event.preventDefault();
      toggle(chevron.getAttribute('data-hierarchy-toggle'));
      return;
    }
    if (target.closest('[data-hierarchy-expand-all]')) {
      event.preventDefault();
      toggleAll(true);
      return;
    }
    if (target.closest('[data-hierarchy-collapse-all]')) {
      event.preventDefault();
      // Move focus OUT of any subtree before mass-collapsing so keyboard
      // readers don't strand focus inside a hidden group.
      var active = document.activeElement;
      var btnTool = document.querySelector('[data-hierarchy-collapse-all]');
      if (active && active !== btnTool && active.closest('[data-hierarchy-subtree]')) {
        if (btnTool) {
          btnTool.focus();
        } else {
          active.blur();
        }
      }
      toggleAll(false);
    }
  });
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    var target = event.target;
    if (!target || !target.closest) return;
    var chevron = target.closest('[data-hierarchy-toggle]');
    if (chevron) {
      event.preventDefault();
      toggle(chevron.getAttribute('data-hierarchy-toggle'));
      return;
    }
    if (target.closest('[data-hierarchy-expand-all]')) {
      event.preventDefault();
      toggleAll(true);
      return;
    }
    if (target.closest('[data-hierarchy-collapse-all]')) {
      event.preventDefault();
      toggleAll(false);
    }
  });
})();
        ]]></script>`;
}

// Render the body of the SVG: root + subtrees + connectors. Walks DFS so
// every subtree group naturally wraps its descendants, and the parent's
// outgoing connectors are emitted inside the parent's subtree group so
// they hide when the subtree collapses.
function renderArt(frames, initialOpen) {
  const byId = new Map(frames.map((frame) => [frame.id, frame]));
  // Pre-decorate each frame with its initial open state once, so the
  // node, chevron, and subtree opener agree.
  for (const frame of frames) {
    frame.initialOpen = initialOpen.has(frame.id);
  }
  function makeParentConnector(parent, child) {
    return {
      x1: parent.cx,
      y1: parent.cy + parent.totalHeight / 2,
      x2: child.cx,
      y2: child.cy - child.height / 2,
    };
  }
  function walk(frame) {
    let art = renderNode(frame);
    if (frame.hasChildren) {
      art += renderSubtreeOpen(frame);
      // Emit parent's outgoing connectors INSIDE the subtree group so
      // they hide together when the subtree collapses.
      const connectors = frame.children.map((child) => makeParentConnector(frame, byId.get(child.id)));
      for (const connector of connectors) {
        art += '\n';
        art += renderConnector(connector);
      }
      art += '\n';
      for (const child of frame.children) {
        const childFrame = byId.get(child.id);
        art += walk(childFrame);
      }
      art += renderSubtreeClose(frame);
    }
    return art;
  }
  const root = byId.get(hierarchy.root);
  return walk(root);
}

function renderSvg({ viewBox, art }) {
  return `      <svg viewBox="0 0 ${viewBox[0]} ${viewBox[1]}" data-reader-fit="intrinsic-height" data-diagram-type="hierarchy"${svgRootAttrs(hierarchy.meta)}>
${svgAccessibleText(hierarchy.meta, 'hierarchy')}
${renderDefinitions()}

        <!-- Background Grid -->
        <rect width="100%" height="100%" fill="url(#grid)" />
${renderToolPair()}

        <!-- Hierarchy (root + subtrees + connectors live inside their groups) -->
${art}
${renderScript()}
      </svg>`;
}

// Boot: validate the JSON, render the SVG, write the HTML artifact.
const indexed = indexNodes();
validateHierarchy(indexed);
const root = buildChildren(indexed.byId);
const initialOpen = computeInitialOpen();
const { frames, viewBox } = layoutTree(root);
const art = renderArt(frames, initialOpen);
const svg = renderSvg({ viewBox, art });

writeDiagram({
  outPath,
  template,
  diagramType: 'hierarchy',
  meta: hierarchy.meta,
  svg,
  cards: hierarchy.cards,
  sourceEvidence,
});
