# 显式节点链接内容实验 C

C 从 B 复制，仅把 context 中 `baz 1` 和 `bar` 改为指向 `declared.baz`、`declared.bar` 的显式节点链接，文字事实未改。比较基准 B HTML SHA-256 为 `b3abfa149778fb86b5fe9cf2450dd49d36364bd067ee542150c6694a73f0fd3c`；C 输入 SHA-256 为 `4e58f9bb87d8b16426bf1a0683a6129b0f96ae7f9a41b9b1cf39904538126789`。未改产品代码。

解析 HTML 内 `archify-explainer-prepared` 后，document 唯一变化是该段的 text（两处链接标记）和自动生成的段落 ID（`prose-5852bf36a605` → `prose-6ccd48ae713d`）。整个 `preparedDiagrams` 对象相等；`declared` 内压缩原生 HTML 字节 SHA-256 均为 `380b3020a144451867cc7d63c3bc3b069dcd996b2bd37edffd9cabd252758ced`，子图 SHA 均为 `ff72baeb79ec8bf7622ded0c4e4035ab2fdf01bffbb1d1327b5520d59c199c94`。这是结构与字节对照，尚非读者效果证据。

执行环境：分支 `codex/lab-conflict-explanation` 的 `ae0acf7db3014cf4392ae5db9ff7529ec1fe8190`，运行时源码对应 dev `d5d979493bba650b3995836afd379cd249f2d0dd`；macOS arm64，Node v26.12.0，zlib 1.2.12，Google Chrome。一次 finalize 的 validate/deliver/check 均 pass，1 条已有 52/50 中文句长 warning；内部 browser-check 未请求。随后单独 browser-check pass，运行时 provenance=current，零 diagnostics，1280/1440 明暗主题交互检查通过；visualReview 为 not-requested。分别墙钟 1.83 秒和 11.35 秒，只是本次运行记录。stdout 和 sidecar 脱敏副本及其 raw/public SHA 对照见 [hash-mapping.json](hash-mapping.json)，不作为 live provenance。原始文件保存在本机 `/tmp/archify-round9-term-originals/second`，检查完成前未更改 sidecar。

首次输出到系统临时目录时的 HTML SHA 为 `a6862e58cb650abbe93433db543ef4e99e332d14e312cbd20a39a7ec3bcf958b`；它通过机器检查，但包含本机路径，保留为私有记录，不作为公开产物。第二次在输入旁生成的精确 C HTML SHA 为 `8c02079dc91e49c8ca461e40d9ce0863cd49ae1e067522909f308718440a9c1f`，无 `/Users/` 字面路径。

在仓库根目录，依赖和 Chrome 已就绪时复现（fresh finalize 后再检查；运行会生成 live sidecar）：

```sh
mkdir -p /tmp/archify-round9-term-repro
node archify/bin/archify.mjs finalize explainer experiments/conflict-explanation/term-links/c.archify.md experiments/conflict-explanation/term-links/c.html --quality showcase --json --out-dir /tmp/archify-round9-term-repro/finalize > /tmp/archify-round9-term-repro/finalize.stdout.json
node archify/bin/archify.mjs browser-check experiments/conflict-explanation/term-links/c.html --json --require-provenance --out-dir /tmp/archify-round9-term-repro/browser > /tmp/archify-round9-term-repro/browser.stdout.json
```

保留当前生成的 HTML 与其原始 receipt 的区别；复制或脱敏的 HTML 不自动继承 live provenance。未运行广泛测试、CI 或真实用户研究。

实际键盘与页面复核已完成，见 [root-review/review.md](root-review/review.md)：两处直达行为成立，但原生详情遮挡与泛化类型标签仍限制阅读质量；保留研究样例，不升级为共享功能建议。
