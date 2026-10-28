# 恢复研究：让删除块与另一处新增块互相可达

2026-10-26。只读调研三个固定 revision，未按 stars 筛选，未运行上游、测试或浏览器。**保留一个可复用能力实验：在现有 Explainer `@diff` 中，为跨文件/跨 hunk 的明确文本匹配块提供双向行跳转。** 不另做单一 fixture 解释页，不引 AST 引擎、Go/Python 运行时或 PR 工作流。它回答的具体问题是：“这里删除的几行，在这份 diff 的哪一处以相同文本出现？点击后还能回到原处吗？”标签应描述文本匹配，不能自动断言真实搬移、重构或行为保持。

## 现有能力与排重

已读 [50 项实验索引](../../2026-10-25/README.md)，核对全部 scouts 的项目名及 diff/move 线索，并复读 [Round18](../../2026-10-25/scouts/round18-structural-diff-reading.md)、[Round24](../../2026-10-25/scouts/round24-change-reading.md)和[本日 task-view/PR Lens 增量](named-project-refresh.md)。Difftastic、diffsitter、astdiff、diffmantic、Graphtage 的匹配/过滤/动作区分已讨论，不再重新计作新发现。下述三仓未在本地 scouts 的名称检索中命中；这是本地排重结果，不是领域穷尽。

本次工作区 HEAD 是 `60342aa9e40618aeb7c33bdb8d65889fea3a588e`；这是研究 checkout 身份，不称最新 dev。直接读了该 revision 的 [diff parser](https://github.com/tt-a1i/archify/blob/60342aa9e40618aeb7c33bdb8d65889fea3a588e/archify/explainer/diff.mjs)、[render 分支 L80–84](https://github.com/tt-a1i/archify/blob/60342aa9e40618aeb7c33bdb8d65889fea3a588e/archify/explainer/render.mjs#L80-L84)及[现有测试](https://github.com/tt-a1i/archify/blob/60342aa9e40618aeb7c33bdb8d65889fea3a588e/test/explainer-diff.test.mjs)：parser 已接受多文件 unified diff，保留 raw/ending、oldLine/newLine、文件路径和 hunk；renderer 逐行输出表格，尚没有对应块间的链接。这是源码观察，未声称本轮运行验证。

| 现有实验 | 已解决的问题 | 本轮新增问题 |
| --- | --- | --- |
| Diff line numbers | 行号完整、长代码可横滚 | 行号已知，另一端在哪里仍需人找 |
| Task review map、PRLens/task-view | 声明与 hunk 范围覆盖 | 不从任务声明生成对应块，也不另加 review 状态 |
| Delta values、Payload delta | 已有两侧值及身份/缺失合同 | 不根据图 ID 或 JSON 值猜代码行身份 |
| Patch outcome | 应用成功与最终目标文本相等分离 | 本轮不应用 patch，不给执行结果 |
| Line notes、Source question tour | 作者行注释与问题组织 | 本轮的链接直接来自这份 diff 的文本对应，不要求作者逐行标注 |

## 来源 A：second-look 的短小文本块机制

固定 [KyleKing/second-look@b0f604f4a740dc3098fca2ec9d508bd16af7b761](https://github.com/KyleKing/second-look/tree/b0f604f4a740dc3098fca2ec9d508bd16af7b761)。项目整体有 PR 审阅/TUI/Agent 等更大范围，本轮只研究其独立的 126 行 [internal/diff/moved.go](https://github.com/KyleKing/second-look/blob/b0f604f4a740dc3098fca2ec9d508bd16af7b761/internal/diff/moved.go)。实际 [LICENSE](https://github.com/KyleKing/second-look/blob/b0f604f4a740dc3098fca2ec9d508bd16af7b761/LICENSE) 是 MIT，Copyright 2026 Kyle King。

实现链是：以去首尾空白的删除行文本建候选索引 → 遍历新增行 → 寻找未占用的最长连续匹配 → 排除同文件同 hunk → 至少三条 meaningful 行 → 每行记录另一侧 Path/Line，并在首行记录 First/Lines（[L21–119](https://github.com/KyleKing/second-look/blob/b0f604f4a740dc3098fca2ec9d508bd16af7b761/internal/diff/moved.go#L21-L119)）。meaningful 的下限来自 [words.go L158–171](https://github.com/KyleKing/second-look/blob/b0f604f4a740dc3098fca2ec9d508bd16af7b761/internal/diff/words.go#L158-L171)，是 trim 后至少四字节；不能改写成三条 AST statement、三个 token 或任意 Unicode 字符规则。`TrimSpace` 还忽略尾空白，不仅是缩进。

它有真实 consumer：[words.go L43–75](https://github.com/KyleKing/second-look/blob/b0f604f4a740dc3098fca2ec9d508bd16af7b761/internal/diff/words.go#L43-L75)调用 `Moved()`，从原位置的词级配对中排除已有远端对应的行，避免把搬走的 helper 与旁边新加的另一个 helper 按位置强行比较。**这是当前源码的调用关系，不是此次运行的 TUI 效果证据。**

### 完整小 fixture：两个文件、一个四行对应块

以下是上游 [moved_test.go L10–33](https://github.com/KyleKing/second-look/blob/b0f604f4a740dc3098fca2ec9d508bd16af7b761/internal/diff/moved_test.go#L10-L33) 的完整 `movedPatch` 原始字符串内容（含最后 LF）；它是测试 literal，不是独立已提交 `.patch` 文件。原作者 Kyle King，MIT；这里保留固定来源和许可链接，不伪造 Git 原文件全文。

```diff
diff --git a/app.py b/app.py
--- a/app.py
+++ b/app.py
@@ -10,7 +10,2 @@
 x = 1
-def helper(x):
-    total = x * 2
-    total += 1
-    return total
-
 y = 2
diff --git a/util.py b/util.py
--- a/util.py
+++ b/util.py
@@ -1,1 +1,8 @@
 import os
+class Util:
+    def helper(x):
+        total = x * 2
+        total += 1
+        return total
+
+    def other(y):
```

同一完整[测试 L35–96](https://github.com/KyleKing/second-look/blob/b0f604f4a740dc3098fca2ec9d508bd16af7b761/internal/diff/moved_test.go#L35-L96)断言：`util.py` 新行 3 对应 `app.py` 原行 11，First=true、Lines=4；`app.py` 原行 13 对应 `util.py` 新行 5；新 class 行不算搬移。第二测试在原文件旁加入另一条 `def helper(y)`，断言 `Refine()` 不给这些行错误的词级位置配对。第三测试把同一 hunk 的三行仅重缩进，断言没有 move。**这些都是提交的 expected，未在本轮运行。**

fixture 展示的是删除与新增中的文本对应，不提供完整 app.py/util.py，不证明代码可编译；类内 helper 的语义、静态方法约定等也不由这个 differ 验证。原实现遇到重复候选会取遍历中首先达到最长长度者，并消耗删除端；这不能当作开发者确认的历史身份或 copy 检测。候选实验应把重复候选列为明确负控制，而不是复制该策略后宣称真实来源已确定。

## 来源 B：BDiff 的 block 与内部 update 可以同时存在

固定 [BDiff/BDiff@2ddf42d554ae3aea6a6ccf5a56b4df192fd79eda](https://github.com/BDiff/BDiff/tree/2ddf42d554ae3aea6a6ccf5a56b4df192fd79eda)。这是本轮发现的小型专用代码差分项目；没有用热度、README 截图或 benchmark 文案作为效果依据。

完整小输入是 [3-copy-before.xml](https://github.com/BDiff/BDiff/blob/2ddf42d554ae3aea6a6ccf5a56b4df192fd79eda/tests/st/diff-cases/left_files/3-copy-before.xml) 1046B 与 [3-copy-after.xml](https://github.com/BDiff/BDiff/blob/2ddf42d554ae3aea6a6ccf5a56b4df192fd79eda/tests/st/diff-cases/right_files/3-copy-after.xml) 1197B。原文中 `root` item 保留，新侧增加 `autoroot` item。[edit_scripts 条目 3](https://github.com/BDiff/BDiff/blob/2ddf42d554ae3aea6a6ccf5a56b4df192fd79eda/tests/st/diff-cases/edit_scripts#L4)提交的 expected 把原行 13 起五行到新行 18 起五行标为 copy，并列出 14→19、15→20、16→21 三项 `c_update`。这比“复制块全都没变”更细；也是为何当前候选不应假装覆盖复制后编辑。

实际消费链：[test_bdiff.py L7–16](https://github.com/BDiff/BDiff/blob/2ddf42d554ae3aea6a6ccf5a56b4df192fd79eda/tests/st/test_bdiff.py#L7-L16)排序左右文件，读已提交脚本，对每对文件调用 `bdiff.bdiff`，比较整个 list；脚本按位置配对，不能假称每条包含显式文件身份。算法 [bdiff.py L1367–1477](https://github.com/BDiff/BDiff/blob/2ddf42d554ae3aea6a6ccf5a56b4df192fd79eda/bdiff/bdiff.py#L1367-L1477)把 block 匹配导出为 move/copy 与嵌套 updates 的伴随行记录；[前端 content-lines L20–108](https://github.com/BDiff/BDiff/blob/2ddf42d554ae3aea6a6ccf5a56b4df192fd79eda/front-end/src/utils/diff/content-lines.ts#L20-L108)同时把 block/单行 action ID 写入两侧对应行。**静态源码证明有这条消费路径，不能证明 UI 在本轮跑通或连线清晰。**

实际 [LICENSE](https://github.com/BDiff/BDiff/blob/2ddf42d554ae3aea6a6ccf5a56b4df192fd79eda/LICENSE) 是 **Mulan Public License v2（木兰公共许可证）**，不是 MulanPSL，也不是 MIT。`bdiff/__main__.py` 的版权头同样标 Mulan PubL v2。当前不复制实现/前端或 fixture 到 Archify，不把项目整套当轻量 permissive 依赖。这里只保留原始链接与原创分析。它的多阶段 block/line matching、Python/git 消费链、复制和 split/merge 合同明显大于一个行跳转实验；本轮不提第二个 adapter。

## 来源 C：GumTree 的 mapping 与 edit action 是两个输入层

固定 [GumTreeDiff/gumtree@6e9a863940d6805aa9455b97f404b43390e8079e](https://github.com/GumTreeDiff/gumtree/tree/6e9a863940d6805aa9455b97f404b43390e8079e)。完整 [action_v0.xml](https://github.com/GumTreeDiff/gumtree/blob/6e9a863940d6805aa9455b97f404b43390e8079e/core/src/test/resources/action_v0.xml) 1188B 与 [action_v1.xml](https://github.com/GumTreeDiff/gumtree/blob/6e9a863940d6805aa9455b97f404b43390e8079e/core/src/test/resources/action_v1.xml) 1278B 是抽象 tree fixture，没有源文件位置，不包装成 Java 代码移动实例。

关键证据是 [TestActionGenerator L41–114](https://github.com/GumTreeDiff/gumtree/blob/6e9a863940d6805aa9455b97f404b43390e8079e/core/src/test/java/com/github/gumtreediff/test/TestActionGenerator.java#L41-L114)：测试**手工添加** src/dst mapping，然后调用 SimplifiedChawathe，expected 共九个 actions，含 Move(e→h)、Update(f→y)、Move(k→v)。它没有在这里验证自动 matcher；也不能仅拿两棵树相同标签推论对应身份。另 L99–103 对第二个 move 的 position 断言仍读取第一个 `m`，不能引用为 `m2` 的位置已独立断言。

[ChawatheScriptGenerator L55–139](https://github.com/GumTreeDiff/gumtree/blob/6e9a863940d6805aa9455b97f404b43390e8079e/core/src/main/java/com/github/gumtreediff/actions/ChawatheScriptGenerator.java#L55-L139)直接消费 MappingStore，标签不同产生 Update、映射后父节点不同产生 Move。这支持一个具体取舍：**Archify 的文本匹配导航应该暴露其文本合同，不把它升级为语法实体 mapping，再升级为动作/行为结论。** 本轮不推荐导入树匹配、Java 生成器或新图类型。根 [LICENSE](https://github.com/GumTreeDiff/gumtree/blob/6e9a863940d6805aa9455b97f404b43390e8079e/LICENSE) 为 LGPLv3，源码/fixture 头另明示 v3-or-later；本轮只链接，不移植。

## 唯一实验建议：在现有 diff 行上跳到匹配块

**用户任务：** 阅读一份跨文件 helper 调整的 diff，直接从删除块跳到新增块，再返回原行，判断周围 class/new helper 是否属于同一个文本块。它有实际可复用输入：现有 `@diff` 已接收的完整 two-way unified diff；无需新增上游专用文件格式、后台服务或语义 diff parser。

**最小实现形状：** 在已有 parser 结果上附加一个纯派生的连续文本匹配阶段；只给跨 hunk 的 removed↔added 连续块附双向链接，原始 raw/ending、计数、行顺序和行号继续由当前 parser 拥有。沿用 second-look 的“至少三条 meaningful 行、至少四字节、去首尾空白”作为可见合同的初始对照，不把这个阈值说成普适正确。只接受两端唯一的候选，重复文本不自动选某一来源；碎片输入无真实行号时保留原表，不能制造行号。界面在块首提供“匹配文本 → util.py:3–6 / 返回 app.py:11–14”，目标行可被键盘定位；不折叠原文、不画跨整个页面的连线。文案“忽略首尾空白的文本匹配”比“已移动代码”更准确。

**固定输入与对照：**

1. 同一完整 `movedPatch`，当前 renderer 对照候选 renderer；候选必须定位 util.py 新 3–6 ↔ app.py 原 11–14，class/new helper 留为原始新增；不能从 fixture 省掉未匹配行。
2. 上游同 hunk 重缩进、旁边加入 helper(y) 的完整控制输入；保留原表及 source refs，禁止按相邻位置连错。
3. 原创重复块控制和只一两条 meaningful 行的控制：不产生确定的来源链接。这是验证新增受限合同，不宣称上游已经支持唯一性。
4. BDiff 的完整 XML copy/update pair作为范围讨论的真实对照，不运行/移植它；不能为了覆盖这例扩成 copy detector。后续若需要产品内回归，应写原创同形输入，避免不必要的 fixture 分发许可范围。

**增量价值：** 当前表格能读每一行，新增能力让读者在两个已经存在的精确位置之间来回走；相较再写一页语义 diff 介绍，它改变重复阅读任务的操作。仍未获得用户效率数据，不宣称一定节时，也不以“没有生产事故”否定它作为实验的资格。

**维护成本与边界：** 一段派生匹配、稳定的产物内锚点、块首链接与焦点/返回行为；不增加 schema、网络依赖或语言 parser。真实成本包括重复文本歧义、文件重复路径/多 hunk 定位、长 diff 的候选比较，以及 renderer/generated HTML 的同步；需在实验分支实际测出改动面，不在报告预报确定行数。借鉴或改写 MIT 实现/测试时保留 Kyle King 的版权和许可；不混入 BDiff/GumTree 实现。

**验证应直接服务读者任务：** 固定输入 base/candidate 真产物与截图、点击/键盘跳到对端及返回、文件身份/行号准确、原字节/计数不变；失败控制不出现虚假链接。选择 diff/parser 与 Explainer/browser 相关覆盖，按共享 renderer 责任核 generated 输出；未在本轮执行这些检查。静态源码和上游断言不能代替这些收据。

**停止条件：** 如果链接身份必须猜完整仓库内容、fixture 以外无现有 unified 输入可用、重复块无法在受限规则下保持明确、或要扩大为 AST/copy/rename/merge 服务才能有用，停止；如果真实 base/candidate 操作仅是多一层导航且不能让读者准确到达另一端，也停止，不为第 51 项强加能力。若开销明显随重复文本膨胀，应先缩小有证据的支持范围再评审，不悄悄加入复杂索引框架。

## 固定原件指纹与执行边界

只读 GitHub API 树及固定 raw 文件，在内存计算 SHA-256；没有把上游 checkout 写入仓库。完整原件指纹便于未来复取核对；不是本轮上游运行或测试通过证明。

| 来源文件 | bytes | SHA-256 |
| --- | ---: | --- |
| second-look `LICENSE` | 1066 | `ccc5da2887126ec7e3001e7631c18c21b251b0c7f0c0b195d961b59b5f504724` |
| second-look `internal/diff/moved.go` | 3281 | `d3fd5e6ab9402d17e8b5547405acb222b47c2906be2559d4846245ed1f16ea4a` |
| second-look `internal/diff/moved_test.go` | 2465 | `f5d6365d001a1fa4a99abe206f6e5bf21d9d29fa357d65e1ad3a06370415aa85` |
| second-look `internal/diff/words.go` | 8376 | `d5e93db0c94ca85f85ec3f66c116145c13f2281a5d49cd20900942c8042655c6` |
| BDiff `LICENSE` | 16554 | `c866ddb99dc7595605146e3bf4be5ee905cd6e56dd9c577df997ff0d7f6cc4d9` |
| BDiff `3-copy-before.xml` | 1046 | `d8985c5d2e027bba81aa1e470fe26eb0c2c0d45f25104c3a8fd978ec4b8427db` |
| BDiff `3-copy-after.xml` | 1197 | `33be7dab5a2e7046f7ad0cd246d0d91a82bec0bd9049b61fac9a81d3612660db` |
| BDiff `edit_scripts` | 6307 | `88b713e767d0074f7dbc78060214e6eb6197e8a52a126f84522e33fe4bd96e6a` |
| BDiff `test_bdiff.py` | 725 | `d2bb77aac1ae93cd6a2146f0a15d6c6c159208e3b56fdb4daf9ef782437b8ceb` |
| GumTree `LICENSE` | 7632 | `f97bc4bb9b7ae8a653941073678b5c7775e8de44a01c3bcc21e7cdc148b90e61` |
| GumTree `action_v0.xml` | 1188 | `aa58ef5cf2feec578d25e520ea0ac77118b5fd4563d61a999f0ff9e666da76f9` |
| GumTree `action_v1.xml` | 1278 | `0f8cfcf5746375929de5b129ff85238fc3e43970529618e767b84eacc04a376b` |
| GumTree `TestActionGenerator.java` | 8703 | `d12984f359dcb1b0b0a58b5dff0d743b747ceb5d5a2183fc522df703e6450853` |

本轮唯一写入是本文件；没有实现、上游运行、安装、浏览器、分支、commit、push 或评论。没有自动匹配正确性、编译、性能、语义等价或真实使用收益结论。按 CONTRIBUTING 的文字/研究影响范围核内容、来源与一致性，不因报告触发 renderer 测试。

### second-look fixture 许可通知

上述完整测试 literal 沿用以下上游 MIT 通知（原文完整保留）：

```text
MIT License

Copyright (c) 2026 Kyle King

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
