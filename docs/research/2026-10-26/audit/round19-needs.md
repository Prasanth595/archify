# 第19批：公开阅读问题与现有 ownership

2026-10-28，只读。筛选出 **2 个有完整公开合成复现的待裁定证据链接问题**，但二者都与贡献者正在协调的 #1063 共享代码，不建议并行实现。两例都来自同一作者的合成检查，不冒称真实生产事故；本轮没有复跑或新建 PR。

## 查询范围

先读当前 `docs/research/2026-10-26/README.md` 的研究索引与交付规则，再用 GitHub connector 查询 `repo:tt-a1i/archify is:open` 的 `"source" "navigation"`、`"reader" "source"`、`"relationship" "viewer"`、`"diagram" "misleading"`、`"source" "link"`、`"semantic" "viewer"`，每项最多50；再查 open PR 的 `"1128"`、`"1129"`、`"tag object"`、`"markdown" "plain"`、`"244"`、`"248"`、`"1132"`、`"1133"`。搜索匹配 title/body，不保证语义穷尽或所有边界已遍历；各 issue/PR 状态为本次只读快照。`/tmp/archify-round19-remote-heads.txt` 314 refs，按 source/read/navigation/semantic/query/evidence 等检索发现 `codex/source-range-repair@a25a512f`、`codex/lab-source-question-tour@94d6a4d0`、`codex/lab-source-keyboard@d81830d3` 和 `claude/code-atlas-evidence@47fa7a52`；名称匹配只是提示，不证明实现等同或穷尽。

## 1. GitHub Markdown 行引用不打开 plain 源码

[#1128](https://github.com/tt-a1i/archify/issues/1128)，OPEN，作者 `pqminh27`，报告固定 dev `500d4a65211ffe607fde6b3ce7505027b45bb59e`，给出完整 JSON 和本地临时 Git fixture/命令。原生 `deliver` 据报告通过并标记 evidence verified，但生成 `README.md#L1-L3`，没有 GitHub Markdown 行引用所需的 `?plain=1`；该 fixture 的 fake remote 不证明网页高亮，issue 单独引用 GitHub 官方文档。读者想定位证据行可能需要手动切换 plain 源码。

当前行为是“本地 revision/path 验证”与“生成网页 URL 格式”两回事。`repository-location.mjs` 同时被 [#1063](https://github.com/tt-a1i/archify/pull/1063) 修改；OPEN、作者 `gold-beyond`、当前 head `b06593763f5c3a041c3dde0391e89594b40d4788`。同一报告者已在 [#1063 公开协调](https://github.com/tt-a1i/archify/pull/1063#issuecomment-6435643579)，明确尚未开始并等待范围决定。下一步只读核对当前 dev 与 #1063 head 的 URL 规则和明确 issue 是否仍适用，等贡献者协调，避免复制；不把原始链接验证当浏览器高亮验收。

## 2. Annotated tag 对象被保留成已验证 commit 身份

[#1129](https://github.com/tt-a1i/archify/issues/1129)，OPEN，作者同为 `pqminh27`，基线同 `500d4a65`。完整命令在合成 Git 库创建 annotated tag，`git cat-file -t` 为 `tag`，报告中的 deliver 仍输出 verified 且在 revision/URL 中保留 tag 对象 SHA；issue 另提供公开 Git 上 tag 对象 URL 404、peeled commit URL 200 的对照。读者看到 verified 后仍可能无法打开准确源码。根据报告，现有检查 `<sha>^{commit}` 能 peel tag，但后续保留输入 SHA；这是报告的证据而非本轮复现。

问题与 #1128 同归已声明的 [#1063 协调](https://github.com/tt-a1i/archify/pull/1063#issuecomment-6435643579)，触及其另一共享文件 `repository-evidence.mjs`。报告提出拒绝 tag 对象并建议 peeled commit，但也明确需要维护者同意；不能将其作为已决定合同。下一步只读核对当前 dev 和 #1063 的实际 revision 合同与对象类型测试，并记录 strict reject 与规范化的兼容性差异；等待相关作者/维护者裁定，不抢实现。

## 排除与限制

- [#248](https://github.com/tt-a1i/archify/issues/248) 有完整合成图：反向关系共享一条线被误读为双向，9/9 检查通过；但 OPEN [#260](https://github.com/tt-a1i/archify/pull/260) 已由 `robll-v1` 实现 warning-first 方案，head `b8b752ef7e34b10ba52c57266c053639bf59e0dc`，不重复。
- [#244](https://github.com/tt-a1i/archify/issues/244) 有 lifecycle 装饰 rail 的完整误读复现；[PR #253](https://github.com/tt-a1i/archify/pull/253) 已 merged，issue 的合并验收文字仍提示 reach 覆盖缺口。不能把旧复现直接称当前未修；后续仅在固定当前 revision 上确认 reach 状态，不能重做已合入的三种交互。
- [#1132](https://github.com/tt-a1i/archify/issues/1132) 声明关系级源码证据缺口，但作者已[认领分阶段调查](https://github.com/tt-a1i/archify/issues/1132#issuecomment-6443088515)，且协调 #1063；不抢占。#1133 claim-evidence 为设计提案，issue 未附完整可独立执行的输入，暂不列为已复现。
- [#1139](https://github.com/tt-a1i/archify/issues/1139) 给出真实 CRM/PPM/ERP 双向引用需求和当前一律箭头，但无完整 artifact 复现，且会影响 Route/Reach、动画及合同，暂不列为小型已验证缺口。
- 本批任务要求排除 Lens #1027 与长描述邻域；其中 #648/#611 是 root 任务中的误引用，并非用户直接陈述。精确核查 GitHub 当前 #648 为已合并 WeChat QR PR、#611 为已合并 3.0.1 release PR；实际 [#1112](https://github.com/tt-a1i/archify/issues/1112) 是长图描述提案，按任务范围排除。

这些是公开报告、source identities 与现有 owner 的筛选，不是本轮产品验证、浏览器测试或真人验收。没有修改贡献者分支、评论、实施或新建 PR。
