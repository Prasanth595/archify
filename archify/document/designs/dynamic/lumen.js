(() => {
  const {root,main,reading,reduced,text,el,action,clamp,reveal,chapters,tables,hierarchies,sequences}=window.DocumentDesign;
  const models=[];
  const table=tables.find(table=>table.records.length>=1&&table.records.length<=6&&table.columns.length===2&&table.records.every(record=>record.label&&record.values.every(value=>value.value>=0)));
  if(table)models.push({kind:'comparison',label:'数值',heading:table.heading,sharedScale:table.columns[0].unit===table.columns[1].unit,columns:table.columns,records:table.records.map(record=>({label:record.label,first:record.values[0],second:record.values[1]}))});
  const tree=hierarchies.find(tree=>tree.nodes.length<=18);if(tree)models.push(tree);
  const sequence=sequences.find(sequence=>sequence.records.length>=2&&sequence.records.length<=9);if(sequence)models.push(sequence);
  models.push({kind:'outline',label:'章节',heading:'文档的阅读顺序',records:chapters});
  root.dataset.motion = reduced.matches ? 'still' : 'full';
  const room = el('section','motion-room'); room.setAttribute('aria-label','文档信息空间');
  room.append(el('div','room-marker','EXPLORE THE DOCUMENT'));
  const counter = el('div','room-counter'); room.append(counter);
  const dock = el('nav','glass-dock'); dock.setAttribute('aria-label','切换信息空间'); const lens = el('span','dock-lens'); lens.setAttribute('aria-hidden','true'); dock.append(lens);
  room.append(dock); reading.before(room); reading.hidden=true;
  let current, activeIndex = 0;
  const layoutLens = () => { const button = dock.querySelectorAll('button')[activeIndex]; lens.style.width = button.offsetWidth + 'px'; lens.style.left = button.offsetLeft + 'px'; };
  reduced.addEventListener('change', () => { root.dataset.motion = reduced.matches ? 'still' : 'full'; if(reduced.matches){current?.finish?.();room.getAnimations({subtree:true}).forEach(animation=>animation.finish());} });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)current?.finish?.();});
  window.addEventListener('resize', layoutLens);

  const choices = (parent, records, select) => {
    const list=el('div','choice-list'); list.setAttribute('role','group'); list.setAttribute('aria-label','选择条目'); parent.append(list);
    return records.map((record,index)=>{
      const button=action(list,'',()=>select(index),'choice'); button.dataset.index=index;
      button.append(el('span','choice-number',String(index+1).padStart(2,'0')),el('span','',record.label),el('span','choice-arrow','↗'));
      return button;
    });
  };
  const shell = (model, title) => {
    const node = el('div','scene-layer'); node.dataset.scene = model.kind;
    const copy = el('div','scene-copy'); copy.append(el('div','scene-type', {comparison:model.sharedScale?'COMPARE / 同尺度对照':'METRICS / 独立刻度',hierarchy:'FOCUS / 关系聚焦',sequence:'DEPTH / 步骤走廊',outline:'CHAPTERS / 阅读空间'}[model.kind]),el('h2','',title),el('div','scene-description',model.heading));
    const graphic = el('div','scene-graphic'); graphic.setAttribute('role','group'); graphic.setAttribute('aria-label',model.heading);
    node.append(copy,graphic); return {node,copy,graphic};
  };

  const comparison = model => {
    const scene=shell(model,'每一组，都看清。');
    const sharedMax=Math.max(...model.records.flatMap(record=>[record.first.value,record.second.value]))||1;
    const maxima=model.columns.map(column=>model.sharedScale?sharedMax:Math.max(...column.parsed.map(value=>value.value))||1);
    const field=el('div','comparison-field'), pair=el('div','dial-pair'); field.append(pair); scene.graphic.append(field);
    const namespace='http://www.w3.org/2000/svg', circumference=2*Math.PI*100;
    const dials=model.columns.map((column,index)=>{
      const dial=el('div','metric-dial'); dial.dataset.series=index;
      const svg=document.createElementNS(namespace,'svg');svg.setAttribute('viewBox','0 0 240 240');svg.setAttribute('aria-hidden','true');
      const circle=className=>{
        const node=document.createElementNS(namespace,'circle');node.setAttribute('cx','120');node.setAttribute('cy','120');node.setAttribute('r','100');node.setAttribute('class',className);node.setAttribute('transform','rotate(135 120 120)');svg.append(node);return node;
      };
      circle('dial-track').style.strokeDasharray=circumference*.75+' '+circumference;
      const arc=circle('dial-arc'), center=el('div','dial-center'), value=el('b','dial-value');
      center.append(value,el('span','dial-unit',column.unit));dial.append(svg,center,el('div','dial-heading',column.title));pair.append(dial);
      return {value,arc};
    });
    const scale=el('div','comparison-scale',model.sharedScale?'统一刻度 · 0–'+sharedMax+' '+model.columns[0].unit:'独立刻度 · '+model.columns.map((column,index)=>column.title+' 0–'+maxima[index]+' '+column.unit).join(' / '));field.append(scale);
    const selectedName=el('div','comparison-name');selectedName.setAttribute('aria-live','polite');field.prepend(selectedName);
    const select=index=>{
      const record=model.records[index];selectedName.textContent=record.label;
      buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
      [record.first,record.second].forEach((reading,i)=>{
        dials[i].value.textContent=reading.numeric;
        dials[i].value.style.fontSize=Math.min(76,165/(reading.numeric.length*.62))+'px';
        dials[i].arc.style.strokeDasharray=circumference*.75*reading.value/maxima[i]+' '+circumference;
        dials[i].arc.style.opacity=reading.value===0?'0':'1';
        dials[i].arc.dataset.value=reading.value;
        dials[i].value.setAttribute('aria-label',model.columns[i].title+'：'+reading.raw+' '+(reading.unit?'':model.columns[i].unit));
        reveal(dials[i].value);
      });
    };
    const buttons=choices(scene.copy,model.records,select);
    scene.copy.append(el('div','scene-small','点选一组记录，让对照靠近。'));
    const initial=model.sharedScale?model.records.reduce((best,record,index)=>Math.abs(record.first.value-record.second.value)>Math.abs(model.records[best].first.value-model.records[best].second.value)?index:best,0):0;
    select(initial);return scene;
  };

  const lane = model => {
    const outline=model.kind==='outline',scene=shell(model,outline?'让观点展开。':'一步，再一步。');
    const status=el('div','scene-status');status.setAttribute('aria-live','polite');
    scene.copy.append(status,el('div','scene-small',outline?'点选两侧章节；点中央卡片，阅读全文。':'点选两侧步骤。卡片位置跟随原文次序。'));
    const field=el('div','lane-field'),floor=el('div','lane-ground');floor.setAttribute('aria-hidden','true');field.append(floor);scene.graphic.append(field);
    let position=0,reader,mounted,cue;
    const restore=()=>{
      if(!mounted)return;mounted.home.replaceWith(mounted.chapter);mounted.chapter.hidden=mounted.hidden;mounted=null;
    };
    const closeReader=()=>{
      restore();cue?.destroy();cue=null;reader?.remove();reader=null;scene.node.classList.remove('is-reading');field.inert=false;scene.copy.inert=false;cards[position].focus({preventScroll:true});
    };
    const showChapter=index=>{
      restore();go(index);
      const record=model.records[index],chapter=record.chapter,home=document.createComment('chapter position');
      chapter.before(home);mounted={home,chapter,hidden:chapter.hidden};chapter.hidden=false;
      const body=reader.querySelector('.chapter-document');body.replaceChildren(chapter);body.scrollTop=0;reveal(body);
      reader.querySelector('.chapter-position').textContent=String(index+1).padStart(2,'0')+' / '+String(model.records.length).padStart(2,'0');reader.setAttribute('aria-label',record.title);
    };
    const openReader=index=>{
      if(reader){showChapter(index);return;}
      reader=el('section','chapter-reader');scene.node.append(reader);scene.node.classList.add('is-reading');field.inert=true;scene.copy.inert=true;
      const toolbar=el('div','chapter-toolbar'),back=action(toolbar,'← 返回章节',closeReader,'reader-back');
      const chapterPosition=el('span','chapter-position');chapterPosition.setAttribute('aria-live','polite');toolbar.append(chapterPosition);
      const body=el('div','chapter-document');body.tabIndex=0;body.setAttribute('aria-label','章节正文');reader.append(toolbar,body);showChapter(index);
      cue=window.DocumentDesign.scrollCue(body);reader.append(cue.node);reveal(reader);back.focus();
      reader.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();closeReader();}});
    };
    const select=index=>outline&&index===position?openReader(index):go(index);
    const cards=model.records.map((record,index)=>{
      const button=action(field,'',()=>select(index),'lane-card');button.dataset.index=index;
      button.append(el('span','card-number',String(record.ordinal??index+1).padStart(2,'0')),el('strong','',record.title),el('p','',record.body));
      button.addEventListener('keydown',event=>{
        const target={ArrowLeft:position-1,ArrowRight:position+1,Home:0,End:model.records.length-1}[event.key];
        if(target!==undefined){event.preventDefault();go(target);cards[position].focus({preventScroll:true});}
      });return button;
    });
    const draw=()=>{
      status.textContent=`阅读位置 ${position+1} / ${cards.length}`;
      cards.forEach((card,i)=>{
        const distance=i-position,x=distance*Math.min(255,field.clientWidth*.3),z=-Math.abs(distance)*160,near=Math.abs(distance)<=2;
        card.style.transform=`translate(-50%,-50%) translate3d(${x}px,${Math.abs(distance)*12}px,${z}px) rotateY(${-distance*9}deg)`;
        card.style.opacity=near?String(clamp(1-Math.abs(distance)*.3,.18,1)):'0';card.style.pointerEvents=near?'auto':'none';
        card.style.zIndex=String(cards.length-Math.abs(distance)*100);card.classList.toggle('is-active',i===position);card.setAttribute('aria-pressed',String(i===position));card.tabIndex=i===position?0:-1;
      });
    };
    const go=index=>{position=clamp(index,0,cards.length-1);draw();};
    const resize=new ResizeObserver(draw);resize.observe(field);
    scene.destroy=()=>{restore();cue?.destroy();resize.disconnect();};scene.read=openReader;draw();return scene;
  };
  const enter=index=>{
    current?.finish?.();current?.destroy?.();const old=current?.node;if(old){old.inert=true;old.style.pointerEvents='none';}
    activeIndex=index;const model=models[index];current=model.kind==='comparison'?comparison(model):model.kind==='hierarchy'?window.DocumentDesign.graph(model):lane(model);
    current.node.dataset.active='true';if(old)delete old.dataset.active;room.prepend(current.node);counter.textContent=String(index+1).padStart(2,'0')+' / '+String(models.length).padStart(2,'0');
    dock.querySelectorAll('button').forEach((button,i)=>button.setAttribute('aria-pressed',String(index===i)));layoutLens();
    if(root.dataset.motion==='still'){old?.remove();return;}
    current.node.animate([{opacity:0,transform:'translateY(18px) scale(.98)',filter:'blur(8px)'},{opacity:1,transform:'translateY(0) scale(1)',filter:'blur(0)'}],{duration:650,easing:'cubic-bezier(.2,.8,.2,1)'});
    if(old){const exit=old.animate([{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(.97)'}],{duration:320,easing:'ease-out'});exit.finished.then(()=>old.remove(),()=>old.remove());}
  };
  models.forEach((model,index)=>{const button=action(dock,model.label,()=>enter(index),'');button.dataset.mode=model.kind;});
  const initial=models.findIndex(model=>model.kind===root.dataset.start);enter(initial<0?0:initial);
  main.addEventListener('click',event=>{
    const link=event.target.closest('a[href^="#"]');if(!link||!link.hash)return;
    let target;try{target=document.getElementById(decodeURIComponent(link.hash.slice(1)));}catch{return;}
    const outlineIndex=models.findIndex(model=>model.kind==='outline'), records=models[outlineIndex].records;
    const index=records.findIndex(record=>record.chapter.contains(target));if(index<0)return;
    event.preventDefault();if(activeIndex!==outlineIndex)enter(outlineIndex);current.read(index);
    requestAnimationFrame(()=>target.scrollIntoView({block:'start',behavior:'auto'}));
  });
})();
