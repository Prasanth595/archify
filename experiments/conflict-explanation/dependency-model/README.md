# 依赖声明模型实验 D

先前仅把 Tree 类型标签改成包名的方案已否决：它仍把依赖声明画成包含关系，不能作为本例的修正。

D 是对 C 图示模型的内容修正，不是同输入的运行时性能改进。C 的 Tree 连线代表包含关系，而这里需要展示依赖声明；D 使用 Architecture 的有向连接，保留 `declared` 图块和四个节点 ID。C 的结论、完整上游测试函数、两份完整报告、来源与许可、两处精确节点链接及范围表保持原样。图中 root 1 指向 foo 和 baz，foo 的五个已登记整数候选合并为一个包名节点并指向 bar；三条箭头均标明任意版本。baz 1 已登记且无依赖，bar 仅被引用，没有提供版本。图不表示已安装或选定的版本、求解过程、运行时服务或最小冲突。

Architecture 没有原生 package 类型。这里按现有领域适配约定让四个包名统一使用 `backend` 技术类型、`icon: none`，图例与中文 Viewer 标签显示“包名”。原生 JSON、导出 SVG 元数据、Lens 原始 kind 和 Story inspect 仍使用 `backend`；这不是新增包类型，也不修复 Tree 的通用类型标签问题。[生成前初稿](initial-draft/)与[首个生成版本](first-rendered/)保留可审查原字节；原始收据另保存在本机私有临时目录；保留原始收据后公开脱敏副本及其 raw/public SHA 对照见 [首版哈希对照](first-hash-mapping.json)和[最终版哈希对照](hash-mapping.json)。脱敏副本不是 live provenance。

实验 checkout HEAD `d4f872ee81d3df4e4fd39a2860fccc4f2cae8a65`，macOS arm64，Node v26.12.0，Google Chrome。首版输入 SHA-256 `316ef45577a968e0a0c96c48a5e62cf006b9b7bd12f9c7bc81ec6476fc0c9eb1`，原生 JSON `2c456cfb8c602b5a4f219da5505d7fdaaa7651c3c81ebd9e0bdd4f96632729c3`，HTML `9191f10724258e770f8e808df89ffaff10920a74d6234a574f76776bd3de129c`。首版 showcase finalize 的 validate、deliver、check 均 pass，已有 52/50 中文句长 warning 一条；随后独立 browser-check pass，provenance=current，零 diagnostics，visualReview 为 not-requested。墙钟分别为 1.82 秒和 11.64 秒，仅为本次记录。首版原始输出及收据留在本机 `/tmp/archify-round10-dependency-originals/attempt1`。

独立视觉检查发现首版 Lens 的“真实流量”提示与依赖声明不符，见 [首版截图](root-review/first-lens-runtime-wording.png)。唯一一次生成后修正是在原生 JSON 加入 `viewer.lens.title` 和 `viewer.lens.instruction` 两个文档级翻译；未修改图形、节点、边或正文。最终原生 JSON SHA-256 `f07341589d89dca14439b893b37d458fb78cbf1768e30668c1d5ef822bb3667a`，最终 HTML SHA-256 `09ec711ed24370ea330fe614e0541adf6a5ce621d0324cfdfa66c2676100cd96`，Markdown SHA 不变。重新执行 showcase finalize 后 validate、deliver、check 均 pass，保留同一条句长 warning；单独 browser-check pass、provenance=current、零 diagnostics，visualReview 未请求。墙钟分别 1.80 秒和 4.89 秒。最终原始输出及收据留在本机 `/tmp/archify-round10-dependency-originals/attempt2`。公开 HTML 未修改，公开副本不含本机用户目录。

在仓库根目录、依赖与 Chrome 已就绪时复现。fresh finalize 后再运行 browser-check；命令会生成 live sidecar，检查前不可移动或改写它：

```sh
mkdir -p /tmp/archify-dependency-repro/finalize /tmp/archify-dependency-repro/browser
node archify/bin/archify.mjs finalize explainer experiments/conflict-explanation/dependency-model/d.archify.md experiments/conflict-explanation/dependency-model/d.html --quality showcase --json --out-dir /tmp/archify-dependency-repro/finalize > /tmp/archify-dependency-repro/finalize.stdout.json
node archify/bin/archify.mjs browser-check experiments/conflict-explanation/dependency-model/d.html --json --require-provenance --out-dir /tmp/archify-dependency-repro/browser > /tmp/archify-dependency-repro/browser.stdout.json
```

该样例只是模型与结构验证；没有开展读者研究，不能据此声称阅读效果提升。未运行求解器、广泛测试或 CI。真实页面视觉和精确节点链接已由 root 独立检查，见 [实际页面与证据边界](root-review/review.md)。窄屏可读性仍有限。
