# 第十九批：原生 relabel 阅读与现有 Lifecycle Reach

这是一组实际页面检查，不是新图形实现。根代理逐张查看了 10 张原始截图。全部采用 Ego/Chrome 156.0.8078.48、1440×900 CSS 视口；Archify 为 Classic/light/reduced-motion。源码断言、线上观察、当前仓库中保存的工件分别记账，没有运行上游测试套件或重新生成 Archify 工件。

## VictoriaMetrics：三例都能直接读到中间结果

从 [官方 cookbook](https://docs.victoriametrics.com/relabeling.html) 的 Try the above config 进入 [VMUI relabel playground](https://play.victoriametrics.com/select/0/prometheus/graph/#/relabeling)。固定输入见 [cases.json](vm-source/cases.json)；它来自 `61916650cafcb6037b5f6947774302ece0fb32e2` 的完整 [测试源文件](vm-source/relabel_test.go)，没有发送私有数据。每例在 Config 和 A time series 填入对应 rules/input，点击 Preview，等本例结果与加载状态稳定后读取各步。页面会把规则和标签写入可复制的 URL，三个实际 URL 保存在 [observations.json](vm/observations.json)。

| 原生操作 | 本次页面实际显示 | 正式截图 |
| --- | --- | --- |
| labeldrop `foo.*`，再添加 `foobar=abc` | 第一步删除 `foo`/`foobc`，保留 `m{a="b"}`；第二步添加新标签 | [稳定结果](vm/labeldrop_then_replace-settled.png) |
| drop 匹配 `bar=baz` 的 metric | 原始 `foo{abc="def",bar="baz"}` 变成 `{}` | [删除整个 metric](vm/drop_metric-top.png) |
| 将 `bar` 设为空，再清理空标签 | 第一阶段仍显示 `foo{bar=""}`，独立 `remove empty labels` 阶段才变成 `foo` | [中间值和清理](vm/replace_empty_then_cleanup-top.png) |

三例的显示结果与固定测试里的预期步骤相符。页面格式化会插入空格、重排 label 和序列化 YAML 引号；脚本仅对这三个无空格值的固定标签字符串忽略空白比较，未创建通用 parser。cases 的 YAML 相比 Go 原始字符串去掉了起始换行，不能称输入字节完全一致。

页面明确显示 `v1.155.0-enterprise-cluster`，部署 commit 未知，不能称运行了固定源码 `61916650`。这里检查的是 metric relabel，不是 target discovery 或全部 Prometheus relabel 阶段。完整源码、原 Apache-2.0 [LICENSE](vm-source/LICENSE)、[来源/Git blob 清单](vm-source/source-git-identities.tsv)和 SHA 都保留；根 NOTICE 查询 404 也保留，但不据此概括所有第三方许可或线上企业版许可。

首个脚本把文件名直接传给 CLI，入口解析失败 exit 2，未执行浏览器步骤；改用文档规定的 stdin 后三个样例完成。首例最初截图虽已有正确数据，仍显示加载圈，保留为 [过渡截图](vm/labeldrop_then_replace-top.png)，不能当作稳定完成。随后仅补采此例，连续三次观察到输出一致且无可见加载标记，保存了 [轮询记录](vm/labeldrop_then_replace-settled.polls.json)和稳定图片。早期手动探索也遇到立即读取仍是上一结果的状态，不把该探索当正式回执或响应速度测量。

原生界面已逐步列出规则、输入、输出并高亮变化，分享 URL 也携带输入。当前没有额外图版解决剩余阅读问题的证据，因此不新增求值器、导入器或独立图版；也不声称真人效率、可访问性或小屏验收。

## Lifecycle：现有可达关系正确，旧 rail 不是当前缺陷

打开 [原样保存的 HTML](lifecycle/agent-run.lifecycle.html)。HTML 和 [输入](lifecycle/agent-run.lifecycle.json)直接取自 dev `d5d979493bba650b3995836afd379cd249f2d0dd`，身份见 [清单](lifecycle/source-manifest.json)，观察后哈希不变。这里只验证该仓库工件，不冒称本轮从当前 producer 重建，也不重放旧 #244 的 v1 输入。

真实操作是：点 Reviewing → Downstream → 再点 Downstream 清除 → 关闭 Passport → 点击标题离开节点键盘预览。Reach 显示 3 个下游节点、4 条关系、最大 2 hops；连同起点共 `reviewing/completed/blocked/expired` 四节点，匹配 `reviewing→completed`、`reviewing→blocked`、`blocked→reviewing`、`blocked→expired` 四条声明边。[完整状态](lifecycle/observations.json)和 [Downstream 截图](lifecycle/downstream.png)相符；被标记的旧装饰 rail 数量为 0。

关闭 Passport 后 focus/reach 属性清除，键盘焦点返回 `node-reviewing`。鼠标当时处于被面板遮住的节点位置，最初 [restored](lifecycle/restored.png) 仍有指针预览；移开鼠标后的 [restored-neutral](lifecycle/restored-neutral.png) 又保留了原节点的键盘关系预览。neutral 记录仅采集 focus/reach/hover、节点焦点和 group opacity，未保存 intent 属性；不能仅凭这些属性为空、节点 group opacity 为 1 就称整图恢复。点击标题后焦点变为 BODY，intent trace 也退出，见 [最终状态](lifecycle/restored-unfocused.state.json)及 [最终图片](lifecycle/restored-unfocused.png)。保留这些阶段，不用最终图覆盖初次观察。

原生自动缩放和滚动在这些操作间变化，未做跨状态像素比较。没有导出、移动端、AT、完整键盘遍历或旧自定义 SVG 验收。当前 v3 工件不含旧背景 rail，因此这不是对历史 #253 修复所有范围的追认，也不据旧 issue 新建修复。

## 证据与复现边界

[独立源码核对](../round19-source-audit.md)校验了四份上游 blob、三个测试案例和 Lifecycle 可达集；其工作不含浏览器。`harness/` 保存正式采集脚本及终态日志，使用本机临时路径和已授权 Ego 空间，供审查步骤而非可直接跨机器执行的安装脚本。以上表单与图内操作可手工复现；线上版本可能变化。所有复制文件的原始/公开 SHA 对应见 [copy map](../round19-copy-map.json)。
