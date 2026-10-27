# ASan 报告：三段栈与分配区域的阅读

**结论：有条件的小型候选，尚无价值证明。** 官方的单函数例子中，原报告已明确标记访问、释放、分配，原文足够直接；不值得只把它画成三张卡。更有检验价值的是多个调用层次中重复出现相同函数名的原始程序：在完整日志和源码都可见的前提下，查看并列组织能否帮助读者区分三个独立采样栈，以及“落在分配范围内”与“访问时仍存活”。本轮未编译、安装、运行、生成图或截图；候选收益仍是假设。

## 查重与边界

查阅 `origin/codex/research-lab-20261025` 的 gallery manifest、历史 scout 的 ASan/sanitizer/Valgrind 关键词，以及当前 open PR / 远端 lab refs。基线提交 `60342aa9e40618aeb7c33bdb8d65889fea3a588e` 的 50 项 gallery 有 diagnostic-locations；历史 scout 的 Helgrind 锁序和 SARIF 静态 code flow 均不是 ASan 动态内存报告。邻近的 exception identity（`daf243ae7f40f4f989894f894bb354c5ec5a5660`）、maybe-initialized 静态状态（`61d43f93ee9d11d30d2a239f80e1b2976539d850`）、diagnostic-locations（`b6679399ae688e9a6907e2eca4f222aaa964a975`）、trace-flow（`9f9f9dacf58832f1c8784a1a24f6e04c456a4881`）均不证明 ASan 运行或三段分配历史；当前研究 PR #1120–1124 同样不覆盖此对象。关键词查重不能保证所有同义表达都被发现。

## 原始材料与实际可读任务

- [Clang 官方 AddressSanitizer 文档](https://clang.llvm.org/docs/AddressSanitizer.html#symbolizing-the-reports)给出完整短例：400 字节区域内偏移 4 字节的 READ，分别列出 access、freed、previously allocated 三段栈；三段都从 `main` 出发。错误是 heap-use-after-free，而不是越界。原文本本身已经直接回答这些问题，不以阉割栈或删除标签作为对照。文档说明 macOS 可能需要 `dsymutil` 才有文件行号。固定的 [LLVM use-after-free 测试](https://github.com/llvm/llvm-project/blob/40ce46b0ec4df75686275e18473d7db07cefcec9/compiler-rt/test/asan/TestCases/use-after-free.cpp)只检查简单的 `malloc`、`free`、`x[5]` 和三段栈；它不是自然事故，也不证明阅读困难。LLVM 仓库采用 [Apache 2.0 with LLVM Exceptions](https://github.com/llvm/llvm-project/blob/40ce46b0ec4df75686275e18473d7db07cefcec9/LICENSE.TXT)；若复用代码或文档，保留对应许可与归属。
- [LLVM issue #192351](https://github.com/llvm/llvm-project/issues/192351) 是报告者提供的自然问题与完整源程序、完整报告，非本地复现。报告访问 24 字节区域内偏移 19 的 1 字节；访问、释放、分配的栈都含 `f(bool)`，但分别有不同机器地址。报告者称该结果奇怪，进一步比较 `-Og` 与禁用 `-fextend-variable-liveness`；这支持该问题存在调查负担，**不证明其误读栈**。源代码没有显式 `free`，报告也没有应用源行；issue 中的汇编注释由作者标明为 Claude Code 生成，只作为作者提出的解释，不当作独立验证。ASan 输出本身不证明具体编译器错误原因。
- [LLVM issue #36356](https://github.com/llvm/llvm-project/issues/36356) 含原始输入及报告，但提交者明确称只给出“大部分”输出，故不能声称是完整原始日志。其 80 字节区域内偏移 64 的 4 字节 READ、14 帧访问栈、12 帧释放栈和 26 帧分配栈提供真实长栈压力；`ParseExternalDeclaration` 等重复出现在不同栈中。它有助设计任务，但不能拿残缺报告充当完整基线或据此声称提交者困惑。

## 可执行的最小对照协议（尚未执行）

1. 编写原创、单线程 C 程序：16 字节分配经 `allocate_buffer`/调用者返回；另一个 `release_buffer` 分支释放；随后 `read_buffer` 经独立调用链读取偏移 5 的 1 字节。每条路径至少 2 层，保留一个共同调用者；用 `noinline` 与 `-O0 -g -fsanitize=address -fno-omit-frame-pointer` 降低优化消除风险。不是声称真实事故，也不假定本机 ASan 报告一定可用。记录 `clang --version`、命令、退出码、源码、完整 stdout/stderr，若无符号或没有所需三段就停止并记录，必要时按官方文档尝试 `dsymutil`。不安装任何东西。
2. **基线：**相同原始完整 ASan stderr（包含栈、区域、shadow 与 legend，如本机实际输出）加完整源码，可搜索滚动。**候选：**同一原文及源码仍可展开/检索，固定手工投影把访问、释放、分配三段并列，突出各自来源行、共同调用者，另以区域 `[base, base+16)` 和偏移 5 展示位置，并单独标注报告的 UAF 类型。仅复用现有 Archify 内容/图能力，不改共享代码、不做通用解析器。每个投影项可回指原始日志，缺失则明确缺失。展示顺序是报告角色，不声称线程时间戳、调用链间的直接调用或地址复用身份；分配/释放/访问的关系只依报告与该程序源代码支持的事实表述。
3. 预先固定三题：哪个栈标识当前非法读取，哪些分别记录释放和分配？偏移 5、大小 1 在 16 字节区间内是否就意味着此访问有效？三段反复出现同一调用者是否代表一条连续调用栈？答案需指出源行或报告原文；同时保留可定位完整栈的任务。记录首次回答、耗时、错误与修正、完整原图/窄屏截图、输入和限制。先自检可比性，不要求预先有人体研究才能试制。
4. **证伪：**若原始报告同样易于定位，候选没有减少查找或澄清错误，或投影省略/暗示不被证实的关系，就停止；若纯样例太简单，也不推广至复杂真实故障。再考虑用有完整日志及源码权限的自然报告复核；#36356 不能直接满足完整日志条件。

所有链接为截至本次查阅的材料；LLVM issue 内容可变，若日后作为固定对照应保存原文快照、访问日期和版权来源。没有声称有用户研究或定量效果。

## 后续探针结果（2026-10-27）

上文的“尚未执行”描述筛选阶段。随后原创 C 探针编译成功，但 ASan 运行无报告；独立空程序对照也在启用 ASan 时无输出，普通构建正常退出。原件哈希、命令、退出码与脱敏选取诊断已推送 [`codex/lab-asan-provenance@6f604170`](https://github.com/tt-a1i/archify/tree/6f604170574b5ba854026a7ec8f01fb5ba0dd67a/experiments/asan-provenance)。这是暂缓的运行探针，不是已完成图形阅读实验；没有产图、图片、用户效果或根因结论。没有修复环境、安装或新建 PR。
