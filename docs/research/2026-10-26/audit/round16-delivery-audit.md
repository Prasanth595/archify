# Round 16 Ninja 原生证据只读审计

未重跑 bootstrap、probe、编译或浏览器，未修改仓库。以审计时快照为准。

- Manifest 的 124 个路径均存在，SHA-256 和字节数匹配。固定 `source-tree.json` 的 195 blob 全部与本机临时源码目录的 Git blob 和 size 匹配，tree JSON 的 SHA-256 匹配 root verification。源检验明确发生于 bootstrap 后，并无完整前置验证。保存的 COPYING 与该源码副本字节一致。
- 现存 Ninja 二进制 SHA-256 与 root metadata、summary、source verification 一致；probe.py SHA-256 与 metadata 和 summary 一致。11 项 native exit 全为 0；`-d explain` 的六份非空 stderr 是诊断，不是退出失败。
- action log 是 `oo.h, foo.o, oo.h, oo.h`；clean/missing/updated 六份 before/after 中 foo.o 的 hash、bytes、mtime 全相同；updated 的 oo.h.in 前后内容 hash、bytes 和 mtime 一致。updated explain 指出输入较新，实际命令只复制生成 oo.h。原生 query 明示 `|| oo.h`，本 fixture DOT 已含 `style=dotted`；不能声称此例丢失 order-only 标记。
- 便携脚本用 `tempfile.mkdtemp` 新建报告与 fixture，仅删除自己 fixture 的 oo.h；没有重设 HOME，使用复制动作而非编译 foo.o，阶段使用人工设定的历史 mtime。原始固定报告目录与便携脚本的差异可由保存的两份脚本核验。README 正确限定这些事实与无自然构建/人类收益证据。
- README 与两个指定 scout 的相对 Markdown 链接均存在，round16-dedup.json 可解析。build scout 首段为初轮只读判断，末尾明确后续 native 对照与 DOT 修正；正文仍有“若 root 授权”“本轮没有执行”等历史措辞，建议加明确的初轮时间限定，避免误读为需要重新授权或最终未运行。

源码和二进制身份核验基于现存本机临时副本及已保存树记录，本次没有重新联网获取上游内容。


Root后续：已明确build scout前四节为初轮状态，去除需要再次授权的措辞，并指向末节已完成的执行。该修改只澄清时态，未改变原始记录或审计过的native manifest。

Root文字澄清：native README将“无副作用”改为复制仅写入本次新fixture，并更新manifest中的README哈希。执行数据与脚本未改。
