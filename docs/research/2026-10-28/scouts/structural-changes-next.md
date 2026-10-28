# 结构变更记录：两个来源指向同一目标，不能缩成一次文本配对

2026-10-28，只读研究。**建议最多一个离线实验：消费明确提供的 RefactoringMiner JSON，把每条结构变更声明和两侧位置投影成原生 Explainer 表格/图。** 不运行检测器、不构建 AST 引擎、不自动判重命名、不做新的源码卡或 PR 平台。价值是保留结构记录的角色、版本和多对一关系，不是宣称代码行为等价。尚无实施、浏览器比较或效率实测。

已按 research Skill 阅读一手材料，读取六个项目固定 SHA 的根许可全文；前两个深入生产/消费链，后四个明确作为旧来源复核，不计新发现。未执行、安装上游，未写产品、commit/push、发评论或复制无许可 toy Java；持久变更仅本文。上游 expected、静态源码推导与本轮运行回执严格区分。

## 当前范围和排重

完整核对54项 gallery selection 的标题/价值、最新 [patch-navigation](patch-navigation.md)、[source-navigation-next](source-navigation-next.md)、[reading-state](reading-state.md)，以及 [round18结构diff](../../2026-10-25/scouts/round18-structural-diff-reading.md)。diff-matches 是同一 diff 内字面文本往返；diff-file-navigation 是文件段落定位；Hintful stages 是作者声明的中间文本；Patch outcome 是片段应用状态；Task review map 是阅读声明到hunk的映射。它们没有导入下文的四条 refactoring records，也不承诺两个同文方法归并到同一个声明的位置关系。

固定产品基线 [dev `6ca6a5c84439b57ea22e0630fe306e1d91587a6e`](https://github.com/tt-a1i/archify/tree/6ca6a5c84439b57ea22e0630fe306e1d91587a6e)。直接读取该 revision 的 [diff.mjs](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/archify/explainer/diff.mjs)：解析两向文本/hunk、行号与文件metadata，不计算符号对应；Git文件 rename header 也不等于方法 rename。[sources.mjs L205–260](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/archify/explainer/sources.mjs#L205-L260)要求同一文档所有 repository code sources 绑定文档固定 revision，不能给一页前后两版源码各填一个revision而称验证通过。

当次 GitHub CLI/API 有界核查：

- [#1015](https://github.com/tt-a1i/archify/pull/1015) OPEN、head `fe4f80d2195e0a7b49b7cfe6d3dba7ffd31a7ac8`，code focus/展开/复制，不生产或导入结构变更记录。
- [#1049](https://github.com/tt-a1i/archify/pull/1049) OPEN、head `7184b99b01768349840f93b4de83ff206d202c33`，读取两个 Git refs 已提交 Architecture snapshots；body明确不推断源码rename。
- [#1103](https://github.com/tt-a1i/archify/pull/1103) OPEN、head `f0be206acbc90eb7c6c6b636030e3eb28963d284`，Code Analysis Atlas 是一次分析的文件/函数/依赖投影，与 Classic evidence往返；本轮不加第二个overview或索引器。
- [#1132](https://github.com/tt-a1i/archify/issues/1132) / [#1141](https://github.com/tt-a1i/archify/pull/1141) OPEN，后者head `30196a0be2aae32c6dc032e6b55e9cc0b8bab263`，验证关系的固定源码证据，不保证关系语义、不跨revision检测结构变化。
- [#1143](https://github.com/tt-a1i/archify/pull/1143) OPEN、head `4148c8d39b738ff38aa9e3d56dfef12b40b39bbd`，比较 authored Workflow稳定ID，不是代码符号变化。
- 全状态标题搜索 `refactoring in:title`、`"structural diff" in:title`均0；`rename in:title`仅#432（跨文件系统rename修复）；open `source in:title`9条中上述关系证据、GHE/Codeberg/Gitea source links最相关。另读open关键词搜索前50项。**这是当前有界排重，不是全历史不存在相似工作的证明。**

## 六个固定来源

| 项目 / 固定 revision | 本次材料与结论 | 完整许可 |
| --- | --- | --- |
| [tsantalis/RefactoringMiner `de0a67f9f690914e6c1ac1ed1b2a850c4ff6068d`](https://github.com/tsantalis/RefactoringMiner/tree/de0a67f9f690914e6c1ac1ed1b2a850c4ff6068d) | 新深读。命名实体类型、两侧声明位置、codeElement及commit envelope；不是仅文字配对。完整JSON有两来源合入同一目标的可核对输入。 | [MIT](https://github.com/tsantalis/RefactoringMiner/blob/de0a67f9f690914e6c1ac1ed1b2a850c4ff6068d/LICENSE)，1075B；SHA256 `448e37db6cdb74dfcd65e44cb3fa07f74a8c96428104624b7666a5a16f6b6765` |
| [GumTreeDiff/gumtree `6e9a863940d6805aa9455b97f404b43390e8079e`](https://github.com/GumTreeDiff/gumtree/tree/6e9a863940d6805aa9455b97f404b43390e8079e) | 新深读。tree mappings→edit actions→JSON，move依赖匹配与树位置，不等于已验证的命名方法移动。完整move test显式提供mapping。 | [LGPL-3.0正文](https://github.com/GumTreeDiff/gumtree/blob/6e9a863940d6805aa9455b97f404b43390e8079e/LICENSE)，源码允许or-later；7632B，`f97bc4bb9b7ae8a653941073678b5c7775e8de44a01c3bcc21e7cdc148b90e61`。只观察，不复制实现/fixture。 |
| [Wilfred/difftastic `0b92338c6042152b1fc91c30ed01cf0449070844`](https://github.com/Wilfred/difftastic/tree/0b92338c6042152b1fc91c30ed01cf0449070844) | README复核；语法差异及上下文，未知扩展回退文本；旧来源同SHA，不当新发现，不引其parser。 | [MIT](https://github.com/Wilfred/difftastic/blob/0b92338c6042152b1fc91c30ed01cf0449070844/LICENSE)，1076B，`76f1045e65caa521762a76bbddcc24b6e6ec2251a097d0b3975ca35de47f11e2` |
| [afnanenayet/diffsitter `a5a6681b0f50d1114f81aa8f3bbf61858b08e945`](https://github.com/afnanenayet/diffsitter/tree/a5a6681b0f50d1114f81aa8f3bbf61858b08e945) | 重读diff与JSON renderer；输出DisplayData，不能从“JSON可读”升级为命名实体重构合同。旧round18同SHA，无新推荐。 | [MIT](https://github.com/afnanenayet/diffsitter/blob/a5a6681b0f50d1114f81aa8f3bbf61858b08e945/LICENSE)，1052B，`0ee7ab7ce0ffdc23bbca9d7a7108440beb3cf4584a16d5c890c1833223e6f6a5` |
| [gtindo/task-view `a3fa21767bfaeb3077fdda08bddb7249366caa93`](https://github.com/gtindo/task-view/tree/a3fa21767bfaeb3077fdda08bddb7249366caa93) | 当前HEAD等于reading-state已报告版本；README只复核范围，无fresh delta，不重复已读/flow scope报告。 | [MIT](https://github.com/gtindo/task-view/blob/a3fa21767bfaeb3077fdda08bddb7249366caa93/LICENSE)，1075B，`1e9de46e2feb8e0b134d0f5eef807be1971e22c3c004ccf29e1b6131e55f916e` |
| [coldteadotai/pr-lens `918ffe82cb1dd71d20ce70b27917aeb80a7a4b49`](https://github.com/coldteadotai/pr-lens/tree/918ffe82cb1dd71d20ce70b27917aeb80a7a4b49) | 当前HEAD等于reading-state已报告版本；README复核无fresh delta，不重复该报告的数据模型/省略行分析。 | [MIT](https://github.com/coldteadotai/pr-lens/blob/918ffe82cb1dd71d20ce70b27917aeb80a7a4b49/LICENSE)，1067B，`f95e90af396c71c9a94648bd58e4f5bb2dcab4f6ac3ab7d3d2ca3f4e4f4a1ae7` |

没有按stars排序。许可结论来自完整正文，不是API标签；依赖和第三方源码许可不能由根MIT包办。

## 深读链一：检测器声明→带角色的位置→commit JSON

[GitHistoryRefactoringMinerImpl L190–227](https://github.com/tsantalis/RefactoringMiner/blob/de0a67f9f690914e6c1ac1ed1b2a850c4ff6068d/src/main/java/org/refactoringminer/rm1/GitHistoryRefactoringMinerImpl.java#L190-L227)对当前commit和其first parent读取发生变化的两侧文件，建两个模型并取model diff。显式merge-parent参数另有路径；不能只知道child SHA就把任意merge parent说成其before。此处是源码观察，不是运行结果。

[UMLModelDiff#createRefactoring L7962–8020](https://github.com/tsantalis/RefactoringMiner/blob/de0a67f9f690914e6c1ac1ed1b2a850c4ff6068d/src/main/java/gr/uom/java/xmi/diff/UMLModelDiff.java#L7962-L8020)依据body mapper、继承方向、compatible/moved signature等条件选择Pull Up、Push Down、Move或Move and Rename；不是发现同一段文字就直接赋move。[MoveOperationRefactoring](https://github.com/tsantalis/RefactoringMiner/blob/de0a67f9f690914e6c1ac1ed1b2a850c4ff6068d/src/main/java/gr/uom/java/xmi/diff/MoveOperationRefactoring.java#L54-L67)根据两侧方法名区分Move与Move and Rename；[left/right L132–146](https://github.com/tsantalis/RefactoringMiner/blob/de0a67f9f690914e6c1ac1ed1b2a850c4ff6068d/src/main/java/gr/uom/java/xmi/diff/MoveOperationRefactoring.java#L132-L146)保留原/目标完整声明范围与签名，[PullUpOperationRefactoring](https://github.com/tsantalis/RefactoringMiner/blob/de0a67f9f690914e6c1ac1ed1b2a850c4ff6068d/src/main/java/gr/uom/java/xmi/diff/PullUpOperationRefactoring.java)把right角色改成pulled up method declaration。这些是producer推断分类，仍非人工确认或行为保持证明。

消费链：[Refactoring.toJSON](https://github.com/tsantalis/RefactoringMiner/blob/de0a67f9f690914e6c1ac1ed1b2a850c4ff6068d/src/main/java/org/refactoringminer/api/Refactoring.java#L119-L153)写type/description/两侧locations；[CodeRange](https://github.com/tsantalis/RefactoringMiner/blob/de0a67f9f690914e6c1ac1ed1b2a850c4ff6068d/src/main/java/gr/uom/java/xmi/diff/CodeRange.java#L91-L110)写path、line/column范围、kind、角色、codeElement；[CLI commitJSON L316–344](https://github.com/tsantalis/RefactoringMiner/blob/de0a67f9f690914e6c1ac1ed1b2a850c4ff6068d/src/main/java/org/refactoringminer/RefactoringMiner.java#L316-L344)再包repository/sha1/url/refactorings[]。因此离线consumer可以诚实展示已有声明，无须集成检测器。

### 完整fixture与独立oracle

**唯一建议输入是完整3180B的已提交JSON**：[refactoring-toy-example-commit-expected.json](https://github.com/tsantalis/RefactoringMiner/blob/de0a67f9f690914e6c1ac1ed1b2a850c4ff6068d/src/test/resources/commandline/refactoring-toy-example-commit-expected.json)；[raw固定URL](https://raw.githubusercontent.com/tsantalis/RefactoringMiner/de0a67f9f690914e6c1ac1ed1b2a850c4ff6068d/src/test/resources/commandline/refactoring-toy-example-commit-expected.json)。SHA256 `abb1a93274946a7db8bd81de10feb925a3fc5a8107788390e44766028e3a381d`。全文已读，不截掉另外两条attribute，不补写新的记录。

结构：根`commits[]`长度1；commit含repository、sha1、url、refactorings[]长度4。每条有type、description、leftSideLocations[]、rightSideLocations[]；此fixture每侧各1个location，location含filePath/startLine/endLine/startColumn/endColumn/codeElementType/description/codeElement。**它没有base SHA、parent index、producer版本/选项，也没有每条record的稳定ID。** 当前toJSON(commitURL)还可带markup；旧fixture没有该字段，不能假称它是当前HEAD刚产生的输出。

该JSON自带repository=`https://github.com/danilofes/refactoring-toy-example.git`、child=`36287f7c3b09eff78395267a3ac0d7da067863fd`。本次只读[GitHub commit API](https://api.github.com/repos/danilofes/refactoring-toy-example/commits/36287f7c3b09eff78395267a3ac0d7da067863fd)确认唯一parent=`cd61fd2a70828030ccb3cf46d8719f8b204c52ed`；这应另存fixture manifest，不能谎称report内自带。对未知报告，必须由用户提供或已保存的manifest明确base/head/parent选择；缺base只展示left角色与原range，不能拼一个看似已固定的before链接。无需网络自动补全。

| 原record序号 / type | left：parent版原声明 | right：child版目标声明 | 原location角色 |
| --- | --- | --- | --- |
| 0 / Pull Up Method | Labrador.java L7–9，C2–3；METHOD_DECLARATION；`public getAge() : int` | Dog.java L7–9，C2–3；同kind/signature | original method declaration → pulled up method declaration |
| 1 / Pull Up Method | Poodle.java L7–9，C2–3；同kind/signature | **同一个**Dog.java L7–9，C2–3 | 同上；仍独立record，不能被0吞掉 |
| 2 / Pull Up Attribute | Labrador.java L5，C14–21；FIELD_DECLARATION；`private age : int` | Dog.java L5，C14–21；同kind/element | original attribute declaration → pulled up attribute declaration |
| 3 / Pull Up Attribute | Poodle.java L5，C14–21；同kind/element | **同一个**Dog.java L5，C14–21 | 同上；仍独立record |

上表路径均带`src/org/animals/`前缀。record identity用输入commit index+record index即可；端点身份需要**侧别/确定revision+完整path+line/column范围+kind**，不能用codeElement同名就合并。图可有4个before端点、2个after端点、4条独立声明边；不是四对一对一匹配，也不是实际调用/执行方向。

独立oracle没有运行RefactoringMiner，也没有照抄JSON当检测准确性证明。本轮另读两版全部六个Java文件：

| 完整源码，URL-only，不复制 | Bytes | SHA256 |
| --- | ---: | --- |
| [parent Dog.java](https://github.com/danilofes/refactoring-toy-example/blob/cd61fd2a70828030ccb3cf46d8719f8b204c52ed/src/org/animals/Dog.java) | 263 | `d6bdb24c19a6622bb99500fd4cf1174892d9e15500d12425d7ce52513dae0973` |
| [parent Labrador.java](https://github.com/danilofes/refactoring-toy-example/blob/cd61fd2a70828030ccb3cf46d8719f8b204c52ed/src/org/animals/Labrador.java) | 142 | `21cabf37f9579f924da7ecdf2c47e883a9d9e5683c327db0c5fce421a7fd59d3` |
| [parent Poodle.java](https://github.com/danilofes/refactoring-toy-example/blob/cd61fd2a70828030ccb3cf46d8719f8b204c52ed/src/org/animals/Poodle.java) | 140 | `9609544e52071d196092a75e9437d5da67df6304cc89df02d37399e00df21ad4` |
| [child Dog.java](https://github.com/danilofes/refactoring-toy-example/blob/36287f7c3b09eff78395267a3ac0d7da067863fd/src/org/animals/Dog.java) | 338 | `ae558487e0a3046f5a5e78452b4599fc0fb0ec6ad8eed33906df815191e3f722` |
| [child Labrador.java](https://github.com/danilofes/refactoring-toy-example/blob/36287f7c3b09eff78395267a3ac0d7da067863fd/src/org/animals/Labrador.java) | 67 | `bd06095a0360069b7316bbe998374d4f484bcee9f0f13a84ff82a81d96d180ed` |
| [child Poodle.java](https://github.com/danilofes/refactoring-toy-example/blob/36287f7c3b09eff78395267a3ac0d7da067863fd/src/org/animals/Poodle.java) | 64 | `354c8572314d016da4744450832361d626a08a29aeba03a42fc17be23a4426d5` |

手工源码核对：before两个子类各有age字段和getAge方法，Dog没有；after字段/方法在Dog，两子类只剩继承声明；四条location与上述范围一致。这个oracle独立于导入器、检测器执行及图片，能验证图/表保留的角色与位置；**不证明检测全集、Java编译/执行成功或行为等价**。原toy仓API license为null，不能把RefactoringMiner根MIT套给这些Java文件，公开实验保持URL-only，不下载复制进提交。

[TestCommandLine L109–125](https://github.com/tsantalis/RefactoringMiner/blob/de0a67f9f690914e6c1ac1ed1b2a850c4ff6068d/src/test/java/org/refactoringminer/test/TestCommandLine.java#L109-L125)确实指定该child并对比完整JSON，但方法带`@Disabled`。它是历史expected与测试意图，不是当前测试通过或当前版本输出证据。后续若仅消费固定expected，标题/manifest必须明确这一层级。

## 深读链二：GumTree的move需要mapping前提

[Diff.compute L78–89](https://github.com/GumTreeDiff/gumtree/blob/6e9a863940d6805aa9455b97f404b43390e8079e/core/src/main/java/com/github/gumtreediff/actions/Diff.java#L78-L89)从generator得到两树，由指定matcher/properties形成MappingStore，再生成SimplifiedChawathe edit script。[ChawatheScriptGenerator L110–186](https://github.com/GumTreeDiff/gumtree/blob/6e9a863940d6805aa9455b97f404b43390e8079e/core/src/main/java/com/github/gumtreediff/actions/ChawatheScriptGenerator.java#L110-L186)对已匹配节点label变化发Update，对parent或child顺序差异发Move；不是方法符号语义分析器。

[ActionsIoUtils serializer L89–125](https://github.com/GumTreeDiff/gumtree/blob/6e9a863940d6805aa9455b97f404b43390e8079e/core/src/main/java/com/github/gumtreediff/io/ActionsIoUtils.java#L89-L125)先输出全部matches，再按action种类写；[JSON formatter L377–435](https://github.com/GumTreeDiff/gumtree/blob/6e9a863940d6805aa9455b97f404b43390e8079e/core/src/main/java/com/github/gumtreediff/io/ActionsIoUtils.java#L377-L435)的move是tree字符串、parent字符串和at序号，update另带label。[TextDiff.run](https://github.com/GumTreeDiff/gumtree/blob/6e9a863940d6805aa9455b97f404b43390e8079e/client.diff/src/main/java/com/github/gumtreediff/client/diff/TextDiff.java#L106-L119)消费该Diff并写text/XML/JSON。省掉matches或假设parent是目标文件中的声明身份，会失去解释动作所需的输入。

完整 [TestActionIoUtils.java](https://github.com/GumTreeDiff/gumtree/blob/6e9a863940d6805aa9455b97f404b43390e8079e/core/src/test/java/com/github/gumtreediff/test/TestActionIoUtils.java)已通读，8081B，SHA256 `11d5cd87f60f4b1b10207230803c56f6b0bf2619dd7efd182c9f7e050fe98323`；三个完整测试覆盖insert/move/update。move用两个完整XML literal交换type1/type2子节点顺序，并手工给三条mapping；expected为type1的`move-tree`、parent root、at=1。**它验证给定mapping的action序列化，不验证matcher选对mapping，更不验证命名方法移动。** 独立的结构oracle是两树子节点顺序相反、mapping的type1仍配type1；这无需执行上游即可阅读核对。故本轮不把此JSON与RefactoringMiner JSON混成统一“semantic change schema”，也不立第二个adapter。

## 唯一候选：离线结构声明投影CLI

**问题/收益。** 同一签名和正文可能在两个来源定义中出现，最终只有一个目标。现有文本往返只能指出相同文字；完整记录表/图可以回答“原声明各属于哪份文件、哪个版本？为什么两条method记录指到同一个Dog方法？另外两条attribute是否被漏掉？”收益是可检查的记录保真与阅读操作，不预报节约时间，也不要求先有生产事故。

**最小范围。** 独立实验目录内一个离线CLI，读取固定JSON文件和可选identity manifest，输出既有原生Explainer及旁置记录账目。通用遍历`commits[].refactorings[]`，保留输入顺序、原type/description和完整locations；不是把这四项写死成页面。首次支持范围依当前fixture约束：一个commit、每条恰好一个left和一个right、上表两种Pull Up类型可投影成带record序号的有向声明边；其余type、零/多locations或多commit保留原记录，明确标“未作图/未支持”，不丢弃、不猜方向、不拆成笛卡尔积。坏JSON/缺必需结构给输入诊断；额外字段保留原JSON账目，不默默假装理解。扩展其它record种类必须另有完整fixture，而非单凭type字符串类推。

端点按已确定side/revision/path/完整range/kind分组，**保留四条record及四条边**。这是原位置去重，不是建立跨修订稳定symbol ID。若manifest缺base，left端点仍可列原range与未知revision，避免编造链接；fixture manifest可用已核对的唯一parent和child。源URL按固定revision生成；不自动git clone/fetch，不调用RefactoringMiner，不抓源文件。toy内容保持URL-only，仅复制RefactoringMiner的完整MIT JSON并保留完整许可通知。图中type明确为“报告声明”，不得写“已证实语义移动”。

**现有输入已经足够。** 原JSON负责四条类型、角色、坐标及child/repository；补充manifest负责固定base与记录来源身份；现有Explainer code/table/diagram足够承载。由于单文档code source只允许一个revision，本实验不扩共享schema、不绕过验证，也不把URL-only source卡叫verified excerpt。若需要内嵌两版源码，应另选许可明确的完整fixture或原创synthetic，并保持作者声明与detector输出的区别，本批无需顺手扩展。

**同输入的最低验收。** 基线为完整3180B JSON原文，候选为同JSON的表/图（原文仍可取回）。依据上表独立oracle逐项核对4条record、8个location出现、4个before/2个after端点、4条边；两条method边共用同一个Dog target，attribute不被混入method。每条表记录能定位对应图边及两侧固定链接，图点回对应record；这才是超过静态手写说明页的操作差异。用原创变体检查重复同名但不同path/range不能误并、重复record仍两条、未知type保留并计数、缺base不伪造before链接；这些是导入投影边界，不测上游语义检测。

待实施时再做真实1280/390浅深浏览器比较，检查长path、类型/角色可读、键盘激活与返回落点；输出图片不能代替record/target核对。若原生Explainer无需reader修改即能完成，保留该边界；若为了一个fixture必须引跨版本SourceCard、AST服务或新交互框架，退回表格/链接方案或结束实验。

**成本与未证明。** 预计只需离线JSON读取/投影、manifest、原生输出和少量保真边界检查；无新依赖。未知格式保留账目不意味着支持它，未来扩展kind/多端点是持续成本。本轮没有实现CLI、运行上游或Archify tests、生成页面/截图，没有证明当前RefactoringMiner能复现历史expected、检测准确率、完整重构覆盖或阅读效率。该候选应按离线实验评估，不报成dev已支持结构变更。
