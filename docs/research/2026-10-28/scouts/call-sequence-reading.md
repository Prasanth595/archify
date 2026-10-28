# 调用、递归与返回：同一条生命线究竟代表什么

2026-10-28，只读研究。结论：**本轮没有值得新增的独立实验**。六个项目的来源筛查及三项深读发现了有用语义区别，但 self-message 已由 #570 / #571 覆盖；把这些区别再做一个说明页，尚无超过已有53项的增量价值。尤其不能为了画出递归而虚构第二个参与者，也不能把包级自调用称为递归。

本报告只写这一文件。未执行上游代码、安装依赖、生成产品、提交、推送、评论、合入、发布或安装Archify；从公开JSON计算摘要、计数和栈配对属于静态材料核验。研究使用 research Skill；当前代理本身即为协调者委派的后台研究成员。

## 现有能力与排重

本轮读过[53项总账](../../2026-10-25/README.md)、[runtime-code-reading](../../2026-10-26/scouts/runtime-code-reading.md)及[control-data-reading](../../2026-10-25/scouts/round19-control-data-reading.md)。不重做 Trace waterfall 的 X 区间、Delivery witness 的投递身份、Task occurrences 的位置/身份、运行时逐行值，或静态控制/数据依赖图。

以协调者指定的真实dev [`6ca6a5c84439b57ea22e0630fe306e1d91587a6e`](https://github.com/tt-a1i/archify/tree/6ca6a5c84439b57ea22e0630fe306e1d91587a6e) 为能力基线，不用实验cwd推断dev。已直接 `git show` 核对该版 [Sequence README](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/archify/renderers/sequence/README.md)、[renderer](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/archify/renderers/sequence/render-sequence.mjs)：

- 已有按作者给定 y 排列的消息、return / dashed变体、激活区间、分段与说明卡；return是视觉变体，不是调用栈配对合同；activation是作者给定的 y 区间。
- 同端点仍明确拒绝为 `sequence/self-message-unsupported`。不能宣称“schema接收”就意味着产品能画自调用。
- 实时查询GitHub open issue/PR后，直接重叠是 [#570](https://github.com/tt-a1i/archify/issues/570) 和 [#571](https://github.com/tt-a1i/archify/pull/571)，PR head为 `48ec9db0ac11fe7826ea71f9e6de1d4f258fa0f8`。PR说明覆盖loop朝向、连续/混合self-call、长标签/说明及普通消息保持，不再推荐另一套loop几何。PR自述的测试/CI不算本报告执行证据。
- [#93](https://github.com/tt-a1i/archify/issues/93) 已讨论 Mermaid sequence导入；[#452](https://github.com/tt-a1i/archify/issues/452) 已讨论按作者顺序读调用。单纯增加一种文本导入或调用顺序突出，同样不构成本轮新方向。当前也有 [#923](https://github.com/tt-a1i/archify/pull/923)、[#891](https://github.com/tt-a1i/archify/pull/891) 分别处理Sequence说明调整和诊断，不能把已有工作重新包装为探索发现。

## 六个项目，按机制筛查

不以星数筛选。所有SHA在本轮查询固定；许可读到文件，不只依赖GitHub API标签。404的猜测仓库名不计入六项。

| 项目 / 固定SHA | 来源、实际机制与筛选 |
| --- | --- |
| [blockdiag/seqdiag `9ffd7bf4e65f2508f3f7a2041f77564bc44deafa`](https://github.com/blockdiag/seqdiag/tree/9ffd7bf4e65f2508f3f7a2041f77564bc44deafa) | [Apache-2.0全文](https://github.com/blockdiag/seqdiag/blob/9ffd7bf4e65f2508f3f7a2041f77564bc44deafa/LICENSE)。DSL显式声明调用、返回、异步箭头、自引用；builder与metrics落地。深读①。self-loop直接与#571重叠。 |
| [hidayetzadeyusif-cell/stacksprout `f230441c9435454cb4d06136d0a6022e32e3f320`](https://github.com/hidayetzadeyusif-cell/stacksprout/tree/f230441c9435454cb4d06136d0a6022e32e3f320) | [MIT全文](https://github.com/hidayetzadeyusif-cell/stacksprout/blob/f230441c9435454cb4d06136d0a6022e32e3f320/LICENSE)。小型Python装饰器给每次调用分配id/父id/逻辑进出步数，再在Tk画布分类future/active/completed。深读②。不是新trace采集器候选。 |
| [applandinc/appmap-js `cac2f2bfb81a453fb00e72f4b35781a609606c44`](https://github.com/applandinc/appmap-js/tree/cac2f2bfb81a453fb00e72f4b35781a609606c44) | [`packages/sequence-diagram/LICENSE.txt`](https://github.com/applandinc/appmap-js/blob/cac2f2bfb81a453fb00e72f4b35781a609606c44/packages/sequence-diagram/LICENSE.txt) 是 **MIT附Commons Clause**，不可写成纯MIT。真实recording fixture→actor聚合、调用树、返回类型与golden PlantUML；深读③。只研究机制，不搬实现或fixture进实验。 |
| [Bishalsarang/Recursion-Tree-Visualizer `e4b46fed3347150ded25c15a9a8df45da5c8f22b`](https://github.com/Bishalsarang/Recursion-Tree-Visualizer/tree/e4b46fed3347150ded25c15a9a8df45da5c8f22b) | [MIT全文](https://github.com/Bishalsarang/Recursion-Tree-Visualizer/blob/e4b46fed3347150ded25c15a9a8df45da5c8f22b/LICENSE.md)；[visualiser.py](https://github.com/Bishalsarang/Recursion-Tree-Visualizer/blob/e4b46fed3347150ded25c15a9a8df45da5c8f22b/visualiser/visualiser.py) 的wrapper增加node_num，正常返回后把result写在节点标签；[完整fib示例](https://github.com/Bishalsarang/Recursion-Tree-Visualizer/blob/e4b46fed3347150ded25c15a9a8df45da5c8f22b/examples/fibonacci.py) 调fib(6)。这是每次调用一个节点的树，不是同一生命线上的返回消息；不以函数名或参数去重。现有Tree可讲，尚无独立用户问题。 |
| [melodypapa/autosar_calltree `41dc0161a7f05b8a56eb13de6708fb9e231d68af`](https://github.com/melodypapa/autosar_calltree/tree/41dc0161a7f05b8a56eb13de6708fb9e231d68af) | [MIT全文](https://github.com/melodypapa/autosar_calltree/blob/41dc0161a7f05b8a56eb13de6708fb9e231d68af/LICENSE)；[mermaid_generator.py](https://github.com/melodypapa/autosar_calltree/blob/41dc0161a7f05b8a56eb13de6708fb9e231d68af/src/autosar_calltree/generators/mermaid_generator.py) 默认include_returns=false；启用时在遍历子树后为非recursive节点补固定return字样，recursive节点用特殊终止箭头标记。不代表记录到函数返回值、真实执行次数或递归终止。完整[circular_functions.c](https://github.com/melodypapa/autosar_calltree/blob/41dc0161a7f05b8a56eb13de6708fb9e231d68af/tests/fixtures/traditional_c/circular_functions.c) 与[generator tests](https://github.com/melodypapa/autosar_calltree/blob/41dc0161a7f05b8a56eb13de6708fb9e231d68af/tests/unit/generators/test_mermaid_generator.py)是静态来源，不能当运行trace。 |
| [mermaid-js/mermaid `7b981f640c63cacd06742a95a55c1351c5440582`](https://github.com/mermaid-js/mermaid/tree/7b981f640c63cacd06742a95a55c1351c5440582) | [MIT全文](https://github.com/mermaid-js/mermaid/blob/7b981f640c63cacd06742a95a55c1351c5440582/LICENSE)；[sequenceRenderer.ts](https://github.com/mermaid-js/mermaid/blob/7b981f640c63cacd06742a95a55c1351c5440582/packages/mermaid/src/diagrams/sequence/sequenceRenderer.ts#L1939-L1955) 特判同端点并调整activation锚点。可参考绘制语义，但#571已经承接该问题；不再做通用Mermaid兼容或替换渲染器。这里只深读相关几何，不声称覆盖完整parser/tests。 |

## 深读①：seqdiag的自引用、返回和异步均由作者声明

完整官方输入 [`examples/edge_type.diag`](https://github.com/blockdiag/seqdiag/blob/9ffd7bf4e65f2508f3f7a2041f77564bc44deafa/examples/edge_type.diag) 为485B，SHA-256 `89aa6d6c7139f6d2c6c310a5832c4e2f85b19e50c3634009d4d4afb3f4738d16`。其九条声明依次覆盖普通、虚线、两种异步、四种返回和最后的A→A。这里读了完整文件，不挑单条漂亮箭头充作完整运行。

[`DiagramEdge.set_dir/direction`](https://github.com/blockdiag/seqdiag/blob/9ffd7bf4e65f2508f3f7a2041f77564bc44deafa/src/seqdiag/elements.py#L153-L207) 把同列识别为self，并对普通单向自引用关闭自动激活；[`EdgeMetrics.shaft`](https://github.com/blockdiag/seqdiag/blob/9ffd7bf4e65f2508f3f7a2041f77564bc44deafa/src/seqdiag/metrics.py#L310-L327) 构造右折、向下、折回的四点路径。不是让两个相同端点走零长度直线。

[`instantiate_edge`](https://github.com/blockdiag/seqdiag/blob/9ffd7bf4e65f2508f3f7a2041f77564bc44deafa/src/seqdiag/builder.py#L182-L225) 可把both拆成forward与back，back设为虚线并取return_label；[`drawer.edge`](https://github.com/blockdiag/seqdiag/blob/9ffd7bf4e65f2508f3f7a2041f77564bc44deafa/src/seqdiag/drawer.py#L99-L111) 根据asynchronous改箭头头部。它画出作者声明，没从代码证明这些是已发生的调用。完整输入同时出现异步和返回符号也不能证明某个任务已await、回调已送达或跨线程happens-before。

对Archify的价值是解释边界和#571的既有几何问题；不支持另起“Sequence支持self-call”实验。

## 深读②：stacksprout区分递归实例，但没有异步因果模型

完整官方 [`examples/factorial.py`](https://github.com/hidayetzadeyusif-cell/stacksprout/blob/f230441c9435454cb4d06136d0a6022e32e3f320/examples/factorial.py) 为174B，SHA-256 `8cbcb628b84b14f38c89a4570765f119513fa06988fa3cafd49894a72f19f586`。声明一个递归factorial，调用factorial(5)，最后把被装饰函数交给visualize_tree；没有预存JSON expected，也没有本轮运行输出。

完整 [`tracer.py`](https://github.com/hidayetzadeyusif-cell/stacksprout/blob/f230441c9435454cb4d06136d0a6022e32e3f320/stacksprout/tracer.py) 只有同步wrapper：入栈分配my_id，以stack[-1]为父，timer入/出各加一；result仅在正常返回时写入，finally总会记录out_time并pop。可从源码推导本例调用id 1…6分别对应n=5…0、进入步1…6、退出步12…7；这是**静态推演**，不称实测。反例是异常：finally仍有out_time而result仍None；不能将“有退出”解释为成功返回。

[`animation.animate`](https://github.com/hidayetzadeyusif-cell/stacksprout/blob/f230441c9435454cb4d06136d0a6022e32e3f320/stacksprout/animation.py#L116-L159) 根据cursor和in/out分类节点，不是按墙钟时间播放。每次实例都有身份，比仅画fact→fact更能解释递归展开；但这已经落入Task occurrences和已有runtime阅读的邻域。

具体异步反例（源码推论，未执行）：若给async def套这个同步wrapper，func调用先返回coroutine对象，finally会马上出栈；真正await后的递归或任务执行不在这个记录区间。不同被装饰函数各自有closure栈，也不能据此自动得到完整互递归父链。扩展到await、task身份、异常态需要新的采集合同，不是迁移此小库就能获得的功能。本轮不引入这些状态。

## 深读③：AppMap的models→models实际不是递归

完整官方输入 [`show_user.appmap.json`](https://github.com/applandinc/appmap-js/blob/cac2f2bfb81a453fb00e72f4b35781a609606c44/packages/sequence-diagram/tests/fixtures/app/tmp/appmap/show_user.appmap.json) 为15768B，SHA-256 `7f626e4549618ed162aac7b63edccdcaa300a756b582595c62aed620fbed0e46`。静态解析核对到18 events、9 call/return对、唯一thread_id=2380；每个return.parent_id都与顺序栈顶一致，最终栈空。没有运行Ruby或AppMap。

| call id → return id | 输入给定的调用与结果种类 |
| --- | --- |
| 1 → 18 | UsersController#show → Array |
| 2 → 5 | User.find → User |
| 3 → 4 | Database.query → 无return_value字段 |
| 6 → 17 | Views::Users::Show#show → Hash |
| 7 → 12 | User#posts → Array |
| 8 → 11 | Post.find_for_user → Array |
| 9 → 10 | Database.query → 无return_value字段 |
| 13 → 14 | Views::Posts::Show#show → String |
| 15 → 16 | Views::Posts::Show#show → String |

[`tests/util.ts`](https://github.com/applandinc/appmap-js/blob/cac2f2bfb81a453fb00e72f4b35781a609606c44/packages/sequence-diagram/tests/util.ts) 用buildAppMap消费完整记录，loadDiagram默认loops=true；[`buildDiagram.ts`](https://github.com/applandinc/appmap-js/blob/cac2f2bfb81a453fb00e72f4b35781a609606c44/packages/sequence-diagram/src/buildDiagram.ts) 将code object按specification选择为actor，维持请求/事件栈并构建返回类型，再可选合并重复子序列；[`formatter/plantUML.ts`](https://github.com/applandinc/appmap-js/blob/cac2f2bfb81a453fb00e72f4b35781a609606c44/packages/sequence-diagram/src/formatter/plantUML.ts) 输出消息及激活。

[`完整golden UML`](https://github.com/applandinc/appmap-js/blob/cac2f2bfb81a453fb00e72f4b35781a609606c44/packages/sequence-diagram/tests/fixtures/app/tmp/appmap/show_user.sequence.uml) 1463B，SHA-256 `7916fc1b9f2f265ba762e95c87e29c86694f919acd2c7b9de156fec4e31869b2`；[`integration test`](https://github.com/applandinc/appmap-js/blob/cac2f2bfb81a453fb00e72f4b35781a609606c44/packages/sequence-diagram/tests/integration/sequenceDiagram.spec.ts) 对fixture集合格式化后与golden完整比较，不只是检查出现某个关键字。本轮读到了测试，没有执行它。

这个golden的自调用把call7与call8所在的两个类都聚合成models：真实 [`User#posts`](https://github.com/applandinc/appmap-js/blob/cac2f2bfb81a453fb00e72f4b35781a609606c44/packages/sequence-diagram/tests/fixtures/app/lib/models/user.rb#L17-L19) 调用 [`Post.find_for_user`](https://github.com/applandinc/appmap-js/blob/cac2f2bfb81a453fb00e72f4b35781a609606c44/packages/sequence-diagram/tests/fixtures/app/lib/models/post.rb#L18-L21)。这是**同一展示参与者里的跨类调用**；不是同函数递归、同实例重入或重复投递。call8的Array返回仍回到call7；不能仅凭models→models两个相同字符串消除该消息。两次Posts Show实例在golden合成Loop 2，原记录仍是13/15两个call id。

另一个限制：输入未提供Database.query的return_value，builder在没有异常时投影成void。这是工具投影规则，不是从缺字段证明业务函数的语言级返回类型。fixture只有单线程；虽然buildDiagram出现顺序栈，本报告没有跨线程/async fixture验证，不能把它描述成通用异步因果引擎。

源码包许可是MIT附Commons Clause。研究可指出机制，但本轮没有把实现、fixture、golden或截图复制到可发布实验；未来若要复用必须先解决具体文件许可和发布用途，不能只附一条MIT声明。

## 是否有一个值得做的不同方向

没有推荐新增实施。最接近的新问题是“actor聚合后的self-call与递归实例/return配对如何区分”。后续可用完整公开输入或明确标注的构造复现，比较读者能否区分跨类调用、递归实例和返回配对，判断现有notes/cards/return变体是否足够；不要求先观察到真实Archify用户失败。本轮没有提出超过已有实验的充分增量价值：核心self-loop已有#571，而完整trace导入会增添配对、缺失返回、异常、线程与过滤等合同，成本远高于一处loop绘制。

后续探索可先限定为完整、许可明确的单线程fixture，或清楚标注的构造复现，保留call/return id、父调用和actor映射，以同actor跨类调用与同函数递归作对照；缺失return不能补成功，异常不当正常返回，异步/跨线程无证据则标未知。可先用现有Explainer+Tree+Sequence比较同输入下的读者任务；若依赖self-call，明确实验采用的能力、固定版本及其未合入状态即可，无须等待#571合入。实际浏览器图片和适用的交互、说明、导出检查应服务于所选比较，同时说明哪些材料是上游记录、静态推演或本轮运行；能画出图本身不足以证明新增阅读价值。

本报告的验证仅为固定来源读取、完整fixture字节摘要、JSON计数/配对以及GitHub排重；没有运行Archify renderer/test/browser套件，因此没有新增运行时或用户收益结论。
