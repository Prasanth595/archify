# Kconfig 配置交接：一个可运行的固定 `imply` 样例候选

2026-10-28，source-only。**有条件保留一个 standalone Explainer 内容实验**：同页保留完整上游 fixture、测试断言、具体配置值与依赖关系，回答「`IMPLY_DIRECT_DEPS=y`，为什么 `UNMET_DIRECT_1=n`，而 `MET_DIRECT_1=y`？」其实际用途是离线交接某次可复核的配置解释，而不是新 Kconfig 求值器。上游测试与菜单本身已经提供结果和原因；需要比较完整 native symbol-info/断言后再判断成品是否带来交接价值，无需先证明人工速度。

## 排重

对 `origin/codex/research-lab-20261025` 和当前 2026-10-26 scouts 搜 Kconfig/menuconfig/Zephyr config，未见直接命中；关键词不保证穷尽。[config-origins](https://github.com/tt-a1i/archify/tree/codex/lab-config-origins) 讲 provider 声明、覆盖与错误归属；[rule-matching](https://github.com/tt-a1i/archify/blob/codex/research-lab-20261026/docs/research/2026-10-26/scouts/rule-matching-reading.md) 讲 ESLint 条件匹配。Kconfig 的 user value、direct dependency、反向 `select`/`imply` 和最终值有不同的生产者合同，不能只按配置文件最后赋值推导。

## 一手需求、固定样例与断言

[Zephyr 固定文档 tips.rst](https://github.com/zephyrproject-rtos/zephyr/blob/ec98918869caeb2ddaef6e698f9ff36fb60a97ac/doc/build/kconfig/tips.rst#L88-L175) 描述实际可理解的维护困惑：`USB_CONSOLE` select `CONSOLE`，后来 `CONSOLE depends on STRING_ROUTINES`，则 USB_CONSOLE 为 y 仍能强制 CONSOLE=y，即使 STRING_ROUTINES=n；非局部 select 容易掩盖启用路径。它是官方教学示例和设计建议，不是有完整事故采集的用户报告，也不能说 select 一般应被随意改成 depends。固定 [Zephyr@ec98918869caeb2ddaef6e698f9ff36fb60a97ac](https://github.com/zephyrproject-rtos/zephyr/tree/ec98918869caeb2ddaef6e698f9ff36fb60a97ac)（2026-10-27 默认分支）、[Apache-2.0](https://github.com/zephyrproject-rtos/zephyr/blob/ec98918869caeb2ddaef6e698f9ff36fb60a97ac/LICENSE)；该完整文档 SHA-256 `a22dd1e957b8ec3d032cb78cbff7bf433e8f6f0a9b3c65b128cf4c119b5a58ae`。示例以省略号展示，不是可运行的完整 Kconfig，也不伪造对应的 warning 输出。

可运行的完整 upstream fixture 是 [Kconfiglib tests/Kimply](https://github.com/ulfalizer/Kconfiglib/blob/061e71f7d78cb057762d88de088055361863deff/tests/Kimply)，SHA-256 `0952741f2cf17f091d74bfb689a08fbbf8b584d6f7c31cef786fde2c88f6c9ed`；固定 [testsuite.py](https://github.com/ulfalizer/Kconfiglib/blob/061e71f7d78cb057762d88de088055361863deff/testsuite.py#L2062-L2115) SHA-256 `f83d62a993bc52bcb33bc98efe74e065e2efafba912bdf3cb8e4d9e624494deb`，上游断言默认 `IMPLY_DIRECT_DEPS=y`、`UNMET_DIRECT_1/2/3=n`、`MET_DIRECT_1/2/3/4=y`；后面测试动态设置 `IMPLY=y`、`DIRECT_DEP=y` 时 `IMPLIED_TRISTATE=y`，再将 DIRECT_DEP 置 n 时为 n。完整文件还有条件、tristate 和用户赋值用例，不得裁成假装完整的输入。均为上游断言，未在本轮运行；它是 imply 例，**不是** select warning 测试。

固定 [Kconfiglib@061e71f7d78cb057762d88de088055361863deff](https://github.com/ulfalizer/Kconfiglib/tree/061e71f7d78cb057762d88de088055361863deff)，最新提交日期 2020-01-31（不冒充当前 Zephyr vendored 版本），[ISC 许可](https://github.com/ulfalizer/Kconfiglib/blob/061e71f7d78cb057762d88de088055361863deff/LICENSE.txt)。[求值源码](https://github.com/ulfalizer/Kconfiglib/blob/061e71f7d78cb057762d88de088055361863deff/kconfiglib.py#L4470-L4485) 中 imply 值需 direct dependency 非零，select reverse dependency 优先并在超过 direct dep 时调用 [warning](https://github.com/ulfalizer/Kconfiglib/blob/061e71f7d78cb057762d88de088055361863deff/kconfiglib.py#L4951-L4975)，报告目标、依赖值与选择者。上述源码不是运行结果；不能从 Zephyr 教学文字声称已捕获某环境的精确 stderr。

## 完整 native 基线和候选

固定 [menuconfig `_info_str`](https://github.com/ulfalizer/Kconfiglib/blob/061e71f7d78cb057762d88de088055361863deff/menuconfig.py#L2540-L2558) 包含 symbol name、prompt、type、当前 value、direct dependency、defaults、select/imply 反向来源以及原始定义位置；[select/imply 信息](https://github.com/ulfalizer/Kconfiglib/blob/061e71f7d78cb057762d88de088055361863deff/menuconfig.py#L2718-L2760) 按当前 n/m/y 关系分组。Zephyr [menuconfig 官方说明](https://github.com/zephyrproject-rtos/zephyr/blob/ec98918869caeb2ddaef6e698f9ff36fb60a97ac/doc/build/kconfig/menuconfig.rst) 描述 `/` 搜索、`?` 信息、show-all 和不可见赋值；应把这些原生交互、warning、完整源/test 与生成配置都纳入基线，不能只比较裸 `.config` 文本。当前读取源码未实测 UI；`_value_info` 显示最终值，不能据此宣称它显示用户赋值的所有来源。

**具体可运行假设**：在隔离且许可允许的固定 checkout，使用上游 testsuite 的 `Kimply` 和版本一致工具产出完整 stdout/stderr 与各目标的 native symbol-info；不能只断言简化自写 parser。独立 Explainer 页面嵌入原始 fixture/断言（保留 ISC 许可及 hash），列出 `IMPLY_DIRECT_DEPS=y`、两个目标的 direct dependency、最终 n/y 和 upstream expected，标注期望与实测区别；用少量明确标为 Kconfig 关系的连接表示 `imply` 与 `depends on`，不画成执行、构建或因果轨迹。可附官方 `select` 教学作为单独非运行旁证，不把两份样例拼成一个实测状态。对照完整 menuconfig symbol-info及 warning，页面的可验证附加用途是把固定上下文、结论和来源绑定成可离线交付件；若原生输出本身已可等价打包，或页面不能保留完整上下文则停止。非必要引入 parser、运行时、通用依赖图、构建系统或预测引擎。

本轮未安装、执行、浏览器、用户验收或写仓库；未声称以上样例已运行通过、具体 warning 已产生、适用于所有 Zephyr 版本或证明 reader 效率。
