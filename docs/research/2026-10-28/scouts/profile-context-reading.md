# 采样剖析的调用上下文与比较阅读

研究日期：2026-10-28。范围：只读 primary-source 研究；未安装、编译、运行上游 profiler、Archify、浏览器或 benchmark。GitHub 当前默认分支 HEAD 固定如下，下载只读 archive 到 `/tmp/archify-profile-research`；samply 大 archive 下载未完成，改为读取固定 SHA 的 README、Cargo.toml 与许可原件。未修改产品、hub、index，未 commit/push。

结论：建议两个独立小实验，优先“递归上下文与函数总计”，其次“归一化改变比较问题”。价值是让分享图能回答可复核的问题：同一个函数出现在哪条栈上、self/total 的分母是什么、正负差值到底比较绝对量还是占比。不是构造新的通用 profiler，也不是以没有生产事故或尚未证明提速为由拒绝探索。

## 已有 56 项与当前工作去重

读取 hub `docs/research/2026-10-25/gallery/manifest.json` 全部 56 项的 id/title/value/limits。最邻近三项：

- [trace-waterfall](https://github.com/tt-a1i/archify/tree/8e65f150b8db6947c98f9b12e37d970014e0ea7e/experiments/trace-waterfall) 是 Chrome X 操作区间，明确不推断调用树；本方向是已记录采样栈的上下文权重，不从时间嵌套推断调用。
- [retained-size](https://github.com/tt-a1i/archify/tree/a0c76fc8f090eb194915103e4fc7344ad2ae7184/experiments/retained-size) 是 Twiggy 支配树自身/保留字节；本方向的 total 是某函数参与的样本权重去重和，不能借用 retained-size 的跨层相加规则。
- [benchmark-reading](https://github.com/tt-a1i/archify/tree/7b8258cdc3f7bc2d9c6a0277feaa5d31b1a70686/experiments/benchmark-reading) 是 benchstat median、CI、p、n；本方向没有统计显著性推断，差分也不证明版本变快。

task-occurrences、notebook-occurrences 已有“身份不等于出现次数”的阅读价值；若实验只给同名节点加 occurrence ID 会重复。必须加入真实采样权重、递归去重和独立数值答案才能成立。

GitHub 搜索边界：`gh issue list --state open --limit 500` 与 `gh pr list --state open --limit 500`，对标题过滤 `profil|sampl|flame|call.tree|benchmark|trace|retained`，另看 open PR 全标题；没有发现直接的采样调用上下文项目。邻近 [PR #1122](https://github.com/tt-a1i/archify/pull/1122) 是 recorded trace flows 与 timing/nesting；[PR #1120](https://github.com/tt-a1i/archify/pull/1120) 是异常组身份；[issue #1058](https://github.com/tt-a1i/archify/issues/1058) 是 benchmark 质量计分；[#906](https://github.com/tt-a1i/archify/issues/906) 的 profile 指 DSH 配置，排除。此为当前 open 列表标题有界搜索，没有宣称遍历 closed/history 或所有正文。

## 有实际行为的五个项目

选取覆盖数据生产、同上下文聚合、函数聚合、差分与消费交互的项目，不使用 stars 排名。FlameGraph 是直接可读的小脚本入口，samply 和 py-spy 提供真实 producer 边界。

| 项目 / 固定 SHA | 已查行为与证据 | 对 Archify 的启发与取舍 |
| --- | --- | --- |
| [speedscope](https://github.com/jlfwong/speedscope/tree/fe804e6281cf847713448c2c3e0faec3e1f62b2d) `fe804e6281cf847713448c2c3e0faec3e1f62b2d` | [profile.ts](https://github.com/jlfwong/speedscope/blob/fe804e6281cf847713448c2c3e0faec3e1f62b2d/src/lib/profile.ts) 区分 CallTreeNode 与 Frame；递归每样本按唯一 Frame 计 total，节点按上下文计；[sandwich-view](https://github.com/jlfwong/speedscope/blob/fe804e6281cf847713448c2c3e0faec3e1f62b2d/src/views/sandwich-view.tsx) 选择函数后展示 callers/callees | 可分享“这两个 a 节点为什么不同”的小解释；不重做完整 WebGL viewer。MIT。 |
| [google/pprof](https://github.com/google/pprof/tree/dbd0ed30aa888a30e21ba83b9831ac0e80d41022) `dbd0ed30aa888a30e21ba83b9831ac0e80d41022` | [graph.go](https://github.com/google/pprof/blob/dbd0ed30aa888a30e21ba83b9831ac0e80d41022/internal/graph/graph.go) newGraph 全局合并、newTree 按 parent map 保留上下文；[比较文档](https://github.com/google/pprof/blob/dbd0ed30aa888a30e21ba83b9831ac0e80d41022/doc/README.md#comparing-profiles) 明确 base/diff_base/normalize | 对比必须带所选 sample type、单位、归一化与分母；不把负差当不可能值。Apache-2.0。 |
| [samply](https://github.com/mstange/samply/tree/99fe90353baeca4b50e71ea6ec83a03643f888ff) `99fe90353baeca4b50e71ea6ec83a03643f888ff` | [README](https://github.com/mstange/samply/blob/99fe90353baeca4b50e71ea6ec83a03643f888ff/README.md) 采集每线程栈、默认 1000Hz，交 Firefox Profiler；macOS/Windows 含 on/off-CPU，Linux 当前仅 on-CPU；双击调用树到 source，逐行采样计数 | 同为“1ms”不保证跨平台采集语义一致。暂不做 importer：符号、OS、off-CPU 语义成本高。MIT OR Apache-2.0，两份完整许可已读。 |
| [FlameGraph](https://github.com/brendangregg/FlameGraph/tree/41fee1f99f9276008b7cd112fca19dc3ea84ac32) `41fee1f99f9276008b7cd112fca19dc3ea84ac32` | [flamegraph.pl](https://github.com/brendangregg/FlameGraph/blob/41fee1f99f9276008b7cd112fca19dc3ea84ac32/flamegraph.pl) 说明横轴排序无时间意义、宽度是相对样本存在；[difffolded.pl](https://github.com/brendangregg/FlameGraph/blob/41fee1f99f9276008b7cd112fca19dc3ea84ac32/difffolded.pl) 输出完整栈并集两列、缺失补零，宽度来自第二份，建议反向再画一张避免消失栈被忽略 | 很小的差分入口也有重要语义：颜色、宽度、消失项不能混为一谈。所读 difffolded.pl header 为 GPL-2.0-or-later；未复制实现。 |
| [py-spy](https://github.com/benfred/py-spy/tree/353afa6ff5bb322730c80abfc3372b2d1159de8c) `353afa6ff5bb322730c80abfc3372b2d1159de8c` | [speedscope.rs](https://github.com/benfred/py-spy/blob/353afa6ff5bb322730c80abfc3372b2d1159de8c/src/speedscope.rs) 每线程输出 samples，每权重 `1/sample_rate`，单位 seconds；[README](https://github.com/benfred/py-spy/blob/353afa6ff5bb322730c80abfc3372b2d1159de8c/README.md) 解释 idle/GIL 过滤与 idle 检测限制 | sampled seconds 是采样规则赋权，不是逐调用精确计时。过滤和线程需伴随图保存。MIT，完整许可已读，导出源码另含 rbspy MIT attribution。 |

## 深挖 A：speedscope 的上下文、递归与单位

固定 SHA：`fe804e6281cf847713448c2c3e0faec3e1f62b2d`。

Producer → model → consumer：

1. 上游完整 `sample/profiles/stackcollapse/recursion.txt` 是随仓提供的 10 行递归示例 fixture；未确认当前自动测试直接使用此文件，不声称是本轮实测 workload。`src/import/bg-flamegraph.ts` 按最后整数分开 stack/weight、分号切帧，同名帧 key=name；这种输入没有显式时间单位，不能擅自标秒。
2. `StackListProfileBuilder._appendSample` 将 stack prefix 分开存为节点；同一函数 Frame 可有多个父节点/递归层。节点 total 对每次经过累计，leaf 增 self；函数 total 用 `Set<Frame>` 每条样本去重，self 加到叶函数。`appendSampleWithWeight` 拒绝负值，0 忽略。
3. `getProfileWithRecursionFlattened` 改变结构时特意从原函数复制 self/total，避免 self 随递归折叠移位；caller/callee 构建遇 focalFrame 不无限向同一递归链重复搜集。
4. `profile-table-view.tsx` 取函数 self/total；`sandwich-view.tsx` 展示选中函数的上下调用视图。不能把函数总计表直接当成每个节点的权重。

依据均可在固定 [producer](https://github.com/jlfwong/speedscope/blob/fe804e6281cf847713448c2c3e0faec3e1f62b2d/src/import/bg-flamegraph.ts)、[model](https://github.com/jlfwong/speedscope/blob/fe804e6281cf847713448c2c3e0faec3e1f62b2d/src/lib/profile.ts)、[table consumer](https://github.com/jlfwong/speedscope/blob/fe804e6281cf847713448c2c3e0faec3e1f62b2d/src/views/profile-table-view.tsx) 检查。

独立答案（本轮 Python 标准库直接遍历完整 10 行；没有 import 或运行上游代码）：总权重 10。函数 self：a=1、b=5、c=4；函数 total：a=9、b=9、c=4。total 之和 22 不等于 10，因为一次样本可包含多个函数，不能用函数 total 求互斥占比。完整上下文 total 如下：

| prefix（root→leaf） | total |
| --- | ---: |
| a | 9 |
| a;a | 1 |
| b | 1 |
| b;b | 1 |
| a;b | 8 |
| a;b;a | 7 |
| a;b;a;b | 5 |
| a;b;a;c | 2 |
| a;b;a;b;a | 1 |
| a;b;a;b;a;b | 1 |
| a;b;a;b;c | 2 |

节点 `a;b;a` total=7，函数 a total=9；绝不能将所有名为 a 的节点 total 相加（9+1+7+1=18）作为函数 total。完整原件见附录。

第二个完整原件 `simple-sampled.speedscope.json` 用 frame index 保身份，unit=seconds，5 个 sample row、权重 1,1,4,3,5，总重14。a self=0/total14，b self5/total14，c self5/total5，d self4/total4。它是明确单位的格式 fixture，不是 5 次函数调用，也不是本轮实测14秒。[file-format.ts](https://github.com/jlfwong/speedscope/blob/fe804e6281cf847713448c2c3e0faec3e1f62b2d/src/lib/file-format.ts) 的 importSampledProfile 从 `shared.frames`、samples 与 weights 建模型，保留 unit formatter，校验两数组等长。相比 folded fixture，它能揭露“sample row 数”与“采样权重”混淆。

## 深挖 B：pprof 的 unsample 与 normalize→subtract

固定 SHA：`dbd0ed30aa888a30e21ba83b9831ac0e80d41022`。采用上游测试实际读取的两个完整 legacy C++ contention 文件：`internal/driver/testdata/cppbench.contention`、`cppbench.small.contention`，不是从大 profile 挑漂亮几行。前者含6条栈与完整 memory map，后者含1条栈与完整 memory map。另保留 `profile/testdata/cppbench.contention.string` 完整 golden，供不执行二进制的审查者核对。历史 fixture 的采集现场与函数符号未知，不补造业务故事。

Producer → model → consumer：

1. [legacy_profile.go](https://github.com/google/pprof/blob/dbd0ed30aa888a30e21ba83b9831ac0e80d41022/profile/legacy_profile.go) 的 parseContention / parseContentionSample 读取 `cycles/second=3201000000` 与 `sampling period=100`：原列 `(delayCycles, contentions)` 变为 `[contentions*100, int(delayCycles*100/3.201)]`。原第一行 `19490304,27` 因而为 `[2700,608881724]`。值已“unsample”，不是原始观察数，更不能当函数调用次数。
2. [fetch.go](https://github.com/google/pprof/blob/dbd0ed30aa888a30e21ba83b9831ac0e80d41022/internal/driver/fetch.go) 在 normalize 后才将 base Scale(-1) 合并；diff_base 另保留 `pprof::base=true` 标签。顺序不是先减再归一化。
3. [merge.go](https://github.com/google/pprof/blob/dbd0ed30aa888a30e21ba83b9831ac0e80d41022/profile/merge.go) Normalize 对每个 sample type 独立求 `baseTotal/sourceTotal`；[profile.go](https://github.com/google/pprof/blob/dbd0ed30aa888a30e21ba83b9831ac0e80d41022/profile/profile.go) ScaleN 用 math.Round 逐值舍入。所以类型间不可共用比例，舍入后总差可非0。
4. [graph.go](https://github.com/google/pprof/blob/dbd0ed30aa888a30e21ba83b9831ac0e80d41022/internal/graph/graph.go) newGraph 用 seenNode/seenEdge 避免同样本循环重复计累计值；newTree 按 parentNodeMap 保留上下文。所选 sample_index 决定 graph 权重。[doc/README.md](https://github.com/google/pprof/blob/dbd0ed30aa888a30e21ba83b9831ac0e80d41022/doc/README.md) 定义报告取一个 sample value，默认最后一种；diff_base 百分比分母为 base 总量，base 用于累计 profile 差分时的分母不同。

独立答案：完整 source 六行 unsampled `[contentions,delay ns]` 为 `[2700,608881724] [100,23992] [200,179943] [100,17778444] [100,75976] [300,63568134]`，总计 `[3500,690508213]`。small/base 第一条栈为 `[1000,3124]`。以下每行对应 source 原件顺序，第一条与 base 同栈，其余 base 缺失：

| 行 | source−base（count,ns） | normalize(source)−base（count,ns） |
| --- | --- | --- |
| 1 | 1700, 608878600 | -229, -369 |
| 2 | 100, 23992 | 29, 0 |
| 3 | 200, 179943 | 57, 1 |
| 4 | 100, 17778444 | 29, 80 |
| 5 | 100, 75976 | 29, 0 |
| 6 | 300, 63568134 | 86, 288 |

上游 [fetch_test.go](https://github.com/google/pprof/blob/dbd0ed30aa888a30e21ba83b9831ac0e80d41022/internal/driver/fetch_test.go) TestFetch 的 `not normalized, different base and source` 与 `normalized different base and source` 明确列出这两个完整6行 expected 集；本轮另用 Python 直接求和、比例和正值 round 重算后一列，与 expected 相同。不是执行上游测试通过。第一行符号翻转正说明比较的问题变了；不是性能改善证据。count 归一化差求和为1，ns为0，逐样本四舍五入可解释前者。

## 推荐实验（最多两项，独立远程分支由后续实施轮处理）

### P1：递归上下文与函数总计的可分享读图

- 用户价值：代码审查/排障讨论中，收到一份采样 profile 后回答“a 的热点来自哪个调用上下文；为什么这里7而表里9；折叠递归后 self 是否变了”。不要求先发生生产事故。
- 数据：保留上述两个 speedscope 完整 fixture、来源SHA、原文/字节hash与完整 MIT。fixture 是上游示例/测试材料，不冒充真实 workload 录制。无需适配更多格式来增加数量。
- 基线：原始 folded/JSON 与 speedscope 自有 sandwich/table 已可回答。Archify 的增量假设是让接收者在单页对照上下文节点、同函数汇总、原始样本与算式，保留 source provenance；不声称胜过 profiler 的全量探索能力。
- 可用能力：原生 Tree 保留每个完整 prefix 为独立节点，旁边 Explainer 显示函数 a 的 self1/total9、所有含a的9条样本；选择 `a;b;a` 定位原始样本行并说明 node total7；对照 grouped 与递归折叠说明，不把 folded 横轴当时间。框选/聚焦应操作真实上下文ID，不能只用函数名。
- 可证伪验收：完整11个非root prefix 均保留；10行与总重10可逐行定位；全部 self/total 等于上表；a节点 total 相加18不被显示为函数总计；simple-sampled 的5行与14seconds分开标；递归折叠结构变化后函数 self/total保持；键盘和指针选中同一 prefix；源文本仍可查全，禁止只保留热点路径。真实图验证后若同名定位混淆、算式不闭合，实验失败。
- 维护成本：局部实验模型（frame identity、prefix identity、weight、unit），沿用 Tree/Explainer；不接 profiler 采集、symbol server、二进制解析。若共享 Viewer 需要新全局状态，应回退为局部页面交互并计成本。没有效率收益实测，先验证解释是否正确与可读。

### P2：同一对 profile，绝对差与占比差的双读法

- 用户价值：避免把归一化后负数误讲成绝对资源下降，或把单一红/蓝差分图当完整事实。直接回答“第一条栈为何从正变负；count 与 ns 为什么不能同一比例”。
- 数据：完整两个 pprof contention 原件、完整 `.string` golden、固定SHA和 Apache全文；保留 memory maps、无符号地址、原始采样周期。明确这是 legacy contention 数据，不是 CPU 采样时间或性能 benchmark。
- 基线：pprof normalize/base 命令及其完整 expected 已定义正确答案；原始文本+表可完成核算。Archify 只增加两种比较问题并排、选中栈上下文、raw→unsampled→normalized→diff 的可检查步骤。
- 可用能力：Tree/Explainer 展示6条完整样本路径与两个 metric 切换，三列原始绝对值/未归一化差/归一化差；选择第一条栈时同时显示 `[3500,690508213]` 与 base `[1000,3124]` 两个分母和两个比例。不能借用单维 waterfall 的位置长度暗示精确执行时间。
- 可证伪验收：全部6行的两列差值与表一致；原件base缺失的5条栈明确为0而非unknown；保留负值；第一条两metric符号均翻转；count总差1的舍入解释可追溯；不得显示“快了”“显著”“调用次数”或无出处的符号函数名；完整memory map仍可查；来源和所选metric随分享保留。若图隐藏零ns但非零count的行2/5，或将不同metric混加，失败。
- 维护成本：legacy parser 与 rounding 必须维护，优先离线实验脚本且只支持该明确fixture形态，拒绝泛化 pprof/protobuf importer。可将已验证源/golden作为声明数据，若新增parser只是在包装格式且图无法让人看到两个问题的差异，则不继续。相对 P1 更偏解释，不宜同时扩张采集能力。

## 独立复核方法

以下是可手工或用 Python 标准库复核的规则，不依赖上游 profiler。对附录 recursion.txt 的每一行，最后一列为 w：`self[leaf] += w`、对该行去重后的每个函数 `total[f] += w`、对每个完整前缀 `context[prefix] += w`。三张表分开，不能先按函数名压成树再求上下文。

对 pprof 六行 golden `v[j][metric]`，未归一化差为 `v[j][metric] - base[j][metric]`；归一化差为 `round_positive(v[j][metric] * baseTotal[metric] / sourceTotal[metric]) - base[j][metric]`，其中仅第一行 base 非0，`round_positive(x)=floor(x+0.5)`。这对应当前正值 source 的 Go math.Round，不能将 Python banker rounding 当通用等价规则。各 metric 分开计算，source raw 的 unsample 用截断到int，normalize 用round，两阶段舍入规则不同。

## 证据边界与许可证

本轮只做源码/fixture静态阅读和独立 Python 标准库算术；未执行 Go/Rust/TypeScript/Perl 上游、未跑测试、未采集进程、未测速度、未打开浏览器或生成真实图。两个候选是否实际提升理解速度/正确率仍待后续真实图和读者任务验证。没有把 README 的宣传性性能描述当测量证据。

两项深挖所需 LICENSE 全文附在文末，fixture 均完整内嵌而非裁剪。下方字节hash针对上游原件，Markdown fence不是字节容器；后续实施应按固定SHA重新取原件，核 hash，而非从排版后的文本重建。两个深挖fixture已另通过 GitHub contents API 按固定SHA重取hash一致。samply 与 py-spy 完整 MIT许可已读，分别链接 [samply LICENSE-MIT](https://github.com/mstange/samply/blob/99fe90353baeca4b50e71ea6ec83a03643f888ff/LICENSE-MIT)、[LICENSE-APACHE](https://github.com/mstange/samply/blob/99fe90353baeca4b50e71ea6ec83a03643f888ff/LICENSE-APACHE)、[py-spy LICENSE](https://github.com/benfred/py-spy/blob/353afa6ff5bb322730c80abfc3372b2d1159de8c/LICENSE)；本报告不复制它们的实现。FlameGraph 不按目录臆定统一许可：以所读脚本完整header为依据，若后续复制脚本须单独保留其GPL正文/attribution。

## 附录：完整原件与可重取指纹

### speedscope/sample/profiles/stackcollapse/recursion.txt

[固定原件](https://github.com/jlfwong/speedscope/blob/fe804e6281cf847713448c2c3e0faec3e1f62b2d/sample/profiles/stackcollapse/recursion.txt) · 96 bytes · SHA-256 `5e6da30ddbe1e66f4e8a326236f2c9016484c61a6a7022b60389d94920fc4a57`

```text
a;a 1
b;b 1
a;b 1
a;b;a;b 1
a;b;a;c 1
a;b;a;b;a;b 1
a;b;a;b;c 1
a;b;a;b 1
a;b;a;c 1
a;b;a;b;c 1
```

### speedscope/sample/profiles/speedscope/0.1.2/simple-sampled.speedscope.json

[固定原件](https://github.com/jlfwong/speedscope/blob/fe804e6281cf847713448c2c3e0faec3e1f62b2d/sample/profiles/speedscope/0.1.2/simple-sampled.speedscope.json) · 458 bytes · SHA-256 `6a4508cd712ee7a1a80929009d4a1b212cadfafd30831722ae6f195601f8967c`

```text
{
  "version": "0.1.2",
  "$schema": "https://www.speedscope.app/file-format-schema.json",
  "profiles": [
    {
      "type": "sampled",
      "name": "simple.speedscope.json",
      "unit": "seconds",
      "startValue": 0,
      "endValue": 14,
      "samples": [[0, 1, 2], [0, 1, 2], [0, 1, 3], [0, 1, 2], [0, 1]],
      "weights": [1, 1, 4, 3, 5]
    }
  ],
  "shared": {
    "frames": [{"name": "a"}, {"name": "b"}, {"name": "c"}, {"name": "d"}]
  }
}
```

### pprof/internal/driver/testdata/cppbench.contention

[固定原件](https://github.com/google/pprof/blob/dbd0ed30aa888a30e21ba83b9831ac0e80d41022/internal/driver/testdata/cppbench.contention) · 1551 bytes · SHA-256 `e0f3035db93cd3bb384590b224ca2b26d79aca41e71042a32c351a6d3e34d2d4`

```text
--- contentionz 1 ---
cycles/second = 3201000000
sampling period = 100
ms since reset = 16502830
discarded samples = 0
  19490304       27 @ 0xbccc97 0xc61202 0x42ed5f 0x42edc1 0x42e15a 0x5261af 0x526edf 0x5280ab 0x79e80a 0x7a251b 0x7a296d 0xa456e4 0x7fcdc2ff214e
       768        1 @ 0xbccc97 0xa42dc7 0xa456e4 0x7fcdc2ff214e
      5760        2 @ 0xbccc97 0xb82b73 0xb82bcb 0xb87eab 0xb8814c 0x4e969d 0x4faa17 0x4fc5f6 0x4fd028 0x4fd230 0x79e80a 0x7a251b 0x7a296d 0xa456e4 0x7fcdc2ff214e
    569088        1 @ 0xbccc97 0xb82b73 0xb82bcb 0xb87f08 0xb8814c 0x42ed5f 0x42edc1 0x42e15a 0x5261af 0x526edf 0x5280ab 0x79e80a 0x7a251b 0x7a296d 0xa456e4 0x7fcdc2ff214e
      2432        1 @ 0xbccc97 0xb82b73 0xb82bcb 0xb87eab 0xb8814c 0x7aa74c 0x7ab844 0x7ab914 0x79e9e9 0x79e326 0x4d299e 0x4d4b7b 0x4b7be8 0x4b7ff1 0x4d2dae 0x79e80a
   2034816        3 @ 0xbccc97 0xb82f0f 0xb83003 0xb87d50 0xc635f0 0x42ecc3 0x42e14c 0x5261af 0x526edf 0x5280ab 0x79e80a 0x7a251b 0x7a296d 0xa456e4 0x7fcdc2ff214e
--- Memory map: ---
  00400000-00fcb000: cppbench_server_main
  7fcdc231e000-7fcdc2321000: /libnss_cache-2.15.so
  7fcdc2522000-7fcdc252e000: /libnss_files-2.15.so
  7fcdc272f000-7fcdc28dd000: /libc-2.15.so
  7fcdc2ae7000-7fcdc2be2000: /libm-2.15.so
  7fcdc2de3000-7fcdc2dea000: /librt-2.15.so
  7fcdc2feb000-7fcdc3003000: /libpthread-2.15.so
  7fcdc3208000-7fcdc320a000: /libdl-2.15.so
  7fcdc340c000-7fcdc3415000: /libcrypt-2.15.so
  7fcdc3645000-7fcdc3669000: /ld-2.15.so
  7fff86bff000-7fff86c00000: [vdso]
  ffffffffff600000-ffffffffff601000: [vsyscall]
```

### pprof/internal/driver/testdata/cppbench.small.contention

[固定原件](https://github.com/google/pprof/blob/dbd0ed30aa888a30e21ba83b9831ac0e80d41022/internal/driver/testdata/cppbench.small.contention) · 821 bytes · SHA-256 `0d1f47b05eb6664827672b360eb122f13daec15765eb76eed1d77ed9e788516f`

```text
--- contentionz 1 ---
cycles/second = 3201000000
sampling period = 100
ms since reset = 16502830
discarded samples = 0
       100     10 @ 0xbccc97 0xc61202 0x42ed5f 0x42edc1 0x42e15a 0x5261af 0x526edf 0x5280ab 0x79e80a 0x7a251b 0x7a296d 0xa456e4 0x7fcdc2ff214e
--- Memory map: ---
  00400000-00fcb000: cppbench_server_main
  7fcdc231e000-7fcdc2321000: /libnss_cache-2.15.so
  7fcdc2522000-7fcdc252e000: /libnss_files-2.15.so
  7fcdc272f000-7fcdc28dd000: /libc-2.15.so
  7fcdc2ae7000-7fcdc2be2000: /libm-2.15.so
  7fcdc2de3000-7fcdc2dea000: /librt-2.15.so
  7fcdc2feb000-7fcdc3003000: /libpthread-2.15.so
  7fcdc3208000-7fcdc320a000: /libdl-2.15.so
  7fcdc340c000-7fcdc3415000: /libcrypt-2.15.so
  7fcdc3645000-7fcdc3669000: /ld-2.15.so
  7fff86bff000-7fff86c00000: [vdso]
  ffffffffff600000-ffffffffff601000: [vsyscall]
```

### pprof/profile/testdata/cppbench.contention.string

[固定原件](https://github.com/google/pprof/blob/dbd0ed30aa888a30e21ba83b9831ac0e80d41022/profile/testdata/cppbench.contention.string) · 2025 bytes · SHA-256 `a552baca08d20d75945171f9d1ff08f5f9df12a0d7099ce88c9b894358015552`

```text
PeriodType: contentions count
Period: 100
Duration: 4h35
Samples:
contentions/count delay/nanoseconds
       2700  608881724: 1 2 3 4 5 6 7 8 9 10 11 12 13
        100      23992: 1 14 12 13
        200     179943: 1 15 16 17 18 19 20 21 22 23 9 10 11 12 13
        100   17778444: 1 15 16 24 18 3 4 5 6 7 8 9 10 11 12 13
        100      75976: 1 15 16 17 18 25 26 27 28 29 30 31 32 33 34 9
        300   63568134: 1 35 36 37 38 39 40 6 7 8 9 10 11 12 13
Locations
     1: 0xbccc96 M=1
     2: 0xc61201 M=1
     3: 0x42ed5e M=1
     4: 0x42edc0 M=1
     5: 0x42e159 M=1
     6: 0x5261ae M=1
     7: 0x526ede M=1
     8: 0x5280aa M=1
     9: 0x79e809 M=1
    10: 0x7a251a M=1
    11: 0x7a296c M=1
    12: 0xa456e3 M=1
    13: 0x7fcdc2ff214d M=7
    14: 0xa42dc6 M=1
    15: 0xb82b72 M=1
    16: 0xb82bca M=1
    17: 0xb87eaa M=1
    18: 0xb8814b M=1
    19: 0x4e969c M=1
    20: 0x4faa16 M=1
    21: 0x4fc5f5 M=1
    22: 0x4fd027 M=1
    23: 0x4fd22f M=1
    24: 0xb87f07 M=1
    25: 0x7aa74b M=1
    26: 0x7ab843 M=1
    27: 0x7ab913 M=1
    28: 0x79e9e8 M=1
    29: 0x79e325 M=1
    30: 0x4d299d M=1
    31: 0x4d4b7a M=1
    32: 0x4b7be7 M=1
    33: 0x4b7ff0 M=1
    34: 0x4d2dad M=1
    35: 0xb82f0e M=1
    36: 0xb83002 M=1
    37: 0xb87d4f M=1
    38: 0xc635ef M=1
    39: 0x42ecc2 M=1
    40: 0x42e14b M=1
Mappings
1: 0x400000/0xfcb000/0x0 cppbench_server_main
2: 0x7fcdc231e000/0x7fcdc2321000/0x0 /libnss_cache-2.15.so
3: 0x7fcdc2522000/0x7fcdc252e000/0x0 /libnss_files-2.15.so
4: 0x7fcdc272f000/0x7fcdc28dd000/0x0 /libc-2.15.so
5: 0x7fcdc2ae7000/0x7fcdc2be2000/0x0 /libm-2.15.so
6: 0x7fcdc2de3000/0x7fcdc2dea000/0x0 /librt-2.15.so
7: 0x7fcdc2feb000/0x7fcdc3003000/0x0 /libpthread-2.15.so
8: 0x7fcdc3208000/0x7fcdc320a000/0x0 /libdl-2.15.so
9: 0x7fcdc340c000/0x7fcdc3415000/0x0 /libcrypt-2.15.so
10: 0x7fcdc3645000/0x7fcdc3669000/0x0 /ld-2.15.so
11: 0x7fff86bff000/0x7fff86c00000/0x0 [vdso]
12: 0xffffffffff600000/0xffffffffff601000/0x0 [vsyscall]
```

### speedscope/LICENSE

[固定原件](https://github.com/jlfwong/speedscope/blob/fe804e6281cf847713448c2c3e0faec3e1f62b2d/LICENSE) · 1067 bytes · SHA-256 `6244b13e9bf25cfd42d81c939d6c535d932596e8c320050234f2c2ac5a6f36a0`

```text
MIT License

Copyright (c) 2018 Jamie Wong

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

### pprof/LICENSE

[固定原件](https://github.com/google/pprof/blob/dbd0ed30aa888a30e21ba83b9831ac0e80d41022/LICENSE) · 11358 bytes · SHA-256 `cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30`

```text

                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "[]"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Copyright [yyyy] [name of copyright owner]

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
```
