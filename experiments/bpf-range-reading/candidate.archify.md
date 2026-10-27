# 一条移位为何改变边界错误？ {#bpf-range}

两段上游测试仅在相减后是否右移不同。它们的特权模式预期分别指出最大偏移越界和最小偏移为负。

- Linux 上游自测的预期，不是本轮 verifier 日志或执行结果。[](source:fixture)
- 相同字节对的位向量模型仅说明可能值，不代表 verifier 内部精确范围。
- map 为 8 字节；最终访问为 1 字节。空指针分支退出；此处没有运行任一分支。

@answer scope="固定上游测试 · 位向量数学模型 · 未运行内核"
@meta locale=zh-CN
@source fixture title="Linux verifier_bounds.c：map 与两段测试，GPL-2.0" url=https://github.com/torvalds/linux/blob/d135ab453a7400a34930bdda1ef4bdc8acfac80e/tools/testing/selftests/bpf/progs/verifier_bounds.c#L9-L76
@source verifier title="Linux verifier.c：范围检查与算术" url=https://github.com/torvalds/linux/blob/d135ab453a7400a34930bdda1ef4bdc8acfac80e/kernel/bpf/verifier.c#L4778-L4865
@source license title="Linux GPL-2.0 许可全文" url=https://github.com/torvalds/linux/blob/d135ab453a7400a34930bdda1ef4bdc8acfac80e/LICENSES/preferred/GPL-2.0

## 两段测试的完整原文 {#source span=12}

以下保留 map 定义和两个完整函数，来自 Linux 固定版本，文件标记 GPL-2.0。完整原件与许可另存于实验目录。[](source:license)

```c
struct {
	__uint(type, BPF_MAP_TYPE_HASH);
	__uint(max_entries, 1);
	__type(key, long long);
	__type(value, long long);
} map_hash_8b SEC(".maps");

SEC("socket")
__description("subtraction bounds (map value) variant 1")
__failure __msg("R0 max value is outside of the allowed memory range")
__failure_unpriv
__naked void bounds_map_value_variant_1(void)
{
	asm volatile ("					\
	r1 = 0;						\
	*(u64*)(r10 - 8) = r1;				\
	r2 = r10;					\
	r2 += -8;					\
	r1 = %[map_hash_8b] ll;				\
	call %[bpf_map_lookup_elem];			\
	if r0 == 0 goto l0_%=;				\
	r1 = *(u8*)(r0 + 0);				\
	if r1 > 0xff goto l0_%=;			\
	r3 = *(u8*)(r0 + 1);				\
	if r3 > 0xff goto l0_%=;			\
	r1 -= r3;					\
	r1 >>= 56;					\
	r0 += r1;					\
	r0 = *(u8*)(r0 + 0);				\
	exit;						\
l0_%=:	r0 = 0;						\
	exit;						\
"	:
	: __imm(bpf_map_lookup_elem),
	  __imm_addr(map_hash_8b)
	: __clobber_all);
}

SEC("socket")
__description("subtraction bounds (map value) variant 2")
__failure
__msg("R0 min value is negative, either use unsigned index or do a if (index >=0) check.")
__msg_unpriv("R1 has unknown scalar with mixed signed bounds")
__naked void bounds_map_value_variant_2(void)
{
	asm volatile ("					\
	r1 = 0;						\
	*(u64*)(r10 - 8) = r1;				\
	r2 = r10;					\
	r2 += -8;					\
	r1 = %[map_hash_8b] ll;				\
	call %[bpf_map_lookup_elem];			\
	if r0 == 0 goto l0_%=;				\
	r1 = *(u8*)(r0 + 0);				\
	if r1 > 0xff goto l0_%=;			\
	r3 = *(u8*)(r0 + 1);				\
	if r3 > 0xff goto l0_%=;			\
	r1 -= r3;					\
	r0 += r1;					\
	r0 = *(u8*)(r0 + 0);				\
	exit;						\
l0_%=:	r0 = 0;						\
	exit;						\
"	:
	: __imm(bpf_map_lookup_elem),
	  __imm_addr(map_hash_8b)
	: __clobber_all);
}
```

## 两次预期与权限边界 {#expected span=12}

测试从同一 map 值的偏移 0 和 1 读取两个 u8。读取前检查返回值非空。两次相减后，只有变体 1 逻辑右移 56 位，再将结果加到指针；变体 2 直接相加。两者最终各读取 1 字节。

| 模式 | 变体 1：有移位 | 变体 2：无移位 |
| --- | --- | --- |
| 特权预期 | `R0 max value is outside of the allowed memory range` | `R0 min value is negative, either use unsigned index or do a if (index >=0) check.` |
| 非特权预期 | 标记失败，未指定消息 | `R1 has unknown scalar with mixed signed bounds` |

这些文字是测试匹配的子串，不是完整错误日志。非特权检查可能在指针运算阶段报错。[](source:verifier)

## 同一输入的数学结果 {#math span=12}

令两个字节为 a、b，各为 0 到 255。64 位减法按模 2 的 64 次方保留位模式。以有符号数解释，可能值为 −255 到 255；逻辑右移 56 位后的精确集合是 0 和 255。

取 `a=0, b=1`：无移位时按有符号解释为 `−1`；有移位时 `0xffffffffffffffff` 逻辑右移 56 位得到 `255`。前者在区域之前，后者超过 8 字节区域的末端。它们是数学上的可能值，不是观测到的 map 内容。

独立 Python 模型穷举 65,536 对：右移为 0 的有 32,896 对，为 255 的有 32,640 对。数学集合不是 verifier 的 cnum 或 tnum 精确状态，也不能单独证明预期错误的内部路径。

## 对齐比较：不同的只有中间一行 {#compare span=12}

这是两段指令和数学示例的并排投影，不是运行轨迹或 verifier 状态。下表保留原文之外的阅读组织，不推断空指针分支已执行。

| 比较项 | 变体 1：有移位 | 变体 2：无移位 |
| --- | --- | --- |
| 原始字节 | 读取 offset 0 与 1 | 读取 offset 0 与 1 |
| 相减 | 64 位 `r1 -= r3` | 64 位 `r1 -= r3` |
| 区别 | `r1 >>= 56` | 无移位指令 |
| 模型：a=0，b=1 | 逻辑右移后为 `255` | 有符号解释为 `−1` |
| 最终读取 | 基址加结果，读取 1 字节 | 基址加结果，读取 1 字节 |
| 特权预期 | 最大偏移越界 | 最小偏移为负 |
