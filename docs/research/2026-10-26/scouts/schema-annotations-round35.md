# 第 35 批：成功分支覆盖的解释页实验

2026-10-29。开始前及推送前均核对 330 条远程 heads，两份快照一致；新方向只推独立远程分支，不创建 PR。

## 为什么保留这个方向

JSON Schema 的 `anyOf` 可以成功，但整体仍被 `unevaluatedProperties:false` 拒绝。一个属性出现在失败分支中，不等于它获得了覆盖。官方测试组还包含两个分支同时成功的对照，能防止把 `anyOf` 误读成只取第一个分支或 `oneOf`。

源于 [JSON-Schema-Test-Suite 固定文件](https://github.com/json-schema-org/JSON-Schema-Test-Suite/blob/89e83a74014617ffbe79a56d83d14d054cd11417/tests/draft2020-12/unevaluatedProperties.json) 的完整 `/11` 组，MIT，Copyright (c) 2012 Julian Berman。四个输入、schema、完整上游文件和许可均保留。语义依据为 [2020-12 Core](https://json-schema.org/draft/2020-12/json-schema-core)。

已有 ajv-errors 方向保留底层错误，但不解释成功分支的覆盖汇总；两个研究总账未找到该关键词，当前 issue / PR 有界检索各 0。没有把这个结果当作全库绝无概念重叠的证明。

## 原生证据与候选边界

官方 Node 22.23.3、已有 Ajv 8.20.0，四例 × 两种 allErrors 设置：8 次完整校验全与官方期望相符。另跑 24 次独立分支、8 次独立 anyOf、8 次根 properties 校验，输入未变。案例 2/4 的主 errors 只有 `unevaluatedProperties`，额外检查才给出 `const` 或 `required` 原因。

覆盖集合是固定四例的受限推导，不是 Ajv annotation 导出；独立分支检查也不是引擎执行轨迹。当前只支持这组固定 schema，不尝试通用求值图、递归引用或新 parser。

保留为内容候选：原生图、步骤聚焦、四例表和完整原文包装都使用 Archify 现有能力，零产品运行时代码改动。原文包装含同一主结论、完整数据和记录，未被伪称为 Ajv 官方 UI。未做真实读者试验，不能声称阅读提效。

## 已交付

- 独立分支 [`codex/lab-schema-annotations`](https://github.com/tt-a1i/archify/tree/codex/lab-schema-annotations)，本地 / 远程 readback 均为 `7eed924b945554e18e30344cfa1454032925d80a`；工作区干净。
- [固定版本的说明、输入、复现脚本与证据](https://github.com/tt-a1i/archify/tree/7eed924b945554e18e30344cfa1454032925d80a/experiments/schema-annotations)。基线 `847146aeb93b492592adb78dc220f57e4a8b4636`。
- [真实桌面图](https://github.com/tt-a1i/archify/blob/7eed924b945554e18e30344cfa1454032925d80a/experiments/schema-annotations/evidence/final-light.png)、[真实原生入口](https://github.com/tt-a1i/archify/blob/7eed924b945554e18e30344cfa1454032925d80a/experiments/schema-annotations/evidence/final-native-modal.png)、深色、窄屏、步骤首尾和原文视图共 14 张 PNG 已逐张查看。
- Explainer 三项静态门禁通过、0 diagnostics，其 finalize 未运行 browser-check；独立原生图四项门禁全部通过，含 Chrome browser-check。Ego 实际操作验证五步、结束、原生入口、主题和 checkbox。
- 1440×900 桌面无页面级横向溢出；390×844 正文不溢出，表格局部滚动。窄屏图预览字小，原生图初始裁切右侧，缩小到 25% 后文字更小；保留原始截图，不计为完整移动端验收。步骤截图实际 1291×762，未冒充桌面对照尺寸。
- 首稿与第二稿均留档；最终修订使用现有 JSON 合同恢复七个节点来源映射，收紧几何，并把默认“后端”图例改为“解释项”。七节点及六关系的身份与文字保留。
- 68 个 manifest 文件哈希复核通过；59 条原始生成 HTML / 浏览器日志 whitespace 提示完整记录，作者输入、脚本及说明的 scoped 检查通过。

新工作区第一次默认 Node 26.12.0 的观察也保留；最终用官方 Node 22 重跑，两个版本的 runs 数组一致。复用已有同锁依赖，提交前移除临时链接，没有安装。未执行完整产品库存、跨平台 CI、全浏览器或视频导出，没有重建未改动的 ZIP / 图库。

## 另一条初步线索

[Bloaty 固定文档](https://github.com/google/bloaty/blob/f1a83e63f36beb628dcf022e1201a2eb391a22a6/doc/how-bloaty-works.md) 的 file space / VM space / `.bss` 区分值得继续核对。当前只读了文档，尚未执行原生工具、完成价值筛选或实现实验；不能记为验证通过或淘汰。已有 Twiggy retained-size 方向仍需避免重复。

本批有独立远程内容实验和真实证据，属于实质推进。没有创建 PR、合并、发布、部署或安装。后续只有真实阅读任务证明价值后，才考虑模板复用；持续目标保持进行中。
