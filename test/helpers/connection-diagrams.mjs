export function connectionDiagram(type,locale='en') {
  const meta={title:'Create a connection',output:'diagram.html',locale,viewBox:[760,480],legend:{mode:'hidden'}};
  const links=[{id:'first',from:'a',to:'b',label:'Request'},{id:'second',from:'b',to:'c',label:'Result'}];
  const nodes=[{id:'a',type:'frontend',label:'Intake'},{id:'b',type:'backend',label:'Execute'},{id:'c',type:'database',label:'Store'},{id:'d',type:'external',label:'Separate'}];
  if(type==='architecture')return {schema_version:1,diagram_type:type,meta,components:nodes.map((n,i)=>({...n,pos:i===3?[320,350]:[80+240*i,180],size:[100,60]})),connections:links};
  meta.viewBox=[1000,520];
  if(type==='workflow')return {schema_version:2,diagram_type:type,meta,lanes:[{id:'main',label:'Main'},{id:'observer',label:'Observer'}],nodes:nodes.map((n,i)=>({...n,lane:i===3?'observer':'main',col:i===3?1:i})),edges:links};
  if(type==='dataflow')return {schema_version:1,diagram_type:type,meta,stages:[{label:'Source'},{label:'Process'},{label:'Store'}],nodes:nodes.map((n,i)=>({...n,stage:i===3?1:i,row:i===3?2:0})),flows:links};
  throw Error('Unknown editing fixture: '+type);
}
