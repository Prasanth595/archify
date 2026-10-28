# 第 33 批：Jless 阅读身份启发的 Finder 计数修复

2026-10-29。按最新授权只交付远程分支，不创建 PR。工作前核对 329 条远程 heads，较第 32 批无新增分支，只有本总账 head 变化。fx/gron、Finder context、authored relationships 等既有方向继续去重。

## 筛选与实测

[Jless](https://github.com/PaulJuliusMartinez/jless/tree/e6cdef719c7319020391d6bbf838ab272ce44cf0) 固定到 `e6cdef719c7319020391d6bbf838ab272ce44cf0`，作者 Paul Julius Martinez，MIT。其 `src/search.rs` 区分正则匹配数与折叠容器的可见定位目标。只做源码研究，没有安装或执行 Jless；没有复制其代码。没有为 path-copy、通用 JSON 导入或折叠导航另建重复实验。

核对 Archify 身份规则时发现 Finder 按端点对去重，Passport 已按关系 key 去重。原生 Cache Miss 时序图未改一字：Redis 的读缓存、未命中返回、写缓存共 3 条，Finder 显示 2；API 10 条显示 9。实际浏览器复现了这个差异。这个具体错误支持小范围修复，没有人类阅读速度或生产采用结论。

相关 Draft #795 固定 head `879300698a51ef78fcab40bf4e98b89968760fb0` 是关系查询不可用声明，仍保留端点对计数；其暂停范围没有推进。检索返回与完整 heads 保存在实验分支。

## 已交付

独立工作区 `/Users/tsk/.codex/worktrees/lab-finder-link-count/archify`，基线 `dev@847146aeb93b492592adb78dc220f57e4a8b4636`。

- 远程分支：[`codex/lab-finder-link-count`](https://github.com/tt-a1i/archify/tree/codex/lab-finder-link-count)。本地和远程 readback 一致：`b91366b99e75fd3157fb4fed98489099eb89a383`；工作区干净。
- [固定版本的完整说明、来源与复现步骤](https://github.com/tt-a1i/archify/tree/b91366b99e75fd3157fb4fed98489099eb89a383/experiments/finder-link-count)。产品计数代码仅修改两行，复用已有 key / 端点+标签规则；无新依赖或状态，图形 SVG 字节相同。
- 七张 Ego 实际页面图片已查看，含同条件明暗前后图、Passport 和窄屏；另有原测试套件输出的四张截图也已查看。浏览器库存中旧研究空间已不存在，按用户此前授权重建为 TaskSpace 2，未操作用户空间 1。持续目标尚未结束，研究空间保留供后续工作。
- 原始代码的新增回归在原生输入上失败：API 9 vs 10。最终 Finder 9 项通过，核心 CLI / 关系元数据 20 项通过，均零跳过；generated/golden 与产物检查通过。
- 官方 Node 22.23.3 / bundled zlib 1.3.1-e00f703 两次构建 ZIP 字节相同，SHA-256 `c5b66e17a0caa80b5854f8a515ffa4962b76602d2e11054962ee6f5e9e21df33`。模板与 20 个归档 HTML 源字节一致。
- 最终 manifest 的 95 个文件哈希复核通过。39 条 whitespace 提示均为原始 HTML / 原始工具输出，保留原字节；诊断另以 JSON losslessly 记录，源码/测试/说明的 scoped 检查通过。

两次补充夹具被已有 Sequence 校验拒绝：不支持自消息、画布没有给图例留够空间。失败日志完整保留；最终调整为支持的原生跨参与者消息和 620 高度，没有降低校验。最初 npm 选中 Node 26，最终红绿与核心测试固定官方 Node 22。复用锁文件相同的已有依赖并移除临时链接，没有安装。

没有执行完整测试库存、全浏览器、WebM 编码或跨平台 CI。没有合并、发布、部署、安装或创建 PR。缺少 key 的旧 SVG 仍无法区分同端点同标签的独立关系，与现有 Passport 限制一致。

本批属于有原生输入和实际错误数字支持的产品修复候选；后续继续筛选新的具体阅读任务，避免把通用 JSON 阅读器或当前计数方向再次包装为新实验。
