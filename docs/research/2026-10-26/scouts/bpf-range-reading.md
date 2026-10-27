# eBPF 两条 bounds 测试：位向量演绎与 verifier 证据分开

2026-10-27。**决定：可做一个固定内容的配对阅读实验，但不做 verifier 模拟器或共享产品改动。** 两条上游测试只有一条移位指令差别，预期错误却分别是最大偏移越界与最小偏移为负。并排对齐指令、数学取值示例和上游原始错误，可能降低在两个长 asm 块中来回寻找差异的成本；这是可检验的视觉假设，并非已经证明收益。实验必须清楚区分可执行位向量数学与 verifier 的抽象状态：**上游 fixture 未提交本次寄存器逐步日志，不能把数学精确集合标成 verifier 内部区间。**

## 排重及固定来源

此前检索历史 scout、50 项实验索引、当前 scouts 及 round6 远端分支与 PR 快照，`ebpf`、`bpf verifier` 无相关命中；范围有限，不证明未命名工作不存在。邻近的 static-uses、control-data 讲静态依赖，state-lifetime 讲状态集合，diagnostic-locations 与 test-failure 讲位置与错误；它们都不直接解释相邻的位运算怎样改变这个特定 verifier 边界。无上游执行、内核测试、安装、浏览器、截图或产品代码。

来源固定 Linux [`d135ab453a7400a34930bdda1ef4bdc8acfac80e`](https://github.com/torvalds/linux/tree/d135ab453a7400a34930bdda1ef4bdc8acfac80e) 的完整 [verifier_bounds.c](https://github.com/torvalds/linux/blob/d135ab453a7400a34930bdda1ef4bdc8acfac80e/tools/testing/selftests/bpf/progs/verifier_bounds.c) 与 [verifier.c](https://github.com/torvalds/linux/blob/d135ab453a7400a34930bdda1ef4bdc8acfac80e/kernel/bpf/verifier.c)。测试文件 SPDX 是 `GPL-2.0`；[完整 GPL-2.0 正文](https://github.com/torvalds/linux/blob/d135ab453a7400a34930bdda1ef4bdc8acfac80e/LICENSES/preferred/GPL-2.0)，[仓库 COPYING](https://github.com/torvalds/linux/blob/d135ab453a7400a34930bdda1ef4bdc8acfac80e/COPYING) 说明不同文件许可可能不同，不能以 syscall exception 自动覆盖此测试文件。若复制完整 fixture 到实验，保留原文件、SPDX、许可全文和来源，不把它误称 Apache/MIT；许可边界需复核。

## 固定样本能证明什么

`map_hash_8b` 是 hash map，value 类型 `long long`，测试意图为 8-byte 值。两函数先 `bpf_map_lookup_elem`，返回 null 则退出；非 null 分支以 `*(u8*)(r0 + 0)` 装入 r1，以 `*(u8*)(r0 + 1)` 装入 r3，是同一 map value 的不同地址，都是单字节无符号读取。代码对二者各有 `> 0xff` 跳转；接着执行 64-bit `r1 -= r3`，variant 1 独有 `r1 >>= 56`，然后 `r0 += r1`、读取 `*(u8*)(r0 + 0)`（一次 1 byte）。这些是上游测试代码，不表示本轮有 map 内容、事件轨迹或实际执行。

原 fixture 的 privileged 预期：variant 1 `__failure __msg("R0 max value is outside of the allowed memory range")`；variant 2 `__failure __msg("R0 min value is negative, either use unsigned index or do a if (index >=0) check.")`。variant 1 另标 `__failure_unpriv`，**没有指定非特权消息**；variant 2 的 `__msg_unpriv` 为 `R1 has unknown scalar with mixed signed bounds`。只保留测试实际指定的消息，不为 variant 1 编造 unpriv 文案；`__msg` 是断言子串，不是完整 verifier 日志。测试未被本轮运行。

源码链路：[`check_map_mem_read`](https://github.com/torvalds/linux/blob/d135ab453a7400a34930bdda1ef4bdc8acfac80e/kernel/bpf/verifier.c#L7183) 对常规非只读 map 的读调用 `mark_reg_unknown`；[`check_mem_access`](https://github.com/torvalds/linux/blob/d135ab453a7400a34930bdda1ef4bdc8acfac80e/kernel/bpf/verifier.c#L7240) 在成功的短无符号 scalar read 后使用 `coerce_reg_to_size`。每次读取单独产生未知 scalar 的表示；两字节是不同地址，此处以所有 u8 对建模，不推测 map 实际数据或运行时是否有并发修改。[`adjust_scalar_min_max_vals`](https://github.com/torvalds/linux/blob/d135ab453a7400a34930bdda1ef4bdc8acfac80e/kernel/bpf/verifier.c#L17310) 对减法同时更新 cnum 和 tnum；[`scalar_min_max_rsh`](https://github.com/torvalds/linux/blob/d135ab453a7400a34930bdda1ef4bdc8acfac80e/kernel/bpf/verifier.c#L17104) 明确 BPF_RSH 为无符号右移，并从无符号范围及 tnum 重新推导。之后 [`adjust_ptr_min_max_vals`](https://github.com/torvalds/linux/blob/d135ab453a7400a34930bdda1ef4bdc8acfac80e/kernel/bpf/verifier.c#L16287) 处理 pointer + scalar；[`check_mem_region_access`](https://github.com/torvalds/linux/blob/d135ab453a7400a34930bdda1ef4bdc8acfac80e/kernel/bpf/verifier.c#L4778) 先检查负的 signed minimum，再检查 unsigned maximum 与区域和 access size。非特权可能在 pointer arithmetic 的 [`sanitize_err`](https://github.com/torvalds/linux/blob/d135ab453a7400a34930bdda1ef4bdc8acfac80e/kernel/bpf/verifier.c#L16162) 提前报告 mixed signed bounds，不可把所有情况画成相同末端检查。

## 原创穷举：仅位向量模型

本轮用 Python 标准库对 256×256 个输入对做了纯整数计算：`v = (a-b) & ((1<<64)-1)`，按二补码将 v 解读为 signed；同时计算 `v >> 56`。输出为 65,536 对；signed 差值最小 −255、最大 255；非负 32,896 对，负值 32,640 对；右移结果仅为 0（32,896）或 255（32,640）。例如 `a=0,b=1`：减法的 64-bit 位模式为 `0xffffffffffffffff`，逻辑右移 56 后为 255；不移位则 signed 为 −1。这是数学上对任意两 u8 值的原创建模，并非运行 eBPF 程序或 verifier、不是上游 receipt，也不证明每个 map 数据都出现过。模型并不表达 verifier 的 cnum/tnum 抽象精度和所有路径；因此不能把 `[-255,255]` 与 `{0,255}` 标成 verifier 日志或保证其精确内部表示。

这足以说明为何两种可能的偏移分别触及 8-byte 区域之前和远超末端；但**不能独自证明对应预期诊断如何由具体抽象状态到达**。上游 `__msg` 与 owning check 代码提供错误类别的证据，具体逐指令范围仍未知。若内容图依赖精确 verifier 上界/下界或完整日志，应停止而不是把数学模型伪装成它。

## 有界实验与价值门槛

公平 A0 是完整两个 fixture 函数、map 定义、原样 expected 和必要解释（包括 unpriv 区别）；A1 用相同内容与可核来源，左右对齐共有指令，显式标记额外逻辑移位，并提供标为数学模型的 −1→255 示例及真实预期消息。让读者回答：哪里不同、该例的偏移如何变化、priv/unpriv 预期分别是什么、能否从测试断言推出实际运行。可用现有 Explainer/静态图；无需新 schema、runtime、自动导入、内核、解析器或 range engine。完成时保留相同主题和视口的实际图、原文和可复查出处；不能以一个漂亮图声称更快、更准确。若图无法一屏同时保留证据、视觉组织比原文本更难读，或要求伪造 verifier 内部范围，则拒绝。GPL 原始内容许可与最终产物复用先解决；本报告不授权发布或创建 PR。

## 后续落地状态（2026-10-27）

上文是筛选时的范围说明，后续已按该边界完成固定内容实验并推送 [`codex/lab-bpf-range-reading@cd5d94ea`](https://github.com/tt-a1i/archify/tree/cd5d94ea3bf66b9ae4b08459ac5d454994b2aee2/experiments/bpf-range-reading)。两臂保留同源原文、解释与许可，候选仅附对齐表；实际 HTML、七张浏览器截图、数学模型及独立审查已记录。自动 browser-check 与实际页面观察完成，但未运行内核、未证明读者效率；未新建 PR。最终成本与边界见分支 README 和本 hub 第七批记录。
