# 等式重写解释的阅读：暂缓

结论：**暂不建实验或共享功能**。调试错误重写规则是具体问题，但目前唯一审查的完整小输入已有足够直接的原生逐步解释；没有独立真实长解释或读者任务证明图能改善它。教程的例子是教学构造，不是观察到的用户事故。

## 排重与范围

查了 `origin/codex/research-lab-20261025` 和当前 `docs/research` 中 egraph/e-graph、equivalence、proof、witness、conflict 及中文近义词（只读文本，排除 HTML 内嵌图片）。[model witness](https://github.com/tt-a1i/archify/blob/60342aa9e40618aeb7c33bdb8d65889fea3a588e/docs/research/2026-10-25/scouts/model-witness-smalltools.md) 研究模型反例的有限前缀/循环，并非等式推导；[visual explanation](https://github.com/tt-a1i/archify/blob/60342aa9e40618aeb7c33bdb8d65889fea3a588e/docs/research/2026-10-25/scouts/visual-explanation-smalltools.md) 提醒优化前后呈现不证明语义等价；[dependency conflict](dependency-conflict-reading.md) 研究求解器的包依赖冲突报告；witness groups 研究来源组合。这些都不是 egg 的重写解释，也不证明所有未命名工作不存在。

## 固定上游及完整案例

[egg](https://github.com/egraphs-good/egg/tree/73975c9819efb4af2f3c6c1b44fa53f8c5742574)，SHA `73975c9819efb4af2f3c6c1b44fa53f8c5742574`；[Cargo.toml](https://github.com/egraphs-good/egg/blob/73975c9819efb4af2f3c6c1b44fa53f8c5742574/Cargo.toml) 声明 MIT（Copyright 2019 Max Willsey），[许可证原文](https://github.com/egraphs-good/egg/blob/73975c9819efb4af2f3c6c1b44fa53f8c5742574/LICENSE)。固定[官方解释教程](https://github.com/egraphs-good/egg/blob/73975c9819efb4af2f3c6c1b44fa53f8c5742574/src/tutorials/_03_explanations.rs) 给出可复核的完整代码、五条规则和原生输出，问题是从 `(/ (* (/ 2 3) (/ 3 2)) 1)` 到 `1` 用了什么等式：

```text
(/ (* (/ 2 3) (/ 3 2)) 1)
(Rewrite<= div-one (* (/ 2 3) (/ 3 2)))
(* (Rewrite=> unsafe-invert-division (/ 1 (/ 3 2))) (/ 3 2))
(Rewrite=> cancel-denominator 1)
```

完整规则及调用见上游，不能只截取输出理解假设。教程明确每个后续项含一个重写注记，箭头指规则应用方向；`Rewrite<=` 因而不是时间倒流。解释是一条在所给规则下的等价推导，不是饱和过程的完整执行日志；规则自身合理性和实际程序语义需要独立验证。`unsafe-invert-division` 显示此区别：教程也给 `0` 到 `1` 的三行解释，并指出 `(/ 1 0)` 导致错误等价。

原生 `get_flat_string` 已把变化位置、规则名与方向放在对应表达式里；教程亦说明 `TreeExplanation` 允许嵌套与 let 共享，减少重复。其分享结构不是每一次运行发生的事件，不能把图中连线或节点数称为执行次数、完整搜索历史或独立证明。默认贪心缩短解释见[变更日志](https://github.com/egraphs-good/egg/blob/73975c9819efb4af2f3c6c1b44fa53f8c5742574/CHANGELOG.md)，不应称全局最短。

**版本陷阱**：同一教程仍推荐 `explain_existance` 来解释 `(/ 1 0)` 从何而来，但固定 SHA 的 changelog 说该功能 0.10.0 已移除（buggy，且与 analysis 不兼容）；Cargo.toml 版本为 0.11.0。不能把旧教程推荐当作此版本可用 API，也不能把等价解释说成已解释 term 存在的完整原因。

## 价值、成本和下一门槛

潜在价值：审阅者可能需要定位长解释中变化子表达式、规则方向和共享子推导；但所查四行示例原生文本已回答规则/位置/方向，没有实证阅读痛点。成本：保留原始术语及左右方向、表达式上下文、共享引用身份及版本，解析嵌套格式和避免暗示时间顺序都会引入语义及维护风险。影响：现在增加 parser、证明检查器或 viewer 无依据；也不应把视觉投影当数学正确性的验证。

重新评估的最小门槛：取得可公开、固定版本的**完整自然任务**（含输入、规则/假设、完整原生输出和阅读问题），先让读者直接用原生 flat/tree 回答“哪一子式、哪条规则、什么方向、共享项指向哪里”；若出现可重复错误或耗时障碍，再用现有 Archify 内容能力做忠实对照，比较答案正确率、时间及遗漏，同时保留原文。没有收益或无法保真则停止。不得用四行教程删减原文制造弱基线。

本次只读官方源码与文档，未安装、运行 egg、重现输出、检查用户样本或做阅读实验；输出是上游文档声称的示例，不是本轮运行结果。未修改产品代码。
