# rr / Pernosco 逆向调试阅读探针

2026-10-28，只读；结论 **defer**。公开的具体任务是 Pernosco 官方 Node.js 间歇性 race 事故：`TcpHolder::WriteRaw` 的 `this` 为 NULL，如何追到导致它的值来源及 socket 状态？但同一官方 walkthrough 已展示点击值后 Dataflow 自动跨复制/寄存器回溯、跳转调用栈，并在 notebook 记录调查。因此不能把“看见值如何产生、共享调试结论”声称为 Pernosco 尚未解决的缺口。没有独立用户误读、等价原始输入或比较实验，不建议实现 Archify 图、导入器或因果推断。

## 查重

检索当前 `docs/research/2026-10-26/scouts` 的 rr、Pernosco、逆向执行/调试关键词，以及 `origin/codex/research-lab-20261025` 的 Markdown 研究（`60342aa9e40618aeb7c33bdb8d65889fea3a588e`），没有直接命中；这是关键词检索，不保证语义穷尽。现有 `asan-provenance-reading.md` 研究分配/释放/非法访问三段报告而非反向执行值来源；`async-trace-reading.md` 与 `lab-trace-flow-evidence@9f9f9dacf58832f1c8784a1a24f6e04c456a4881` 研究显式仪器化 flow，不是 debugger dataflow；`lab-trace-waterfall@8e65f150b8db6947c98f9b12e37d970014e0ea7e` 仅 X 区间。已查 `/tmp/archify-round14-remote-heads.txt` 的相关名称，不能据名称排除所有未索引工作。

## 证据、能力与限制

- rr [5.10.0 源码](https://github.com/rr-debugger/rr/tree/7c5a08e538e7999bf996f60a8c206e122f4b8050) tag `7c5a08e538e7999bf996f60a8c206e122f4b8050`。固定 [LICENSE](https://github.com/rr-debugger/rr/blob/7c5a08e538e7999bf996f60a8c206e122f4b8050/LICENSE) 首段是 MIT 风格授权，全文还含其他版权/许可，不能将全仓库笼统视为单一许可；本研究不复制代码。官方 [Usage wiki 固定版本](https://github.com/rr-debugger/rr/wiki/Usage/96f9297ebb16ef3d14d855698d3630a1294c3e82) 提供具体自然教学场景：反向 watchpoint 查 `mRect.width` 的上次写入；在逆向执行越过写入时，GDB 的 “New value” 是该语句执行**之前**的值。这是官方说明的方向语义，不是已证实的用户误读，也不是本轮运行。原生基线包括 reverse-continue/step/next/finish、硬件 watchpoint、checkpoint/restart、event number 和 GDB 输出，不能只以正向单步作为对照。
- [Pernosco 官方 Node 案例](https://pernos.co/examples/race-condition) 给出实际调试任务和产品作者所述过程：从 NULL 指针经过 Dataflow 回溯到 `unique_ptr::reset`，再用调用栈查看 `OnEof`。官方 [产品说明](https://pernos.co/about/) 还列出可跨复制和共享内存追值、动态调用图、查询、集成 notebook 与会话共享。它是商业产品，[FAQ](https://pernos.co/faq/)明确不计划开源；页面滚动更新，2026-10-28 查阅，未取得可固定的服务版本/源码 SHA。本轮未打开或操作实际 debugger、未比较完整记录，所以将这些称为供应商描述，不是独立能力验收或效能证明。
- 仅凭时间先后、同值或单个 watchpoint 输出不能自动建立完整因果链；追踪范围、线程、地址与生命周期需要来源证据。逆向 GDB 中 New/Old 的文字方向是可证伪的教学问题，但现有官方原文已明确解释，尚无证据表明用户会误读、也没有证据显示加图比保留原文更好。

## 剩余证据缺口与验证门槛

唯一值得后续追问的精确缺口：在一次真实且可公开的 rr 逆向 watchpoint 会话中，接手者是否把 `New value` 当成正向写入后的值，从而错误解释具体一次写入？需有完整、许可可用的命令、原始输出、源码、实际版本及自然使用者首次解释；不是从术语歧义推断真实误读。若取得证据，比较完整原始 GDB 输出及官方解释与同证据的标注材料，要求指出写入前后各值、执行方向和写入点；记录独立回答与时间。Pernosco 同一任务若可使用，必须把 Dataflow、导航和 notebook 纳入最强基线，而非仅比较 rr 单步。错误方向或不受输出支持的箭头即失败。

维护成本包括采集可共享录制、版本/符号/源码对应、地址与时间语义、隐私和许可核对、两臂材料以及独立用户检验；自动重建跨线程或寄存器因果更需额外事实和长期维护。目前只读官方文字，没有安装、录制、运行目标程序、读取私有数据或做 GUI 验证，推荐继续 defer。
