# DeviceTree：overlay 选择与最终声明

2026-10-28，源码调查；**暂缓新页面和解析器**。真实 [Zephyr #38251](https://github.com/zephyrproject-rtos/zephyr/issues/38251) 中，用户以为显式 `DTC_OVERLAY_FILE` 会附加在自动选中的 board overlay 后，实际选择规则不同；[维护者原生构建日志](https://github.com/zephyrproject-rtos/zephyr/issues/38251#issuecomment-932145728) 已列出所选文件和最终 DTS 路径。该历史问题没有公开完整项目和对应最终 DTS，不能冒充同次复现。当前固定 [HOWTO](https://github.com/zephyrproject-rtos/zephyr/blob/ec98918869caeb2ddaef6e698f9ff36fb60a97ac/doc/build/dts/howtos.rst) 解释显式、自动和 `EXTRA_DTC_OVERLAY_FILE`；较新文档不能回填给 2021 年用户。关联文档 PR #39034 已关闭但未合并，不能说它解决了问题。

完整 [Zephyr `test_dtlib.py`](https://github.com/zephyrproject-rtos/zephyr/blob/ec98918869caeb2ddaef6e698f9ff36fb60a97ac/scripts/dts/python-devicetree/tests/test_dtlib.py) 的 `test_duplicate_nodes` 给出同一 DTS 两个根块将 `/foo` 属性从 3 改为 4 的完整输入及最终 `<0x4>` expected；同块重复节点是不同的错误测试。它是合成单元测试，**不是独立 board/overlay 构建或本轮运行**。同文件 `test_phandle2node` 另有完整输入和引用断言，不能把它合并成同一案例。

[Zephyr 状态合同](https://github.com/zephyrproject-rtos/zephyr/blob/ec98918869caeb2ddaef6e698f9ff36fb60a97ac/doc/build/dts/intro-syntax-structure.rst)：缺失 `status` 或 `okay` 为 enabled；父节点 disabled 不自动使子节点 disabled。此合同不证明驱动创建、初始化或硬件可用；[故障排查](https://github.com/zephyrproject-rtos/zephyr/blob/ec98918869caeb2ddaef6e698f9ff36fb60a97ac/doc/build/dts/troubleshooting.rst) 还要求检查驱动配置。phandle 不自动代表运行调用或物理接线。

原生强基线是完整选择日志、预处理和最终 `zephyr.dts`、bindings 与必要的生成 header；[DTSh](https://github.com/dottspina/dtsh/tree/22fa0356c350b1ad28beeed4af8b238a62290808) 已提供最终 DTS 的树与搜索。未实测该工具，也未证明它追溯各 overlay 的贡献。上游固定测试文件为 BSD-3-Clause，见[全文](https://github.com/zephyrproject-rtos/zephyr/blob/ec98918869caeb2ddaef6e698f9ff36fb60a97ac/LICENSES/BSD-3-Clause.txt)；DTSh 为 [Apache-2.0](https://github.com/dottspina/dtsh/blob/22fa0356c350b1ad28beeed4af8b238a62290808/LICENSE)。

未来只有取得同构建的完整 board、overlay、flags、日志与最终 DTS，才考虑用现有 Explainer 表对照输入、选择和最终值，并与完整原生工具比较。现有 Tree 能表达声明的包含层级，但不能以 parent 边冒充 phandle；它的结构类型显示问题已有独立候选，不能视为当前 dev 已修复。无同输入对照或读者价值，不扩展 schema、parser 或驱动推断。
