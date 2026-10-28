# profile-contexts 独立只读审查

日期：2026-10-28。审查人：Codex 独立子 agent。基线：`6ca6a5c84439b57ea22e0630fe306e1d91587a6e`；分支 `codex/lab-profile-contexts`。实验尚未提交，按文件 SHA-256 绑定，不把工作区 HEAD 当实验内容身份。

## 结论

在下方已绑定的快照上，没有发现数据正确性、完整性或静态阅读回链的阻塞缺陷。这个离线实验有明确价值：同页解释上下文 node total=7 与函数 a total=9 的差别，并保留每一条原始 occurrence 和可复核算式。成本局限于一份固定原件生成器、实验测试和派生产物，没有引入共享状态或通用 profiler 解析器。

这仅是静态正确性/范围结论。实际视觉、键盘、指针、源卡交互、CI 和人类接受不在本次审查的证据范围；root 另负责真实 Ego 验证。最终布局与证据完成后，需要追加 hash 差异绑定。

## 审查依据和范围

已读取 AGENTS.md、CONTRIBUTING.md、REVIEWING.md、仓库 archify-review/test-value skill、冻结合同 `<external-feasibility-report>`、研究 hub 的 profile-context-reading 报告、完整原件、生成器及测试。按内部实验审查处理，沿用用户研究/实施授权；不创建 PR、代表人类确认、批准合并或安装。

独立核读本机固定 speedscope archive 的 `src/import/bg-flamegraph.ts` 与 `src/lib/profile.ts`：

- folded key=name，原样本每帧 total 按 Set 去重，节点按完整上下文累计；连续同 leaf 的内部样本可合并，输入 ledger 的 occurrence 则保持原位置。
- flatten 的 retained/null 栈按 open/close 跟踪；null close 不删除外层 retained frame。
- Frame self/total 最后由原始 profile 覆盖；这与 flattened node self/total 是不同口径。
- 上游四行注释反例完整保留，未冒充采集样本。

没有运行上游、任何浏览器、共享 test runner、安装、commit 或 push。仓库只读；仅在本报告 `/tmp` 目录写入快照、独立 oracle 和结果。

## 快照身份

| 文件 | SHA-256 |
| --- | --- |
| generate.mjs | `5fb5aaeed41f520190ba40107051fac2783d5feaea23a124722ca381bcd6daf3` |
| profile-contexts.test.mjs | `80794b693507e009533b76a86db9003780d86ab0ba1a9d9c88538001a513ab2e` |
| output/ledger.json | `a9c56435f79e035f39878d35db91863bedccf57e789b91ced3e76c1e23a4ee4a` |
| output/candidate.explainer.json | `a7c851ac9b936965a7e5bce72b9c77a4a03a40946b2d3143083d1590652c1500` |
| output/candidate.html | `5d03c4718122850733b5db2e72d6fb8148c5faa3b9dd55dbf31e685862996c42` |

测试文件复制时作者已并行修改，因此其 hash 与初始只读命令的 `32e0c7...` 不同；审查实际保存并阅读的是上表 `80794b...` 快照。数据 oracle 不 import 作者生成器或测试。

## 独立复核

执行 `python3 <external-review-evidence>/independent_oracle.py`，535 项断言通过。详细结果为同目录 `independent-oracle.json`。数量只是复核记账，不代表535项独立产品能力。

1. 直接从完整 raw bytes 构建另一套 Python comprehension oracle，核对全部11 raw prefix 的 self/total/成员；Frame a=1/9、b=5/9、c=4/4；raw全部 a node total=18，Frame totals合计22，总输入权重10，口径未混用。
2. 直接从完整 JSON 的 samples/weights 各位置计算全部4 prefix；5条 occurrence 权重1/1/4/3/5合计14，Frame index保身份，所有 pointer和源行11/12真实。J01/J02及R04/R08分别保留，没有因相同栈/文本丢失。
3. 以全10行固定 retained-stack表独立核对 flat 模型；4 prefix及 self/total/成员正确。按 eventIntervals 直接积分与该表一致；所有 suppressed close 后 outer active frame仍在。四行反例得到 node a=1/4、a;b=3/3，但Frame仍a=4/4、b=0/3；覆写前a=1/4、b=3/3足以区分错误重算。
4. 解析实际候选HTML，逐行核对所有关系：raw38、flat22、JSON14，共74个真实row anchor。每条贡献有实际 incoming detail链接；每条detail内有同namespace同prefix的返回anchor及正确`data-diagram-link`/`data-diagram-hash=focus=...`。全文本原件在真实public HTML内完整保留。所有本地anchor href均有真实目标。
5. 技术root明确不是函数；19个非root preview节点分别有nodeBlocks→贡献段映射，不按显示名称合并。raw两个c上下文到flat一个c上下文的映射正确。

独立oracle编写时曾把第2行末尾的null close期望误写为空栈，实际应保留b；修正审查oracle后通过。随后也把原生node链接的HTML表现从错误假设的href suffix改为实际受支持的`data-diagram-hash`断言。这两次是审查工具期望修正，不是产品修复。

## 范围、测试价值与剩余证据

没有新增共享checker、Viewer桥接或schema；fixture数据完整，未通过删节点、删记录或裁剪原文改善布局。固定回链明确只回同prefix入口，没有宣称动态恢复任意DOM opener或Viewer后来改选的反向联动。URL-only provenance与Git excerpt验证区别、未知folded单位与JSON sampled seconds均披露准确。

作者 focused tests 的常量表、重复 occurrence、同名不同index、null close、四行Frame反例和真实target检查能区分具体错误；本次用独立原bytes算法补核，避免仅复跑同实现测试。无需为本静态审查运行全量renderer矩阵。布局改变后仅数字和ledger未变的证据可复用，实际HTML锚点、产物hash和视觉证据必须针对新产物绑定。

待最终证据完成的事项，均不归类为已复现数据缺陷：

- 当前`candidate.finalize-summary.json`报告旧browser evidence artifact hash不匹配产生`viewer/evidence-path-conflict`，browser-check并未执行；旧receipt不能用来证明新候选通过或失败。应保留历史失败并给最终产物新receipt。
- 初始横向raw树过小与共享keyboard遍历预算问题由root跟踪；当前`generate.mjs`已为down完整树。PR #1124仍为独立未合并工作，不能据此宣称base6ca6的public gate已修复，也无需把共享checker改动带入本实验。
- 页面说浏览器与CI状态“另见README”，快照时README尚未生成。最终文档需明确public gate的实际结果、局部延长Tab观察的区别，以及无CI/无人类接受等真实边界。

稳定身份采用固定namespace + 固定输入首次出现次序的id，并可通过ledger找回完整prefix。它满足这次固定fixture实验；没有声明输入编辑后id跨版本稳定，不建议为此扩充通用身份系统。


## 最终差异绑定（候选已冻结）

收到root冻结信号后再次逐字节比较：generate、测试、ledger、Explainer JSON和HTML与上方独立审查快照完全相同，无静态正确性证据失效。candidate仍`5d03c4718122850733b5db2e72d6fb8148c5faa3b9dd55dbf31e685862996c42` / 1661053B；baseline为`c5d99514b65aa429bf7648b8bf200eaf7f882189816891aa3faa0831c50b0605` / 20093B。全量最终hash和新文件审查范围见`final-delta.json`。

追加阅读README、verify.mjs、traverse.mjs及portable verification/完整Tab trace：没有发现新的正确性或范围阻塞。README已经生成，原“另见README”缺口已解决。重读外部原始证据`<external-run-evidence>/11-finalize.stdout`与`11-evidence/candidate.browser-check.json`，均绑定最终HTML，实际public browser-check失败68项全部为keyboard-traversal，validate/deliver/check通过；`14-check.stdout`独立strict check为ok；`13-tests.stdout`为7/7、0failed、0skipped。旧output内evidence-path-conflict回执是历史失败，不能当最终结果，最终README已经分清。

对四组完整Tab trace重新计算初始target身份集合：每组448步unique428/445，第468步445/445；每组额外23个非初始target焦点身份。脚本使用真实Input keyDown/keyUp；不调用focus()、不改tabindex或HTML。artifactBefore/After都为最终5d03...，README统计与raw trace一致。这是本页漏报的有界解释，不使public gate变成pass，也不能证明共享checker所有情况已解决。

root报告已在真实Ego走通p06来源卡Tab→贡献→R04→固定同prefix入口、精确Viewer打开/Escape回当前opener，并核R04/R08与J01/J02分离。该信息仅归为协调者报告，本审查未自行运行浏览器或查看/接受截图；root仍在核390窄屏入口，最后图片及文档包装由root负责。无需重跑未改变的数字oracle；若root仅追加图片与证据文档，不改变候选字节，本静态结论继续适用。

非阻塞交付提醒：当前工作目录仍保留含本机路径/旧hash的原始CLI sidecar，README承诺不公开提交。最后stage范围须排除这些历史原始回执，仅提交portable summary、所需完整Tab trace和明确选择的图片。此提醒不是要求删除证据，也不是新增产品行为门禁。

最终 disposition：静态正确性/完整性/固定回链范围审查无阻塞；public browser-check保持fail；真实视觉/窄屏接受与最终图片包装由root报告；无CI、无合并/发布/安装、人类接受未被本报告代替。
