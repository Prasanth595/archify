# 执行溯源阅读：值来源边不是完整解释链

2026-10-28，只读调研。**0 项实施建议。** 新增深入来源只有 Cyberbrain；广搜五个官方项目，Hunter/snoop/PySnooper 先查重后排除，noWorkflow 仅初筛，不把 README 的能力描述冒充完整实现审计。未安装、import 或执行上游，未开浏览器、采集运行、连接调试端口或改变 live installation。源码与 golden 的一致性仅静态阅读，未声称上游测试通过。

## 查重范围

读取当前 gallery manifest 的59项名称及 value，搜索 2026-10-25/28 scouts 的项目名和机制，并复读 execution-reading-smalltools、debugging-reading-round7、concurrency-evidence-smalltools、concurrency-reading-round13、source-reading-audit-round10、adjacent-discovery-round3，以及 call-sequence-reading。结论是有界的仓库内文本排重，并非全部互联网项目查重。

- Hunter 的 Backlog、snoop/PySnooper 的变量 repr 日志已经在 [debugging round7](../../2026-10-25/scouts/debugging-reading-round7.md)；Birdseye 的表达式选择、嵌套迭代及采样在 [adjacent round3](../../2026-10-25/scouts/adjacent-discovery-round3.md)。不重新包装成新发现。
- Moirae/ShiViz 的事件顺序、重复投递、partial order，既有 trace-waterfall、profile-contexts/normalization 的时间/采样贡献，不是本题的数据来源边。既有 copy-identity 已回答对象别名，static-uses 已回答静态符号使用，witness-groups 已区分共同/替代见证，本轮不复制。
- source-question-tour、line-notes 和 source-keyboard 已解决固定源码的组织与往返；原生 source preview 的14行不等于丢失全文。本轮也不以修改问题标题制造另一个 tour。

## 广搜的一手来源与筛选

| 官方仓库及固定 SHA | 许可与已读路径 | 结果及成本 |
| --- | --- | --- |
| [laike9m/Cyberbrain](https://github.com/laike9m/Cyberbrain/tree/ef92fee10e3fd4ff4bcee38bf8356b0d645519e3) `ef92fee10e3fd4ff4bcee38bf8356b0d645519e3` | [LICENSE](https://github.com/laike9m/Cyberbrain/blob/ef92fee10e3fd4ff4bcee38bf8356b0d645519e3/LICENSE) MIT；README、Python事件/snapshot→RPC、VS Code data/graph、完整官方 test+golden | 新来源，深入1链。可明确把某次赋值关联到具体历史事件；原 viewer 已有祖先/后继高亮。跨Python版本、opcode、值序列化、事件/loop身份若导入均是新维护面；无必要增加适配器。 |
| [ionelmc/python-hunter](https://github.com/ionelmc/python-hunter/tree/b29fb483a14db7cedbb68d354ffd6188c0415c68) `b29fb483a14db7cedbb68d354ffd6188c0415c68` | [LICENSE](https://github.com/ionelmc/python-hunter/blob/b29fb483a14db7cedbb68d354ffd6188c0415c68/LICENSE) BSD-2-Clause；本轮重新读取 README.rst、src/hunter/predicates.py | 与既有 Backlog 窗口/补栈来源分类重复。不是完整值依赖图，不深入第二次。 |
| [alexmojaki/snoop](https://github.com/alexmojaki/snoop/tree/f2f345f3ccc67e170b5329d345acd82e146a62b1) `f2f345f3ccc67e170b5329d345acd82e146a62b1` | [LICENSE.txt](https://github.com/alexmojaki/snoop/blob/f2f345f3ccc67e170b5329d345acd82e146a62b1/LICENSE.txt) MIT；README.md、snoop/tracer.py | 已有行/异常/返回与 repr 对比。文本显示改变不足以证明对象/数据依赖，不另造日志平台。 |
| [cool-RR/PySnooper](https://github.com/cool-RR/PySnooper/tree/4be5c156ffc3315011c42ba521c4d8487052d289) `4be5c156ffc3315011c42ba521c4d8487052d289` | [LICENSE](https://github.com/cool-RR/PySnooper/blob/4be5c156ffc3315011c42ba521c4d8487052d289/LICENSE) MIT；README.md、pysnooper/tracer.py | 与既有 scout 和 snoop 同类，不计新方向。PySnooper canonical owner 是 cool-RR；错误 owner 查询失败未被当成项目不存在。 |
| [gems-uff/noworkflow](https://github.com/gems-uff/noworkflow/tree/4b4c87003e7ba37e491843fff35ef6147bdceea5) `4b4c87003e7ba37e491843fff35ef6147bdceea5` | [README.md](https://github.com/gems-uff/noworkflow/blob/4b4c87003e7ba37e491843fff35ef6147bdceea5/README.md)、[LICENSE](https://github.com/gems-uff/noworkflow/blob/4b4c87003e7ba37e491843fff35ef6147bdceea5/LICENSE) MIT | 新名字但本轮只初筛。官方描述含AST/reflection/profiling及trial provenance。未拿到完整冻结数据库→解析→图链，不以这些宣传作为第二个已验证候选；研究系统/采集平台的集成面也大于这轮只读任务。 |

Cyberbrain、Hunter、snoop 的 SHA 由GitHub default-branch API读取；noWorkflow 用 git ls-remote HEAD 固定。GitHub匿名API后续限流，改用已认证 gh 做Archify查重；未以失败请求填补事实。Stars未参与筛选。

## 深入链：完整7事件的分支 fixture

输入来自作者提交的 [test/test_jump.py](https://github.com/laike9m/Cyberbrain/blob/ef92fee10e3fd4ff4bcee38bf8356b0d645519e3/test/test_jump.py) 和 [test/data/py310/test_jump.json](https://github.com/laike9m/Cyberbrain/blob/ef92fee10e3fd4ff4bcee38bf8356b0d645519e3/test/data/py310/test_jump.json)。这是 **官方测试 golden**，不是生产 trace、当前机器运行记录或本轮采集结果。测试使用 tracer.start/stop，仅定义一个被观测窗口；JSON有完整 response 与更详细 tracer.events 两部分。附录原样保存这两份完整文件及上游许可，不只保留本段选出的事件。

完整 response 有7事件、4 identifiers、0 loops、2个tracingResult键、合计3条来源引用。全量账目如下；括号中是event index，不把index当时间戳。

| event id 后缀 | target / 类型 / 行 | 原始 repr | JSON明确的来源 |
| --- | --- | --- | --- |
| 0 | a / InitialValue / -1 | `[]` | 无来源记录 |
| 1 | x / Binding / 14 | `1` | sources=[]，tracingResult无此键 |
| 2 | x / Binding / 17 | `2` | sources=[]，tracingResult无此键 |
| 3 | b / InitialValue / -1 | `'b'` 的JSON显示为 `"b"` | 无来源记录 |
| 4 | c / InitialValue / -1 | `'c'` 的JSON显示为 `"c"` | 无来源记录 |
| 5 | x / Binding / 19 | `True` | b(3)、c(4) |
| 6 | x / Binding / 20 | `"c"` | c(4) |

JSON的value是序列化文本，比如 `true`，repr则是 `True`；二者不是相同字段。InitialValue行号=-1表示此记录没有赋值源码行，不能发明行号，也不把其index当原赋值发生时间。源码中 a/b/c 在start前定义，InitialValue随追踪读取而进入记录；事件列表不是完整源码语句执行日志。

### 事件如何变成边和阅读动作

1. [tracer.py](https://github.com/laike9m/Cyberbrain/blob/ef92fee10e3fd4ff4bcee38bf8356b0d645519e3/cyberbrain/tracer.py) 在选定frame开启opcode trace，local_tracer处理opcode/exception/return，stop发送frame；不跟进递归frame的设计有显式注释。不是跨进程、跨线程或Python任意版本的全程序因果记录。
2. [value_stack.py](https://github.com/laike9m/Cyberbrain/blob/ef92fee10e3fd4ff4bcee38bf8356b0d645519e3/cyberbrain/value_stack.py) 保存符号来源，二元操作合并stack sources；L846–871的条件跳转handler会pop或保留栈项。它没有在本fixture给常量 `x=1`/`x=2` 增加predicate依赖。
3. [rpc_client.py L23–81](https://github.com/laike9m/Cyberbrain/blob/ef92fee10e3fd4ff4bcee38bf8356b0d645519e3/cyberbrain/rpc_client.py#L23-L81) 不是“找同名变量最后一次赋值”：它用 `source.snapshot.events_pointer[source.name]` 找相应历史事件id。注释用 `x,y=y,x` 解释为什么按最近的同名赋值会错。这是数据读取时快照到赋值实例的映射机制，不能用静态符号边替换。
4. [test/conftest.py](https://github.com/laike9m/Cyberbrain/blob/ef92fee10e3fd4ff4bcee38bf8356b0d645519e3/test/conftest.py) check_tracer_events序列化snapshot/events_pointer，check_response拦截msgpack请求并同golden比较。因此JSON同时有内部sources与RPC端event-id边；fixture不是手工画的说明图，但本轮未运行断言。
5. [rpc_server.ts](https://github.com/laike9m/Cyberbrain/blob/ef92fee10e3fd4ff4bcee38bf8356b0d645519e3/cyberbrain-vsc/src/rpc_server.ts) 收HTTP frame并解msgpack，送webview；[trace_data.js](https://github.com/laike9m/Cyberbrain/blob/ef92fee10e3fd4ff4bcee38bf8356b0d645519e3/cyberbrain-vsc/src/trace_data.js) 初始化events、解value、保留tracingResult Map，并管理loop可见项。
6. [trace_graph.js L156–171](https://github.com/laike9m/Cyberbrain/blob/ef92fee10e3fd4ff4bcee38bf8356b0d645519e3/cyberbrain-vsc/src/trace_graph.js#L156-L171) 对已有tracingResult构造 source_event_id→event.id 边；L493–539 的 findNodesAndEdgesOnTracePath 对指定方向递归，分别取上游和下游。hover高亮并展示值的路径已在L246附近存在。本轮未观测其实际浏览器/VS Code交互。

### 可以回答什么，不能回答什么

“最后一次 x 的序列化值是什么、上游记录关联哪个历史event？”来源直接支持 `"c"`、`test_jump:4`。这有别于只看同名x的所有改写历史：中间 x=1/2/True 在完整记录中存在，但不自动成为最后一次赋值的数据来源。

“为什么程序选择 c？a/b 有没有参与控制判断？”源码 `a == b or c` 明显包含a/b比较，但最后一次x只收到c的来源边。完整fixture还显示 `x=a!=b!=c` 的来源仅b/c，没有a。**不能把tracingResult称为包含所有读取/控制条件的完整动态切片，更不能称所有且仅有真实因果。** 本报告只描述上游明确记录的来源；不能擅自加a/b边修补成自己的语义。是否应把它判为上游缺陷，需先确定其“数据来源”定义与版本合同，本轮不提交bug判断。

两种独立关系必须分开：event.index是记录序；tracingResult是该instrumentation计算的值来源关联。它不是wall-clock、duration、happens-before、消息因果、控制依赖或见证组。来源为空仅能读作“此字段未给出来源”，不能读作“执行不依赖任何输入”。

## 当前Archify已经解决什么

本地只读产品比较固定在 `2c83780d646be256d668ae0433f561b13253158f`；共享研究HEAD以后可能变化。直接读取当前文件而非只复述旧scout：

- [Explainer reader.js](https://github.com/tt-a1i/archify/blob/2c83780d646be256d668ae0433f561b13253158f/archify/explainer/reader.js#L599-L640) 已有 pinned源码卡、路径/行范围、14行预览和固定原文入口。
- [render.mjs](https://github.com/tt-a1i/archify/blob/2c83780d646be256d668ae0433f561b13253158f/archify/explainer/render.mjs#L80) 的code block渲染完整 `source.text`，snippet也保留完整文本；足以放全量7事件表、JSON、源码和警告，不需自建reader。
- [Viewer sourceEvidence](https://github.com/tt-a1i/archify/blob/2c83780d646be256d668ae0433f561b13253158f/viewer/template.source.html#L972-L1015) 验证仓库/版本/blob/行范围并给节点证据。验证的是来源身份，不证明源码或作者边的运行语义。
- `viewer/route-probe.js` 已有基于作者有向边的Journey和局部路径；把Cyberbrain边投成原生Architecture，再加另一套上下游高亮，会复用/重复已有图阅读。没有发现已存在专用Cyberbrain parser的证据，但这不是“应新增一个”的理由。

本轮未运行生成、check或browser-check：没有新HTML、截图、阅读时长、理解正确率、视觉/可访问验收结论。

## live GitHub重叠：有界声明

2026-10-28 经 gh 读取开放PR列表（前100）及关键词查询；没有把候选算成dev已有：

- [#1122](https://github.com/tt-a1i/archify/pull/1122) OPEN，head `9f9f9dacf58832f1c8784a1a24f6e04c456a4881`，读了body+files：已经以完整5017条Catapult原件保留明确flow端点，明确不从相邻时间制造调用因果。本轮不能再做“trace存在显式边”一页同构实验来凑项。Cyberbrain值来源语义不同，但便携静态解释的产品机制差异不足。
- [#1141](https://github.com/tt-a1i/archify/pull/1141) OPEN，head `1176c65b2b610811ef5401ea52f39aeda16c79c4`，读body+files：Architecture关系级版本固定证据正在实现，不再建议关系→源码来源系统。它验证来源identity，不是runtime provenance采集。
- [#1142](https://github.com/tt-a1i/archify/pull/1142) OPEN，head `7155281fc1e22154f0c88bd8349df3a1b0680f79`，读body+files：answer→已有block/source的作者引用归属；不是动态数据依赖，不能用它宣布本题已集成，但也不重做claim/evidence导航。
- #1015 head `fe4f80d2195e0a7b49b7cfe6d3dba7ffd31a7ac8` 和 #1103 head `f0be206acbc90eb7c6c6b636030e3eb28963d284` 仍在此次OPEN列表，分别涉及源码细节阅读及Atlas。仅列表与既有源码审计，不声称本轮重新审过全部实现。
- 全状态关键词 `cyberbrain` 返回0；`"data dependency"` 返回9，其中含#1133/#1142/#1135/#1144等Explainer话题。只支持“这些返回项中未找到专门Cyberbrain值来源reader”，不支持“GitHub不存在相关需求”。

## 决策、具体剩余任务与停止条件

**拒绝本轮实施。** Cyberbrain原工具已经把来源event ID变成可高亮祖先/后继链；剩余具体阅读题是“记录到的值来源边为什么不能回答控制条件”，不是新图种/播放器。现有源码+完整表足以解释，换成Archify页面的净收益尚无证据。测试样例仅7事件，建立snapshot resolver、loop投影、跨版本adapter/recorder都会让维护成本大于已证实价值；不用几行hardcoded边冒充通用支持。

如果未来用户确有一份可分享的完整固定报告，需要先使用原Cyberbrain viewer与现有Explainer做对照，任务只问某一次赋值的**记录来源**，同时要求正确说出控制依赖未提供、未记录不等于没执行。必须保留完整源文件/JSON、版本、许可、全量事件与边数量、缺失/窗口说明。若只是“点变量看上游”原viewer已做到，停止；若必须采集、重跑程序、连接活动会话或自建复杂状态才能成立，另立授权任务。本轮不立实施候选、不请求新adapter。

## 固定文件指纹

SHA-256由直接下载的固定raw字节计算，未规范化换行。以下路径均相对Cyberbrain根：

| path | bytes | SHA-256 |
| --- | ---: | --- |
| [LICENSE](https://github.com/laike9m/Cyberbrain/blob/ef92fee10e3fd4ff4bcee38bf8356b0d645519e3/LICENSE) | 1064 | `ad712f5ab92d442ee1ea4ca9b284c65e3cc584cb7c9f492f42acb867ed13e7aa` |
| [test/test_jump.py](https://github.com/laike9m/Cyberbrain/blob/ef92fee10e3fd4ff4bcee38bf8356b0d645519e3/test/test_jump.py) | 477 | `c10f89c83d1ffd23d5bad2406f2175f4527cbe4869a0d80495bd5840d300ab7f` |
| [test/data/py310/test_jump.json](https://github.com/laike9m/Cyberbrain/blob/ef92fee10e3fd4ff4bcee38bf8356b0d645519e3/test/data/py310/test_jump.json) | 6692 | `79d53207e6388b445abc05d89d8ccf8602f29f5b21692541ede092281b454e16` |
| [test/conftest.py](https://github.com/laike9m/Cyberbrain/blob/ef92fee10e3fd4ff4bcee38bf8356b0d645519e3/test/conftest.py) | 5119 | `586199044b84eb108706ab36f075707163e2645cdc391ddf969f34e1385b0ca0` |
| [cyberbrain/tracer.py](https://github.com/laike9m/Cyberbrain/blob/ef92fee10e3fd4ff4bcee38bf8356b0d645519e3/cyberbrain/tracer.py) | 10015 | `41dab083ab115dc9bbb5cbdd6e8c415df3c10e5608b075df852a1be6509942be` |
| [cyberbrain/frame.py](https://github.com/laike9m/Cyberbrain/blob/ef92fee10e3fd4ff4bcee38bf8356b0d645519e3/cyberbrain/frame.py) | 12645 | `6a26310d41bab5c4092d3a1f3b1f22bf77432edbea2a0a55da721b6d64987fb6` |
| [cyberbrain/value_stack.py](https://github.com/laike9m/Cyberbrain/blob/ef92fee10e3fd4ff4bcee38bf8356b0d645519e3/cyberbrain/value_stack.py) | 52330 | `e1bc698c6ab9db50ffc2d8319d2ccb12473b78a64deed7ed8bf217fb203bb368` |
| [cyberbrain/rpc_client.py](https://github.com/laike9m/Cyberbrain/blob/ef92fee10e3fd4ff4bcee38bf8356b0d645519e3/cyberbrain/rpc_client.py) | 3757 | `51ce5c32ccbb1c9a35971e1cff3ba39db1f9245f8c00fce47b85feeeb39ccbae` |
| [cyberbrain-vsc/src/rpc_server.ts](https://github.com/laike9m/Cyberbrain/blob/ef92fee10e3fd4ff4bcee38bf8356b0d645519e3/cyberbrain-vsc/src/rpc_server.ts) | 2226 | `b4b61b4c4cc7fae18ab67804cb4463116f5d863f2e8d89c622732544e2a837d2` |
| [cyberbrain-vsc/src/trace_data.js](https://github.com/laike9m/Cyberbrain/blob/ef92fee10e3fd4ff4bcee38bf8356b0d645519e3/cyberbrain-vsc/src/trace_data.js) | 9828 | `bbb490259a86026646e5381498ab0f155de13c3b4504492fd7f3d8cd7670bfab` |
| [cyberbrain-vsc/src/trace_graph.js](https://github.com/laike9m/Cyberbrain/blob/ef92fee10e3fd4ff4bcee38bf8356b0d645519e3/cyberbrain-vsc/src/trace_graph.js) | 15556 | `f5dcedf8de1f253f84e8a4fdf3243b3a1bbecc3bf0327fe74153dc770efea7b4` |

广搜来源的重新读取指纹（未作第二条深读链）：

| source / path | bytes | SHA-256 |
| --- | ---: | --- |
| python-hunter/README.rst | 18774 | `04f938ece4d8379e993f7edc6fd562a6c5a3787b89321c95af527a58d3aac6a4` |
| python-hunter/src/hunter/predicates.py | 28990 | `f998cddebeef0bed104336217e7649ddfa9c4fbd0f9d70becb7b944cbb4d5350` |
| snoop/README.md | 21113 | `4490355115911e110ba0230f50d4cb4267584607164253dfa546961f27b21973` |
| snoop/snoop/tracer.py | 11246 | `63444030e3e3610ad9279948411afa3b7f1c5f2bf1de52761b404f9a2b34c262` |
| PySnooper/README.md | 4299 | `5e813d7f69182f094e8b2d8ea731b2512cb2c5a2e7cbbc36866bd3bcee18e70c` |
| PySnooper/pysnooper/tracer.py | 23874 | `7a92f9eecbe4df4d491d63933634103cab292ccd1079ce373c920d6fa5b9db79` |
| noworkflow-README.md | 42941 | `978b2b7a7611153bff5e7d7f04dd1885d51574edd47f6c04a909fefc26ee754e` |
| noworkflow-LICENSE | 1151 | `117c4c573d3da0549c1d28d7a201b34bc6b82372461f16daf7b9eb01353fafcc` |

## 附录：完整官方输入（原字节内容）

以下是完整文件内容，fence之外的排版换行不属于原件。复核时以固定raw链接与上述bytes/hash为身份标准。未截取events，未移除tracer.events/snapshots，也未挑几条记录构造新故事。

### test/test_jump.py

```python
from cyberbrain import Binding, InitialValue, Symbol


def test_jump(tracer, check_golden_file):
    a = []
    b = "b"
    c = "c"

    tracer.start()

    if a:  # POP_JUMP_IF_FALSE
        pass  # JUMP_FORWARD
    else:
        x = 1

    if not a:  # POP_JUMP_IF_TRUE
        x = 2

    x = a != b != c  # JUMP_IF_FALSE_OR_POP
    x = a == b or c  # JUMP_IF_TRUE_OR_POP

    # TODO: Test JUMP_ABSOLUTE. This requires loop instructions to be Implemented.

    tracer.stop()

```

### test/data/py310/test_jump.json

```json
{
    "response": {
        "metadata": {
            "frame_id": "test_jump",
            "frame_name": "test_jump",
            "filename": "test_jump.py",
            "defined_lineno": 4
        },
        "identifiers": [
            "a",
            "x",
            "b",
            "c"
        ],
        "loops": [],
        "events": [
            {
                "lineno": -1,
                "index": 0,
                "offset": 20,
                "filename": "test_jump.py",
                "id": "test_jump:0",
                "target": "a",
                "value": "[]",
                "repr": "[]",
                "type": "InitialValue"
            },
            {
                "lineno": 14,
                "index": 1,
                "offset": 28,
                "filename": "test_jump.py",
                "id": "test_jump:1",
                "target": "x",
                "value": "1",
                "repr": "1",
                "type": "Binding"
            },
            {
                "lineno": 17,
                "index": 2,
                "offset": 36,
                "filename": "test_jump.py",
                "id": "test_jump:2",
                "target": "x",
                "value": "2",
                "repr": "2",
                "type": "Binding"
            },
            {
                "lineno": -1,
                "index": 3,
                "offset": 40,
                "filename": "test_jump.py",
                "id": "test_jump:3",
                "target": "b",
                "value": "\"b\"",
                "repr": "\"b\"",
                "type": "InitialValue"
            },
            {
                "lineno": -1,
                "index": 4,
                "offset": 50,
                "filename": "test_jump.py",
                "id": "test_jump:4",
                "target": "c",
                "value": "\"c\"",
                "repr": "\"c\"",
                "type": "InitialValue"
            },
            {
                "lineno": 19,
                "index": 5,
                "offset": 60,
                "filename": "test_jump.py",
                "id": "test_jump:5",
                "target": "x",
                "value": "true",
                "repr": "True",
                "type": "Binding"
            },
            {
                "lineno": 20,
                "index": 6,
                "offset": 72,
                "filename": "test_jump.py",
                "id": "test_jump:6",
                "target": "x",
                "value": "\"c\"",
                "repr": "\"c\"",
                "type": "Binding"
            }
        ],
        "tracingResult": {
            "test_jump:5": [
                "test_jump:3",
                "test_jump:4"
            ],
            "test_jump:6": [
                "test_jump:4"
            ]
        }
    },
    "tracer.events": [
        {
            "lineno": -1,
            "index": 0,
            "offset": 20,
            "filename": "test_jump.py",
            "id": "test_jump:0",
            "target": {
                "name": "a",
                "snapshot": null
            },
            "value": "[]",
            "repr": "[]",
            "__class__": "InitialValue"
        },
        {
            "lineno": 14,
            "index": 1,
            "offset": 28,
            "filename": "test_jump.py",
            "id": "test_jump:1",
            "target": {
                "name": "x",
                "snapshot": null
            },
            "value": "1",
            "repr": "1",
            "sources": [],
            "__class__": "Binding"
        },
        {
            "lineno": 17,
            "index": 2,
            "offset": 36,
            "filename": "test_jump.py",
            "id": "test_jump:2",
            "target": {
                "name": "x",
                "snapshot": null
            },
            "value": "2",
            "repr": "2",
            "sources": [],
            "__class__": "Binding"
        },
        {
            "lineno": -1,
            "index": 3,
            "offset": 40,
            "filename": "test_jump.py",
            "id": "test_jump:3",
            "target": {
                "name": "b",
                "snapshot": null
            },
            "value": "\"b\"",
            "repr": "\"b\"",
            "__class__": "InitialValue"
        },
        {
            "lineno": -1,
            "index": 4,
            "offset": 50,
            "filename": "test_jump.py",
            "id": "test_jump:4",
            "target": {
                "name": "c",
                "snapshot": null
            },
            "value": "\"c\"",
            "repr": "\"c\"",
            "__class__": "InitialValue"
        },
        {
            "lineno": 19,
            "index": 5,
            "offset": 60,
            "filename": "test_jump.py",
            "id": "test_jump:5",
            "target": {
                "name": "x",
                "snapshot": null
            },
            "value": "true",
            "repr": "True",
            "sources": [
                {
                    "name": "b",
                    "snapshot": {
                        "location": null,
                        "events_pointer": {
                            "a": 0,
                            "x": 1,
                            "b": 0
                        }
                    }
                },
                {
                    "name": "c",
                    "snapshot": {
                        "location": null,
                        "events_pointer": {
                            "a": 0,
                            "x": 1,
                            "b": 0,
                            "c": 0
                        }
                    }
                }
            ],
            "__class__": "Binding"
        },
        {
            "lineno": 20,
            "index": 6,
            "offset": 72,
            "filename": "test_jump.py",
            "id": "test_jump:6",
            "target": {
                "name": "x",
                "snapshot": null
            },
            "value": "\"c\"",
            "repr": "\"c\"",
            "sources": [
                {
                    "name": "c",
                    "snapshot": {
                        "location": null,
                        "events_pointer": {
                            "a": 0,
                            "x": 2,
                            "b": 0,
                            "c": 0
                        }
                    }
                }
            ],
            "__class__": "Binding"
        }
    ]
}
```

### LICENSE

```text
MIT License

Copyright (c) 2020 laike9m

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

```

