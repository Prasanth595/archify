
(() => {
  const D=window.DocumentDesign,{main,reading,el,action,svg,reveal,chapters,tables,openChapter}=D;
  const desk=el('section','compare-desk');desk.dataset.experience='paired-comparison';desk.setAttribute('aria-label','并排对照');reading.before(desk);reading.hidden=true;
  const usable=tables.filter(table=>table.columns.length&&table.records.length&&table.records.length<=40&&table.records.every(record=>record.label));
  const bar=el('div','compare-toolbar');bar.append(el('span','workspace-kicker','SIDE BY SIDE / 并排对照'));
  const tableSelect=el('select','table-select');tableSelect.setAttribute('aria-label','选择表格');bar.append(tableSelect);desk.append(bar);
  const pair=el('div','compare-pair');desk.append(pair);
  const cards=[0,1].map(side=>{const card=el('article','compare-sheet');const heading=el('div','compare-sheet-heading');heading.append(el('span','sheet-side',side?'B / 右侧':'A / 左侧'));const select=el('select','record-select');select.setAttribute('aria-label',side?'右侧条目':'左侧条目');heading.append(select);const title=el('h2','sheet-title'),body=el('div','sheet-metrics');card.append(heading,title,body);pair.append(card);return {card,select,title,body};});
  const chart=el('div','compare-rail');desk.append(chart);let active=0,metric=0,indices=[0,1],frame=0,positions=null;
  const render=()=>{
    const table=usable[active];
    if(!table){
      tableSelect.hidden=true;chart.hidden=true;
      cards.forEach((card,side)=>{card.select.replaceChildren();chapters.forEach((chapter,index)=>{const option=el('option','',chapter.title);option.value=index;card.select.append(option);});const show=()=>{const index=Number(card.select.value),record=chapters[index];card.title.textContent=record.title;card.body.replaceChildren(el('p','sheet-excerpt',record.body));action(card.body,'进入这一章 ↗',()=>openChapter(index),'source-link');reveal(card.body);};card.select.value=String(Math.min(side,chapters.length-1));card.select.onchange=show;show();});return;
    }
    indices=indices.map(index=>Math.min(index,table.records.length-1));metric=Math.min(metric,table.columns.length-1);
    cards.forEach((card,side)=>{
      card.select.replaceChildren();table.records.forEach((record,index)=>{const option=el('option','',record.label);option.value=index;card.select.append(option);});card.select.value=indices[side];
      card.select.onchange=()=>{indices[side]=Number(card.select.value);draw();};
    });
    chart.replaceChildren();const chartBar=el('div','compare-chart-bar');chartBar.append(el('span','',table.heading));const metricSelect=el('select','metric-select');metricSelect.setAttribute('aria-label','对照指标');table.columns.forEach((column,index)=>{const option=el('option','',column.title);option.value=index;metricSelect.append(option);});metricSelect.value=metric;metricSelect.onchange=()=>{metric=Number(metricSelect.value);draw();};chartBar.append(metricSelect);action(chartBar,'查看所在章节 ↗',()=>openChapter(table.chapterIndex),'source-link');chart.append(chartBar,el('div','compare-axis'));
    draw();
  };
  const draw=()=>{
    cancelAnimationFrame(frame);
    const table=usable[active],column=table.columns[metric];
    cards.forEach((card,side)=>{
      const record=table.records[indices[side]];card.title.textContent=record.label;card.body.replaceChildren();
      table.columns.forEach((column,index)=>{const cell=el('div','sheet-metric'),value=record.values[index];cell.append(el('span','',column.title),el('strong','',value.numeric),el('small','',column.unit));card.body.append(cell);});reveal(card.body);
    });
    const host=chart.querySelector('.compare-axis'),width=Math.max(500,host.clientWidth),height=145;
    let graphic=host.querySelector('svg');if(!graphic){graphic=svg('svg',{role:'img','aria-label':'单项数值对照'});host.append(graphic);}graphic.setAttribute('viewBox','0 0 '+width+' '+height);graphic.replaceChildren();
    const raw=column.parsed.map(value=>value.value),low=Math.min(0,...raw),high=Math.max(0,...raw)||1,left=55,right=width-55,x=value=>left+(value-low)/(high-low||1)*(right-left);
    graphic.append(svg('line',{x1:left,x2:right,y1:75,y2:75,class:'pair-axis-line'}));
    for(const value of new Set([low,(low+high)/2,high])){graphic.append(svg('line',{x1:x(value),x2:x(value),y1:69,y2:81,class:'pair-axis-tick'}),svg('text',{x:x(value),y:130,'text-anchor':'middle',class:'pair-axis-label'},new Intl.NumberFormat('zh-CN',{maximumSignificantDigits:5}).format(value)+' '+column.unit));}
    const points=indices.map(index=>x(table.records[index].values[metric].value)),line=svg('line',{x1:points[0],x2:points[1],y1:75,y2:75,class:'pair-selected-line'});graphic.append(line);
    const marks=indices.map((index,side)=>{const group=svg('g',{class:'pair-point side-'+side,'data-label':table.records[index].label,'data-value':table.records[index].values[metric].value});group.style.transform='translate('+points[side]+'px,75px)';group.append(svg('circle',{r:side?7:9}),svg('text',{x:0,y:side?28:-24,'text-anchor':'middle'},table.records[index].values[metric].raw));graphic.append(group);return group;});
    const from=positions||points,start=performance.now();const paint=now=>{const t=D.root.dataset.motion==='still'||document.hidden?1:Math.min(1,(now-start)/650),progress=1-(1-t)**3;positions=points.map((point,i)=>from[i]+(point-from[i])*progress);marks.forEach((mark,i)=>mark.style.transform='translate('+positions[i]+'px,75px)');line.setAttribute('x1',positions[0]);line.setAttribute('x2',positions[1]);if(t<1)frame=requestAnimationFrame(paint);};paint(positions?start+1:start+650);
  };
  usable.forEach((table,index)=>{const option=el('option','',String(index+1).padStart(2,'0')+' · '+table.heading);option.value=index;tableSelect.append(option);});tableSelect.onchange=()=>{active=Number(tableSelect.value);metric=0;indices=[0,1];render();};render();
  const strip=el('nav','document-strip');strip.setAttribute('aria-label','完整章节');strip.append(el('span','strip-label','DOCUMENT / 完整章节'));chapters.forEach((chapter,index)=>{const button=action(strip,'',()=>openChapter(index),'chapter-tile');button.append(el('span','',String(index+1).padStart(2,'0')),el('strong','',chapter.title));});main.append(strip);
  new ResizeObserver(()=>{if(usable.length)draw();}).observe(desk);
})();
