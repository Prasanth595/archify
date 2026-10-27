# Round 15 交付只读审计

核对范围：`audit/round15-stack-native` 和指定五个 scout；未运行 probe、测试或浏览器，也未修改仓库。

- Manifest 24 条路径均存在，SHA-256 和字节数匹配。49 条 source blob TSV 与 root JSON 的路径和 Git blob 一致；本机现存 `/tmp/archify-round15-stack-native/source-raw` 的 49 个文件，Git blob 和 SHA-256 均与记录匹配。保存的 MIT LICENSE 与该源码副本字节一致。
- 历史、fresh、root 的保存日志均可见默认 `m-feature`、none `x-feature`；fresh 与 root 的各状态均记录 exit 0、stderr 空，外层 exit 0。root 保存的临时仓库仍存在，独立只读 Git 查询得到相同 tree `569d3f8edb348bf01c3ca01a5fdef9f5c44347e7`，feature 非 develop 祖先（exit 1），与 receipt 一致。
- 当前 `probe-fresh.sh` 使用 mktemp 全新 `/tmp/archify-stack-replay.*`，无 HOME 赋值，无删除动作；README 的干净环境调用禁用 system/global Git config。和保存的历史 fresh 脚本比较，恰为 README 所述三项：清单相对脚本、临时仓库独立路径、`git hash-object --no-filters`。历史首版固定路径并重设 HOME 也如实记录。没有执行脚本。
- README 和五个 scout 的相对 Markdown 链接全部存在。文档把 nbdime 内容标为上游截图/源码推导而非本轮 native 运行；Radar 报告明确没有发现回归、不是修复；不声称人类收益或测量提升。stacked scout 的原只读结论由末尾后续原生运行段落限定，未混称同一时点。

本结果基于核对时快照；raw source 与合成仓库在本机临时目录，不能保证跨机器持久存在。上游固定 commit 本次未联网重新取证，源身份核对为现存副本与已保存记录的一致性。
