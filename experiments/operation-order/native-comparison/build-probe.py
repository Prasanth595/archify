import pathlib,re
r=pathlib.Path(__file__).resolve().parent
readme=(r/'upstream/README.md').read_text()
blocks=re.findall(r'```go\n(.*?)```',readme,re.S)
model=next(b for b in blocks if b.startswith('type registerInput'))
typeblock,modelblock=model.split('// a sequential specification of a register',1)
events=next(b for b in blocks if b.startswith('events :=') and 'false, 200' in b).split('\nok :=',1)[0]
program='''package main
import (
 "encoding/json"
 "fmt"
 "os"
 "runtime"
 "time"
 "github.com/anishathalye/porcupine"
)
'''+typeblock+'''
func main() {
'''+modelblock+'''
 // Descriptions affect only native visualization labels, not model decisions.
 registerModel.DescribeOperation = func(input, output interface{}) string {
  in := input.(registerInput)
  if in.op {return fmt.Sprintf("get() -> %v", output)}
  return fmt.Sprintf("put(%d) -> %v", in.value, output)
 }
 registerModel.DescribeState = func(state interface{}) string {return fmt.Sprintf("register = %v",state)}
'''+events+'''
 control := append([]porcupine.Event(nil), events...)
 control[4].Value = 200
 cases := []struct{name string; events []porcupine.Event; expected porcupine.CheckResult}{
  {"original",events,porcupine.Illegal},
  {"read-200-control",control,porcupine.Ok},
 }
 if err:=os.MkdirAll("generated",0755);err!=nil{panic(err)}
 receipts:=[]map[string]interface{}{}
 for _,c:=range cases {
  ok:=porcupine.CheckEvents(registerModel,c.events)
  result,info:=porcupine.CheckEventsVerbose(registerModel,c.events,5*time.Second)
  if result!=c.expected || ok!=(result==porcupine.Ok){panic(fmt.Sprintf("unexpected result %s: %s",c.name,result))}
  if err:=porcupine.VisualizePath(registerModel,info,"generated/"+c.name+".html");err!=nil{panic(err)}
  evs:=[]map[string]interface{}{}
  for i,e:=range c.events {
   kind:="return"
   var value interface{}=e.Value
   if e.Kind==porcupine.CallEvent {
    kind="call";v:=e.Value.(registerInput);value=map[string]interface{}{"op":v.op,"value":v.value}
   }
   evs=append(evs,map[string]interface{}{"ordinal":i+1,"index":i,"kind":kind,"id":e.Id,"clientId":e.ClientId,"value":value})
  }
  receipts=append(receipts,map[string]interface{}{"case":c.name,"events":evs,"CheckEvents":ok,"CheckEventsVerbose":result,"partialLinearizations":info.PartialLinearizations()})
 }
 out:=map[string]interface{}{"goVersion":runtime.Version(),"upstreamCommit":"97cd067defd99df172053ba7f4ca5bbae57fe446","verboseTimeoutSeconds":5,"cases":receipts}
 b,err:=json.MarshalIndent(out,"","  ");if err!=nil{panic(err)}
 b=append(b,'\\n');if err:=os.WriteFile("results.json",b,0644);err!=nil{panic(err)}
 fmt.Println(string(b))
}
'''
(r/'main.go').write_text(program)
print('Derived model and original events from fixed upstream README')
