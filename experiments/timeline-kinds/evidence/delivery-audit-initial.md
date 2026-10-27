# Timeline kinds 交付只读核对

范围：`experiments/timeline-kinds`；未修改目录、重跑测试或浏览器。检查时 README 尚不存在。

## 待修正

`evidence/hash-mapping.json` 共 149 条，其中 5 条 public 路径不存在：`evidence/delivery/candidate-timeline.delivery.json`、`candidate-default.delivery.json`、`baseline-timeline.delivery.json`、`baseline-default.delivery.json`、`first-candidate-timeline.delivery.json`。目录中有相应的 `delivery-` 前缀版本，且另外五条映射已指向它们。应去除过期条目或明确更新映射；不能声称所有 public 路径均可访问。其余 144 条 public SHA-256 匹配；149 条 rawArchive 均存在且 raw SHA-256 匹配。raw 位于本机 `/tmp`，不构成仓库内可持久访问的存档。

`final-checks.json` 的 `trackedMembersVerified: true`、除 package.json 外 234 个成员逐字节相同之声明，在本目录检索未找到独立比对日志；不否认检查曾发生，但目前从交付证据无法复核该项。ZIP 大小 6,999,975 与 `evidence/generated/diff-stat.txt` 一致；235 与 zip-1/zip-2 和 exclusions 输出一致；SHA-256 与 `sha.stdout` 一致，`cmp.exit` 为 0。保留首次 `zip-run-first.exit=1` 和 stderr 的 `run: command not found`；随后 `zip-run.exit=0`，不应描述成所有尝试首次通过。

## 已核对

- 全部 47 个 JSON 文件可解析；14 个截图的 PNG 签名、声明尺寸、SHA-256，以及对应 HTML 的 SHA-256 全部匹配。
- `candidate-after-repair-2.stdout` 记录 379 pass、0 fail、0 skipped；对应 JSON 退出 0。`reuse-npm-test.stdout` 记录 19 pass、0 fail、0 skipped，退出 0；generated 重试退出 0，日志结尾 all checks passed，初次 missing dependency 失败被保留。
- baseline、candidate、first-candidate 输出目录仅有 HTML，未留下 `.delivery.json` sidecar；`evidence/delivery/delivery-*.delivery.json` 是归档证据，不是输出目录 sidecar。
- 全目录文本搜索 `<USER_HOME>` 无命中（包括 HTML）；此结论针对字面路径，不代表所有可能编码或其他身份信息已检测。
- 未做产品质量验收或视觉交互复验。所有结果反映核对时目录状态；并发编辑后需重新核对对应哈希。
