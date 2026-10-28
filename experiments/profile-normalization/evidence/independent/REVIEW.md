# profile-normalization 独立审查

2026-10-28。基线`6ca6a5c84439b57ea22e0630fe306e1d91587a6e`，分支`codex/lab-profile-normalization`。本报告是内部agent审查，不是人类接受、GitHub批准或集成许可。仓库只读；所有审查脚本和证据仅写入本/tmp目录。

## 已审结论

在首次冻结 Architecture 候选上，未发现算术、完整数据、合并身份、依赖边或静态来源回链的阻塞缺陷。此前独立建立的`DERIVATION.md` / `derivation.json`没有失效；本轮没有用作者生成输出充当数值oracle。候选的增量是明确展示六条source共同决定S1的全局factor及base/diff_base报告分母差异，符合本实验范围，不是Tree换fixture。

本次读取generate、tests、verify、完整fixtures/ledger、三张native Architecture spec、Explainer JSON与真实public HTML。原生Architecture格式选择只改变展示；完整7输入、S1见证范围、全部六行输出、标签及分母合同保留。未改产品、schema、checker、candidate/hub，未安装、commit或push。root负责真实Ego读图，本审查不把自动指标当视觉接受。

## 首次冻结身份（legend修订前）

- generate SHA-256：`d1d0f3e1245e02bdc56b12dcda10ea7a0a5d58066193d75e2c5ed3df9d94c890`。
- Explainer JSON：`5897cdd1c9c4251944a8d26477d0611430f3b68dcfcd0bbe196bd29c1477f397`。
- candidate HTML：1773349B，`65815f7d59d26476c20ea833b06102419a24c77729973fac6fa172ffe14c8234`。
- baseline：98898B，`0668f1f91c1c77e81fd55ff0a479f77fcd676675ea2143e35e40940d7197c214`。

完整快照和manifest见`snapshot/`与`frozen-review.json`。root随后通知legend从通用“后端”改成已有meta.legend条目的“算术输入与运算”；本段暂不将新字节当作已绑定，需要最终delta。

## 重要合同的独立结果

`review_frozen.py`将保存的独立原bytes推导与候选public产物逐字段比较，未import作者实现。确认：

- 完整6source+1base原行、source79/base13地址位置、raw→corrected减1、40个source locations与全部24条原memory map均保留，源位置正确；原件、完整golden和Apache文本在public HTML内完整可读。
- trunc unsample与每metric独立round之后的六行结果全部正确。S1绝对差`[1700,608878600]`变normalized差`[-229,-369]`；S2/S5为`[29,0]`仍保留；scaled source`[1001,3124]`和net`[1,0]`未混为报告分母。
- ordinary base为6条完整signed samples，diff_base为7条且负B1保留`pprof::base=true`。全部contributors、标签、signed values与独立合并模型一致。四组report分母为`[2500,690505089]`、`[1000,3124]`、`[459,738]`、`[1000,3124]`，均正确。
- 两metric各13节点15边，六个source到sourceTotal、baseTotal/sourceTotal到factor的分子/分母角色、S1与factor到round、两种减法的两输入及方向全部正确。分母图9节点8边，两种ratio均有共享S1分子和各自报告分母输入。没有以net1/0作除法输入。
- 35个实际preview节点都有真实详情映射和精确native返回；factor→sourceTotal→全部S1…S6原行可达；每个原行链接完整maps原件，并有明确count/delay factor固定返回。所有public HTML本地anchor有真实目标。steps移到紧随详情panel，仅恢复图宽，未删target或操作。
- 页面明确箭头是算术值依赖，不是runtime call；无上游执行/采集workload、无动态Viewer反向同步或任意DOM返回栈、无阅读效率结论。只在相同map的固定pair内匹配完整stack，不发明符号函数或跨版本地址身份。

## 检查复用与键盘失败诊断

原始CLI证据目录`$LOCAL_PATH`：已核`tests.stdout`是5/5、0fail、0skip；finalize不带browser gate时validate/deliver/check通过，strict `check --require-provenance`为ok，均绑定上述658...HTML。没有重复执行这组未改变的证据。

public完整browser receipt `$PRE_LEGEND_BROWSER_RUN/candidate.browser-check.json`也绑定658...HTML，仍为FAIL，164条全部`explainer/browser-keyboard-traversal`，没有readability/fit/text诊断。这不等于人类认为布局好。

独立Chrome CLI键盘观察脚本`continued-tab.mjs`仅发送真实Tab和native radio ArrowRight，四组1280/1440 × light/dark，不调用focus()补达、不改tabindex/controls或artifact。原始完整轨迹`keyboard-traversal.json`与重新计算摘要`keyboard-summary.json`显示：原预算285步到241/282个初始目标；第334步282/282全达，missing为空。每组41漏达×4=164，和public诊断完全一致；artifactBefore/After均为658...。

该结果足以将本页164条诊断定位为现有`controlCount+3`有界遍历预算耗尽，而非已证明控件不可访问。它与协调者给出的开放PR #1124问题一致，本审查没有重新查询PR远程状态，也没有复制PR修复。共享checker保持原样，public FAIL不改写为PASS。此轨迹只证明初次冻结658...字节，legend修订后的最终产物须另绑定或明确按不变control结构复用。

## 最小测试判断与待收尾

已有5个focused tests覆盖真正会误导阅读的错误：完整原件/golden、trunc与round、whole-stack匹配反例、labels/merged身份、四分母与native依赖/返回。测试没有冻结自动布局坐标；无需新增同源断言或全仓suite。独立脚本补核实际public HTML及全部有意义的边角色，不用断言数量表示价值。

README在snapshot时含旧Dataflow布局历史及“最终证据待完成”文字；root已明确会补最终结果，暂不按文档待收尾判数据失败。最终仅需同步Architecture维护成本描述、最终hash/实际browser gate FAIL及局部Tab观察的区别；不要把probe实图继承为fullpage接受。最终legend字节与root真实Ego证据另作delta绑定。


## 最终legend差异与正式字节绑定

最终generator为28738B / `20df1edce8366dbb8d4cc1347bdbd40c4a6b4c32b3a23845e0eaf32f60c8d030`；Explainer JSON为79369B / `dcdda473b220acb17f6b7280f96a24d695b4cf41be9436fa50ad1f295e274ca7`；candidate为1776392B / `035db27d3cac4cda94258f839116cc7e72db39cafa5ddb734184118e8e4c0a94`；baseline仍98898B / `0668f1f91c1c77e81fd55ff0a479f77fcd676675ea2143e35e40940d7197c214`。

逐字段diff只有3处Architecture `meta.legend.entries.backend.label="算术输入与运算"`；components/connections、nodeBlocks、steps和所有正文均无变化。ledger/baseline逐字节相同。实际新HTML的三处legend已改，195个DOM IDs与354项静态interactive/native节点及边属性/次序完全相同（354含静态候选元素，不是动态QA的282个初始可见target）。新HTML再次通过相同独立数据/图/原件/真实anchor检查，结果见`final-frozen-review.json`；delta细节见`legend-spec-delta.json` / `final-delta.json`。

最终CLI证据已独立读取`.../archify-profile-normalization-verify-6XYbmi`：5/5测试、0fail、0skip；validate/deliver/check通过，browser-check未在此finalize命令启用；strict provenance check为ok。finalize另有8项`explainer/writing-paragraph-length`非阻塞warning，不隐去或当数据失败。最终完整public browser receipt为`$FINAL_BROWSER_RUN/candidate.browser-check.json`，确绑定035...，仍FAIL且164项均keyboard-traversal，无其他public browser诊断。机器通过/失败和人类视觉接受保持分开。

先前四组真实Tab轨迹仍按原658...字节保存，没有修改其artifact hash或冒称新HTML重跑；其重用依据是本次已证实纯legend delta、交互身份/次序不变。最终public receipt也重现相同164预算漏达。没有新运行Ego或补焦点，不把局部延长观察当public gate豁免。

最终 disposition：数据/完整性/依赖/固定回链审查无阻塞；public browser gate保留FAIL，并有本页预算耗尽的独立实证解释。root最后真实Ego与图片/README包装另行记录；无CI、无阅读速度结论、无跨平台结论，本审查不代表人类接受。README仅改证据包装时不会使本次数据结论失效；若候选或依赖结构再变，应按实际delta判断重用范围。
