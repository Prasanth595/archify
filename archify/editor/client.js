(() => {
  'use strict';
  const data = document.getElementById('archify-edit-data');
  if (!data || !window.Archify?.focus) return;
  const state = JSON.parse(data.textContent), root = document.documentElement;
  Object.assign(window.archifyI18nData.messages,state.editorMessages);
  const t=window.viewerText;
  const svg = document.querySelector('.diagram-container svg'), container = svg.closest('.diagram-container');
  let enabled = false, busy = false, drag, releaseMotion, signature = '', frame, savedReload = false, ignoreClick = false, selectedKey = state.selection;
  let history = [structuredClone(state.scene.edges).map(edge=>{
    if(edge.labelAnchor){const binding=nearest(edge.labelAnchor,edge.points);edge.labelBinding={segment:binding.segment,t:binding.t,offset:edge.labelAnchor.map((v,i)=>v-binding.point[i])};}
    return edge;
  })], index = 0;
  const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
  const edges = () => history[index];
  const selected = () => edges().find(e => e.key === selectedKey);
  const element = (tag, text) => {const n=document.createElement(tag);if(text)n.textContent=text;return n;};
  const draftControl=element('div');draftControl.className='connection-draft-control';
  const toggle=element('button',t('editor.draft'));toggle.id='btn-draft';toggle.type='button';toggle.setAttribute('aria-pressed','false');toggle.setAttribute('data-toolbar-control','');
  toggle.setAttribute('aria-controls','connection-draft-panel');toggle.title=t('editor.toggle');
  const panel=element('div');panel.id='connection-draft-panel';panel.className='connection-adjust';panel.hidden=true;
  draftControl.append(toggle,panel);
  document.getElementById('btn-present').before(draftControl);
  const status=element('p');status.className='connection-adjust-status';status.setAttribute('role','status');
  const undo=element('button','↶'),redo=element('button','↷');undo.type=redo.type='button';
  for(const [button,label,key] of [[undo,t('editor.undo'),'Ctrl/Cmd+Z'],[redo,t('editor.redo'),'Ctrl/Cmd+Shift+Z']]) {button.className='connection-draft-history';button.setAttribute('data-toolbar-control','');button.setAttribute('aria-label',label);button.title=label+' ('+key+')';}
  draftControl.insertBefore(undo,panel);draftControl.insertBefore(redo,panel);
  const dismiss=element('button','×');dismiss.type='button';dismiss.className='connection-adjust-dismiss';dismiss.setAttribute('aria-label',t('viewer.common.close'));
  const details=element('details'),summary=element('summary',t('editor.details')),diagnostic=element('pre');details.hidden=true;details.append(summary,diagnostic);
  panel.append(dismiss,status,details);
  const handles=element('div');handles.className='connection-adjust-handles';container.append(handles);
  const nodeHandles=element('div');nodeHandles.className='connection-node-handles';container.append(nodeHandles);
  const preview=document.createElementNS(svg.namespaceURI,'svg');preview.classList.add('connection-create-preview');preview.setAttribute('aria-hidden','true');container.append(preview);
  const createForm=element('form');createForm.className='connection-create-form';createForm.hidden=true;createForm.setAttribute('role','dialog');createForm.setAttribute('aria-label',t('editor.newConnection'));
  const createHeading=element('p'),labelField=element('label',t('editor.label')),labelInput=element('input');labelInput.name='label';labelInput.maxLength=240;labelField.append(labelInput);
  const createButton=element('button',t('editor.create')),cancelButton=element('button',t('editor.cancel'));createButton.type='submit';cancelButton.type='button';createForm.append(createHeading,labelField,createButton,cancelButton);document.body.append(createForm);
  let connectionStart,pendingConnection,hoveredNode,portSignature='';
  const createdViews=new Map();
  const save=element('button');save.type='button';save.setAttribute('role','menuitem');save.tabIndex=-1;
  const copy=element('span');copy.className='export-item-copy';const title=element('strong',t('editor.save'));
  copy.append(title,element('small',t('editor.saveHint')));save.append(copy);
  document.querySelector('#export-menu .export-menu-section').prepend(save);
  const point=(p)=>new DOMPoint(...p).matrixTransform(svg.getScreenCTM());
  const local=e=>new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse());
  const initial=new Map(state.scene.edges.map(e=>[e.key,e]));
  const paths=[...svg.querySelectorAll('[data-edge-key][data-composition-points]')].map(n=>({n,key:n.dataset.edgeKey,d:n.getAttribute('d'),points:n.getAttribute('data-composition-points'),underlay:n.previousElementSibling?.matches('[data-graph-role="automatic-crossover-underlay"]')?n.previousElementSibling:null}));
  const hitPaths=[...svg.querySelectorAll('[data-relationship-hit-key]')].flatMap(target=>[...target.querySelectorAll('path[data-composition-points]')].map(n=>({n,key:target.dataset.relationshipHitKey})));
  const labels=[...svg.querySelectorAll('g[data-edge-key]')].filter(n=>n.querySelector('text')&&initial.get(n.dataset.edgeKey)?.labelAnchor).map(n=>({n,key:n.dataset.edgeKey,transform:n.getAttribute('transform')}));
  for(const {n} of labels)n.classList.add('connection-adjust-label');
  function edits() {
    return edges().flatMap(e=>{
      if(e.created)return [{key:e.key,field:'create',value:{id:e.id,from:e.from,to:e.to,label:e.label,fromSide:e.fromSide,toSide:e.toSide,points:e.points,...(e.label?{labelAt:e.labelAnchor}:{})}}];
      const old=initial.get(e.key),result=[];
      if(!same(e.points,old.points))result.push({key:e.key,field:'via',value:e.points});
      if(e.labelAnchor&&(!same(e.labelAnchor,old.labelAnchor)||result.length))result.push({key:e.key,field:'labelAt',value:e.labelAnchor});
      return result;
    });
  }
  function hint(message, detail='', error=false) {status.textContent=message;status.dataset.error=String(error);details.hidden=!detail;diagnostic.textContent=detail;details.open=false;panel.hidden=!error;}
  function attribute(node,name,value) {
    if(node.getAttribute(name)===value)return;
    if(value===null)node.removeAttribute(name);else node.setAttribute(name,value);
  }
  function paint() {
    syncCreatedViews();
    const current=new Map(edges().map(e=>[e.key,e]));
    for(const item of paths) {
      const e=current.get(item.key),changed=!same(e.points,initial.get(item.key).points);
      const d=changed?e.points.map((p,i)=>`${i?'L':'M'}${p[0]},${p[1]}`).join(' '):item.d;
      attribute(item.n,'d',d);attribute(item.n,'data-composition-points',changed?e.points.map(p=>p.join(',')).join(';'):item.points);
      if(item.underlay)attribute(item.underlay,'d',d);
    }
    for(const item of labels) {
      const from=initial.get(item.key).labelAnchor,to=current.get(item.key).labelAnchor;
      attribute(item.n,'transform',same(from,to)?item.transform:`translate(${to[0]-from[0]} ${to[1]-from[1]}) ${item.transform||''}`);
    }
    for(const item of hitPaths){const e=current.get(item.key);if(!e)continue;const source=paths.find(p=>p.key===item.key);attribute(item.n,'d',source.n.getAttribute('d'));attribute(item.n,'data-composition-points',source.n.getAttribute('data-composition-points'));}
    signature='';sync();
  }
  function sync() {
    for(const item of paths)item.n.classList.toggle('connection-draft-selected',enabled&&item.key===selectedKey);
    toggle.disabled=busy;toggle.textContent=t(busy?'editor.saving':enabled?'editor.draftOn':'editor.draft');toggle.setAttribute('aria-pressed',String(enabled));
    undo.hidden=redo.hidden=!enabled;undo.disabled=busy||!!pendingConnection||!!connectionStart||index===0;redo.disabled=busy||!!pendingConnection||!!connectionStart||index===history.length-1;
    save.disabled=busy||!!pendingConnection||!!connectionStart||!edits().length;title.textContent=t(edits().length?'editor.saveDraft':'editor.save');renderHandles();renderNodePorts();
  }
  function remember(next) {
    for(const edge of next){
      const previous=edges().find(e=>e.key===edge.key);if(same(edge.points,previous?.points))continue;
      const points=[];
      for(const p of edge.points){
        if(points.length&&Math.hypot(p[0]-points.at(-1)[0],p[1]-points.at(-1)[1])<1e-6)continue;
        while(points.length>1){const a=points.at(-2),b=points.at(-1);if(!((a[0]===b[0]&&b[0]===p[0]&&(b[1]-a[1])*(p[1]-b[1])>=0)||(a[1]===b[1]&&b[1]===p[1]&&(b[0]-a[0])*(p[0]-b[0])>=0)))break;points.pop();}
        points.push(p);
      }
      edge.points=points;
      if(edge.labelBinding){const binding=edge.labelBinding,q=nearest(edge.labelAnchor.map((v,i)=>v-binding.offset[i]),points);edge.labelBinding={segment:q.segment,t:q.t,offset:binding.offset};}
    }
    if(same(next,edges()))return;
    history=history.slice(0,index+1);history.push(next);index++;
    hint('Draft updated. Continue editing, then save once.');paint();
  }
  function restore(step){if(busy||drag||pendingConnection||connectionStart||index+step<0||index+step>=history.length)return;index+=step;hint(edits().length?'Draft updated. Changes are not saved.':'Back to the saved version.');paint();}
  function enable(next) {
    enabled=next;
    if(!next)cancelConnection();
    if(next){selectedKey ||= Archify.focus.relationship()?.key;Archify.focus.clear({updateUrl:false});Archify.routeProbe?.clear({updateUrl:false,restoreFocus:false});Archify.semanticLens?.close?.(false);releaseMotion ||= Archify.motionGovernor?.suspend('connection-adjust');root.setAttribute('data-connection-adjust','true');hint('Draft mode. Drag lines or their labels; save when finished.');}
    else{releaseMotion?.();releaseMotion=null;root.removeAttribute('data-connection-adjust');}
    sync();
  }
  async function saveDraft() {
    if(busy||drag||pendingConnection||connectionStart||!edits().length)return;
    busy=true;sync();hint('Generating and checking the complete draft…');
    try {
      const response=await fetch('/edit/save',{method:'POST',headers:{'Content-Type':'application/json','X-Archify-Edit-Token':state.token},body:JSON.stringify({revision:state.revision,key:selected()?.key,edits:edits()})});
      const result=await response.json();
      if(!response.ok){hint(t('editor.saveFailure'),result.details||result.error||'',true);return;}
      history=[structuredClone(result.scene.edges)];index=0;
      savedReload=true;
      location.reload();
    }catch(error){hint(t('editor.saveFailure'),error.message,true);}
    finally{busy=false;sync();}
  }
  toggle.addEventListener('click',e=>{e.stopPropagation();enable(!enabled);});
  dismiss.addEventListener('click',()=>{panel.hidden=true;toggle.focus();});
  document.addEventListener('pointerdown',e=>{ignoreClick=false;if(!panel.hidden&&!panel.contains(e.target))panel.hidden=true;},true);
  function draftTarget(event){return event.target.closest?.('[data-relationship-hit-key], [data-edge-key]');}
  function selectDraft(key){if(!edges().some(e=>e.key===key))return;selectedKey=key;signature='';sync();}
  function inspectCreated(event){
    if(enabled||!event.target.closest?.('[data-draft-connection]'))return false;
    const target=draftTarget(event),key=target?.dataset.relationshipHitKey??target?.dataset.edgeKey;
    if(!key||!Archify.focus.inspectRelationship(key))return false;
    event.preventDefault();event.stopImmediatePropagation();return true;
  }
  window.addEventListener('click',e=>{
    if(ignoreClick){ignoreClick=false;e.preventDefault();e.stopImmediatePropagation();return;}
    if(inspectCreated(e))return;
    if(enabled&&svg.contains(e.target)){if(connectionStart)cancelConnection();const target=draftTarget(e);if(target)selectDraft(target.dataset.relationshipHitKey??target.dataset.edgeKey);e.preventDefault();e.stopImmediatePropagation();}
  },true);
  for(const type of ['pointerover','pointerout','focusin','focusout'])window.addEventListener(type,e=>{if(enabled&&svg.contains(e.target))e.stopPropagation();},true);
  window.addEventListener('keydown',e=>{if(e.isComposing||e.keyCode===229||!['Enter',' '].includes(e.key))return;if(inspectCreated(e))return;if(enabled&&svg.contains(e.target)){const target=draftTarget(e);if(target)selectDraft(target.dataset.relationshipHitKey??target.dataset.edgeKey);e.preventDefault();e.stopImmediatePropagation();}},true);
  undo.addEventListener('click',()=>restore(-1));redo.addEventListener('click',()=>restore(1));
  save.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();Archify.exportMenu.close(false);saveDraft();},true);
  function svgElement(tag,attributes){const n=document.createElementNS(svg.namespaceURI,tag);for(const [key,value] of Object.entries(attributes||{}))n.setAttribute(key,String(value));return n;}
  function syncCreatedViews(){
    const present=new Map(edges().filter(e=>e.created).map(e=>[e.key,e]));
    for(const [key,view] of createdViews)if(!present.has(key)||present.get(key).id!==view.id){view.node.remove();createdViews.delete(key);for(const list of [paths,labels,hitPaths])for(let i=list.length-1;i>=0;i--)if(list[i].created&&list[i].key===key)list.splice(i,1);}
    for(const edge of present.values())if(!createdViews.has(edge.key)){
      const base=edge.base;initial.set(edge.key,base);
      const group=svgElement('g',{'data-draft-connection':edge.id});
      const attrs={'data-edge-key':edge.key,'data-edge-id':edge.id,'data-edge-from':edge.from,'data-edge-to':edge.to,'data-edge-label':edge.label};
      const d=base.points.map((p,i)=>`${i?'L':'M'}${p.join(',')}`).join(' ');
      const line=svgElement('path',{...attrs,d,'data-composition-points':base.points.map(p=>p.join(',')).join(';'),class:'a-default',fill:'none','stroke-width':1.5,'marker-end':'url(#arrowhead)'});
      const hit=svgElement('path',{d,'data-relationship-hit-key':edge.key,'data-relationship-hit-overlay':'',class:'connection-draft-hit',tabindex:0,role:'button','aria-label':t('viewer.passport.relationship.inspect',{index:Number(edge.key)+1,total:edges().length,from:state.scene.nodes.find(n=>n.id===edge.from).label,to:state.scene.nodes.find(n=>n.id===edge.to).label,label:edge.label||t('viewer.passport.relationship.connectsTo')})});group.append(line,hit);
      paths.push({n:line,key:edge.key,d,points:line.getAttribute('data-composition-points'),created:true});hitPaths.push({n:hit,key:edge.key,created:true});
      if(edge.label){const box=base.labelBox,g=svgElement('g',{...attrs,class:'connection-adjust-label'}),mask=svgElement('rect',{x:box.x,y:box.y,width:box.width,height:box.height,rx:3,class:'c-mask'}),text=svgElement('text',{x:base.labelAnchor[0],y:base.labelAnchor[1],class:'t-muted','font-size':8,'text-anchor':'middle'});text.textContent=edge.label;g.append(mask,text);group.append(g);labels.push({n:g,key:edge.key,transform:null,created:true});}
      svg.append(group);createdViews.set(edge.key,{node:group,id:edge.id});
    }
  }
  function availableSides(node){
    const b=node.box;
    return ['left','right','top','bottom'].filter(side=>!edges().some(edge=>['from','to'].some(end=>{if(edge[end]!==node.id)return false;const p=end==='from'?edge.points[0]:edge.points.at(-1);return side==='left'?Math.abs(p[0]-b.x)<1e-6:side==='right'?Math.abs(p[0]-b.x-b.width)<1e-6:side==='top'?Math.abs(p[1]-b.y)<1e-6:Math.abs(p[1]-b.y-b.height)<1e-6;})));
  }
  function nodeAnchor(node,side){const b=node.box;return side==='left'?[b.x,b.y+b.height/2]:side==='right'?[b.x+b.width,b.y+b.height/2]:side==='top'?[b.x+b.width/2,b.y]:[b.x+b.width/2,b.y+b.height];}
  function portButton(node,side){
    const h=element('button');h.type='button';h.className='connection-node-port';h.dataset.nodeId=node.id;h.dataset.side=side;
    h.addEventListener('pointerdown',event=>event.stopPropagation());
    h.addEventListener('click',event=>{
      event.preventDefault();event.stopImmediatePropagation();panel.hidden=true;
      if(connectionStart?.from===node.id&&connectionStart.fromSide===side){cancelConnection();return;}
      if(!connectionStart){connectionStart={from:node.id,fromSide:side};sync();return;}
      pendingConnection={...connectionStart,to:node.id,toSide:side};connectionStart=null;
      const from=state.scene.nodes.find(n=>n.id===pendingConnection.from),p=point(nodeAnchor(node,side));
      createHeading.textContent=from.label+' → '+node.label;labelInput.value='';createForm.hidden=false;
      createForm.style.left=Math.max(16,Math.min(p.x+12,innerWidth-296))+'px';createForm.style.top=Math.max(16,Math.min(p.y+12,innerHeight-190))+'px';sync();labelInput.focus();
    });
    const previewTarget=()=>{
      if(!connectionStart||connectionStart.from===node.id)return;
      const from=state.scene.nodes.find(n=>n.id===connectionStart.from),start=nodeAnchor(from,connectionStart.fromSide),end=nodeAnchor(node,side),box=container.getBoundingClientRect();
      preview.replaceChildren(svgElement('path',{d:[start,[end[0],start[1]],end].map((at,i)=>{const p=point(at);return `${i?'L':'M'}${p.x-box.left},${p.y-box.top}`;}).join(' ')}));
    };
    h.addEventListener('pointerenter',previewTarget);h.addEventListener('focus',previewTarget);
    h.addEventListener('pointerleave',()=>{if(!pendingConnection)preview.replaceChildren();});h.addEventListener('blur',()=>{if(!pendingConnection)preview.replaceChildren();});
    return h;
  }
  function renderNodePorts(){
    const node=state.scene.nodes.find(n=>n.id===hoveredNode),matrix=svg.getScreenCTM(),box=container.getBoundingClientRect();
    const signature=JSON.stringify([enabled,busy,!!pendingConnection,connectionStart,node?.id,edges().map(e=>[e.key,e.points[0],e.points[1],e.points.at(-2),e.points.at(-1)]),matrix&&[matrix.a,matrix.b,matrix.c,matrix.d,matrix.e,matrix.f],box.x,box.y]);
    if(signature===portSignature)return;portSignature=signature;if(!pendingConnection)preview.replaceChildren();
    if(!enabled||!state.canCreate||busy||pendingConnection){nodeHandles.replaceChildren();return;}
    const candidates=connectionStart?[state.scene.nodes.find(n=>n.id===connectionStart.from),...state.scene.nodes.filter(n=>n.id!==connectionStart.from)]:node?[node]:[];
    const ports=candidates.flatMap(candidate=>availableSides(candidate).flatMap(side=>connectionStart?.from===candidate.id&&connectionStart.fromSide!==side?[]:[{node:candidate,side,key:candidate.id+'\0'+side}]));
    const wanted=new Set(ports.map(p=>p.key)),existing=new Map([...nodeHandles.children].map(h=>[h.dataset.nodeId+'\0'+h.dataset.side,h]));
    for(const [key,h] of existing)if(!wanted.has(key))h.remove();
    for(const {node:candidate,side,key} of ports){
      const active=connectionStart?.from===candidate.id&&connectionStart.fromSide===side;
      const h=existing.get(key)||portButton(candidate,side);if(!h.parentNode)nodeHandles.append(h);
      h.textContent=active?'−':'+';h.setAttribute('aria-pressed',String(active));
      h.setAttribute('aria-label',t(active?'editor.cancelConnection':connectionStart?'editor.end':'editor.start',{label:candidate.label,side:t('editor.side.'+side)}));h.title=h.getAttribute('aria-label');
      const p=point(nodeAnchor(candidate,side));h.style.left=p.x-box.left+'px';h.style.top=p.y-box.top+'px';
    }
  }
  function cancelConnection(){pendingConnection=null;connectionStart=null;createForm.hidden=true;preview.replaceChildren();portSignature='';sync();}
  for(const type of ['pointerover','focusin'])window.addEventListener(type,event=>{if(!enabled||!state.canCreate||connectionStart||pendingConnection)return;const node=event.target.closest?.('[data-node-id]');if(node){hoveredNode=node.dataset.nodeId;renderNodePorts();}},true);
  cancelButton.addEventListener('click',()=>{cancelConnection();toggle.focus();});
  createForm.addEventListener('keydown',event=>{if(event.isComposing||event.keyCode===229)return;if(event.key==='Escape'&&!busy){event.preventDefault();event.stopPropagation();cancelConnection();toggle.focus();}});
  createForm.addEventListener('submit',async event=>{
    event.preventDefault();if(!pendingConnection||busy)return;busy=true;createButton.disabled=cancelButton.disabled=true;sync();
    try{const response=await fetch('/edit/connect',{method:'POST',headers:{'Content-Type':'application/json','X-Archify-Edit-Token':state.token},body:JSON.stringify({revision:state.revision,edits:edits(),connection:{...pendingConnection,label:labelInput.value}})});const result=await response.json();if(!response.ok){hint(t('editor.connectBlocked'),result.details||result.error||'',true);return;}
      const edge=result.edge;edge.created=true;edge.base=structuredClone(edge);if(edge.labelAnchor){const q=nearest(edge.labelAnchor,edge.points);edge.labelBinding={segment:q.segment,t:q.t,offset:edge.labelAnchor.map((v,i)=>v-q.point[i])};}selectedKey=edge.key;pendingConnection=null;createForm.hidden=true;preview.replaceChildren();remember([...structuredClone(edges()),edge]);
    }catch(error){hint(t('editor.connectFailure'),error.message,true);}finally{busy=false;createButton.disabled=cancelButton.disabled=false;sync();}
  });
  function offsetRoute(points,i,delta) {
    const next=points.map(p=>[...p]),a=points[i],b=points[i+1],horizontal=a[1]===b[1];
    if(points.length===2){const axis=horizontal?0:1,cross=1-axis,direction=Math.sign(b[axis]-a[axis]),stub=Math.min(24,Math.abs(b[axis]-a[axis])/4);const l=[...a],r=[...b];l[axis]+=direction*stub;r[axis]-=direction*stub;const ml=[...l],mr=[...r];ml[cross]+=delta;mr[cross]+=delta;return [a,l,ml,mr,r,b].map(p=>[...p]);}
    const axis=horizontal?1:0;
    let low=-Infinity,high=Infinity;const snaps=[];
    for(const [end,neighbor] of [[i,i-1],[i+1,i+2]]){
      if(!points[neighbor])continue;
      const distance=points[end][axis]-points[neighbor][axis];snaps.push(-distance);
      if(distance>0)low=Math.max(low,-distance);else if(distance<0)high=Math.min(high,-distance);
    }
    delta=Math.max(low,Math.min(high,delta));
    const snap=snaps.filter(v=>v>=low&&v<=high&&Math.abs(v-delta)<=4).sort((a,b)=>Math.abs(a-delta)-Math.abs(b-delta))[0];
    if(snap!==undefined)delta=snap;
    next[i][axis]+=delta;next[i+1][axis]+=delta;return next;
  }
  function nearest(p,points) {
    let best,distance=Infinity;
    for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=b[0]-a[0],dy=b[1]-a[1],len=dx*dx+dy*dy,t=len?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/len)):0;const q=[a[0]+t*dx,a[1]+t*dy],d=(p[0]-q[0])**2+(p[1]-q[1])**2;if(d<distance){distance=d;best={point:q,segment:i-1,t};}}
    return best;
  }
  function labelRect(edge) {
    const old=initial.get(edge.key);
    if(!old.labelBox||!edge.labelAnchor)return null;
    return {...old.labelBox,x:old.labelBox.x+edge.labelAnchor[0]-old.labelAnchor[0],y:old.labelBox.y+edge.labelAnchor[1]-old.labelAnchor[1]};
  }
  function segmentBox(a,b){return{x:Math.min(a[0],b[0]),y:Math.min(a[1],b[1]),width:Math.abs(a[0]-b[0]),height:Math.abs(a[1]-b[1])};}
  // Intersect the four linear inequalities for a moving box and a fixed obstacle.
  function collisionInterval(from,to,box,gap) {
    let enter=0,leave=1;
    const inequalities=[
      [box.x+box.width+gap-from.x,box.x+box.width+gap-to.x],
      [from.x+from.width-box.x+gap,to.x+to.width-box.x+gap],
      [box.y+box.height+gap-from.y,box.y+box.height+gap-to.y],
      [from.y+from.height-box.y+gap,to.y+to.height-box.y+gap],
    ];
    for(const [a,b] of inequalities){const slope=b-a;if(Math.abs(slope)<1e-12){if(a<0)return null;continue;}const at=-a/slope;if(slope>0)enter=Math.max(enter,at);else leave=Math.min(leave,at);}
    return enter<=leave&&leave>=0&&enter<=1?[Math.max(0,enter),Math.min(1,leave)]:null;
  }
  function permittedFraction(before,after) {
    let limit=1;
    const fromLabel=labelRect(before),toLabel=labelRect(after),[x,y,width,height]=state.scene.viewBox.split(/[ ,]+/).map(Number);
    function contain(a,b){
      for(const [start,end,min,max] of [[a.x,b.x,x,x+width],[a.x+a.width,b.x+b.width,x,x+width],[a.y,b.y,y,y+height],[a.y+a.height,b.y+b.height,y,y+height]]){
        if(end<min&&end!==start)limit=Math.min(limit,(min-start)/(end-start));
        if(end>max&&end!==start)limit=Math.min(limit,(max-start)/(end-start));
      }
    }
    function avoid(a,b,obstacle,gap){const hit=collisionInterval(a,b,obstacle,gap);if(!hit||hit[1]<=1e-12)return;const shift=Math.max(Math.abs(b.x-a.x),Math.abs(b.y-a.y),Math.abs(b.width-a.width),Math.abs(b.height-a.height),1);limit=Math.min(limit,Math.max(0,hit[0]-0.001/shift));}
    for(let i=1;i<before.points.length;i++){
      const a=segmentBox(before.points[i-1],before.points[i]),b=segmentBox(after.points[i-1],after.points[i]);contain(a,b);
      for(const node of state.scene.nodes)if(node.id!==before.from&&node.id!==before.to)avoid(a,b,node.box,2);
    }
    if(fromLabel&&toLabel){
      contain(fromLabel,toLabel);
      for(const node of state.scene.nodes)avoid(fromLabel,toLabel,node.box,-2);
      for(const other of edges())if(other.key!==before.key){const box=labelRect(other);if(box)avoid(fromLabel,toLabel,box,-2);}
    }
    return Math.max(0,Math.min(1,limit));
  }
  function moveRoute(edge,segment,delta) {
    const previous=edge.points,next=offsetRoute(previous,segment,delta),binding=edge.labelBinding;
    if(binding){
      if(previous.length===2){
        const a=previous[0],b=previous[1],p=a.map((v,i)=>v+(b[i]-v)*binding.t);
        p[a[1]===b[1]?1:0]+=delta;
        const mapped=nearest(p,next);binding.segment=mapped.segment;binding.t=mapped.t;
      }
      const a=next[binding.segment],b=next[binding.segment+1];
      edge.labelAnchor=a.map((v,i)=>v+(b[i]-v)*binding.t+binding.offset[i]);
    }
    edge.points=next;
  }
  function constrainedRoute(edge,segment,delta) {
    const original=structuredClone(edge),requested=structuredClone(edge);moveRoute(requested,segment,delta);
    const base=structuredClone(edge);moveRoute(base,segment,0);
    const axis=edge.points[segment][1]===edge.points[segment+1][1]?1:0,index=edge.points.length===2?2:segment;
    const actual=requested.points[index][axis]-base.points[index][axis],fraction=permittedFraction(base,requested);
    Object.assign(edge,original);moveRoute(edge,segment,actual*fraction);
    return fraction<1;
  }
  function constrainedLabel(edge,wanted) {
    const binding=edge.labelBinding,target=nearest(wanted,edge.points),start=binding.segment+binding.t,end=target.segment+target.t;
    const stops=[];
    if(end>start){for(let i=Math.floor(start)+1;i<end;i++)stops.push(edge.points[i]);}
    else{for(let i=Math.ceil(start)-1;i>end;i--)stops.push(edge.points[i]);}
    stops.push(target.point);
    let blocked=false;
    for(const stop of stops){
      const next=structuredClone(edge);next.labelAnchor=stop.map((v,i)=>v+binding.offset[i]);
      const fraction=permittedFraction(edge,next);
      edge.labelAnchor=edge.labelAnchor.map((v,i)=>v+(next.labelAnchor[i]-v)*fraction);
      if(fraction<1){blocked=true;break;}
    }
    const q=nearest(edge.labelAnchor.map((v,i)=>v-binding.offset[i]),edge.points);
    edge.labelBinding={segment:q.segment,t:q.t,offset:binding.offset};return blocked;
  }
  function start(event,target,edit) {
    if(busy||pendingConnection||connectionStart||event.button!==0)return;
    event.preventDefault();event.stopImmediatePropagation();
    target.setPointerCapture(event.pointerId);
    const snapshot=structuredClone(edges()),edge=snapshot.find(e=>e.key===edit.key);
    drag={...edit,target,id:event.pointerId,start:local(event),before:snapshot,edge,offset:edge.labelBinding?.offset,moved:false};
  }
  document.addEventListener('pointermove',event=>{
    if(!drag||event.pointerId!==drag.id)return;
    event.stopImmediatePropagation();const at=local(event),dx=at.x-drag.start.x,dy=at.y-drag.start.y;
    const next=structuredClone(drag.before),e=next.find(e=>e.key===drag.key);
    if(drag.field==='via')drag.blocked=constrainedRoute(e,drag.segment,drag.horizontal?dy:dx);
    else{const wanted=[drag.edge.labelAnchor[0]+dx-drag.offset[0],drag.edge.labelAnchor[1]+dy-drag.offset[1]];drag.blocked=constrainedLabel(e,wanted);}
    drag.moved=drag.field==='via'?Math.abs(drag.horizontal?dy:dx)>1:!same(e.labelAnchor,drag.edge.labelAnchor);
    drag.next=next;
    history[index]=next;paint();history[index]=drag.before;
    if(drag.field==='via'){
      for(const handle of handles.children){const i=drag.edge.points.length===2?2:Number(handle.dataset.segment),a=e.points[i],b=e.points[i+1];if(!a||!b)continue;const p=point([(a[0]+b[0])/2,(a[1]+b[1])/2]),box=container.getBoundingClientRect();handle.style.left=p.x-box.left+'px';handle.style.top=p.y-box.top+'px';}
      drag.target.dataset.blocked=String(drag.blocked);
    }
  },true);
  function finish(event,cancel=false) {
    if(!drag||event.pointerId!==drag.id)return;
    event.preventDefault();event.stopImmediatePropagation();const done=drag;drag=null;
    ignoreClick=!cancel&&done.moved;
    if(done.target.hasPointerCapture(done.id))done.target.releasePointerCapture(done.id);
    if(!cancel&&done.moved)remember(done.next);else paint();
  }
  document.addEventListener('pointerup',e=>finish(e),true);document.addEventListener('pointercancel',e=>finish(e,true),true);
  document.addEventListener('lostpointercapture',e=>{if(drag&&e.pointerId===drag.id)finish(e,true);},true);
  svg.addEventListener('pointerdown',e=>{
    if(!enabled||busy)return;const target=draftTarget(e);if(target){selectDraft(target.dataset.relationshipHitKey??target.dataset.edgeKey);e.preventDefault();e.stopImmediatePropagation();}
    const group=e.target.closest('g.connection-adjust-label');if(!group)return;
    const key=group.dataset.edgeKey;
    start(e,group,{key,field:'labelAt'});
  },true);
  svg.addEventListener('click',e=>{if(enabled&&e.target.closest('g.connection-adjust-label')){e.preventDefault();e.stopImmediatePropagation();}},true);
  function renderHandles() {
    if(drag)return;
    const current=selected(),matrix=svg.getScreenCTM(),box=container.getBoundingClientRect(),cameraBusy=container.hasAttribute('data-camera-transaction')||container.classList.contains('is-panning');
    const next=JSON.stringify([enabled,busy,!!connectionStart,!!pendingConnection,cameraBusy,current?.key,current?.points,matrix&&[matrix.a,matrix.b,matrix.c,matrix.d,matrix.e,matrix.f],box.x,box.y]);
    if(next===signature)return;signature=next;handles.replaceChildren();
    if(!enabled||busy||connectionStart||pendingConnection||!current||cameraBusy)return;
    for(let i=0;i<current.points.length-1;i++){
      if(current.points.length!==2&&(i===0||i===current.points.length-2))continue;
      const a=current.points[i],b=current.points[i+1];if((a[0]!==b[0]&&a[1]!==b[1])||Math.hypot(a[0]-b[0],a[1]-b[1])<8)continue;
      const handle=element('button');handle.type='button';handle.className='connection-adjust-handle';handle.setAttribute('aria-label',t('editor.moveSegment'));
      handle.dataset.segment=String(i);
      const p=point([(a[0]+b[0])/2,(a[1]+b[1])/2]);handle.style.left=p.x-box.left+'px';handle.style.top=p.y-box.top+'px';
      const edit={key:current.key,field:'via',segment:i,horizontal:a[1]===b[1]};
      handle.addEventListener('pointerdown',e=>start(e,handle,edit));handle.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();});
      handle.addEventListener('keydown',e=>{const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(!d||busy)return;e.preventDefault();e.stopPropagation();const delta=(edit.horizontal?d[1]:d[0])*(e.shiftKey?10:2);if(!delta)return;const next=structuredClone(edges());constrainedRoute(next.find(n=>n.key===edit.key),i,delta);remember(next);});
      handles.append(handle);
    }
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(()=>{frame=null;sync();});}
  new MutationObserver(schedule).observe(svg,{attributes:true,attributeFilter:['data-relationship-pin-active','style','class']});
  new MutationObserver(schedule).observe(container,{attributes:true,attributeFilter:['data-camera-transaction','class']});
  new ResizeObserver(schedule).observe(container);container.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('beforeunload',e=>{if(!savedReload&&edits().length){e.preventDefault();e.returnValue='';}});
  document.addEventListener('keydown',e=>{
    if(e.isComposing||e.keyCode===229)return;
    if(/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)||e.target.isContentEditable)return;
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'&&(enabled||edits().length)){e.preventDefault();saveDraft();return;}
    if(!enabled)return;
    if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();if(pendingConnection||connectionStart){cancelConnection();toggle.focus();}else if(!panel.hidden){panel.hidden=true;toggle.focus();}else if(drag)finish({pointerId:drag.id,preventDefault(){},stopImmediatePropagation(){}},true);else enable(false);}
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();restore(e.shiftKey?1:-1);}
  },true);
  sync();
})();
