# Timeline kinds 最终交付复核

复核时 `evidence/hash-mapping.json` 有 144 条且 public 路径唯一；全部 public 与 rawArchive 文件存在，SHA-256 均匹配。此前 5 条失效路径已消除。rawArchive 位于本机临时目录，跨机器或清理后不保证可访问。本次结果是本次快照，后续新增映射须重新核验。

`evidence/zip-members.json` 的 235 条与 `/tmp/archify-round13-generated/build-2.zip` 完整成员集合一致；ZIP SHA-256 为 c002107b581918105fff1099cdc272bdda696272f93af0c2de5e9706c4bdb633。全部成员的 ZIP 和当前源文件哈希均匹配清单，234 项两侧相同；唯一例外 `archify/package.json` 经实际 JSON 比对，恰为移除 `scripts` 和 `devDependencies` 两个字段，其余内容相同。此次为读取既有 ZIP 和源码，没有重新构建。

README 中所有相对 Markdown 图片/链接均存在；两条上游示例源码路径在所列 d5d97949 commit 存在。复现命令参数顺序和选项与当前 `archify finalize --help` 一致，两个输入路径存在；未实际运行命令、测试或浏览器。README 的产品和测试结果没有做超出上述范围的重新验收。

前次审计的 47 个 JSON、14 截图、379/19 日志和输出 sidecar 检查结果详见 `/tmp/archify-round13-delivery-audit.md`；本次未重做这些检查，新增或修改文件不受其覆盖。
