
(() => {
  const root=document.documentElement, main=document.querySelector('main'), reading=document.querySelector('.source-reading');
  const text=node=>node?.textContent.replace(/\s+/g,' ').trim()||'';
  const el=(tag,className,content)=>{const node=document.createElement(tag);if(className)node.className=className;if(content!==undefined)node.textContent=content;return node;};
  const action=(parent,title,callback,className='plain-action')=>{const button=el('button',className,title);button.type='button';button.addEventListener('click',callback);parent.append(button);return button;};
  const svg=(tag,attrs={},content)=>{const node=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [key,value]of Object.entries(attrs))node.setAttribute(key,value);if(content!==undefined)node.textContent=content;return node;};
  const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value));
  const scrollCue=viewport=>{
    const node=el('span','scroll-cue');node.setAttribute('aria-hidden','true');
    viewport.classList.add('scroll-surface');if(!viewport.hasAttribute('tabindex'))viewport.tabIndex=0;
    const update=()=>{
      const down=viewport.scrollHeight-viewport.clientHeight-viewport.scrollTop>2,right=viewport.scrollWidth-viewport.clientWidth-viewport.scrollLeft>2;
      node.hidden=!down&&!right;node.textContent=down?'继续向下 ↓':'更多内容 →';
    };
    const resize=new ResizeObserver(update);
    const watch=()=>{resize.disconnect();resize.observe(viewport);for(const child of viewport.children)resize.observe(child);update();};
    const mutation=new MutationObserver(watch);mutation.observe(viewport,{childList:true});
    viewport.addEventListener('scroll',update,{passive:true});watch();
    return {node,update,destroy:()=>{resize.disconnect();mutation.disconnect();viewport.removeEventListener('scroll',update);node.remove();}};
  };
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');root.dataset.motion=reduced.matches?'still':'full';
  reduced.addEventListener('change',()=>{root.dataset.motion=reduced.matches?'still':'full';});
  const reveal=node=>{if(root.dataset.motion!=='still')node.animate([{opacity:0,transform:'translateY(10px)',filter:'blur(3px)'},{opacity:1,transform:'translateY(0)',filter:'blur(0)'}],{duration:450,easing:'cubic-bezier(.2,.8,.2,1)'});};
  const number=raw=>{const match=/^([+-]?(?:\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?|\.\d+))\s*([%a-zA-Z\u3400-\u9fff]*)$/.exec(raw.replace(/−/g,'-'));if(!match)return null;const value=Number(match[1].replaceAll(',',''));return Number.isFinite(value)?{value,unit:match[2],numeric:match[1],raw}:null;};
  const hero=main.querySelector('.hero');
  if(!hero.querySelector('h1')){
    hero.append(el('h1','',text(reading.querySelector('h1,h2,h3,h4,h5,h6'))||'文档'));
    const opening=reading.querySelector('.source-body > p');if(opening&&!hero.querySelector('p'))hero.append(el('p','hero-summary',text(opening)));
  }
  const introduction=[...hero.children].filter(node=>node.matches('p,pre,table,blockquote,ul,ol,dl,figure,hr,h2,h3,h4,h5,h6'));
  if(!reading.querySelector('.source-chapter')||introduction.length>1||introduction.some(node=>!node.matches('p'))){
    const chapter=el('section','source-chapter'),body=el('div','source-body');chapter.append(el('h2','',text(hero.querySelector('h1'))||'文档开篇'),body);reading.prepend(chapter);
    const summary=introduction.find(node=>node.matches('p'));if(summary)hero.append(el('p','hero-summary',text(summary)));body.append(...introduction);
  }
  const chapters=[...reading.querySelectorAll('.source-chapter')].filter(node=>text(node)).map(chapter=>({title:text(chapter.querySelector('h1,h2,h3,h4,h5,h6'))||'正文',body:text(chapter.querySelector('p')),chapter}));
  if(!chapters.length)chapters.push({title:text(hero.querySelector('h1'))||'正文',body:text(hero.querySelector('p')),chapter:reading});
  const owner=node=>chapters.findIndex(record=>record.chapter.contains(node));
  const sourceHeading=node=>chapters[owner(node)]?.title||text(hero.querySelector('h1'));
  const tables=[...reading.querySelectorAll('table')].map((node,index)=>{
    const headers=[...(node.tHead?.rows[0]?.cells||[])].map(text),rows=[...(node.tBodies[0]?.rows||[])],raw=rows.map(row=>[...row.cells].map(text));
    const columns=headers.slice(1).flatMap((title,i)=>{
      const parsed=raw.map(row=>number(row[i+1]||''));if(!parsed.length||parsed.some(value=>!value)||new Set(parsed.map(value=>value.unit)).size!==1)return [];
      const declared=/[（(]([^()（）]+)[）)]/.exec(title)?.[1]?.trim(),suffix=parsed[0].unit;
      if((!declared&&!suffix)||(declared&&suffix&&declared!==suffix))return [];
      return [{title,unit:declared||suffix,index:i+1,parsed}];
    });
    return {node,index,chapterIndex:owner(node),heading:sourceHeading(node),headers,columns,records:raw.map((row,i)=>({label:row[0]||'',raw:row,values:columns.map(column=>column.parsed[i])}))};
  });
  const ownText=node=>{const copy=node.cloneNode(true);copy.querySelectorAll('ul,ol').forEach(list=>list.remove());return text(copy);};
  const hierarchies=[...reading.querySelectorAll('.source-body > ul')].flatMap(list=>{
    if(!list.querySelector('ul')||list.querySelector('ol'))return [];
    const nodes=[];const visit=(list,parent=null)=>[...list.children].filter(node=>node.tagName==='LI').map(item=>{const node={label:ownText(item),parent,index:nodes.length};nodes.push(node);node.children=[...item.children].filter(node=>node.tagName==='UL').flatMap(child=>visit(child,node));return node;});
    const roots=visit(list);return nodes.some(node=>!node.label)?[]:[{kind:'hierarchy',label:'关系',heading:sourceHeading(list),chapterIndex:owner(list),roots,nodes}];
  });
  const sequences=[...reading.querySelectorAll('.source-body > ol')].flatMap(list=>{
    const items=[...list.children].filter(node=>node.tagName==='LI');if(!items.length||list.querySelector('ul,ol'))return [];
    let ordinal=list.hasAttribute('start')?list.start:list.reversed?items.length:1;
    const records=items.map(item=>{if(item.hasAttribute('value'))ordinal=item.value;const full=text(item),strong=text(item.querySelector('strong')),title=strong&&full.startsWith(strong)?strong:full;const record={title,body:title===full?'':full.slice(title.length).trim(),ordinal};ordinal+=list.reversed?-1:1;return record;});
    return [{kind:'sequence',label:'顺序',heading:sourceHeading(list),chapterIndex:owner(list),records}];
  });
  const mount=(node,host)=>{const home=document.createComment('content position'),hidden=node.hidden;node.before(home);node.hidden=false;host.replaceChildren(node);return ()=>{home.replaceWith(node);node.hidden=hidden;};};
  let dialog,restore,cue,position=0;
  const openChapter=index=>{
    if(!dialog){
      dialog=el('dialog','source-dialog');const bar=el('div','source-dialog-bar');bar.append(el('span','source-dialog-position'));
      action(bar,'←',()=>show(position-1),'source-previous').setAttribute('aria-label','上一章');action(bar,'→',()=>show(position+1),'source-next').setAttribute('aria-label','下一章');action(bar,'关闭 ×',()=>dialog.close(),'source-close');
      dialog.append(bar,el('div','chapter-document source-dialog-body'));document.body.append(dialog);
      cue=scrollCue(dialog.querySelector('.source-dialog-body'));dialog.append(cue.node);
      dialog.addEventListener('close',()=>{restore?.();restore=null;cue.destroy();dialog.remove();dialog=null;});dialog.showModal();
    }
    show(index);
  };
  const show=index=>{
    restore?.();position=clamp(index,0,chapters.length-1);const record=chapters[position],body=dialog.querySelector('.source-dialog-body');restore=mount(record.chapter,body);body.scrollTop=0;dialog.setAttribute('aria-label',record.title);
    dialog.querySelector('.source-dialog-position').textContent=String(position+1).padStart(2,'0')+' / '+String(chapters.length).padStart(2,'0');dialog.querySelector('.source-previous').disabled=position===0;dialog.querySelector('.source-next').disabled=position===chapters.length-1;reveal(body);
  };
  document.addEventListener('click',event=>{
    if(event.defaultPrevented)return;const link=event.target.closest('a[href^="#"]');if(!link?.hash)return;
    let target;try{target=document.getElementById(decodeURIComponent(link.hash.slice(1)));}catch{return;}
    const index=chapters.findIndex(record=>record.chapter.contains(target));if(index<0)return;event.preventDefault();openChapter(index);requestAnimationFrame(()=>target.scrollIntoView({block:'start',behavior:'auto'}));
  });
  window.DocumentDesign={root,main,reading,reduced,text,el,action,svg,clamp,reveal,chapters,tables,hierarchies,sequences,mount,openChapter,scrollCue};
})();
