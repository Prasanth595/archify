package main
import (
 "encoding/json"
 "fmt"
 "os"
 "runtime"
 "time"
 "github.com/anishathalye/porcupine"
)
type registerInput struct {
    op    bool // false = put, true = get
    value int
}


func main() {

registerModel := porcupine.Model{
    Init: func() interface{} {
        return 0
    },
    // step function: takes a state, input, and output, and returns whether it
    // was a legal operation, along with a new state
    Step: func(state, input, output interface{}) (bool, interface{}) {
        regInput := input.(registerInput)
        if regInput.op == false {
            return true, regInput.value // always ok to execute a put
        } else {
            readCorrectValue := output == state
            return readCorrectValue, state // state is unchanged
        }
    },
    // computes a hash for a state (optional field, improves performance)
    Hash: func(state interface{}) uint64 {
        return uint64(state.(int))
    },
}

 // Descriptions affect only native visualization labels, not model decisions.
 registerModel.DescribeOperation = func(input, output interface{}) string {
  in := input.(registerInput)
  if in.op {return fmt.Sprintf("get() -> %v", output)}
  return fmt.Sprintf("put(%d) -> %v", in.value, output)
 }
 registerModel.DescribeState = func(state interface{}) string {return fmt.Sprintf("register = %v",state)}
events := []porcupine.Event{
    // C0: put('200')
    {Kind: porcupine.CallEvent, Value: registerInput{false, 200}, Id: 0, ClientId: 0},
    // C1: get()
    {Kind: porcupine.CallEvent, Value: registerInput{true, 0}, Id: 1, ClientId: 1},
    // C1: Completed get() -> '200'
    {Kind: porcupine.ReturnEvent, Value: 200, Id: 1, ClientId: 1},
    // C2: get()
    {Kind: porcupine.CallEvent, Value: registerInput{true, 0}, Id: 2, ClientId: 2},
    // C2: Completed get() -> '0'
    {Kind: porcupine.ReturnEvent, Value: 0, Id: 2, ClientId: 2},
    // C0: Completed put('200')
    {Kind: porcupine.ReturnEvent, Value: 0, Id: 0, ClientId: 0},
}

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
 b=append(b,'\n');if err:=os.WriteFile("results.json",b,0644);err!=nil{panic(err)}
 fmt.Println(string(b))
}
