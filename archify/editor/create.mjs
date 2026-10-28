import { randomUUID } from 'node:crypto';
import { createArchitectureRouter, connectionLabelBoxAt, hasAutomaticRouteGeometry } from '../renderers/architecture/routing.mjs';
import { placeAutomaticLabels } from '../renderers/shared/automatic-labels.mjs';
import { anchor, labelPoint, rectsOverlap, cleanFlowProblems, cleanEndpointSideProblems, cleanCrossingProblems, cleanAmbiguousCorridorProblems, cleanBorderRunProblems, cleanRouteRhythmProblems, cleanLabelRouteClearanceProblems, cleanLabelCanvasContainmentProblems } from '../renderers/shared/geometry.mjs';
import { cleanRouteDetourProblems } from '../renderers/shared/route-quality.mjs';
import { applyConnectionEdit } from './model.mjs';

const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const sides = ['left','right','top','bottom'];
const endpointSide = (edge,end,node) => {
  const p=end==='from'?edge.points[0]:edge.points.at(-1),box=node.box;
  return sides.find(side=>side==='left'?Math.abs(p[0]-box.x)<1e-6:side==='right'?Math.abs(p[0]-box.x-box.width)<1e-6:side==='top'?Math.abs(p[1]-box.y)<1e-6:Math.abs(p[1]-box.y-box.height)<1e-6);
};
function components(source,scene) {
  return new Map(scene.nodes.map(node=>[node.id,{...source.components.find(n=>n.id===node.id),...node.box,cx:node.box.x+node.box.width/2,cy:node.box.y+node.box.height/2}]));
}
function context(source,scene,quality) {
  const nodes=components(source,scene),relations=source.connections;
  const points=new Map(scene.edges.map(edge=>[edge.id || edge.key,edge.points]));
  return {relations,endpointIds:new Set(nodes.keys()),diagramType:'architecture',relationCollection:'connections',profile:quality,profileIsAuthoritative:true,
    pathFor:relation=>({points:points.get(relation.id || String(relations.indexOf(relation)))}),
    fromSideFor:relation=>relation.fromSide,toSideFor:relation=>relation.toSide,
    frames:scene.frames.filter(frame=>frame.role==='box').map(frame=>({...frame.box,radius:frame.id.startsWith('security-group:')?8:12})),
    obstacles:[...nodes.values()]};
}
function assertGeometry(source,scene,edge,quality) {
  const ctx=context(source,scene,quality),relation=source.connections.at(-1);
  const labels=scene.edges.flatMap((item,index)=>item.labelBox?[{...item.labelBox,lx:item.labelAnchor[0],ly:item.labelAnchor[1],relation:source.connections[index],relationIndex:index,label:item.label}]:[]);
  const [, ,width,height]=scene.viewBox.split(/[ ,]+/).map(Number);
  if(edge.points.some(p=>p[0]<0||p[1]<0||p[0]>width||p[1]>height))throw Error('The current canvas has no room for this route.');
  const ownLabel=edge.label?labels.at(-1):null;
  if(edge.label && (!ownLabel || ownLabel.relation!==relation))throw Error('The label could not be placed.');
  if(ownLabel&&(ctx.obstacles.some(box=>rectsOverlap(ownLabel,box,-2))||labels.slice(0,-1).some(box=>rectsOverlap(ownLabel,box,-2))))throw Error('The current layout has no clear position for this label.');
  if(ownLabel&&(ownLabel.x<0||ownLabel.y<0||ownLabel.x+ownLabel.width>width||ownLabel.y+ownLabel.height>height||(scene.titleBoxes||[]).some(box=>rectsOverlap(ownLabel,box))))throw Error('The label does not fit the available canvas space.');
  const failures=[
    ...cleanFlowProblems({...ctx,relations:[relation],obstacleKind:'component'}),
    ...cleanEndpointSideProblems({...ctx,relations:[relation]}),
    ...cleanCrossingProblems({...ctx,crossingResolved:(a,b)=>hasAutomaticRouteGeometry(a)&&hasAutomaticRouteGeometry(b)}),
    ...cleanAmbiguousCorridorProblems(ctx),
    ...cleanBorderRunProblems({...ctx,relations:[relation]}),
    ...cleanRouteRhythmProblems({...ctx,relations:[relation]}),
    ...cleanRouteDetourProblems({...ctx,relations:[relation],contentRects:ctx.obstacles}),
    ...cleanLabelRouteClearanceProblems({...ctx,labels}),
    ...cleanLabelCanvasContainmentProblems({...ctx,labels,viewBox:[width,height]}),
  ];
  if(failures.length)throw Error('The connection does not fit the current fixed layout. '+failures[0]);
}

export function appendConnection(source,type,scene,value,quality) {
  if(type!=='architecture')throw Error('New connections currently require an architecture diagram.');
  if(!value||typeof value.id!=='string'||!/^edge-[a-zA-Z0-9_-]{1,80}$/.test(value.id)||source.connections.some(e=>e.id===value.id))throw Error('The new connection needs a unique ID.');
  if(typeof value.label!=='string'||value.label.length>240)throw Error('Use a label of at most 240 characters.');
  const nodes=components(source,scene),from=nodes.get(value.from),to=nodes.get(value.to);
  if(!from||!to||from===to||!sides.includes(value.fromSide)||!sides.includes(value.toSide))throw Error('Choose two existing nodes and available connection sides.');
  for(const [id,side] of [[value.from,value.fromSide],[value.to,value.toSide]])if(scene.edges.some(e=>(e.from===id&&endpointSide(e,'from',scene.nodes.find(n=>n.id===id))===side)||(e.to===id&&endpointSide(e,'to',scene.nodes.find(n=>n.id===id))===side)))throw Error('That connection side is already in use. Choose a free side.');
  const points=value.points;
  if(!Array.isArray(points)||points.length<2||points.length>64||points.some(p=>!Array.isArray(p)||p.length!==2||p.some(v=>!Number.isFinite(v)||Math.abs(v)>1e7)))throw Error('The new route has invalid geometry.');
  if(!same(points[0],anchor(from,value.fromSide))||!same(points.at(-1),anchor(to,value.toSide)))throw Error('The new route must use the selected node anchors.');
  if(points.slice(1).some((p,i)=>same(p,points[i])||(p[0]!==points[i][0]&&p[1]!==points[i][1])))throw Error('The new route must have nonzero orthogonal segments.');
  if(value.label&&(!Array.isArray(value.labelAt)||value.labelAt.length!==2||value.labelAt.some(v=>!Number.isFinite(v))))throw Error('The new label needs a finite position.');
  const relation={id:value.id,from:value.from,to:value.to,label:value.label,fromSide:value.fromSide,toSide:value.toSide,via:points.slice(1,-1).map(p=>[...p]),...(value.label?{labelAt:[...value.labelAt]}:{})};
  const next=structuredClone(source),key=String(next.connections.length);
  next.connections.push(relation);
  const [x,y,width,height]=scene.viewBox.split(/[ ,]+/).map(Number);
  if(x!==0||y!==0)throw Error('New connections require an origin-zero canvas.');
  next.meta={...next.meta,viewBox:[width,height]};
  const edge={key,id:relation.id,from:relation.from,to:relation.to,label:relation.label,points:structuredClone(points),fromSide:value.fromSide,toSide:value.toSide,
    ...(value.label?{labelAnchor:[...value.labelAt],labelBox:connectionLabelBoxAt(relation,value.labelAt)}:{})};
  const draft={...scene,edges:[...scene.edges,edge]};
  assertGeometry(next,draft,edge,quality);
  return {source:next,scene:draft,edge};
}

export function prepareEdits(source,type,scene,commands,quality) {
  if(!Array.isArray(commands)||commands.length>256)throw Error('Use a bounded list of connection adjustments.');
  let next=source,draft=structuredClone(scene);
  const fields=new Set(),routed=new Set(commands.filter(c=>c?.field==='via').map(c=>c.key));
  for(const command of commands){
    if(!command||typeof command.key!=='string')throw Error('An adjustment has no connection key.');
    const key=command.key+':'+command.field;if(fields.has(key))throw Error('Save contains duplicate adjustments.');fields.add(key);
    if(command.field==='create'){
      const added=appendConnection(next,type,draft,command.value,quality);
      if(command.key!==added.edge.key)throw Error('The new connection order changed.');
      next=added.source;draft=added.scene;
    }else{
      next=applyConnectionEdit(next,type,draft,{...command,pin:routed.has(command.key)});
      const edge=draft.edges.find(e=>e.key===command.key);
      if(command.field==='via')edge.points=structuredClone(command.value);
      else if(command.field==='labelAt'){
        if(edge.labelBox){edge.labelBox.x+=command.value[0]-edge.labelAnchor[0];edge.labelBox.y+=command.value[1]-edge.labelAnchor[1];}
        edge.labelAnchor=[...command.value];
      }
    }
  }
  return {source:next,scene:draft};
}

export function proposeConnection(source,scene,request,quality) {
  if(!request||typeof request.label!=='string'||request.label.length>240||!sides.includes(request.fromSide)||!sides.includes(request.toSide))throw Error('Choose connection sides and a label of at most 240 characters.');
  const nodes=components(source,scene),relation={id:'edge-'+randomUUID(),from:request.from,to:request.to,label:request.label||'',fromSide:request.fromSide,toSide:request.toSide};
  if(!nodes.has(relation.from)||!nodes.has(relation.to))throw Error('Choose existing nodes.');
  const frames=context(source,scene,quality).frames;
  const router=createArchitectureRouter(nodes,[...source.connections,relation],{frames,fixedCanvas:true});
  const points=router.pathFor(relation).points;
  for(const [index,old] of source.connections.entries())if(!same(router.pathFor(old).points,scene.edges[index].points))throw Error('This connection would move an existing route. Choose another free side.');
  let labelAt;
  if(relation.label){
    const labels=scene.edges.flatMap((edge,i)=>edge.labelBox?[{...edge.labelBox,lx:edge.labelAnchor[0],ly:edge.labelAnchor[1],label:edge.label,relation:{...source.connections[i],labelAt:edge.labelAnchor},relationIndex:i}]:[]);
    const preferred=labelPoint(relation,points);
    labels.push({...connectionLabelBoxAt(relation,preferred),relation,relationIndex:source.connections.length,label:relation.label});
    const [, ,width,height]=scene.viewBox.split(/[ ,]+/).map(Number);
    const placed=placeAutomaticLabels({labels,routes:[...scene.edges.map((edge,i)=>({relationIndex:i,points:edge.points})),{relationIndex:source.connections.length,points}],components:[...nodes.values()],titles:scene.titleBoxes||[],viewBox:[width,height],keepFallbackNearRoute:true});
    labelAt=[placed.at(-1).lx,placed.at(-1).ly];
  }
  const value={...relation,points,...(labelAt?{labelAt}:{})};
  return {value,edge:appendConnection(source,'architecture',scene,value,quality).edge};
}
