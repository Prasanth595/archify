# 第十批 D 最终包装只读复核

结论：通过本次记录与包装复核；未发现阻断问题。只写本文件，未修改仓库、重跑测试/渲染/浏览器、提交或推送。它不新增实际页面、读者效果或 CI 验收。

复核对象：dependency-model/README.md、root-review/review.md、screenshots.json、author-verification.json、两组 hash-mapping、first-rendered/、initial-draft/，以及实验根 README 和 C README 的更正。对照此前独立源码/嵌入产物复核及保留的首版原件。

## 记录的语义与边界

- 根 README 开头明确更正 B/C 的 Tree 模型误用，保留旧产物和观察为历史；C README 追加更正，区分已成立的键盘交互与不成立的模型选择。D README 与 root-review/review.md 均明确否决仅改 Tree 标签的方案。
- paint→kind 原因准确：Tree renderer 主动把 tone 放入 Passport.kind；不是 Viewer 因缺失 metadata 的 fallback。通用 Tree 问题仍未修复，未拿 D 掩盖它。
- Architecture 是既有领域呈现约定：四个包名统一 backend/icon:none，图例和 Viewer 文案叫“包名”。raw IR/DOM、导出 SVG、Lens kind、Story inspect 仍 backend；记录没有宣称原生 package 类型或新增产品默认值。
- “三条分组箭头不是七项逐版本声明的数量”准确：root 1 的 root→foo/root→baz 两项，加五个 foo 版本各自→bar 的五项，共七项。foo 合并表达是已披露的内容抽象，没有把五个候选误写成一个选定版本。
- 首个 D 有 Lens 真实流量措辞问题；最终只有两项文档级翻译修正。原生 SVG 完全相同、解压 native HTML 仅两条字符串变化的前次独立结论仍有效。首版/末版身份和初稿/首次生成区分清楚。
- root-review 对桌面读图、真实 Tab/Enter/Escape、Finder/Lens、窄桌面可读性分别记录。尤其明确窄屏焦点成功不等于可读性通过，并保留裁切/遮挡、无焦点暗色总览和过早截图的状态边界。没有将检查器时序误差升级为产品故障。
- 机器 finalize/browser 记录被描述为当时结果；visualReview=not-requested、脱敏副本不是 live provenance、Node 26 不是 canonical Node 22 CI、未运行 solver/广泛测试/CI均清楚。图片检查没有被称为读者研究或人类认可。

## 实际包装核对

最终 d.html 实算 SHA-256 仍为 `09ec711ed24370ea330fe614e0541adf6a5ce621d0324cfdfa66c2676100cd96`，541872 bytes。相对 C/B/A 的增加量1602/1894/388935 bytes与现存文件大小一致。

first-rendered/ 包含可审查首版原字节：

- HTML `9191f10724258e770f8e808df89ffaff10920a74d6234a574f76776bd3de129c`。
- native JSON `2c456cfb8c602b5a4f219da5505d7fdaaa7651c3c81ebd9e0bdd4f96632729c3`。
- Markdown `316ef45577a968e0a0c96c48a5e62cf006b9b7bd12f9c7bc81ec6476fc0c9eb1`。

initial-draft/ 单独保留生成前 native JSON（`1f6090f08f9bf505bd77553ed0b2fd8e144e1b132c9e86339f2fc1ba3b279070`），README 明确未生成/未验收；Markdown与首版及最终相同。未把首个已生成版本冒充作者最初输入。

screenshots.json 共13项，与目录13张PNG一一对应；逐项实算图片SHA与manifest一致，4张first-*绑定9191首版，其余9张绑定09ec最终版。两张非有效焦点图有stateCaveat。此复核检查身份、清单与记录边界，没有重新打开图片或自行确认像素内容。

author-verification.json 的12组 raw/public receipt映射已逐项读取本机原件和公开副本并实算SHA，全部相符；两份hash-mapping的12个公开副本SHA亦全部相符。author-verification对raw与redacted的区分准确，且标明root接手而非冒称不可用的作者代理完成。

公开tree-source-diagnosis.md和independent-source-review.md与本机原报告比较，恰好只有实验checkout绝对路径前缀替换为仓库相对路径；其余文本相同。此前独立诊断未被改写。

已检查上述新README/复核报告中的Markdown相对文件链接及归档目录均存在。来源HTTP链接未联网重取；文稿中source:/node:是已有编译语法，不当作本地文件链接。初稿/首版README里的裸相对路径在文件系统中存在。

## 可接受处置

可以把这批材料作为原研究分支的历史证据与有界D内容修正继续整理。它不证明D比A更易读、不解除窄屏/护照遮挡限制、不修复通用Tree metadata，也不构成PR、合并、发布、部署或安装的验证。此前“仅改Tree包名标签即可修正该例”的建议已明确被本批记录取代。
