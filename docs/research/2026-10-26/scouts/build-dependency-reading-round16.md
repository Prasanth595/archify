# Ninja 依赖类型与重建原因阅读

2026-10-28，建议 **defer**。前四节记录初轮只读判断，末节记录同批随后完成的原生执行。旧研究已识别 Ninja graph DOT 的依赖类型信息损失，不能重新把一般 build graph 当新方向。新增可检验问题：当 order-only 生成物本身需要重建时，为什么生成它的命令运行，而依赖它的 `foo.o` 不一定重建？上游测试精确定义结果；`-t query` 能显示类型、`-d explain` 提供状态解释，但初轮尚未执行，不能假称它们在该 fixture 的完整输出或已证明阅读缺口。

## 查重

历史 [build-infra-smalltools](https://github.com/tt-a1i/archify/blob/60342aa9e40618aeb7c33bdb8d65889fea3a588e/docs/research/2026-10-25/scouts/build-infra-smalltools.md) 已固定 Ninja `3ccb2270e8ef5a84bb31c4651c0df84440f30362`、比较 Graphviz 的规则节点与有损 order-only 表达，明确拒绝 DOT 换皮；本研究不重复其实现。当前 `docs/research` 的相关关键词检索无新 Ninja 直接命中。刷新 313 refs 的 `/tmp/archify-round16-remote-heads.txt` 包含 `lab-dependency-map@2be2ab55`、`lab-static-uses@7be0711d`、`lab-config-origins@14867942`；分别是依赖邻接、静态使用和配置来源，不能据它们推导某次 Ninja dirtiness 或 build 执行。检索不保证语义穷尽。

## 精确上游 fixture：类型与实际执行断言

[Ninja build_test.cc `RebuildOrderOnlyDeps`](https://github.com/ninja-build/ninja/blob/3ccb2270e8ef5a84bb31c4651c0df84440f30362/src/build_test.cc#L1208-L1252)，固定 SHA `3ccb2270e8ef5a84bb31c4651c0df84440f30362`，完整 manifest 输入：

```ninja
rule cc
  command = cc $in
rule true
  command = true
build oo.h: cc oo.h.in
build foo.o: cc foo.c || oo.h
```

测试的 fake filesystem 初始化 `foo.c` 和 `oo.h.in`；首次 `foo.o` 和 order-only 生成物 dirty，断言两条命令；全部 clean 后无工作；删除 `oo.h` 后仅运行 `cc oo.h.in`；再推进 fake 时间并更新 `oo.h.in` 后仍仅运行该命令。`oo.h` 是声明的生成输出、`foo.c`/`oo.h.in` 为此 fixture 的输入；不能仅由文件扩展名推断一般项目中的生成/源码身份。这是模拟 FS 和 fake runner 的已提交测试断言，**不是本轮编译或真实执行**，不是自然用户任务。

同文件 [`OrderOnlyDeps`](https://github.com/ninja-build/ninja/blob/3ccb2270e8ef5a84bb31c4651c0df84440f30362/src/build_test.cc#L1138-L1206) 的完整 manifest 为 `rule cc`、`command = cc $in`、`depfile = $out.d` 和 `build foo.o: cc foo.c || otherfile`；测试写 `foo.o.d` 内容 `foo.o: blah.h bar.h\n`，断言解析后 1 个 explicit、2 个 depfile implicit、1 个 order-only，执行命令为 `cc foo.c`；随后测试 implicit dirty 有构建、order-only dirty 为 up-to-date。depfile 来源及每次状态要一并保留，不要仅用静态 manifest 冒称完整输入。[manual](https://github.com/ninja-build/ninja/blob/3ccb2270e8ef5a84bb31c4651c0df84440f30362/doc/manual.asciidoc) 说明 implicit 可触发重建但不进 `$in`，order-only 先完成且其变化本身不触发依赖输出重建；depfile 有额外语义。完整 [COPYING](https://github.com/ninja-build/ninja/blob/3ccb2270e8ef5a84bb31c4651c0df84440f30362/COPYING) 是 Apache 2.0；不复制实现。

## 原生基线与自然问题

固定 [ToolQuery 实现](https://github.com/ninja-build/ninja/blob/3ccb2270e8ef5a84bb31c4651c0df84440f30362/src/ninja.cc#L467-L525) 对某目标列 rule、输入，implicit 前加 `|`、order-only 前加 `||`，另列输出和 validation；会尝试加载 pending dyndep，故读取状态依赖实际文件与运行时。它是**结构查询**，单独不证明哪条命令此次执行或原因。`-t graph` 既有研究已说明不能作为类型无损来源；`-d explain` 是原生 dirty 原因基线，`-n -d explain` 是计划观察而非实际执行证据。版本、完整日志、depfile、mtime、构建日志与目标都影响结果；不能从一条可达路径推断这次一定触发了重建。

Android Soong 固定 [官方性能文档 a964a2f](https://android.googlesource.com/platform/build/soong/+/a964a2f12a6d58974a9e3eb45932f7f080a5fddc/docs/perf.md) 明确称大量 `-d explain` 数据难读，并展示改动源 header 后，经生成工具、生成 header 到目标对象的一段 explain 日志；建议从头阅读并结合 `.ninja` 图。该公开说明是自然阅读需求，但示例有省略号、未附完整 manifest、状态与原始输出，不能直接作为完整可验证因果图或对照数据。Ninja [issue #2424](https://github.com/ninja-build/ninja/issues/2424) 则有用户困惑 `-t inputs` 有内容而 `-t deps` 无输出；维护者说明 `deps` 是记录在 depfile 的隐式依赖，并指出 phony 目标无 depfile。这是另一个自然困惑，不证明所有无输出都是 phony 或所有 build 记录完整。两者均不等于上述合成测试的用户误读。

## 价值与下一步

初轮提出的证据方案（现已在文末完成）：在全新临时目录用已有二进制建自有小 manifest，保存固定版本、输入、生成物、真实前后 mtime、完整 `-t query`/`-t graph`、`-n -d explain`、真实构建 stdout/stderr 和退出码，再对每次仅改变一个条件；注意 dry-run 不等于实际执行。只有对照完整原生查询及解释，且标注 source/generator、依赖类型、当次 dirty 依据，才能测图是否减少跨文件关联成本；缺失 depfile 或日志应显示未知。采集真实 Android 完整公开 build 数据的规模、许可和脱敏成本较高，通用解析还须处理 depfile/dyndep/restat/log 和版本差异。初轮尚未运行、构建或生成图；后续执行并不自动证明人类阅读收益，最终仍defer。


## 后续实际原生对照与范围修正

以上是初轮只读判断；随后通过源码bootstrap取得临时Ninja并执行[完整合成对照](../audit/round16-ninja-native/README.md)。固定源码195个blob在bootstrap后核对，未安装；作者首轮和root的便携脚本复现分开保存。实际query显示`|| oo.h`，初建oo.h和foo.o，clean无操作，missing和updated各仅生成oo.h；这里updated只改变输入mtime，内容没有变化，阶段前置时间是人工构造，不能称自然连续工作流。

特别修正笼统表述：**本例的双输入DOT已经用`style=dotted`表达order-only边**；旧报告说的是完整类型分类存在限制，且单入单出简化路径不做该标记，不等于本例图缺失order-only。地址样式DOT ID也不是跨运行稳定标识。query/graph/解释与真实命令共同支持此固定问题，没有证明需要新增图或一般parser。
