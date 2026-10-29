import * as fc from './fast-check.bundle.mjs';
const results={library:{version:fc.__version,commitHash:fc.__commitHash,type:fc.__type},cases:[]};
try {
 for(const [name,global,local] of [['default',{},{}],['global-stop',{endOnFailure:true},{}],['local-override',{endOnFailure:true},{endOnFailure:false}]]) {
  fc.resetConfigureGlobal();fc.configureGlobal(global);
  const property=fc.property(fc.integer({min:0,max:20}),n=>{fc.pre(n!==0);return n<5;});
  const parameters={seed:42,numRuns:20,verbose:fc.VerbosityLevel.VeryVerbose,...local};
  const details=fc.check(property,parameters);
  const report=await fc.defaultReportMessage(details);
  results.cases.push({name,global:fc.readConfigureGlobal(),local:parameters,details,report});
  const section=document.createElement('section');const title=document.createElement('h2');title.textContent=name;
  const scope=document.createElement('p');scope.textContent='实际 endOnFailure='+details.runConfiguration.endOnFailure+'；numShrinks='+details.numShrinks+'；numSkips='+details.numSkips;
  const pre=document.createElement('pre');pre.id='report-'+name;pre.textContent=report.replace(/\x1b\[(?:0|31|32|33)m/g,'');
  section.append(title,scope,pre);document.querySelector('main').append(section);
 }
 document.querySelector('#results').textContent=JSON.stringify(results,(key,value)=> typeof value==='function'?{$function:value.name}:value instanceof Error?{name:value.name,message:value.message,stack:value.stack}:value,2);
 document.querySelector('#status').textContent='Complete · '+fc.__version;
} catch(error) {document.querySelector('#status').textContent='Error: '+error.stack;} finally {fc.resetConfigureGlobal();}
