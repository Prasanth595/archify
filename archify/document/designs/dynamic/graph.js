(() => {
  const {root,el,action,clamp,scrollCue}=window.DocumentDesign;
  window.DocumentDesign.graph = model => {
    const node=el('div','scene-layer');node.dataset.scene='hierarchy';
    const copy=el('div','scene-copy');copy.append(el('div','scene-type','STRUCTURE / 原文层级'),el('h2','','看清每条分支。'),el('div','scene-description',model.heading));
    const status=el('div','scene-status');status.setAttribute('aria-live','polite');
    copy.append(status,el('div','scene-small','点选节点聚焦；再次点选或点击图中空白，回到全图。连线表示原文父子层级。'));
    const graphic=el('div','scene-graphic graph-viewport');graphic.tabIndex=0;graphic.setAttribute('aria-label','原文层级图，可滚动');
    const field=el('div','graph-field');graphic.append(field);node.append(copy,graphic);
    const namespace='http://www.w3.org/2000/svg',svg=document.createElementNS(namespace,'svg');
    svg.setAttribute('class','graph-edges');svg.setAttribute('aria-hidden','true');field.append(svg);
    let frame=0,selected=null,targets=new Map();
    const positions=new Map(model.nodes.map(item=>[item,{x:0,y:0}]));
    const items=new Map(model.nodes.map(item=>{
      const button=action(field,item.label,()=>focus(selected===item?null:item),'graph-node'+(item.parent?'':' is-root'));button.dataset.index=item.index;
      button.setAttribute('aria-label',item.parent?'父条目：'+item.parent.label+'；条目：'+item.label:item.label);
      let edge;if(item.parent){edge=document.createElementNS(namespace,'path');edge.dataset.parent=item.parent.label;edge.dataset.child=item.label;svg.append(edge);}
      return [item,{button,edge}];
    }));
    const paint=()=>{
      model.nodes.forEach(item=>{
        const position=positions.get(item),controls=items.get(item);controls.button.style.transform=`translate(${position.x}px,${position.y}px)`;
        if(controls.edge){
          const parent=positions.get(item.parent),parentButton=items.get(item.parent).button;
          const x1=parent.x+parentButton.offsetWidth,y1=parent.y+parentButton.offsetHeight/2,x2=position.x,y2=position.y+controls.button.offsetHeight/2,middle=(x1+x2)/2;
          controls.edge.setAttribute('d',`M${x1},${y1} C${middle},${y1} ${middle},${y2} ${x2},${y2}`);
        }
      });
    };
    const layout=()=>{
      const depths=new Map();const visit=(item,depth)=>{depths.set(item,depth);item.children.forEach(child=>visit(child,depth+1));};model.roots.forEach(item=>visit(item,0));
      const columns=Math.max(...depths.values())+1,gap=56,padding=20;
      const width=Math.max(graphic.clientWidth,columns*190+(columns-1)*gap+padding*2);
      const cardWidth=Math.min(280,(width-padding*2-(columns-1)*gap)/columns),span=new Map();
      model.nodes.forEach(item=>{items.get(item).button.style.width=cardWidth+'px';});
      // 每个子树独占连续的纵向空间，避免不同分支的连线穿插。
      const measure=item=>{const height=items.get(item).button.offsetHeight;const value=Math.max(height,item.children.reduce((sum,child)=>sum+measure(child),0)+Math.max(0,item.children.length-1)*14);span.set(item,value);return value;};
      const total=model.roots.reduce((sum,item)=>sum+measure(item),0)+Math.max(0,model.roots.length-1)*30;
      const height=Math.max(graphic.clientHeight,total+padding*2);field.style.width=width+'px';field.style.height=height+'px';svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
      targets=new Map();const usedWidth=columns*cardWidth+(columns-1)*gap;
      const place=(item,top)=>{
        targets.set(item,{x:(width-usedWidth)/2+depths.get(item)*(cardWidth+gap),y:top+(span.get(item)-items.get(item).button.offsetHeight)/2});
        let childTop=top;item.children.forEach(child=>{place(child,childTop);childTop+=span.get(child)+14;});
      };
      let top=(height-total)/2;model.roots.forEach(item=>{place(item,top);top+=span.get(item)+30;});
    };
    const finish=()=>{cancelAnimationFrame(frame);frame=0;targets.forEach((point,item)=>positions.set(item,{...point}));paint();};
    const focus=item=>{
      selected=item;const related=new Set();const descend=item=>{related.add(item);item.children.forEach(descend);};
      if(item){descend(item);for(let parent=item.parent;parent;parent=parent.parent)related.add(parent);}
      const path=[];for(let parent=item;parent;parent=parent.parent)path.unshift(parent.label);
      status.textContent=item?'路径：'+path.join(' › '):model.roots.length+' 条分支 · '+model.nodes.length+' 个原文条目';
      model.nodes.forEach(record=>{
        const controls=items.get(record);controls.button.classList.toggle('is-muted',!!item&&!related.has(record));controls.button.classList.toggle('is-selected',record===item);controls.button.setAttribute('aria-pressed',String(record===item));
        if(controls.edge){controls.edge.classList.toggle('is-muted',!!item&&!related.has(record));controls.edge.classList.toggle('is-related',!!item&&related.has(record));}
      });
      if(item&&root.dataset.motion!=='still')items.get(item).button.animate([{background:'#edf3fc'},{background:'#fff'}],{duration:550});
    };
    graphic.addEventListener('click',event=>{if(!event.target.closest('.graph-node'))focus(null);});
    graphic.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();focus(null);}});
    const redraw=()=>{
      cancelAnimationFrame(frame);layout();
      if(root.dataset.motion==='still'){finish();return;}
      const from=new Map([...positions].map(([item,point])=>[item,{...point}])),start=performance.now();
      const tick=now=>{const t=clamp((now-start)/600),progress=1-(1-t)**3;targets.forEach((point,item)=>{const before=from.get(item);positions.set(item,{x:before.x+(point.x-before.x)*progress,y:before.y+(point.y-before.y)*progress});});paint();if(t<1)frame=requestAnimationFrame(tick);else frame=0;};
      frame=requestAnimationFrame(tick);
    };
    const resize=new ResizeObserver(redraw);resize.observe(graphic);
    const cue=scrollCue(graphic);cue.node.classList.add('graph-scroll-cue');node.append(cue.node);
    focus(null);
    return {node,finish,destroy:()=>{cancelAnimationFrame(frame);resize.disconnect();cue.destroy();}};
  };
})();
