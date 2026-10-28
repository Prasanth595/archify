# React Scan 原生阅读证据 · 第 47 批

本包记录 2026-10-29（Asia/Shanghai）对公开网站的操作、源码筛选及数据范围审计。详见 [研究取舍](../../scouts/react-scan-scope-round47.md)。没有 Archify 产品实现或新 PR。

## 来源和版本

- [aidenybai/react-scan](https://github.com/aidenybai/react-scan)，固定 `0fb31862b697ef3ed2d8ed6990878a35a4ca8a75`。[MIT 全文](source/LICENSE)，Copyright 2025 Aiden Bai, Million Software, Inc.；12 份原始文件在 [sources.json](sources.json) 中有 Git blob、字节数、SHA-256。
- 从 README demo 链接打开 `https://react-scan.million.dev`，实际跳转至 `https://react-scan.com/`。没有安装扩展、npm 包或向页面注入 React Scan；它已由上游演示页加载。
- [served/auto.global.js](served/auto.global.js) 是操作完成后从 DOM 中观察到的 script URL 请求保存的原字节。它与固定树中的 public bundle **不同**，但两者静态文本均声明 `version:"0.5.7"`。不是首次加载响应抓包，不证明整个网站的部署 commit，也不能只靠版本号确认源码同一性。
- 两份 bundle 均保留原始 bippy / react-grab 许可注记。网站截图含上游演示与少量第三方品牌元素，仅作观察证据；不把品牌元素作为 Archify 可复用素材。
- [remote-state.json](remote-state.json) 与 [333 heads](remote-heads.tsv) 保存开工排重。issue / PR 状态是当时快照；讨论仅概述并链接，不将讨论文字套用代码许可。

## 原生复现

1. 在网站中选 Script Tag。打开工具条 Inspect element，移动到该 tab 所在 InstallGuide 并选择。检查器遮罩会截获输入，浏览器自动化的底层 DOM click 可能被拒绝；应对实际可见遮罩操作。
2. 记录 “No changes detected since selecting”。点击 Vite，展开第 0 和第 2 hook 的变化。本次分别为 script→vite、138px→307px。像素值依赖页面与布局，不是跨设备恒定答案。
3. 在组件树点 CopyIcon，再返回 InstallGuide。变化列表回到未检测到变化，树上的 InstallGuide ×2 和 History 仍存在。History 在此布局中未作为展开的截图对照，只记录其 DOM 文本。
4. 再点 Script Tag、Vite。两项变化计数均到 x2，展开显示最新的 script→vite、138px→307px；没有把两次变化完整展开成历史列表。11-vite 是有效展开图；11-expanded 的名字不准确，额外点击实际上把已展开的行折叠了。
5. 完成后本次导航到 about:blank 停止演示页面，保留此长期目标的 Ego space。工具条 checkbox 的 title 是 Outline Re-renders，不能未经核实当成总采集开关。

操作记录 [browser/](browser/) 包含 14 个脚本与日志，固定本机路径、当时拥有的 space 3 / p1。跨环境请按手工步骤复现或适配自己的页面与路径，不要照抄控制其他空间。每张图为实际截图，1440×900；[图像审计](image-audit.json)列出 8 张主证据、3 张辅助图、1 张绘制未完成的排除图，12 张均已查看。

## 检查与失败边界

```sh
python3 summarise.py
python3 verify.py
```

仅用 Python 标准库核对已归档 DOM、来源和文件完整性，不运行 React 或模拟其状态。摘要两次执行字节一致。UI 实际操作来自脚本 01–14，不把离线摘要称作浏览器重放或性能验收。完整 DOM 文本可能包含被折叠内容，因此值是否可见以 09-expanded / 11-script / 11-vite 实拍为准。

失败保留：02 坐标没有可靠打开检查模式，实际误开通知；03 只切换普通 tab。05 的语义 click 被选择遮罩拦截，06 观察后 07 在可见遮罩上选择。07 截图早于内容绘制，用 08-before 替代。04 是 DOM 控件盘点，未设置本轮 1440×900，不拿其坐标作截图标准。12 下载成功后停止开关 locator 格式失败；13 查明 checkbox 语义，14 导航空白页。离线摘要初稿的双重转义令正则匹配为空，断言失败；修正后才生成 observations.json，未更改原 DOM。

本次没有控制浏览器前后台、CPU、帧调度或页面部署，因此 History 延迟及 FPS 只保留原始观测，不用于判断用户站点性能、卡顿原因或工具开销。没有执行 CI/CD 接入、React Doctor、React 自身 Profiler 对照、完整调用计数或独立读者试验。没有发送工具采集数据给 AI，也没有实施上游历史 issue 的请求。

[checks.json](checks.json)保留检查结果。自写报告与摘要/核验脚本的 scoped whitespace check 通过；全量检查报告原始浏览器日志的 EOF 空行，按原字节保留，未宣称全量检查通过。新报告及本包相对链接均已核对。
