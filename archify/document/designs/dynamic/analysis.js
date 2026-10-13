
(() => {
  const D=window.DocumentDesign,{main,reading,el,action,svg,reveal,text,chapters,tables,hierarchies,mount,openChapter}=D;
  const workspace=el('section','evidence-workspace');workspace.dataset.experience='coordinate-explorer';workspace.setAttribute('aria-label','信息结构探索');reading.before(workspace);reading.hidden=true;
  const index=el('nav','evidence-index');index.setAttribute('aria-label','原文结构');index.append(el('span','workspace-kicker','SOURCE INDEX / 原文结构'));
  const area=el('div','evidence-area'),heading=el('header','evidence-heading'),title=el('h2'),content=el('div','evidence-view');heading.append(title);workspace.append(index,area);area.append(heading,content);
  const entries=[...tables.filter(table=>table.columns.length&&table.records.length&&table.records.length<=80&&table.records.every(record=>record.label)).map((model,index)=>({kind:'table',tag:'表格 '+String(index+1).padStart(2,'0'),title:model.heading,model})),...hierarchies.filter(model=>model.nodes.length<=18).map((model,index)=>({kind:'tree',tag:'嵌套列表 '+String(index+1).padStart(2,'0'),title:model.heading,model})),...chapters.map((model,index)=>({kind:'chapter',tag:'章节 '+String(index+1).padStart(2,'0'),title:model.title,model,chapterIndex:index}))];
  let selected=0,dispose=()=>{},graph;
  const show=index=>{
    dispose();dispose=()=>{};graph?.finish();graph?.destroy();graph=null;selected=index;const entry=entries[index];title.textContent=entry.title;
    buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));heading.querySelector('button')?.remove();content.replaceChildren();content.dataset.view=entry.kind;
    if(entry.kind==='chapter'){
      const document=el('div','chapter-document analysis-document');content.append(document);const restore=mount(entry.model.chapter,document),cue=D.scrollCue(document);content.append(cue.node);dispose=()=>{cue.destroy();restore();};reveal(document);return;
    }
    action(heading,'查看所在章节 ↗',()=>openChapter(entry.model.chapterIndex),'source-link');
    if(entry.kind==='tree'){graph=D.graph(entry.model);content.append(graph.node);return;}
    plot(entry.model);reveal(content);
  };
  const plot=table=>{
    const controls=el('div','axis-controls');content.append(controls);
    const chooser=(label,value)=>{const wrapper=el('label','axis-choice',label),select=el('select');select.setAttribute('aria-label',label);table.columns.forEach((column,index)=>{const option=el('option','',column.title);option.value=index;select.append(option);});select.value=value;wrapper.append(select);controls.append(wrapper);return select;};
    const horizontal=chooser('X 轴',0),vertical=table.columns.length>1?chooser('Y 轴',1):null;
    if(!vertical)controls.append(el('span','axis-order','纵向位置：原文条目顺序'));
    const chart=el('div','coordinate-plot'),graphic=svg('svg',{role:'img','aria-label':'原始记录坐标图'});chart.append(graphic);content.append(chart);
    const readout=el('div','record-readout');readout.setAttribute('aria-live','polite');content.append(readout);
    const records=el('div','plot-records');records.setAttribute('role','group');records.setAttribute('aria-label',table.headers[0]||'原文条目');content.append(records);
    let activeRow=0,frame=0,positions=null;const buttons=table.records.map((record,index)=>action(records,record.label,()=>pick(index),'plot-record'));
    const pick=index=>{
      activeRow=index;buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
      graphic.querySelectorAll('.coordinate-point').forEach((point,i)=>point.classList.toggle('is-selected',i===index));
      const record=table.records[index];readout.replaceChildren(el('strong','',record.label));record.raw.slice(1).forEach((value,i)=>{const field=el('span','record-field');field.append(el('small','',table.headers[i+1]),el('b','',value));readout.append(field);});
    };
    const extent=values=>{let low=Math.min(0,...values),high=Math.max(0,...values);if(low===high)high=low+1;return {low,high};};
    const draw=()=>{
      cancelAnimationFrame(frame);const target=[];
      const width=Math.max(450,chart.clientWidth),height=390,left=72,right=width-52,top=38,bottom=height-70;
      const xColumn=table.columns[Number(horizontal.value)],yColumn=vertical?table.columns[Number(vertical.value)]:null;
      const xRange=extent(xColumn.parsed.map(value=>value.value)),yRange=yColumn?extent(yColumn.parsed.map(value=>value.value)):{low:0,high:Math.max(1,table.records.length-1)};
      const x=value=>left+(value-xRange.low)/(xRange.high-xRange.low)*(right-left),y=value=>bottom-(value-yRange.low)/(yRange.high-yRange.low)*(bottom-top);
      graphic.replaceChildren();graphic.setAttribute('viewBox','0 0 '+width+' '+height);
      for(let i=0;i<5;i++){
        const xv=xRange.low+(xRange.high-xRange.low)*i/4,yv=yRange.low+(yRange.high-yRange.low)*i/4;
        graphic.append(svg('line',{x1:x(xv),x2:x(xv),y1:top,y2:bottom,class:'coordinate-grid'}),svg('text',{x:x(xv),y:bottom+27,'text-anchor':'middle',class:'coordinate-label'},new Intl.NumberFormat('zh-CN',{maximumSignificantDigits:4}).format(xv)));
        if(yColumn)graphic.append(svg('line',{x1:left,x2:right,y1:y(yv),y2:y(yv),class:'coordinate-grid'}),svg('text',{x:left-15,y:y(yv)+4,'text-anchor':'end',class:'coordinate-label'},new Intl.NumberFormat('zh-CN',{maximumSignificantDigits:4}).format(yv)));
      }
      graphic.append(svg('text',{x:right,y:height-12,'text-anchor':'end',class:'coordinate-axis-title'},xColumn.title),svg('text',{x:left,y:19,class:'coordinate-axis-title'},yColumn?yColumn.title:'原文条目顺序'));
      table.records.forEach((record,index)=>{
        const px=x(record.values[Number(horizontal.value)].value),py=y(yColumn?record.values[Number(vertical.value)].value:index);
        target.push({x:px,y:py});const point=svg('g',{class:'coordinate-point',tabindex:0,role:'button','aria-label':record.label+'；'+record.raw.slice(1).join('；'),'data-label':record.label,'data-x':record.values[Number(horizontal.value)].value,'data-y':yColumn?record.values[Number(vertical.value)].value:index});point.style.transform='translate('+px+'px,'+py+'px)';
        point.append(svg('circle',{r:19,class:'coordinate-halo'}),svg('circle',{r:6,class:'coordinate-dot'}),svg('text',{x:12,y:-13,class:'coordinate-record-label'},record.label),svg('title',{},record.label));
        point.addEventListener('click',()=>pick(index));point.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();pick(index);}});graphic.append(point);
      });pick(activeRow);
      const marks=[...graphic.querySelectorAll('.coordinate-point')],from=positions||target,start=performance.now();const paint=now=>{const t=D.root.dataset.motion==='still'||document.hidden?1:Math.min(1,(now-start)/650),progress=1-(1-t)**3;positions=target.map((point,i)=>({x:from[i].x+(point.x-from[i].x)*progress,y:from[i].y+(point.y-from[i].y)*progress}));marks.forEach((mark,i)=>mark.style.transform='translate('+positions[i].x+'px,'+positions[i].y+'px)');if(t<1)frame=requestAnimationFrame(paint);};paint(positions?start+1:start+650);
    };
    horizontal.onchange=draw;if(vertical)vertical.onchange=draw;draw();const resize=new ResizeObserver(draw);resize.observe(chart);dispose=()=>{cancelAnimationFrame(frame);resize.disconnect();};
  };
  const buttons=entries.map((entry,index)=>{const button=action(workspace.querySelector('.evidence-index'),'',()=>show(index),'index-entry');button.append(el('small','',entry.tag),el('span','',entry.title));return button;});
  show(0);
})();
