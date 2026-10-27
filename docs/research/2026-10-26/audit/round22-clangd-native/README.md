# clangd 调用位置：一次完整 TU 的原生协议观察

这是研究基线，未通过新增图形实验筛选。它证明当次响应里同一个 caller 可以有两个调用位置，也证明本机服务器拒绝当次 outgoing 方法。没有运行样例程序、生成新的 Archify HTML 或测量读者效率。

## 输入和执行

- 原件：[CallHierarchyTests.cpp](CallHierarchyTests.cpp)，LLVM [679fd35aa02e1a55371f47815a9601ed8432937c](https://github.com/llvm/llvm-project/blob/679fd35aa02e1a55371f47815a9601ed8432937c/clang-tools-extra/clangd/unittests/CallHierarchyTests.cpp)；完整文件保留。
- 输入：[fixture.cpp](fixture.cpp) 是完整 IncomingOneFileCpp raw-string TU，只去除测试位置标记。不是完整 LLVM 测试套件，也不是生产事故。原件 SHA-256 5009ce2a92322ddc35dd6976cbc556b859b4582da04550cbcb26ee5ad4189f6d，输入 SHA-256 0777b17a729966fd10c4fe87b2c121933547734b87e3e213846f9f01788c1e30。
- 许可：[LLVM LICENSE.TXT](LICENSE.TXT)，Apache-2.0 with LLVM exceptions 及原文件通知；此派生 TU 的唯一改动见 [transformation.txt](transformation.txt)。
- Python 3.9.6，Apple clangd 17.0.0，arm64；[版本](clangd-version.txt)、[参数](identity.txt)、[完整 stderr](clangd.stderr)。
- 历史执行源码：[probe.py.txt](probe.py.txt)。其 child env 当时设置 PATH 与临时 HOME；按原字节归档，未改动用户设置。它使用固定临时路径并会写文件，供审查当时行为，不是可直接覆盖本证据目录的推荐命令。
- 启动器 /usr/bin/clangd 与实际 CLT 二进制分开记账；[运行后解析记录](resolved-executable.json) 与 stderr 的 argv[0] 相符，不能冒称运行前二进制指纹。
- 未找到编译数据库，使用 stderr 中的 clangd fallback command。所有源码为 ASCII；UTF-16 由参数与 initialize offsetEncoding 确认，不证明 Unicode 偏移转换。
- harness exit 0、clangd exit 0 表示探针正常结束；outgoing 请求仍是明确失败。没有修复或重跑。

## 实际协议

[已发送帧](client-to-server.raw)共 9 条；[已读取帧](server-to-client.raw)共 7 条，与[解码记录](decoded.jsonl)相同。接收记录截至 shutdown 响应，没有退出后的 stdout drain，因此不宣称穷尽所有可能输出。stderr 原样保留。首次暂存时 Git 提示 raw 帧将被换行规范化；现用此目录内的 `.gitattributes` 禁止 raw 文件文本转换，并在暂存区逐文件核对 SHA，保留 Content-Length 帧头的 CRLF。

| 请求 | 本次响应 |
| --- | --- |
| prepare caller1 | 成功，保留返回 item/data |
| incoming caller1 | caller2 一项包含两个 fromRanges；caller3 一项包含一个 |
| prepare caller2 | 成功 |
| outgoing caller2 | JSON-RPC -32601，method not found |
| shutdown | 成功，随后 exit |

caller2 的 selectionRange 是零基第 5 行 9–16；它的两处 fromRanges 是第 6、7 行 6–13，各自选中 caller1 的调用。caller3 的 fromRanges 是第 10 行 6–13。这三个范围属于 caller 的源文件，不是被调用目标的定义位置，也不是三次动态执行的证据。响应将 /tmp URI 规范化为 /private/tmp，原始 URI 不做改写。

[独立核对](../round22-native-audit.md)已检查帧边界、JSON 副本、完整 TU 转换和逐处源文本。相关报告的历史 source-only 开头、启动器身份、输出完整性声明已在[整理后的报告](../round22-call-hierarchy.md)修正。

## 可复核与复现边界

可直接离线查看四个 prepare/calls JSON、fixture、原始帧及历史脚本，逐项对应请求 ID 和源范围。manifest.json 覆盖本目录除 manifest 自身外的所有文件；copy-map 记录来自临时包的原样复制。

若独立重做服务器观察，应使用新的空工作目录和复制的上游原件，按历史脚本的请求顺序发送消息，保留新的 server/version、环境、编码、完整响应和失败；保留正常 HOME，通过服务器自身配置选项限制配置读取。新运行不是此处记录的同一次执行，URI、opaque data、环境和能力可能不同，不可覆盖这些原始记录。这里没有把修改后的可移植 runner 冒充已经验证的程序。

没有原生编辑器逐点导航、跨文件索引、项目构建、完整调用图、浏览器图像或人类阅读对照。本机一次方法失败也不能证明所有 clangd/gopls 版本均不支持该方法；维护 LSP 生命周期和缓存的成本尚无明确阅读收益支持。
