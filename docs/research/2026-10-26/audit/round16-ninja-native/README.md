# Ninja：order-only 不等于触发下游重建

固定[Ninja 3ccb2270e8ef5a84bb31c4651c0df84440f30362](https://github.com/ninja-build/ninja/tree/3ccb2270e8ef5a84bb31c4651c0df84440f30362)，来源启发为[RebuildOrderOnlyDeps完整测试](https://github.com/ninja-build/ninja/blob/3ccb2270e8ef5a84bb31c4651c0df84440f30362/src/build_test.cc#L1208-L1252)。上游使用fake filesystem/runner，本例换成真实临时文件，复制操作只写入本次新fixture；`foo.o`只是输出名称，**不是编译出的目标文件**。本次没有运行上游单元测试、自然Android构建或真人阅读试验。

## 固定问题与结果

`foo.o`有普通输入`foo.c`与order-only输入`oo.h`；后者由`oo.h.in`生成。完整manifest和初始内容都在[probe.py](probe.py)内。

| 场景 | 记录的前置条件 | 实际命令写入的输出 |
| --- | --- | --- |
| initial | 两个输出缺失 | oo.h，随后foo.o |
| clean | 输入早于输出 | 无工作 |
| missing | 删除本例oo.h，foo.o保留 | 只有oo.h |
| updated | oo.h的mtime为1100000000，oo.h.in为1150000000，foo.o为1200000000秒 | 只有oo.h |

updated只变更输入mtime，不改变输入内容；记录也重设了输出时间。每个before-state是明确构造的前置条件，不是一个自然连续工作流，也不声称相对上一after-state只有一个变化。所有设置的时间均在过去，无sleep或未来时间。

[原生query](root/query.stdout)已标出`|| oo.h`；[本例DOT](root/graph.stdout)也用`style=dotted`标出这条order-only边。不能把旧研究的一般分类限制说成本例缺少该标记。DOT的地址式ID不是跨运行身份。本轮不把DOT渲染截图，也不提出另一套图。

[updated计划解释](root/updated-plan.stderr)指出oo.h比输入旧；[实际输出](root/updated-build.stdout)只执行生成oo.h。`-n`的计划和随后真实执行分别记录；真实[action log](root/action-log.txt)为oo.h、foo.o、oo.h、oo.h。root核对clean/missing/updated三阶段foo.o的hash、大小和mtime均不变；最后oo.h的实际mtime比foo.o新，但未使foo.o重建。11次原生命令含版本查询均exit0。解释诊断写入各命令stderr是正常输出，不能概括为所有stderr为空。

## 来源、构建与复现

本机未发现已装Ninja。作者读取固定源码的configure.py后，在临时源目录用现有Python3.15.0、Apple clang17.0.0和ar运行bootstrap；没有安装包、下载依赖、调用安装目标或改用户仓库。版本为1.14.0.git，二进制SHA-256为`a4c40a9d58270a9ee6162b043b954a412ee6ed49ecd30e190abdb40d6d9bd5cf`。完整[构建回执](build/receipt.txt)、[stdout](build/bootstrap-stdout.txt)与空stderr、exit0都保留。取得源码与API的记录均已终止，没有下载失败或遗留session。

[root源码校验](source-verification-root.json)核对[固定树的195个Git blob](source-tree.json)，全部匹配；这是bootstrap后的检查，没有记录完整前置检查。源码commit、二进制hash、工具版本是不同身份，不从版本字符串推断commit。根[COPYING.ninja](COPYING.ninja)完整保留上游Apache-2.0许可原字节；源码第三方部分仍有自己的许可。本目录没有发布上游实现、源码archive或编译二进制。

在独立临时源码checkout中，已有工具可以构建：

```sh
env -i PATH=/usr/bin:/bin:/opt/homebrew/bin CXX=/usr/bin/clang++ PYTHONDONTWRITEBYTECODE=1 python3 configure.py --bootstrap
```

使用固定源码取得的二进制，在本目录执行：

```sh
env -i PATH=/opt/homebrew/bin:/usr/bin:/bin LC_ALL=C PYTHONDONTWRITEBYTECODE=1 python3 probe.py /absolute/path/to/ninja
```

环境路径对应本次macOS已有工具，应按实际已有编译器调整；不同环境不保证二进制字节相同。脚本不安装工具，每次生成新的`/tmp/archify-ninja-run.*`报告及fixture，打印路径，记录二进制、脚本hash和命令。它不会覆盖旧日志，不设置HOME。唯一删除动作是本次新fixture的oo.h，用于missing场景；目录保留供检查。

作者首稿写入固定报告目录，不能安全重复保存；[original/probe.py.txt](original/probe.py.txt)及原始记录保留，勿作为推荐命令。便携版由作者只做语法检查，root随后实际执行一次；[root-summary.json](root-summary.json)绑定[完整原始记录](root/)与当前脚本。两次的路径、DOT地址和实际生成时间不同，不能称字节相同或人类对照实验。文件级哈希清单见[manifest.json](manifest.json)。

## 筛选判断

完整query、DOT、explain和实际执行已经解释此固定任务。自然Android案例提到大日志阅读困难，但没有同一完整manifest/状态可重放；其需求不能由这个小例自动证实。通用解释器还要负责depfile、dyndep、restat、历史日志及版本，当前收益不足以支持新Archify实现。本记录保留可复现基线；不扩展为自动构建、依赖推断或执行因果图，也没有可读性提升或原生UI验收结论。
