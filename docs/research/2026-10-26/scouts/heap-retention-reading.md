# 堆保留关系阅读：引用路径、支配关系与分配栈

2026-10-27，筛选结论：**暂缓实验，不做堆快照解析器或新 viewer。** 值得保留的问题是：某对象在哪里分配、现在被哪些引用保持可达、移除某对象能使哪些对象变得不可达？三问的证据不同；但目前没有同一份可公开输入和完整原生输出，能证明 Archify 比 Chrome 的现有操作更易读。没有运行 profiler、采集 heap、安装或生成截图。

## 排重与剩余缺口

检查 `origin/codex/research-lab-20261025` 的 scouts 和 gallery/manifest，以及本日期 scouts 的相关词，范围有限，不能保证同义内容全被发现。此前 [data-layout](https://github.com/tt-a1i/archify/blob/60342aa9e40618aeb7c33bdb8d65889fea3a588e/docs/research/2026-10-25/scouts/data-layout-smalltools.md) 已区分 JOL 从指定 roots 算的可达 footprint 和完整 heap 的 retained size；[profile](https://github.com/tt-a1i/archify/blob/60342aa9e40618aeb7c33bdb8d65889fea3a588e/docs/research/2026-10-25/scouts/profile-reading-smalltools.md) 已处理分母及调用栈不等于因果；[state lifetime](https://github.com/tt-a1i/archify/blob/60342aa9e40618aeb7c33bdb8d65889fea3a588e/docs/research/2026-10-25/scouts/round20-state-lifetime-reading.md) 区分静态状态与运行事件；本地 [ASan](asan-provenance-reading.md) 讨论访问、释放、分配三段报告栈，不是 GC 引用图。gallery 的 [retained-size](https://github.com/tt-a1i/archify/tree/a0c76fc8f090eb194915103e4fc7344ad2ae7184/experiments/retained-size) 已解释 Wasm 支配树中 165 + 4 = 169 B；它不是运行时 heap 快照。剩余问题仅为**对同一对象联读 allocation 与 retention**，不能再用一张同义 retained-size 图充当新增价值。

## 原生输出和证据

- [Chrome Heap snapshots 官方文档](https://developer.chrome.com/docs/devtools/memory-problems/heap-snapshots) 的 Summary 给每个实例 shallow/retained size 和对象 ID；Retainers 显示指向所选对象的对象，可忽略一个 retainer 以查找其他引用。文档示例明确是 `Item` 实例的 `x` 属性保留一个字符串。它还提供 Comparison、Containment 和对象搜索。按文档所示，这是已有的针对保留原因的原生交互；本次未操作 DevTools，不能声称实测效率或完整路径已核验。文档文本通常为 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)，代码样例 Apache 2.0，以页面许可和例外为准。
- [Chrome Allocation timeline](https://developer.chrome.com/docs/devtools/memory-problems/allocation-profiler) 描述录制期间周期快照和最终快照：蓝色表示最终仍存活，灰色表示已被 GC；可选时间段并在 constructor 中选对象查看 retaining tree。其页面标注 2024-12-09、CC BY 4.0 / Apache 2.0。它已经将分配区间与引用关系联查，因此对照必须保留完整原生视图及其交互，而非只放静态裁图。
- [Memray v1.20.0，源码 revision `f70db8143c7601ca55b4b219e50577a3f06e38ea`](https://github.com/bloomberg/memray/tree/f70db8143c7601ca55b4b219e50577a3f06e38ea)，[Apache-2.0 全文](https://github.com/bloomberg/memray/blob/f70db8143c7601ca55b4b219e50577a3f06e38ea/LICENSE)。[固定 flamegraph 文档](https://github.com/bloomberg/memray/blob/f70db8143c7601ca55b4b219e50577a3f06e38ea/docs/flamegraph.rst) 和 [在线完整说明及代码例](https://bloomberg.github.io/memray/flamegraph.html) 表明默认报告是峰值时仍存在的分配之调用栈叠加，横向顺序不是时间；报告已有搜索、反转和线程筛选等功能。`--leaks` 指追踪结束前未释放的分配，Python allocator 可能保留已释放对象的内存，不能直接认定对象泄漏。源码和报告示例说明输出语义，未本地运行；[官方示例完整 HTML](https://bloomberg.github.io/memray/_static/flamegraphs/memray-flamegraph-sqlite.html) 自带统计与解释。它并非同一 Chrome heap 输入，不能把这两份报告的对象身份拼接。
- [Memray 教程 exercise 2](https://bloomberg.github.io/memray/tutorials/2.html) 解释 400 MB 峰值来自四个同时存活的 100 MB 分配，并借源码指出局部变量持有旧值；这是作者教学与源码推断，不是 flamegraph 单独证明了完整 GC retaining path，也不是本轮复现。在线文档可能变化；固定版本的上游源码为上述 revision。

## 语义和维护边界

在指定快照图与 roots 中，A 支配 B 意味着每条 root→B 路径经过 A；直接支配树的边不必是对象引用边。retaining path 是图中的一条引用路径，存在其他路径时，移除这一路径不必释放目标。allocation stack 记录分配发生时的调用链；它不显示后来谁持有对象，也不表示每个引用发生的时间或执行因果。snapshot 中仍可达不是泄漏的充分证据；数据范围、弱引用及引擎模型均影响结论。shallow 与 retained 也不能相加重复计算。Chrome 的 constructor 行 retained size 是该组对象的**最大值**，不是总和。

未来若有用户提供可分享的同一 Chrome capture、采集版本和完整原生 UI 基线，可选一个有多条 root 路径的对象，比较读者能否准确回答：分配在哪里、哪条路径仍保持可达、移除单条引用后是否还有路径、哪部分由目标支配。候选只做可回指原始对象与边的人工解释，并完整保留原始数据；记录任务答案、耗时、错误与无法回答项。缺少 allocation 信息或完整路径就标未知，不从另一工具或图形补造。若原生工具已经清晰回答或无法取得同源数据，就继续排除。

通用 importer 还需承担 Chrome/V8 版本和快照格式变化、节点/边类型及弱引用、GC roots、大小统计、对象身份、截断和敏感信息等维护成本；自己重算 dominator 又需要验证图完整性与算法。当前没有跨工具对象关联或效果证据，不承担这些成本，不修改产品或引入依赖。
