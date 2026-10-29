# PubGrub 冲突报告：固定输入阅读实验

> 第十批更正：下文 A/B 比较与旧图保留为历史记录。Tree 合同只允许包含关系，B/C 用它表达依赖声明不成立；此前来源复核未发现该模型错误。当前候选请看 [D 依赖声明模型](dependency-model/README.md)及[实际页面复核](dependency-model/root-review/review.md)。A 仍为完整文字基线。

打开 [A：完整文字基线](a.html) 与 [B：同样文字加声明图](b.html)。两臂包含相同结论、完整测试函数、归约前后的完整报告、来源与许可；作者文稿中 B 只追加现有 native Tree 和范围表。Reader 还会为 B 正文自动生成匹配图节点的词语标记，这一现有联动效果属于本次对照，不能将差异归因成纯排版。实验假设是：把输入声明与这份解释树引用范围并排展示，可能帮助读者找出被简短报告隐藏的“本输入未提供 bar 版本”前提，以及解释为什么 baz 仍在输入中却没出现在解释里。尚未测量阅读速度、正确率或真实读者收益。

这是分支内的阅读实验，不改 renderer、schema、验证器、Skill 或产品默认行为。比较基线提交为 `d5d979493bba650b3995836afd379cd249f2d0dd`。未创建 PR、运行 CI、安装 live Skill、运行第三方 Rust 或求解器。最终版本共用四个面板；B 加第五个面板、四个包名节点、三条依赖边及一个范围表。最新 B 比 A 多 387,041 字节（539,978 对 152,937）；A 保留原末稿 finalize 918 ms 的记录，B 窄屏修正后单次 finalize 为 1262 ms（修正前为 1281 ms）。这些是本机单次生成记录，不能作为性能基准。维护成本主要是固定源码与人工讲解同步，尚无证据值得引入自动 parser 或通用证明系统。

## 来源与语义边界

固定来源是 [`pubgrub-rs/pubgrub@2b32d6a1b0b7b6021d2658a274d6fb7b613c5796` 的 `tests/examples.rs::confusing_with_lots_of_holes` L229–268](https://github.com/pubgrub-rs/pubgrub/blob/2b32d6a1b0b7b6021d2658a274d6fb7b613c5796/tests/examples.rs#L229-L268)。[完整上游文件](source/examples.rs) 与 [MPL-2.0 原始许可](source/LICENSE) 随实验保存；函数及报告均来自该源码中的预期断言，不是本次求解产生的日志。完整文件保留 SPDX；两臂可见正文也注明代码摘录的 MPL-2.0 来源。Archify 的渲染运行时保留自身内嵌许可，不能替代第三方代码许可。

root 1 对 foo、baz 的约束都是任意版本。输入仅登记 foo 的五个整数候选 `{1,2,3,4,5}`，每个都依赖任意版本的 bar，但输入没登记任何 bar 版本。图把五个候选合并显示，没有选定具体版本；bar 节点表示被引用的包名。baz 1 已登记且无依赖。测试的 `packages()` 断言收集的是归约后解释树引用的包名，不主张最小冲突或唯一原因。图表达声明关系与解释范围，不是安装树、执行轨迹或完整算法证明。`collapse_no_versions` 简化解释树，未改输入；这例简短报告省略的前提需结合原文阅读。

独立来源语义审查见 [root-review/independent-source-review.md](root-review/independent-source-review.md)。审查复用固定来源、核对原文及内嵌拓扑；静态语义通过不代表阅读收益已验证。

## 首稿、第二稿、语义末稿与窄屏修正

| 阶段 | A HTML SHA-256 / 字节 | B HTML SHA-256 / 字节 | 保全范围与变化 |
| --- | --- | --- | --- |
| 首稿 | `1c89ee0046c5b5f427142bf46f14da1de184cb2ee75c552f3c11c108b738e848` / 148654 | `03737da44c187820ecbb800c13fe2df9f07f37fa11b5c3b04dbceb5eee555613` / 534828 | [first/](first/) 保留首稿文稿、原始机器记录的脱敏副本及一次首稿观察截图；首稿 HTML 原字节未保全。 |
| 第二稿 | `8e71793084616c7e311484808e603751f53c36ef6477e11886d2efd7d990cae2` / 148740 | `b67b2565e45ff9fb8a564c32c78dfe953c8342d162965836890e5c1d0ebb8d6c` / 535061 | [second/](second/) 保存当时文稿、HTML、静态与 browser 记录。已限定 bar 的输入边界，尚未完整落实版本集合、最小性说明及可见 MPL。 |
| 语义末稿（窄屏修正前） | `d9f6488f8ba79cf0c8596a888ad8189c48d56972bd58d4e905b91b3d68bfaed9` / 152937 | `23fcc185c7d14ed3884eb3e2e0d9ef2281a960b063e97eeeea2970252dbcc796` / 540077 | A 保留根目录；旧 B 文稿与 HTML 保全于 [before-narrow-repair/](before-narrow-repair/)。语义修订与明确署名均落实。 |
| 最新窄屏修正 | A 未变，沿用上行身份与证据 | `b3abfa149778fb86b5fe9cf2450dd49d36364bd067ee542150c6694a73f0fd3c` / 539978 | 根目录 B 仅将范围表两处表头缩为“登记版本”“归约后引用”；新记录见 [evidence/narrow/](evidence/narrow/)，不覆盖旧 final 记录。 |

首稿截图 [root-observed-first-draft.png](first/root-observed-first-draft.png) 可见旧文“蓝图”，记录的是观察；截图时没有保存浏览器加载 HTML 的字节 hash，不能把截图严格绑定到表中某个 HTML SHA。首稿与第二稿各自保留完整 browser 机器记录，两臂各一份；未把临时自动 PNG 冒充为人工检查。

原 worker 因模型 capacity 中止，未产出 README 或提交。root 接手修订并重新生成最终两臂；最终证据整理另行完成，保留之前的未完成状态与尝试，不把重生成版本当作首稿。

在 390px 实际检查中，root 观察到 B 表格宽 384px、容器 332px，因此在具体证据支持下增加一轮有限修正。缩短两处表头后，root 复查表格与容器均为 332px，没有该表格横向溢出。除此之外正文、表格行内容和 native 图不变；新 B 与 A 的共同四面板仍完全相同。

[窄屏修正静态语义比较](evidence/narrow/static-semantic-comparison.json) 核对旧/新 B 内嵌 native HTML 解压后逐字节相同：`ff72baeb79ec8bf7622ded0c4e4035ab2fdf01bffbb1d1327b5520d59c199c94`，858106 字节。原有 native 交互图片可以基于该不变子产物复用，但仍归属旧 B 父 HTML SHA；未将旧图片改绑最新 B SHA。编译后的表格及行 ID 随表头自动变化，非额外作者内容变更。

## 机器记录、失败与脱敏

[证据 hash manifest](evidence/hash-manifest.json) 区分每个机器记录的原字节 SHA、公开脱敏字节 SHA 与 artifact SHA，包含首稿、第二稿、语义末稿及新增的 B 窄屏修正阶段。首次原始 sidecar 来自本地首次备份；首次旧公开派生副本亦另存私有存档。原始机器记录保存在本机 `/tmp/archify-conflict-private-originals/`，不随仓库发布。该目录中的 raw-manifest.json 可核对私有原件；公开 manifest 用 `<PRIVATE_ORIGINALS>` 指代它。

公开机器记录均命名 `*.redacted.json`，将绝对工作树前缀替换为 `<WORKTREE>`，工作树以外的用户主目录替换为 `<HOME>`。原有 schema/status 字段保留作为历史内容，但这些文件不能再作为 live provenance、授权依据或本机当前 sidecar。原路径可能指向当时的顶层 a/b，即使文件被归档进 first/second 也不重写其阶段身份。公开 hash 不等于 raw hash。重新执行检查前必须 fresh finalize，生成当前本机有效 sidecar；不要把 redacted 副本复制回 `a.delivery.json`。

[实际失败记录](evidence/failures/post-redact.redacted.json) 保留 `delivery/provenance-invalid`：worker 曾直接把 live sidecar 路径改为 `<repo>` 后再次 `check`，receipt schema 失效。该记录不是伪造失败，也不是产品渲染缺陷；后续重生成恢复了本机 sidecar，发布时再把它们归档为明确脱敏历史文件。不要用这次失败推导 solver 或图表达有问题。

窄屏修正前 [A finalize 摘要](evidence/final/a.finalize-command.redacted.json)、[B finalize 摘要](evidence/final/b.finalize-command.redacted.json) 均记录 validate/deliver/check 三 gate pass，每臂一个 `explainer/writing-sentence-length` warning（52 reading units，建议阈值 50）；其中 browser-check 为 not-run。该阶段随后单独执行的 [A browser-check](evidence/final/a.browser-check.redacted.json)、[B browser-check](evidence/final/b.browser-check.redacted.json) 记录 pass、当时 provenance=current、零 diagnostics，覆盖 1280×900 与 1440×900 明暗主题。它们的 `visualReview` 是 not-requested，自动几何及交互检查不等于审美、人类验收或读者实验。最终本机执行 exit 0 由 root 确认；公开文件是脱敏后的历史证据，不宣称当前可直接重用其授权状态。

最新 B 的 [finalize 摘要](evidence/narrow/b.finalize-command.redacted.json) 仍记录三静态 gate pass、一个相同 writing warning、browser-check not-run；随后独立 [browser-check](evidence/narrow/b.browser-check.redacted.json) 记录 pass、当时 provenance=current、零 diagnostics，绑定新 B SHA。A 未改且未重跑，沿用前述 A 证据。旧顶层 B `*.redacted.json` 与 evidence/final/B 仍明确属于修正前 23fcc… 父产物；新增 B sidecar 脱敏副本保存在 evidence/narrow/，没有覆盖旧 final 历史。

实际 UI、交互图与窄屏观察已由 root 独立记录在 [root-review/review.md](root-review/review.md)，含 14 张逐张检查的截图；其中旧 B native 图片保留旧父产物身份。正文词语入口、触摸与辅助技术不在本轮完整验收范围。

## 复现

从仓库根目录运行；这是复现说明，本轮归档没有重跑产品。先按仓库 [本地 setup](../../CONTRIBUTING.md#local-setup-and-verification) 准备依赖及 Chrome。这里实际运行环境为 Node **v26.12.0**、zlib **1.2.12**，不是官方 Node 22；[runtime.json](evidence/runtime.json) 保存执行上下文。没有构建 canonical ZIP，因此未使用 ZIP 专属工具链。各阶段内部实际命令可在相应 `*.finalize.redacted.json` 查看。

```sh
node -p 'JSON.stringify({executable:process.execPath,node:process.versions.node,zlib:process.versions.zlib})'
node archify/bin/archify.mjs finalize explainer experiments/conflict-explanation/a.archify.md experiments/conflict-explanation/a.html --quality showcase --json > /tmp/conflict-a-finalize-repro.json
node archify/bin/archify.mjs finalize explainer experiments/conflict-explanation/b.archify.md experiments/conflict-explanation/b.html --quality showcase --json > /tmp/conflict-b-finalize-repro.json
node archify/bin/archify.mjs browser-check experiments/conflict-explanation/a.html --json --require-provenance --out-dir /tmp/conflict-browser-a-repro > /tmp/conflict-a-browser-repro.json
node archify/bin/archify.mjs browser-check experiments/conflict-explanation/b.html --json --require-provenance --out-dir /tmp/conflict-browser-b-repro > /tmp/conflict-b-browser-repro.json
```

fresh finalize 会写入本机有效的 `.delivery.json` 与 finalize receipts；随后 browser-check 才能使用其 provenance。新运行应保存新的输出 SHA、运行环境与结果，不把本记录 hash 假定为跨版本字节复现保证。公开副本脱敏不应再改 live sidecar；如要分享，复制后重命名 `.redacted.json`，保留 raw/public 两种 hash。已提供的 HTML 可直接打开阅读，无需先生成 sidecar。

## 限制与 AI 披露

**窄视口的交互成本：** 390px 下 native 图初始文字偏小，工具条不能同时显示所有按钮。实际水平滚动工具条后，100% 和放大按钮均可到达；两次点击放大达到 150%，节点更大，同时有节点超出图的左右可视范围，需要平移查看。Escape 返回打开按钮已验证。此检查是窄桌面视口，不是手机触摸或辅助技术验收。此次只缩短表头，没有修改共享 Viewer；实际截图与观察见 root-review/review.md。

只有一个刻意选定的上游失败 fixture，没有自然任务样本、随机分组、读者计时或人类理解验收。未运行 PubGrub、solver 全测试或项目全套测试；也没有 PR、CI、合并、部署或上线结论。静态与自动 browser 检查解决生成一致性和机器可测边界，不能证明 B 更快或更有用。版本图被人工编码，后续源变化需手工重新核对。

Codex agents 参与来源核对、文稿、生成、自动检查、语义审查与证据整理。执行作者按 `gpt-6.1-terra` / medium 配置启动，独立审查与证据整理按 `gpt-6.1-sol` / medium 配置启动；root 的底层模型身份未单独记录。该材料未声称已经由人类审阅或认可。

## 后续：精确节点链接对照 C

[term-links](term-links/README.md) 保留原 A/B 字节，只将 B 的两个现有包名改成既有节点链接。实际键盘打开与返回已验证，增加292 bytes；详情浮层遮挡和“外部系统”泛化标签仍存在，因此仍是研究样例。旧阶段图片、SHA与成本记录不改绑定。


## 第 57 批：uv 本地候选范围实测

[native-uv](native-uv/README.md) 追加 metadata-only wheel 的原生离线求解对照：缺 bar 退出 1，仅补 bar 1 后退出 0，解中保留 baz。两次末轮输出一致，成功日志仅计时不同；保留首轮 Python 版本警告、两张实际页面图片、来源许可和复现脚本。这是 uv 的合成 Python 分发包案例，不是运行上面的 PubGrub Rust fixture，也没有重演 open3d 历史索引。原生报告已经明确包位置范围，暂不新增图或 importer。旧 A/B/C/D 与其验证边界不变。
