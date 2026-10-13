import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {addMemory} from './memory-designs.mjs';
import {addCaches} from './cache-designs.mjs';
import {addExecution} from './execution-designs.mjs';
import {addDeep} from './deep-designs.mjs';
import {addFinal} from './final-designs.mjs';
export const definitions=[];
const out=path.dirname(fileURLToPath(import.meta.url));const runtime=JSON.parse(fs.readFileSync(path.join(out,'local-runtime.json'),'utf8'));
const xs='src/main/scala/xiangshan/';const fe=xs+'frontend/';const be=xs+'backend/';const mem=xs+'mem/';const ca=xs+'cache/';
export function add(section,id,parent,title,file,flow,notes,extra={}){definitions.push({section,id,parent,title,file:path.posix.normalize(file),flow,notes,...extra});}
const old='.archify/architecture-xiangshan-kunminghu-v3-frontend-20261013-120000/';
for(const [id,title,input,parent,section] of [
 ['frontend','前端总览','candidate.json','core','frontend'],
 ['bpu','BPU 分支预测','bpu.json','frontend','frontend'],
 ['icache','ICache / FDIP','icache.json','frontend','frontend'],
 ['ifu','IFU / IBuffer','ifu.json','frontend','frontend']
])definitions.push({id,title,reuse:old+input,parent,section,level:id==='frontend'?'subsystem':'module'});
function ref(file,token){const lines=fs.readFileSync(path.join(runtime.xiangshan,file),'utf8').split(/\r?\n/);let i=lines.findIndex(l=>l.includes(token)&&!l.trim().startsWith('//'));if(i<0)throw Error(file+' missing '+token);return {path:file,line:i+1,end_line:Math.min(lines.length,i+8),label:'RTL · '+token.slice(0,38)};}
function overview(id,section,title,items,relations,notes,parent=null){
 const components=items.map(([nid,label,sub,x,y,file,token,type='backend'])=>({id:nid,type,label,sublabel:sub,pos:[x,y],size:[280,90],sources:[ref(file,token)]}));
 const connections=relations.map(([a,b,label,variant='emphasis'],i)=>({id:id+'-r'+i,from:a,to:b,label,variant}));
 definitions.push({id,section,title,parent,level:'subsystem',diagram:{schema_version:1,diagram_type:'architecture',meta:{title:'昆明湖 V3 · '+title},components,connections,cards:[{dot:'cyan',title:'主数据与控制路径',items:notes},{dot:'violet',title:'固定配置',items:['top.DefaultConfig(1) · 单核 · OpenLLC。实例和参数依据固定 RTL。','点击节点查看代码；各模块的内部设计通过图集父子目录进入。']}]}})
}
overview('core','overview','全核架构',[
 ['front','Frontend','预测 / FTQ / I$ / IFU / IBuffer',80,90,xs+'XSCore.scala','val frontend','processor'],
 ['decode','Decode / Fusion','默认 8 路 · 向量拆分',460,90,be+'CtrlBlock.scala','val decode'],
 ['rename','Rename','映射 · 空闲表 · 快照 · 压缩',840,90,be+'CtrlBlock.scala','val rename'],
 ['dispatch','Dispatch / Issue','整数 / FP / 向量派发与调度',840,370,be+'CtrlBlock.scala','val dispatch','messagebus'],
 ['int','Integer / Memory Issue','ALU / BJU / MUL / DIV / CSR',80,650,xs+'Parameters.scala','val intSchdParams'],
 ['fp','Float Region','FEX0–FEX3 · 浮点读写/旁路',460,650,be+'Backend.scala','val fpRegion'],
 ['vec','Vector Region','向量译码 / 运算 / 访存',840,650,be+'Backend.scala','val vecRegion'],
 ['wb','Writeback / Bypass','结果仲裁 · 唤醒 · ROB 完成',460,930,be+'datapath/WbArbiter.scala','class WbDataPath','messagebus'],
 ['memory','Memory Block','LSU / LSQ / D$ / MMU / PF',80,930,xs+'XSCore.scala','val memBlock'],
 ['rob','ROB / RAB','144 ROB · 352 RAB · 顺序提交',80,370,be+'rob/Rob.scala','val rab','messagebus'],
 ['l2','CoupledL2','2MiB · 8 路 · 4 bank',80,1210,'src/main/scala/top/Configs.scala','class DefaultConfig','database'],
 ['llc','OpenLLC / L3','32MiB · 16 路 · 4 bank',80,1490,'src/main/scala/top/Configs.scala','OpenLLCConfig("32MB"','database'],
 ['system','外部内存与中断','CHI / AXI / 设备接口',460,1490,'src/main/scala/system/SoC.scala','SoCParameters','external']
],[
 ['front','decode','指令'],['decode','rename','微操作'],['rename','dispatch','重命名'],['dispatch','int','INT 发射'],['dispatch','fp','FP 发射'],['dispatch','vec','VEC 发射'],
 ['int','wb','结果'],['fp','wb','结果'],['vec','wb','结果'],['memory','wb','访存结果'],['wb','rob','完成通知'],['int','memory','访存请求'],['vec','memory','向量访存'],['memory','l2','缓存访问'],['l2','llc','CHI'],['llc','system','内存请求'],
 ['rob','rename','提交 / 恢复','security'],['rob','front','提交 / 重定向','security']
],['主数据路径从前端进入 Decode、Rename、Dispatch，再分到整数、浮点、向量及访存通路。','执行结果写回寄存器/唤醒依赖，并向 ROB 报告完成；ROB/RAB 顺序提交和恢复架构状态。','默认缓存层次：64KiB I$、64KiB 4-way D$、2MiB L2、32MiB OpenLLC；旧参考图参数不混用。']);
overview('backend','backend','后端总览',[
 ['decode','DecodeStage / Fusion','8 路 · CFI/向量属性 · uOP',460,80,be+'CtrlBlock.scala','val decode'],
 ['rename','Rename / RAT / FreeList','物理目的寄存器 · Snapshot',460,350,be+'CtrlBlock.scala','val rename'],
 ['dispatch','Dispatch','就绪表 · IQ 分配 · LSQ/ROB',460,620,be+'CtrlBlock.scala','val dispatch','messagebus'],
 ['int','整数调度 / 数据通路','IssueQueue · RegCache · Int RF',80,890,be+'Backend.scala','private val intRegion'],
 ['float','Float Region','FltIQ · FltIssuePipe · FP RF',460,890,be+'Backend.scala','val fpRegion'],
 ['vector','Vector Region','VecIQ · IssuePipe · Vector RF',840,890,be+'Backend.scala','val vecRegion'],
 ['wb','WB / Wakeup / Bypass','端口冲突 · 结果优先级',460,1160,be+'datapath/WbArbiter.scala','class WbDataPath','messagebus'],
 ['rob','ROB / RAB / VType','提交 · walk · 异常/重定向',460,1430,be+'rob/Rob.scala','val rab','messagebus'],
 ['mem','访存接口','LSQ 分配 · issue · replay',80,1160,xs+'XSCore.scala','backend.io.mem','external'],
 ['redirect','RedirectGenerator','最老事件 · 优先级 · PC 修复',840,1430,be+'CtrlBlock.scala','val redirectGen','security']
],[['decode','rename','微操作'],['rename','dispatch','物理映射'],['dispatch','int','INT'],['dispatch','float','FP'],['dispatch','vector','VEC'],['int','wb','结果'],['float','wb','结果'],['vector','wb','结果'],['mem','wb','访存结果'],['wb','rob','完成'],['int','mem','访存发射'],['rob','rename','提交 / walk','security'],['rob','redirect','异常冲刷','security'],['redirect','decode','流水恢复','security']],['控制、数据和提交是不同职责，Issue/WB 箭头表示实际接口联系而非一个共用执行队列。','默认整数/FP/VEC 配置分别来自 intSchdParams/fpSchdParams/vecSchdParams；同类多实例在配置表列出。'],'core');
overview('memory','memory','访存与缓存总览',[
 ['issue','后端访存发射','LSQ 指针 · 操作数 · ROB index',460,80,mem+'MemBlock.scala','val newLoadUnits','external'],
 ['load','NewLoadUnit ×3','地址 / DTLB / D$ / forward',80,350,mem+'MemBlock.scala','val newLoadUnits'],
 ['store','NewStoreUnit ×2','地址检查 / StoreQueue',460,350,mem+'MemBlock.scala','val storeUnits'],
 ['std','StdExeUnit ×2','标量/向量 store data',840,350,mem+'MemBlock.scala','val stdExeUnits'],
 ['lsq','LSQ / Load & Store Queue','转发 · 违例 · Replay · 异常',460,620,mem+'MemBlock.scala','val lsq','messagebus'],
 ['dcache','DCache','64KiB · 4 路 · 2 个 L1-L2 通道',80,890,mem+'MemBlock.scala','val dcache','database'],
 ['sbuffer','SBuffer','16 项 · 提交 store 合并',460,890,mem+'MemBlock.scala','val sbuffer','messagebus'],
 ['tlb','DTLB / PMP / L2TLB','翻译 · 嵌套走页 · 权限',840,620,mem+'MemBlock.scala','val ptw','security'],
 ['prefetch','PrefetcherWrapper','Stream / Stride / Berti / SMS',840,890,mem+'MemBlock.scala','val prefetcher'],
 ['l2','CoupledL2','inclusive · 2MiB / 8 路 / 4 bank',80,1160,'src/main/scala/top/Configs.scala','L2CacheConfig("2MB"','database'],
 ['llc','OpenLLC','32MiB / 16 路 / 4 bank',80,1430,'src/main/scala/top/Configs.scala','OpenLLCConfig("32MB"','database'],
 ['uncache','Uncache / Atomics','非缓存 · LR/SC/AMO · 顺序门禁',460,1160,mem+'MemBlock.scala','val atomicsUnit'],
 ['backend','后端完成与恢复','完成 · cancel · memoryViolation',460,1430,xs+'XSCore.scala','memoryViolation','external']
],[['issue','load','load'],['issue','store','store addr'],['issue','std','store data'],['load','lsq','检查 / 重放'],['store','lsq','地址入队'],['std','lsq','数据入队'],['lsq','sbuffer','提交 store'],['sbuffer','dcache','合并写入'],['load','dcache','缓存读取'],['store','tlb','翻译 / 权限'],['prefetch','dcache','L1 预取','dashed'],['dcache','l2','缺失 / 回填'],['l2','llc','CHI'],['lsq','backend','违例 / 完成','security'],['uncache','backend','完成 / 异常']],['NewLoadUnit/NewStoreUnit 是当前默认实现；Legacy Load/Store/Hybrid 不当作同时存在的默认实例。','新流水内部也处理非对齐/向量 flow；LSQ 维护转发、顺序检查和重放，SBuffer 只保存已提交 store。','预取器实例与运行开关分别标注，不能把 RTL 存在等同于默认启用。'],'core');

add('frontend','ubtb','bpu','uBTB 全相联目标预测',fe+'bpu/ubtb/MicroBtb.scala',[
 ['PC 与 tag','s0_tag','external','输入接口'],['全相联查找','s0_hitOH'],['S1 命中选择','s1_hitEntry'],['目标重建','io.prediction.bits.target'],['训练更新','t1_updatedEntry']
],['32 项寄存器表以 valid/tag 并行比较；S1 用 one-hot 选择命中项。','目标从低位/进位重建，usefulCnt 与位置/类型/目标的一致性决定训练和分配。','resolve 训练与 fastTrain 共用更新，替换器参考有用计数和 touch。'],{branches:[[1,'预测项状态','private val entries','database','from'],[4,'替换器','new MicroBtbReplacer','backend','from']]});
add('frontend','abtb','bpu','aBTB 提前流水与快速训练',fe+'bpu/abtb/AheadBtb.scala',[
 ['PC / 路径历史','s0_hashIndex','external','输入接口'],['bank 查询','b.io.readReq.valid'],['正常/覆盖状态选择','s1_state'],['预测元数据','io.meta.valid'],['快速训练','t1_trainTaken']
],['aBTB 默认 1024 项/4 路，提前流水把 bank 响应保存在状态中。','S2/S3 override 会切换已缓存的 PipelineState，redirect/disable 清理有效位。','训练同时使用计数器、位置与目标比较，读写冲突经 buffer/replacer 处理。'],{branches:[[1,'Bank / Replacer','private val banks','database','from'],[2,'S3 重放状态','bpuS3ReplayState','database','from']]});
add('frontend','utage','bpu','uTAGE 多历史表方向预测',fe+'bpu/utage/MicroTage.scala',[
 ['折叠历史查询','a0_readIndex','external','输入接口'],['位置/tag 命中','a1_posHitVec'],['历史表选择','a1_abtbTableIDVec'],['输出方向/命中','io.prediction.takenVec'],['误预测分配','t1_allocCandidateMask']
],['uTAGE 与 aBTB 的分支位置联合匹配，按历史表选择方向计数器。','正常和 S2/S3 覆盖采用对应历史与命中状态。','fastTrain 选择误预测分支，保留仍有用表并分配候选。'],{branches:[[1,'历史预测表','new MicroTageTable','database','from']]});
add('frontend','mbtb','bpu','mBTB 对齐 bank 与训练',fe+'bpu/mbtb/MainBtb.scala',[
 ['PC 对齐旋转','s0_rotator','external','输入接口'],['对齐 bank 查询','b.io.read.req.startPc'],['位置提前输出','io.s1_positions'],['预测合并','io.result'],['训练路由','t1_writeAlignBankMask']
],['默认 8192 项/4 路；半块对齐 bank 通过 PC 旋转分派。','位置信息提前提供给 TAGE，预测包含主表和 Victim 结果。','训练按 cfi 位置选择 bank，携带分支、meta 和 mispredict 信息。'],{branches:[[1,'AlignBank','new MainBtbAlignBank','database','from']]});
add('frontend','victim-btb','mbtb','Victim BTB 去重与快照替换',fe+'bpu/mbtb/VictimBtb.scala',[
 ['全相联匹配','s1_readRawHitMask','external','输入接口'],['最早分支选择','s1_selectOH'],['主表重复检测','s2_mainBtbDuplicateMask'],['替换/迁移选择','snapshotEntryWayMask'],['训练与去重更新','when(trainEntry.req.valid)']
],['该固定提交引入全相联 Victim BTB；按分支位置选择最早命中。','Victim 与主表重复项被清理；主表快照替换会迁移被逐出的条目。','预测 touch、训练 touch 与快照更新驱动替换器。'],{branches:[[1,'Victim 项','private val entries','database','from'],[3,'Victim Replacer','new VictimBtbReplacer','backend','from']]});
add('frontend','tage','bpu','TAGE 方向选择与分配',fe+'bpu/tage/Tage.scala',[
 ['PC / 折叠历史','s0_foldedHist','external','输入接口'],['set 查询与 tag','s0_setIdx'],['多表命中','s1_hits'],['训练信息','t2_trainInfoVec'],['分配表/way','t3_allocateTableOH'],['表更新','table.io.writeReq.valid']
],['预测侧按 PC/折叠历史生成 set/tag，联合 mBTB 分支位置形成多表命中。','训练侧读取 meta、计数器与有用位，决定更新 provider 或向更长历史分配。','bank 冲突会拉低 trainReady；useAltOnNa 和 useful reset 参与训练策略。'],{branches:[[1,'TAGE 表','new TageTable','database','from'],[4,'有用位老化','usefulResetCtr','database','from']]});
add('frontend','sc','bpu','SC 多历史统计纠正',fe+'bpu/sc/Sc.scala',[
 ['路径/公共历史','s0_commonHR','external','输入接口'],['统计表索引','s0_pathIdx'],['响应转 percsum','s1_pathPercsum'],['S2 加权和','s2_biasPercsum'],['纠正结果','io.scTakenMask']
],['Path、Global、Backward、IMLI、Bias 表提供饱和计数；各表开关独立。','计数映射到统计和，与阈值及 TAGE 条件联合决定是否采用纠正。','训练更新表和自适应阈值；公共历史 valid 控制部分表访问。'],{branches:[[1,'统计表组','private val pathTable','database','from'],[3,'阈值状态','private val scThreshold','database','from']]});
add('frontend','ittage','bpu','ITTAGE 间接目标与置信度',fe+'bpu/ittage/Ittage.scala',[
 ['PC / 折叠历史','t.io.req.bits.foldedHist','external','输入接口'],['历史表响应','s2_resps'],['provider / alternate','s2_providerTarget'],['S3 目标锁存','s3_ittageTarget'],['训练分配','updateAlloc']
],['多历史表保存间接目标及 confidence/useful，provider 和 alternate 候选决定最终目标。','RegionWays 参与目标高位重建；训练由 FTQ 分支信息触发。','源代码当前 s1_isIndirect 恒真，不能描述为只查询确定的间接分支。'],{branches:[[1,'目标预测表','new IttageTable','database','from'],[3,'RegionWays','new RegionWays','database','from']]});
add('frontend','ras','bpu','RAS 推测与提交恢复',fe+'bpu/ras/Ras.scala',[
 ['推测 call/ret','val specIn','external','输入接口'],['对齐返回 PC','specAlignPc'],['RASStack 操作','private val stack'],['栈顶预测','io.topRetAddr'],['恢复/提交元数据','io.redirectMeta']
],['Ras 将调用/返回属性转为 RasStack 推测 push/pop 和提交操作。','topRetAddr 来自推测栈顶，恢复元数据携带指针与计数。','CommitStackSize=16、SpecQueueSize=32，具体内部结构在 RasStack 页展开。']);
add('frontend','ras-stack','ras','RASStack 队列与栈状态',fe+'bpu/ras/RasStack.scala',[
 ['推测请求','class RasSpecIO','external','输入接口'],['推测队列','private val specQueue','database','内部状态'],['栈指针/重复计数','private val tosr','database','内部状态'],['栈顶读取','io.spec.popAddr'],['提交 push','commitPushAddr'],['恢复优先级','when(io.redirect.valid)']
],['推测队列与已提交栈分离，保存链式栈顶和重复调用计数。','commit 按 metaTosw 取得返回地址；redirect 可修复推测指针/计数。','空间接近溢出通过 specNearOverflow 向上层反馈。']);
add('frontend','micro-ras','ras','MicroRAS 快速返回与覆盖',fe+'bpu/ras/MicroRas.scala',[
 ['S1 call/ret','val specIn','external','输入接口'],['S2 动作状态','s2_hasPush','database','内部状态'],['S3 覆盖动作','s3_realPush'],['全局恢复','when(io.hasRedirect)'],['早期返回目标','io.specOut.retTarget']
],['MicroRAS 为 S1 提供早期返回目标；S2/S3 的真实 call/ret 可覆盖先前推测。','动作和返回地址分别锁存，重定向修正与主 RAS 同步。','isCanUse 表示早期返回状态可用，而非固定命中所有 return。']);
add('frontend','phr','bpu','PHR 路径历史与恢复',fe+'bpu/history/phr/Phr.scala',[
 ['预测推进','s0_fire','external','输入接口'],['历史指针锁存','s1_phrPtr','database','内部状态'],['路径 hash','s2HashComponents'],['覆盖优先级','s2UpdateWins'],['训练历史恢复','predictHist'],['折叠历史输出','io.s0_foldedPhr']
],['路径历史使用分支 PC/target hash 更新，并保存各流水级历史位置。','redirect 优先于 S3、S2 覆盖，避免错误路径更新继续生效。','预测侧和训练侧使用对应的历史快照及折叠结果。']);
add('frontend','common-hr','bpu','CommonHR 公共分支历史',fe+'bpu/history/commonhr/CommonHR.scala',[
 ['历史推进','s0_fire','external','输入接口'],['公共历史队列','private val histQueue','database','内部状态'],['重复命中去重','s2_hitMask'],['taken 历史选择','s3_selectedTakenCommonHR'],['SC 历史输出','io.s0_commonHR']
],['维护 GHR、Backward 和 IMLI 历史，用队列保留分支块的推测状态。','分支位置去重后更新历史，最早 taken 决定实际推进范围。','重定向读取对应 PC/历史快照，不等同于清空全部统计状态。']);
add('frontend','ftq','frontend','FTQ 指针与供给控制',fe+'ftq/Ftq.scala',[
 ['BPU 预测接收','private val bpuEnqueue','external','输入接口'],['预测块记录','metaQueueRedirect','database','内部状态'],['双预取条件','private val canTwoPrefetch'],['双取指条件','private val rawTwoFetchValid'],['重定向指针恢复','when(redirect.valid)'],['训练缓存输出','io.toBpu.train.valid']
],['64 项 FTQ 分离 bpu/prefetch/fetch/commit 指针，并维护预测、恢复和训练元数据。','双取指要求总长度不超过64B、同页、第二块已过 PNR、没有已知后端异常标记。','ResolveQueue 与 CommitQueue 分别提供预测训练和 RAS 提交反馈。'],{branches:[[2,'ResolveQueue','new ResolveQueue','messagebus','from'],[4,'CommitQueue','new CommitQueue','messagebus','from']]});
add('frontend','ftq-meta','ftq','FTQ MetaQueue 同步读写',fe+'ftq/MetaQueue.scala',[
 ['读取请求','sram.io.r.req.valid','external','输入接口'],['SRAM 索引','sram.io.r.req.bits.setIdx'],['读数据返回','io.rdata'],['写使能/地址','sram.io.w.req.valid'],['元数据写入','sram.io.w.req.bits.data']
],['分裂 SRAM 保存 FTQ 关联元数据；按 ftqIdx 读出用于训练或恢复。','读和写使用独立请求，数据为真实 SRAM 返回而非扫描所有项。','逻辑图列出读写两条操作；它们不是固定串行流水。']);
add('frontend','resolve-queue','ftq','ResolveQueue 合并与训练',fe+'ftq/ResolveQueue.scala',[
 ['解析记录','class ResolveWithSource','external','输入接口'],['队列项状态','private val mem','database','内部状态'],['入队索引','private val enqIndex'],['训练出队','io.bpuTrain.valid'],['跳过已冲刷项','when(io.bpuTrain.fire']
],['默认16项，按 FTQ 索引合并分支解析信息，并标记 flushed。','有效未冲刷队头发往 BPU；消费或跳过 flushed 项推动 deqPtr。','full 保留入口余量，redirect 与覆盖不能把年轻错误路径当有效训练。']);
add('frontend','commit-queue','ftq','CommitQueue 已提交调用返回',fe+'ftq/CommitQueue.scala',[
 ['call/ret 提交','class CommitQueueIO','external','输入接口'],['提交记录队列','private val mem','database','内部状态'],['入队指针','private val enqPtr'],['队头训练输出','io.bpuTrain.valid'],['出队内容','io.bpuTrain.bits']
],['64项缓存后端提交的 call/ret，供 RAS 提交状态更新。','enq/deq 指针管理记录寿命；full 预留提交入口余量。','这里只处理已提交信息，不替代 ResolveQueue 的方向/目标训练。']);
add('frontend','ibuffer','ifu','IBuffer 分 bank 与 bypass',fe+'ibuffer/IBuffer.scala',[
 ['指令入队准备','private val enqOffset','external','输入接口'],['预对齐指针','private val ifuAlignedEnqPtrVec','database','内部状态'],['bypass 候选','private val bypassEntries'],['输出寄存器','private val outputEntries','database','内部状态'],['入队反压','io.in.ready'],['redirect 冲刷','when(io.flush)']
],['48项、4写bank、8读bank；当前 DecodeWidth=8。','队列空且后端可接收时走 bypass，vset/vtype 状态会约束 bypass。','输出无空洞，入队使用 IFU 预对齐位置与实际有效指令数量。']);
add('frontend','instr-boundary','ifu','InstrBoundary RVC/RVI 边界',fe+'ifu/InstrBoundary.scala',[
 ['maybeRVC / block 信息','private val maybeRvc','external','输入接口'],['前半块边界','generateBoundary(boundary'],['后半块两候选','generateBoundary(latterHalfBoundary1'],['候选选择','boundary(i) := Mux'],['指令位置输出','io.resp.rawInstrVec']
],['16/32位指令边界由 maybeRVC 决定，后半块按前半末指令是否半条并行推导。','firstInstrIsHalfRvi 处理上一块留下的半条 RVI。','输出位置与 blockSel，数据提取留到后续阶段满足时序。']);
add('frontend','compact-align','ifu','IFU 压紧与写 bank 预对齐',fe+'ifu/Ifu.scala',[
 ['S0 原始位置','s0_rawInstrVec','external','输入接口'],['指令压紧','s1_compactedInstrVec'],['按写指针对齐','s1_baseAlignedInstrVec'],['跨块半条拼接','s1_prevEndHalfRviInfo'],['预译码属性','s1_alignedPdInfoVec']
],['该页描述当前 IFU 内逻辑分组，不把旧 InstrCompact 文件自动当成实际实例。','压紧后按4写bank预对齐，并生成对齐 PC/taken/invalidTaken 信息。','跨 fetch block 的 RVI 拼接使用保存的前块半条和本块数据。']);
add('frontend','pred-checker','ifu','PredChecker 有效范围与目标修正',fe+'ifu/PredChecker.scala',[
 ['CFI 预译码输入','class PredCheckerReq','external','输入接口'],['错误类型检测','jalFaultVec'],['修正指令范围','private val fixedRange'],['修正有效掩码','io.resp.stage1Out.fixedInstrValid'],['最早错误选择','private val mispredIdx'],['FTQ 重定向输出','io.resp.stage2Out.checkerRedirect.valid']
],['检测 JAL/JALR/ret 和 non-CFI taken 等错误，并修正实际指令范围。','stage1Out 修正入队有效性，stage2Out 回写最早误预测位置及正确目标。','不得删除错误反馈以简化几何；与 IFU/FTQ 恢复关系由父图保留。']);
add('frontend','rvc-expander','ifu','RVC Expander 条件译码',fe+'ifu/RvcExpander.scala',[
 ['指令/FS 状态','class RVCExpanderIO','external','输入接口'],['RVC 译码结果','io.out := decoder.decode'],['非法编码反馈','io.ill := decoder.ill'],['32 位透传','io.out := decoder.passthrough']
],['压缩指令通过 decoder 扩为32位；普通指令走 passthrough。','非法压缩编码以 ill 保留，而非当作正常展开结果。','默认 IFU 按 IBufferEnqueueWidth=36 实例化展开位置，并另有非缓存展开器。'],{instances:'默认36个常规展开位置 + 1个非缓存展开位置；有效指令数受掩码限制。'});
add('frontend','ifu-uncache','ifu','IFU 非缓存顺序状态机',fe+'ifu/IfuUncacheUnit.scala',[
 ['请求属性','val shouldWait','external','输入接口'],['等待先前排空','is(UncacheFsmState.WaitLastCommit)'],['非缓存请求','is(UncacheFsmState.SendReq)'],['等待总线响应','is(UncacheFsmState.WaitResp)'],['数据/异常返回','io.resp.bits.exception']
],['PMP-MMIO 或 PBMT-IO 进入 WaitLastCommit；PBMT-NC 可直接发出，首条指令例外。','实际等待条件为 IBuffer 和后端 emptyAfter，不等于无条件按 ROB 每条 commit。','flush 重置 FSM，跨页半条 needResend 通过响应返回。']);
add('frontend','instr-uncache','frontend','Instruction Uncache 总线桥',fe+'instruncache/InstrUncacheImp.scala',[
 ['IFU 请求','io.fromIfu','external','输入接口'],['空闲 entry 分配','entryAllocIdx := PriorityEncoder'],['TileLink 请求','mmioAcquire = bus.a'],['响应接收','mmioGrant   = bus.d'],['IFU 响应仲裁','resp <> respArbiter.io.out']
],['InstrUncache 负责 IFU 非缓存取指的总线事务和数据/异常返回。','总线握手与请求锁存实现多周期取指；跨页/边界重发由上下游协作。','PMP/MMIO 的排空门禁位于 IFU IfuUncacheUnit，桥接页不改变该归属。']);

for(const [id,title,file,flow,notes] of [
 ['icache-prefetch','ICache PrefetchPipe', 'ICachePrefetchPipe.scala', [['FTQ/软件请求','s0_valid','external'],['Meta 与 ITLB 同步入口','io.fromFtq.ready'],['S1 翻译等待','private val s1_state'],['TLB 响应有效','tlbValidLatch'],['缺失请求','io.missReq']], ['S0 同时满足 ITLB 和元数组 ready 才接收；软件预取不写正常取指 WayLookup。','S1 FSM 等待翻译/检查，异常与 miss 条件决定继续查询或发预取。','redirect/BPU 覆盖通过 flush 杀死未稳定请求。']],
 ['way-lookup','WayLookup 元数据队列', 'ICacheWayLookup.scala', [['预取结果','io.write','external'],['32项队列状态','private val entries','database'],['空闲/有效距离','numValidEntries'],['回填更新','entryUpdate'],['双出队条件','canDeqTwo'],['MainPipe 输出','io.toMainPipe.valid']], ['PrefetchDepth=32，分离 write/read 指针和异常指针。','MSHR 回填可更新已有项，updateStall 避免消费不稳定状态。','两项可同时出队取决于有效项数量及回填条件。']],
 ['icache-main','ICache MainPipe', 'ICacheMainPipe.scala', [['FTQ + WayLookup','s0_valid','external'],['SRAM 冲突检查','s0_dataSramReadConflict'],['真实双取指选择','s0_realTwoFetchValid'],['S1 命中数据','s1_sramDatas'],['IFU 返回','io.toIfu']], ['FTQ 与 WayLookup 同时有效才能发 DataArray 读。','双 fetch 还受 SRAM bank 冲突和元数据有效性限制。','命中、MSHR 回填、非缓存属性及异常被合并返回 IFU。']],
 ['icache-miss','ICache MissUnit', 'ICacheMissUnit.scala', [['fetch 请求去重','fetchDemux.io.in.valid','external'],['fetch/prefetch MSHR','new ICacheMshr','messagebus'],['请求优先级','acquireArb.io.in.last'],['TileLink A','io.memAcquire.valid'],['prefetch 排队顺序','private val priorityFIFO','messagebus']], ['默认4 fetch MSHR +10 prefetch MSHR，fetch/prefetch 各自匹配和分配。','fetch 请求与预取请求汇入 Acquire/Get 仲裁，prefetch FIFO 保持优先关系。','L2 响应按 source 归属，回填写阵列并通知上下游。']],
 ['icache-mshr','ICache 单 MSHR', 'ICacheMshr.scala', [['空闲接收门禁','io.req.ready','external'],['请求有效状态','valid','database'],['总线发出条件','io.acquire.valid'],['GetBlock 地址','getBlock'],['回填信息','io.info.valid'],['WFI 安全反馈','io.wfi.wfiSafe']], ['valid/issue 分别记录占用和总线事务已发出。','flush/fence.i 阻止错误请求发布，未返回的已发事务仍影响 WFI safe。','单实例逻辑复用于 fetch 与 prefetch，冲刷策略在父 MissUnit 按类型区分。']],
 ['icache-meta-array','ICache MetaArray', 'ICacheMetaArray.scala', [['双端口读取','r0_validVec','external'],['交错 bank 访问','b.io.read.req.valid'],['响应反旋转','io.read.resp.entries'],['waymask 元数据写','b.io.write.req.bits.entry'],['fence.i 全冲刷','b.io.flushAll']], ['奇偶交错 bank 接受相邻缓存行的 metadata 查询。','rotator/revert 对应请求顺序，写入与 flush 按 set/waymask 选择。','图中读、写、flush 为并行操作依赖，不是每次访问的五级流水。']],
 ['icache-data-array','ICache DataArray', 'ICacheDataArray.scala', [['取指读 ready','io.read.req.ready','external'],['逐 bank 选择','reqReadBankValid'],['set/way 读取','bank.io.read.req.bits.setIdx'],['回填写入','w0_entries'],['逐 bank 写请求','b.io.write.req.bits.entry']], ['默认64B行分为8个64-bit bank，只访问被当前 fetch 范围需要的数据。','set/way 选择支持两 fetch 请求，冲突由 MainPipe 提前检查。','写入包含数据与校验位，valid/ready 共同保证阵列端口可用。']],
 ['icache-replacer','ICache 替换器', 'ICacheReplacer.scala', [['命中 touch','io.touch','external'],['替换状态','replacers','database'],['victim 查询','io.victim'],['目标 way','io.victim.resp.way']], ['默认setplru，支持配置更换替换策略。','按访问set维护替换状态，MSHR 查询得到回填目标way。','多个读取端的touch需合并，不能把数据阵列本身当替换状态。']],
 ['icache-ctrl','ICache CtrlUnit 注错', 'ICacheCtrlUnit.scala', [['控制寄存器','EccCtrlBundle','external'],['使能/注错状态','io.eccEnable'],['注错 FSM','private val iState'],['元数组读改写','io.metaRead.req.valid'],['数据注错写','io.dataWrite.req.valid']], ['可选 CtrlUnit 默认实例化，MMIO 寄存器控制 parity/ECC 检查和错误注入。','InjectFsmState 通过读元数据和写入指定 way 完成一次注错。','注错期间与常规回填共享阵列写口，仲裁在 ICacheImp。']]
]) add('frontend',id,'icache',title,fe+'icache/'+file,flow,notes,{level:'micro'});

add('backend','decode','backend','DecodeStage 多通道译码',be+'vector/Decoder/DecodeStage.scala',[
 ['IBuffer CtrlFlow','class In','external'],['DecodeChannels','val decodeChannels'],['指令通道分配','decodeChannels'],['CSR/VType 恢复','fromCSR'],['译码微操作输出','class Out']
],['当前控制块实例化统一 DecodeStage，不把旧 DecodeUnit 误画为默认译码器。','标量和向量通道处理指令合法性、源目的与微操作数量。','下游反压及向量恢复共同限制接受；具体通道/拆分/选择见子页。']);
add('backend','fusion','decode','Fusion 相邻指令匹配',be+'decode/FusionDecoder.scala',[
 ['相邻指令对','class BaseFusionCase','external'],['组合融合条件','FusedSh1add'],['匹配向量','class FusionDecoder'],['融合控制输出','io.info(i).rs2FromZero']
],['融合器识别特定相邻指令模式，保留微操作对应的架构指令信息。','CSR disableFusion 与单步会禁用融合，不能视为恒定开启。','Fusion 清除第二个实际 uop；ROB 压缩仍需保留两个架构成员。']);
add('backend','vector-split','decode','向量微操作拆分',be+'vector/Decoder/Split/VecUopSplitModule.scala',[
 ['解码后向量指令','class VecUopSplitModule','external'],['拆分控制字段','SplitUopCtlField'],['固定宽度选择','FixedWidthCtlField'],['微操作输出','class VecUopSplitUopOutput']
],['根据向量拆分类型、LMUL/SEW 等译码控制生成每条微操作的源目的和字段。','拆分后的 first/last 及 uOP 信息会影响 Rename、ROB 和精确异常。','这一页是拆分算法数据通路，字段类型本身不当作额外硬件实例。']);
add('backend','uop-select','vector-split','译码 UopSelect 缓冲选择',be+'vector/Decoder/Select/UopSelectModule.scala',[
 ['通道微操作','class UopSelectModule','external'],['输出选择控制','val uopSelectBuffer'],['缓冲/通道候选','val filteredUopFromChannel'],['输出到重命名','out']
],['通道输出与缓冲输出协同选择，保持拆分微操作的顺序。','下游 ready 决定保存/消耗，不能忽略多周期拆分造成的反压。','实际输入输出类型由通道参数决定，示意数据和控制依赖而非新的固定阶段数。']);
add('backend','rename','backend','Rename 分配与恢复',be+'rename/Rename.scala',[
 ['Decode 微操作','val in = Vec','external'],['RAT 读取','val rat = Module'],['FreeList 分配','intFreeList.io.doAllocate'],['Move/依赖旁路','val isMove'],['统一资源门禁','val canOut'],['Rename 输出','val out = Vec']
],['按 INT/FP/VEC/VL 分类读 RAT 并分配物理目的寄存器。','dispatch、各 FreeList、LSQ 和 walk 状态共同限制 canOut。','RAB 提交与 Snapshot/walk 恢复 RAT 和分配指针；Move Elimination 复用源映射。'],{branches:[[1,'映射表','new RenameTableWrapper','database','from'],[2,'空闲表','new StdFreeList','messagebus','from']]});
add('backend','rename-table','rename','RenameTable 推测/架构映射',be+'rename/RenameTable.scala',[
 ['逻辑寄存器读取','val t1_raddr','external'],['推测映射','val spec_table =','database','内部状态'],['读后写旁路','val bypass_data'],['提交架构映射','val arch_table =','database','内部状态'],['恢复快照/架构态','val snapshots'],['旧目的回收','io.need_free']
],['推测映射与架构映射分离，读写旁路保证同周期依赖正确。','redirect 优先修复 spec_table，Snapshot/walk 决定恢复基础。','old_pdest 必须未被架构映射引用且非重复项才允许回收。'],{instances:'RenameTableWrapper 实例化 INT、FP、VEC、VL 四类映射；同设计复用。'});
add('backend','free-list','rename','StdFreeList 分配回收与回滚',be+'rename/freelist/StdFreeList.scala',[
 ['提交回收请求','val freePtr','external'],['尾指针推进','tailPtrNext'],['剩余数量检查','io.canAllocate'],['分配候选选择','val phyRegCandidates'],['head/archHead 更新','val archHeadPtrNext'],['恢复优先级','val realDoAllocate']
],['freeList 环形存储待分配物理寄存器，tail 回收、head 分配。','canAllocate 按 RenameWidth 做余量判断，walk 按自己的有效请求数分配。','redirect 对普通分配有优先级，并以快照/架构 head 修复指针。']);
add('backend','snapshot','rename','SnapshotGenerator 保存与选择',be+'rename/Snapshot.scala',[
 ['快照保存数据','class SnapshotGeneratorIO','external'],['有效快照存储','io.snapshots','database','内部状态'],['入队门禁','when(!io.redirect'],['出队释放','when(!io.redirect && io.deq)'],['定向冲刷','when(flush)']
],['保存调用者传入的映射或队列指针，snapshot 数量取自配置。','队列满/redirect 阻止新保存；已提交快照可被释放。','flushVec 清除特定年轻快照，恢复端按 snptSelect 取数据。']);
add('backend','busy-table','dispatch','BusyTable 唤醒与取消',be+'rename/BusyTable.scala',[
 ['目的分配/写回','val wbMask','external'],['唤醒匹配','wakeupOHVec.zipWithIndex'],['Load dependency','val loadDependency','database','内部状态'],['分配/取消掩码','val allocMask'],['就绪位更新','tableUpdate.zipWithIndex']
],['物理寄存器 busy 随分配/取消置位，写回或合法唤醒清位。','快速唤醒携带loadDependency，Load/OG0取消不能被当作有效就绪。','INT x0 永远 ready；VL 路径对快速Load唤醒有特别约束。']);
add('backend','rob-compression','rename','ROB 压缩组装与例外',be+'rename/CompressUnit.scala',[
 ['架构/实际 uOP 有效','val actualValidVec','external'],['禁止压缩分类','val cannotCompressVec'],['simple/complex 分组','val simpleVec'],['token 边界','val tokenStart'],['prefix 配对状态','var pairStatePrefix'],['entry 成员输出','io.out.isEntryTailLane']
],['架构 valid 与 actualValid 不同，Fusion 不得丢掉被移除 uOP 对应的退休成员。','向量、拆分 uOP、CSR/Fence/AMO、异常/单步等条件禁止压缩。','Simple run/token 和配对 prefix 形成 ROB entry 成员、尾标志和中断安全信息。']);
add('backend','move-elimination','rename','Move Elimination 映射复用',be+'rename/Rename.scala',[
 ['Move 合法性','val isMove','external'],['禁止新目的分配','intFreeList.io.allocateReq'],['源物理映射','uops(i).psrcIntForMove'],['目的寄存器选择','uops(i).pdest := MuxCase'],['RAT 更新与回收','rat.io.intRenamePorts']
],['Move Elimination 属于 Rename 内逻辑，不是新的执行器。','无异常 move 使用源映射，减少目的分配；同组前序依赖必须旁路。','RAT 的架构引用与旧目的去重控制回收，不能假设简单复制后立即释放源物理寄存器。']);
add('backend','dispatch','backend','Dispatch 资源分配与反压',be+'dispatch/Dispatch.scala',[
 ['Rename 接收','io.fromRename','external'],['资源/源就绪','val intBusyTable'],['RegCache tag 查询','val rcTagTable'],['队列/执行口分派','io.toIssueQueues'],['同组接受反馈','io.toRenameAllFire']
],['按照 FuType 和执行区将 uOP 分派到实际 IQ。','BusyTable/RegCacheTag 决定源寄存器和数据来源，ROB/LSQ容量参加接受约束。','redirect 清理错误路径；全组接受信息反馈 Rename。']);
add('backend','rob','backend','ROB 顺序退休与恢复',be+'rob/Rob.scala',[
 ['入队分配','io.enq.canAccept','external'],['writeback 完成','writeback'],['最老异常状态','val exceptionGen'],['退休/Walk 模式','state === s_walk'],['RAB/VType 提交','rab.io.fromRob.commitSize'],['后端冲刷','io.flushOut']
],['默认144项 ROB，跟踪压缩 entry 成员和 uOP完成，不把 ROB项数等同架构指令数量。','RAB=352保存重命名退休信息，VTypeBuffer 保持向量状态顺序。','头部异常、WFI、向量异常修复等限制commit；redirect触发walk恢复。'],{branches:[[2,'异常合并','new ExceptionGen','security','from'],[4,'RenameBuffer','new RenameBuffer','messagebus','from']]});
add('backend','rab','rob','RAB RenameBuffer 提交与 walk',be+'rob/Rab.scala',[
 ['重命名入队','private val enqPtrVec','external'],['入队环形位置','private val enqPtr','database','内部状态'],['退休/恢复游标','private val walkPtr','database','内部状态'],['提交或 walk 输出','io.commits.isCommit'],['容量/模式门禁','io.canEnq'],['重定向修复','when(io.redirect.valid)']
],['默认352项，存每条重命名对应的架构/物理寄存器信息。','ROB 提供 commitSize/walkSize；普通退休与特殊向量 walk 均可能产生回收或恢复记录。','Snapshot 保存 enqPtr，redirect后walk从选中位置重新建立状态。']);
add('backend','rob-exception','rob','ExceptionGen 最老异常追踪',be+'rob/ExceptionGen.scala',[
 ['入队/写回异常','class ExceptionGen','external'],['有效异常候选','s1_out_valid'],['架构最老异常','currentValid','database','内部状态'],['异常数据选择','io.out.bits'],['状态反馈','io.state.bits']
],['合并入队及执行完成报告的异常，按 ROB年龄保留最老未冲刷候选。','redirect 防止错误路径异常覆盖更老的有效异常。','ROB 读取该状态形成精确异常与冲刷条件。']);
add('backend','vtype-buffer','rob','VTypeBuffer 提交与恢复',be+'rob/VTypeBuffer.scala',[
 ['VType 操作入队','private val state','external'],['Snapshot 选择','private val snapshotVType'],['退休/Walk 状态','io.commits.isWalk'],['架构 VType','newestArchVType','database','内部状态'],['译码恢复输出','io.toDecode.walkVType.bits']
],['默认64项，分离推测/架构VType和回滚状态。','普通和特殊walk恢复对应新旧VType，期间可暂停Decode。','已提交VType通过commitVType反馈，不能只画单向执行结果。']);
add('backend','redirect','backend','RedirectGenerator 最老事件仲裁',be+'ctrlblock/RedirectGenerator.scala',[
 ['执行/LoadReplay 候选','class RedirectGeneratorIO','external'],['最老事件选择','oldest'],['ROB 冲刷优先','when(robFlushOrExuFlushValid)'],['延迟冲刷窗口','flushAfterCounter'],['恢复输出','io.stage2Redirect.bits']
],['将执行误预测与访存违例按年龄仲裁，ROB flush 具有更高恢复优先级。','flushAfterCounter 抑制重复/已被更老事件杀死的恢复。','实际目标PC修复由 CtrlBlock 的 FTQ-PC 查询结合该输出完成。']);
add('backend','integer-region','backend','Integer Region 调度与执行',be+'Region.scala',[
 ['IssueQueue 实例','new IssueQueueImp','external','硬件实例'],['操作数数据通路','val dataPath','backend','硬件实例'],['旁路选择','val bypassNetwork','backend','硬件实例'],['执行器组','val exuBlock','backend','硬件实例'],['写回数据通路','val wbDataPath','backend','硬件实例'],['忙表与取消反馈','val wbFuBusyTable']
],['Region 在当前配置承担整数和访存发射；FP/VEC 有新的独立Region。','IQ→DataPath→Bypass→Exu→WB形成主结果通路，取消/唤醒反馈保留。','Og2ForVector是可选旧Region路径，不能与新的VecRegion默认实例混同。']);
for(const [id,title,parent,file,flow,notes] of [
 ['float-region','Float Region','backend','float/FltRegionModule.scala',[['浮点IQ','new FltIssueQueue.LazyMod','external','硬件实例'],['执行流水','new FltIssuePipe.LazyMod','backend','硬件实例'],['读端口仲裁','private val fltRFReadArbiter'],['浮点写回','val fpWbDataPath'],['FU忙表','private val fpWbFuBusyTable']],['FEX0–FEX3执行端使用专用FltIssueQueue/FltIssuePipe。','FP寄存器256项，读冲突、固定/非固定延迟写回和旁路分别处理。','队列唤醒可携带FMA/load来源和取消，完成报告回控制块。']],
 ['vector-region','Vector Region','backend','vector/VecRegionModule.scala',[['向量IQ','new VecIssueQueue.LazyMod','external','硬件实例'],['向量IssuePipe','new IssuePipe.LazyMod','backend','硬件实例'],['VP 写回','val vpWbDataPath'],['V0/VL 写回','val v0WbDataPath'],['写回忙表','private val vpWbFuBusyTable']],['VP/V0/VL等状态与写回端口分开；向量mask/tail与分段访存不能省略。','按当前vecSchdParams配置实际向量执行单元。','WakeUp/Load取消与目的部分写回会影响队列项的就绪性。']],
 ['issue-queue','整数/访存 IssueQueue','integer-region','issue/IssueQueue.scala',[['派发入队','val entries = Module','external'],['源就绪候选','io.srcReadyVec'],['可发射掩码','io.canIssueVec'],['已发射状态','io.issuedVec'],['取消/冲刷反馈','entriesIO.flush']],['IQ各实例容量由IssueBlockParams分别配置，不统一标成旧图24项。','Entries保存uOP与就绪/发射状态，FU/WB忙表约束可选候选。','OG0/OG1/Load取消及反馈可使项目重放或失效。']],
 ['float-issue','FltIssueQueue','float-region','float/FltIssueQueue.scala',[['入队项','private val enqEntries','external'],['快速项','private val fastEntries','database','内部状态'],['FMA/load 唤醒','private val entryFmaM4Wake'],['可发射选择','private val fastEntryCanIssue'],['出队候选','private val deqEntries']],['入队与fast entries分离，项目可保持/迁移。','FMA M4/M2以及Load来源的confirm/cancel影响就绪。','选择后的执行响应可反馈队列，而不是无条件一次出队。']],
 ['vector-issue','VecIssueQueue','vector-region','vector/VecIssueQueue.scala',[['入队项','private val enqEntries','external'],['快速项','private val fastEntries','database','内部状态'],['可发射条件','private val enqEntryCanIssue'],['fast 候选','private val fastEntryCanIssue'],['出队选择','private val deqEntries']],['向量队列包含拆分uOP、源状态与执行反馈。','项的flush依据ROB年龄，不能全队列无条件清空。','向量Load取消、写回和VL/Mask相关约束由实际Entry字段表达。']],
 ['wakeup-queue','MultiWakeupQueue 延迟唤醒','issue-queue','issue/MultiWakeupQueue.scala',[['延迟标签输入','class EnqBundle','external'],['多延迟管线','val pipes'],['按 latency 选择','pipe.io.enq.valid'],['追加路径仲裁','io.enqAppend.ready'],['唤醒输出','io.deq.valid']],['根据latencySet使用多个PipeWithFlush，不把所有FU唤醒视为等延迟。','append通路仅在常规管线无输出时接受。','flushFunc/modificationFunc可取消或更新途中唤醒。']],
 ['datapath','DataPath 读寄存器与取消','integer-region','datapath/DataPath.scala',[['IQ 操作数请求','fromIQDeqOg1Payload','external'],['读端口仲裁','private val intRFReadArbiter'],['RegCache 读取','val regCache'],['旁路数据输出','io.toBypassNetworkRCData'],['OG0/OG1 取消','io.og0Cancel']],['INT RF/RegCache按数据来源选择，PC-target另有读端口。','读冲突与写回忙表可阻止uOP进入执行并产生取消。','本页保留数据供给和取消控制两种依赖。']],
 ['rf-read','寄存器读端口仲裁','datapath','datapath/RFReadArbiter.scala',[['读请求分组','class RFReadArbiterBase','external'],['同端口候选','inGroup'],['最老请求仲裁','new OldestArbiter'],['one-hot 输出','io.out.bits := Mux1H']],['按端口与bank分组，OldestArbiter选ROB年龄最老请求。','未获端口的请求通过ready反馈取消/重试。','INT banked路径与FP/VP/V0/VL路径共用接口但配置不同。']],
 ['writeback','写回端口与目的分派','integer-region','datapath/WbArbiter.scala',[['执行结果','class WbDataPathIO','external'],['目的类型分派','class WbArbiterDispatcher'],['写口冲突仲裁','private val intWbArbiter'],['FP/VEC 写口','private val vfWbArbiter'],['寄存器写入','io.toIntPreg']],['按INT/FP/VP/V0/VL目的类型路由执行结果。','共享物理写端口发生冲突时使用配置优先级并反馈ready。','ROB完成与RF写入是相关但不同接口，不用单一箭头代替。']],
 ['bypass','BypassNetwork 操作数选择','integer-region','datapath/BypassNetwork.scala',[['RF/RC/执行反馈','class FromDataPath','external'],['数据来源枚举','private val forwardOrBypassValidVec3'],['目的与源匹配','pdest'],['旁路/前递选择','private val bypassDataVec'],['执行器输入','class ToExus']],['源操作数可以来自RF、RegCache、直接bypass或forward。','按物理目的与选择控制取得正确数据，Load取消仍影响依赖。','多结果优先级与执行组参数决定连接，不假设全交叉无冲突。']],
 ['regfile','物理寄存器文件与bank','datapath','regfile/Regfile.scala',[['读写端口','class Regfile','external'],['寄存器存储','Reg'],['读地址选择','read'],['有效写入','write'],['分bank封装','class RegfileBank']],['默认INT224、FP256、VEC128、V0=22、VL=32，具体物理端口来自配置。','INT零寄存器与特殊VL行为由参数控制。','同设计实例复用；读/写是并行操作而非每周期五级流水。']],
 ['regcache','RegCache INT/MEM 数据','datapath','regcache/RegCache.scala',[['缓存读写请求','class RegCacheIO','external'],['INT 数据阵列','val IntRegCache'],['MEM 数据阵列','val MemRegCache'],['年龄计时器','val IntRegCacheAgeTimer'],['有效状态联动','IntRegCacheAgeTimer.io.validInfo']],['INT和MEM缓存数据及年龄分别维护，热门物理值减少主RF读取。','写入与读取访问配置独立；tag表在Dispatch/发射路径匹配。','年龄/有效状态约束victim与替换，不能当作架构寄存器。']]
]) add('backend',id,parent,title,be+file,flow,notes);
add('backend','age-arbiter','issue-queue','AgeDetector 最老可发射选择',be+'issue/AgeDetector.scala',[
 ['入队与canIssue','class AgeDetector','external'],['上三角年龄矩阵','val age =','database','内部状态'],['入队更新','def isEnq'],['年龄与有效组合','def getOldestCanIssue'],['one-hot 最老输出','io.out.zip']
],['只保存年龄矩阵上三角，反向关系通过取反重建。','同周期多个入队端口按端口先后更新相对年龄。','无效旧项可保留，canIssue掩码保证只选择可发射项。']);
for(const [id,title,file,request,outToken] of [
 ['iq-enqueue','IQ EnqPolicy 入队候选','EnqPolicy.scala','val canEnqVec','io.enqSelOHVec.zip'],
 ['iq-dequeue','IQ DeqPolicy 出队候选','DeqPolicy.scala','private val requestVec','io.deqSelOHVec.zip']
]) add('backend',id,'issue-queue',title,be+'issue/'+file,[['候选掩码',request,'external'],['SelectOne circ','SelectOne("circ"'],['第 N 个候选','getNthOH'],['valid/one-hot',outToken]],['按候选位图选第N个项目，保持多端口选择不重复。','这是调用的候选政策，不单独宣称所有执行区都使用同一年龄政策。','容量/端口数量来自所属IssueBlockParams。']);
addMemory({add,mem,ca,be});
addCaches({add});
addExecution({add,be});
addDeep({add,fe,be,mem,ca});
addFinal({add,be,mem});
