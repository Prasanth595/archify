(() => {
  const config = JSON.parse(document.querySelector('script[type="application/json"][data-document-options]')?.textContent || '{}');
  if (config.link_previews !== true) return;
  const main = document.querySelector('main'), records = [], byURL = new Map();
  const text = node => node.textContent.replace(/\s+/g, ' ').trim();
  const element = (tag, className, content) => {
    const node = document.createElement(tag); if (className) node.className = className;
    if (content !== undefined) node.textContent = content; return node;
  };
  const typeOf = url => {
    const extension = /\.([a-z0-9]+)$/i.exec(url.pathname)?.[1]?.toLowerCase();
    if (['png','jpg','jpeg','gif','webp','svg','avif','bmp'].includes(extension)) return ['image', '图片'];
    if (['mp4','webm','ogg'].includes(extension)) return ['video', '视频'];
    if (['mp3','wav','m4a','aac','flac','oga'].includes(extension)) return ['audio', '音频'];
    if (['html','htm','txt','json','pdf'].includes(extension)) return ['frame', extension === 'pdf' ? 'PDF' : extension === 'txt' || extension === 'json' ? '文本文件' : 'HTML 文件'];
    if (url.protocol !== 'file:' && !['md','zip','7z','rar','exe','doc','docx','xls','xlsx','ppt','pptx'].includes(extension)) return ['web', '网页'];
    return ['file', '文件'];
  };
  for (const link of main.querySelectorAll('a[href]')) {
    if (link.closest('nav') || link.getAttribute('href').startsWith('#')) continue;
    let url;
    try { url = new URL(link.href); } catch { continue; }
    if (!['http:','https:','file:'].includes(url.protocol)) continue;
    let record = byURL.get(url.href);
    if (!record) {
      const [kind, type] = typeOf(url);
      record = { url, kind, type, label: text(link) || url.href, index: records.length }; records.push(record); byURL.set(url.href, record);
    }
    const button = element('button', 'resource-link-button'); button.type = 'button';
    button.setAttribute('aria-label', '预览：' + (text(link) || url.href)); button.title = '预览链接';
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); icon.setAttribute('viewBox','0 0 20 20'); icon.setAttribute('aria-hidden','true');
    const path = document.createElementNS(icon.namespaceURI, 'path'); path.setAttribute('d','M3 4h14v12H3ZM3 8h14M6 6h.1M8 6h.1'); icon.append(path); button.append(icon);
    button.addEventListener('click', () => open(record, button)); link.after(button);
  }
  if (!records.length) return;
  let panel, picker, stage, heading, location, openLink, note, opener;
  const clear = () => stage?.replaceChildren();
  const showContent = record => {
    clear(); heading.textContent = record.label; location.textContent = record.url.href;
    openLink.href = record.url.href; note.textContent = record.kind === 'web' || record.kind === 'frame' ? '浏览器或目标网站可能不支持内嵌显示，可使用“单独打开”。' : '';
    const load = () => {
      let view;
      if (record.kind === 'image') {
        view = element('img'); view.alt = record.label;
      } else if (record.kind === 'audio' || record.kind === 'video') {
        view = element(record.kind); view.controls = true; view.preload = 'metadata';
      } else {
        view = element('iframe'); view.title = record.label; view.setAttribute('sandbox','allow-scripts'); view.referrerPolicy = 'no-referrer'; view.setAttribute('credentialless','');
      }
      view.addEventListener('error', () => { note.textContent = '资源未能显示，请使用“单独打开”。'; });
      view.src = record.url.href; stage.replaceChildren(view);
    };
    const card = element('div', 'resource-card'); card.append(element('span', 'resource-kind', record.type), element('strong', '', record.label));
    let name = record.url.pathname.split('/').filter(Boolean).at(-1) || record.url.hostname;
    try { name = decodeURIComponent(name); } catch {}
    card.append(element('span', '', record.url.protocol === 'file:' ? name : record.url.hostname));
    if (record.kind === 'web') {
      const button = element('button', 'resource-load', '加载网页视图'); button.type = 'button'; button.addEventListener('click', load); card.append(button); stage.append(card);
    } else if (record.kind === 'file') {
      card.append(element('span', '', '此文件保留链接，可单独打开。')); stage.append(card);
    } else load();
    picker.value = String(record.index);
  };
  const open = (record, button) => {
    opener = button;
    if (!panel) {
      panel = element('dialog', 'resource-preview'); panel.setAttribute('aria-label','资源预览');
      const bar = element('div', 'resource-bar'); bar.append(element('span', '', '资料视图'));
      const close = element('button', 'resource-close', '关闭'); close.type = 'button'; close.addEventListener('click', () => panel.close()); bar.append(close);
      const label = element('label', 'resource-picker'); label.append(document.createTextNode('选择资料'));
      picker = element('select');
      for (const rec of records) { const option = element('option', '', `${rec.type} · ${rec.label}`); option.value = String(rec.index); picker.append(option); }
      picker.addEventListener('change', () => showContent(records[Number(picker.value)])); label.append(picker);
      heading = element('h3'); location = element('div','resource-location');
      openLink = element('a','resource-open','单独打开'); openLink.target = '_blank'; openLink.rel = 'noopener noreferrer';
      stage = element('div','resource-stage'); note = element('p','resource-note');
      panel.append(bar, label, heading, location, openLink, stage, note); document.body.append(panel);
      panel.addEventListener('close', () => { clear(); opener?.focus(); });
      panel.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); panel.close(); } });
    }
    showContent(record); if (!panel.open) panel.show(); picker.focus();
  };
  const launcher = element('button','resource-launcher', `资料视图 · ${records.length}`); launcher.type = 'button';
  launcher.addEventListener('click', () => open(records[0], launcher));
  (document.querySelector('.tools') || document.body).append(launcher);
})();
