// 标注面。点 → 说 → 发。没有模式，没有三级确认。
// 负载是 (身份, 偏移, 性质, 读者的话) —— 不带原文引用。
// 出口三条按可用性降级：
//   ① postMessage 给宿主   —— 有宿主时零人工
//   ② URL 哈希             —— 没宿主时读者复制一次链接
//   ③ 剪贴板               —— 兜底
(function () {
  var bar = document.getElementById('arc-bar');
  var compose = document.getElementById('arc-compose');
  var box = compose.querySelector('textarea');
  var where = compose.querySelector('.where');
  var kinds = compose.querySelector('.kinds');
  var picked = null, pickedAt = null, pickedCell = null, kind = '改它';
  var storeKey = 'arc-notes:' + location.pathname;
  var list = [];
  try { list = JSON.parse(localStorage.getItem(storeKey) || '[]'); } catch (e) { list = []; }

  function el(id) {
    return document.querySelector('[data-src="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]');
  }
  function paint() {
    for (var i = 0; i < list.length; i++) { var e = el(list[i].src); if (e) e.classList.add('arc-marked'); }
    bar.hidden = list.length === 0;
    bar.querySelector('.count').textContent = '已标 ' + list.length + ' 条';
  }
  function publish() {
    var payload = { type: 'arc-annotations', path: location.pathname, notes: list };
    try { parent.postMessage(payload, '*'); } catch (e) {}
    try { localStorage.setItem(storeKey, JSON.stringify(list)); } catch (e) {}
    if (list.length) {
      try { history.replaceState(null, '', '#arc=' + encodeURIComponent(JSON.stringify(list))); } catch (e) {}
    }
    paint();
  }
  window.__arcAnnotations = function () { return list; };

  kinds.addEventListener('click', function (e) {
    if (e.target.tagName !== 'BUTTON') return;
    kind = e.target.textContent;
    Array.prototype.forEach.call(kinds.children, function (b) { b.setAttribute('aria-pressed', String(b === e.target)); });
  });

  function open(x, y, id, at, cell) {
    picked = id; pickedAt = at === undefined ? null : at; pickedCell = cell || null;
    var e = el(id); if (e) e.classList.add('arc-picked');
    where.textContent = id + (cell ? ' [' + cell + ']' : at === null ? '' : ' @' + at);
    compose.style.left = Math.max(8, Math.min(x, innerWidth - 340)) + 'px';
    compose.style.top = (y + scrollY + 14) + 'px';
    compose.classList.add('open');
    box.value = ''; box.focus();
  }
  function close() {
    if (picked) { var e = el(picked); if (e) e.classList.remove('arc-picked'); }
    picked = null; pickedCell = null; compose.classList.remove('open');
  }

  document.addEventListener('click', function (e) {
    if (compose.contains(e.target) || bar.contains(e.target)) return;
    var host = e.target.closest ? e.target.closest('[data-src]') : null;
    if (!host) { close(); return; }
    var id = host.getAttribute('data-src');
    var cell = host.getAttribute('data-cell');
    if (cell) { open(e.pageX, e.pageY, id, null, cell); e.stopPropagation(); return; }
    var at = null;
    var sel = getSelection();
    // 选中半句话就记渲染文字偏移；否则整块（at = null）
    if (sel && !sel.isCollapsed && host.contains(sel.anchorNode)) {
      try {
        var r = document.createRange();
        r.selectNodeContents(host);
        r.setEnd(sel.getRangeAt(0).startContainer, sel.getRangeAt(0).startOffset);
        at = r.toString().length;
      } catch (err) { at = null; }
    }
    open(e.pageX, e.pageY, id, at);
    e.stopPropagation();
  }, true);

  compose.querySelector('[data-act=save]').addEventListener('click', function () {
    if (!picked) return;
    list.push({ src: picked, at: pickedAt, cell: pickedCell, kind: kind, note: box.value.trim() });
    close(); publish();
  });
  compose.querySelector('[data-act=cancel]').addEventListener('click', close);
  bar.querySelector('[data-act=clear]').addEventListener('click', function () {
    list = [];
    Array.prototype.forEach.call(document.querySelectorAll('.arc-marked'), function (e) { e.classList.remove('arc-marked'); });
    publish();
  });
  paint();
})();
