# nbdime cell identity：固定 UI 样例显示折叠边界，暂缓实验

2026-10-28，只读。**结论 defer。** 上游 UI fixture 有两份完整 notebook 和其提交的原生截图：两份首 cell 内容相同但 `id` 不同，截图首屏称一个 cell 未改变并折叠。它给出一个可追查的身份阅读问题；但截图不是完整 diff 结果，没展开折叠项，也未运行 nbdime，不能断言它忽略了 ID、对齐算法选择了什么或原生界面无法显示该差别。还没有真实用户误读、完整 native 交互或复跑的对照，暂不派新实验。

## 排重

历史 [notebook-reading-round10](https://github.com/tt-a1i/archify/blob/60342aa9e40618aeb7c33bdb8d65889fea3a588e/docs/research/2026-10-25/scouts/notebook-reading-round10.md) 与 [notebook-occurrences@2090b0ff](https://github.com/tt-a1i/archify/tree/2090b0ff144b7bc3425d52821655f659858f5d6a/experiments/notebook-occurrences) 已使用 nbdime base/local/完整 diff：六个 occurrence 分别展示 source 与保存 output，其中两份无 cell ID，也无移动；不能将本次重新描述为一项新的输出快照实验。[notebook-evidence](https://github.com/tt-a1i/archify/blob/60342aa9e40618aeb7c33bdb8d65889fea3a588e/docs/research/2026-10-25/scouts/notebook-evidence-smalltools.md) 已说明内容 hash 不是稳定身份；当前 [reactive-reading](https://github.com/tt-a1i/archify/blob/codex/research-lab-20261026/docs/research/2026-10-26/scouts/reactive-reading.md) 区分 dependency-map 的静态生产者/消费者和 state-contract 的声明/观察。此前浏览器 gate 不完整，不能以截图替代原生对照或用户收益。

## 固定的上游样例与原生预期

[jupyter/nbdime@744c97897e2c33a1b3f04f5834ee6e70478219a2](https://github.com/jupyter/nbdime/tree/744c97897e2c33a1b3f04f5834ee6e70478219a2)，2026-06-10 默认分支快照；[BSD-3-Clause LICENSE](https://github.com/jupyter/nbdime/blob/744c97897e2c33a1b3f04f5834ee6e70478219a2/LICENSE.md)。完整 [center.ipynb](https://github.com/jupyter/nbdime/blob/744c97897e2c33a1b3f04f5834ee6e70478219a2/ui-tests/data/diff_test1/center.ipynb) SHA-256 `a7ac52c4a8bbb6b39ce461a546faac8d7ea6809c2fa7c9f0228df9c236c3101a`，完整 [left.ipynb](https://github.com/jupyter/nbdime/blob/744c97897e2c33a1b3f04f5834ee6e70478219a2/ui-tests/data/diff_test1/left.ipynb) SHA-256 `f35ad091c31792bf531f1a5faceeb24b90c6705f94d018f39d5fa1a57ee204af`。二者 notebook format 4.5；前者仅一个 code cell，后者三个。首 cell 同 source、空 outputs、null execution_count 和空 metadata，但 center ID `eabfe4e0-d646-4d09-95a4-09ee3d030db6`、left ID `2d47bfe2-d91d-4f72-9426-1885c4edb5a9`。left 另有注释 cell `b5b285e4` 与空 cell `e3ab7a01`。这不证明首 cell 是同一个历史对象、移动、拆分或执行结果过期。

上游完整 [Playwright test](https://github.com/jupyter/nbdime/blob/744c97897e2c33a1b3f04f5834ee6e70478219a2/ui-tests/tests/nbdime-diff-test1.spec.ts) 把 left 填 remote、center 填 base，点击 Diff files 并断言截图；其提交的 [Linux expected PNG](https://github.com/jupyter/nbdime/blob/744c97897e2c33a1b3f04f5834ee6e70478219a2/ui-tests/tests/nbdime-diff-test1.spec.ts-snapshots/diff-test1-take-a-snapshot-at-opening-1-linux.png)，SHA-256 `b3a5a92cebc66ba413ab937202c359dfeb22f2840761a368d51e84791a6c03d5`，本轮实际读取：顶部显示 `1 unchanged cell(s) hidden`，下方绿色列显示注释和空 cell 及其 ID。截图是上游 UI 基线、不是本轮运行；没有展示折叠部分展开后的详情，也非完整机器 diff oracle。仅凭截图不能声称 ID 差异被永久隐藏、视图有缺陷或可复现某项版本的算法结果。

[固定 notebooks.py](https://github.com/jupyter/nbdime/blob/744c97897e2c33a1b3f04f5834ee6e70478219a2/nbdime/diffing/notebooks.py#L294-L384) 将相等 ID 作为一个 predicate，但另有 source/type、output 的 strict/moderate/approximate predicate；[规则](https://github.com/jupyter/nbdime/blob/744c97897e2c33a1b3f04f5834ee6e70478219a2/nbdime/diffing/notebooks.py#L521-L556) 明示多级 sequence 对齐，ID 字段 atomic。该源码机制不足以无需运行就断言这对 fixture 最终的 diff 或 UI 折叠理由。上游 [#448](https://github.com/jupyter/nbdime/issues/448) 与 [#553](https://github.com/jupyter/nbdime/issues/553) 是 ID 支持背景，均已关闭，不据此推断当前用户问题仍开放。

## 原生强基线与待验证问题

[nbdime 官方文档](https://nbdime.readthedocs.io/en/stable/) 说明 web diff 会渲染 notebook 结构与图像输出；[changelog](https://nbdime.readthedocs.io/en/latest/changelog.html) 描述新增/删除 cell、output 的并排视图及小屏布局。因此不拿原始 JSON 文本或一张未展开的截图冒充完整基线。先固定环境及配置，保存这两份输入的完整 machine diff、完整 web UI 及展开未改变 cell 后的截图，核 ID 是否展示和输出；再测试可核对的 move/split 同 ID 与无 ID 的真实或上游期待 pair，不能把 source 相同当 identity 真值。必须给作者观察任务和相同信息，比较 native 是否已能正确回答，才能评估已有 Explainer 带来源表是否有增量。

目前没有同一个样例的完整 expected machine diff、已展开截图、移动/拆分的上游期待或自然用户交接需求，不能证明新页面有价值。固定内容投影成本有限，但若扩为 matcher/importer，要维护 ID 有无、重复、顺序变化、多级相似度及输出关联，并承担跨版本误配风险；应留在已有实验外。没有安装、执行 nbdime/kernel、浏览器复验、合并或远程写入。


## 后续源码核对

[定向跟进](notebook-identity-source-followup.md)补足本报告初步缺口：前端unchanged判断确实不检查cellId，且CSS隐藏unchanged cell的ID；默认不忽略identifier的后端则可保留ID replace。这是固定源码的条件推导，不是原截图当次完整响应。两层差异不能混同为“算法丢了ID”。root检查现有系统Python3.15与桌面捆绑Python3.12，均无nbdime/nbformat/traitlets等所需模块；没有安装或伪装完整原生运行。待评估的价值限于真实审查者是否需要ID差异，现阶段未选择新实现。
