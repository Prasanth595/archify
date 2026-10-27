# LLVM optimization remarks：重复检查

2026-10-28，只读。**defer，且不重复既有实现候选**：本批要求的同一阅读问题，历史研究已用完整上游 fixture 和 opt-viewer 基线深入覆盖。剩余具体证据缺口是：取得一次可公开的真实优化记录、编译时源码快照与完整 pass/flags/profile/过滤配置，并观察审阅者是否真的把同一行不同列的两次 missed callsite 合并；当前只有合成 FileCheck 预期，没有这样的自然误读或原生 viewer 的本轮实际截图/运行。

## 查重

历史 [compiler-remarks-smalltools](https://github.com/tt-a1i/archify/blob/60342aa9e40618aeb7c33bdb8d65889fea3a588e/docs/research/2026-10-25/scouts/compiler-remarks-smalltools.md) 已研究 LLVM opt-viewer、Compiler Explorer 相关工具、pass、callsite、caller/callee 不同 DebugLoc、空输出过滤与热度；其结论是无新增实施。当前 docs/research 关键词无同名新 scout；`/tmp/archify-round17-remote-heads.txt` 中 `lab-benchmark-reading@7b8258cd`、`lab-static-uses@7be0711d`、`lab-bpf-range-reading@cd5d94ea` 分别涉及 benchmark、静态引用和 verifier 范围，并非实际 optimization remark。历史 `visual-explanation-smalltools` 已覆盖 Compiler Explorer 的多汇编行到同一源码位置。refs 名称与关键词不足以证明其他同义工作不存在。

## 同一完整官方 fixture 已被覆盖

固定 [LLVM `optimization-remarks-yaml.ll`](https://github.com/llvm/llvm-project/blob/f17204bd4c24b4cf0ab7b9b041ddc0fe0529ca3c/llvm/test/Transforms/Inline/optimization-remarks-yaml.ll) 包含完整 IR、debug/profile metadata、RUN 和 FileCheck 预期。该测试预期 `baz` 的两条 `!Missed`，均为 `Pass: inline`、`Name: NoDefinition`，位于 `/tmp/s.c` 行 5 的列 10 与 18，callee 分别 foo、bar；Caller 参数的位置是定义处行 4，不是两个调用位置。阈值设 100 的测试预期记录为空，不能把缺记录当未发生优化尝试；profile count 30 是手工 metadata，不是用户程序运行测量。该路径是 fixture metadata，不表示本地文件存在。完整 [LLVM license](https://github.com/llvm/llvm-project/blob/f17204bd4c24b4cf0ab7b9b041ddc0fe0529ca3c/llvm/LICENSE.TXT) 为 Apache-2.0 WITH LLVM-exception。预期是测试断言，未执行、不是实测生成记录或自然性能问题。

这已是本批拟找的可核验任务：“同一行的两个 NoDefinition 是否是同一个 callsite；caller 定义位置是否等于 remark 位置？”它是技术上可证伪的题目，但目前无证据说明真实用户无法从现有工具解决。错把 remark 视为运行耗时或性能收益、把未显示当作不存在、或从缺失 debug 信息猜 callsite 都超出证据。

## 原生最强基线及成本

固定的 [LLVM opt-viewer 源码](https://github.com/llvm/llvm-project/blob/f17204bd4c24b4cf0ab7b9b041ddc0fe0529ca3c/llvm/tools/opt-viewer/opt-viewer.py#L50-L125) 已将 remark 贴近源码展示；历史研究还记录 cargo-remark 的可跳转参数位置与过滤、Compiler Explorer 的 source/assembly 对照。原生对照应包括完整 remark 原文、准确源码快照、opt-viewer 显示与 producer 配置，而不只给一行简化输出；没有本轮 UI 实测，不声称其对该 fixture 必定解决全部误读。LLVM [remarks 格式文档](https://llvm.org/docs/Remarks.html) 是滚动文档；固定 fixture 和源码是本结论主要版本依据。

如果将来取得上述真实材料，先手工对照两次调用的具体列、参数位置和原生 viewer；只有实际错误或额外可核验定位负担，才考虑小型解释页面。维护成本包含 LLVM YAML/bitstream、optional DebugLoc/Hotness、源码版本、宏/内联、pass 与过滤规则变更、可公开 profile 及实际 workload 的独立测量；无法由 remark 本身推导运行时加速。无需下载整个 LLVM、编译、运行、安装或改产品；本轮均未进行。
