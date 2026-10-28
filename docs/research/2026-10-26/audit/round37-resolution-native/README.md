# 条件解析原生观察包

完整筛选结论见[第 37 批报告](../../scouts/resolution-models-round37.md)。三份原创测试包分别缺 ESM 声明、补齐声明、缺实际 ESM 文件；参考 Are the Types Wrong 的公开问题说明，不是其官方测试集。

- `run-1/`、`run-2/`：全部输入、三个确定性 tgz、原始输出与 `commands.json`。绝对 cwd 是当时临时目录，归档没有改写输出。
- `reproduce.py`：仅 Python 标准库、已存在的 Node 和 TypeScript。创建全新输出目录，不安装、不发布；通过 package 自引用直接运行原创代码。
- `verify.py`、`verification.json`：检查这份固定归档的三组结果、16 对经明确路径替换的输出、三个字节一致的 tarball 配对及 16 个来源文件。不是通用 trace parser。
- `browser/`：11 个实际操作脚本、11 份日志、6 张 1440×900 PNG、最后展开的可见 DOM 文本。脚本记录原会话，不应对其他页面盲目重放。
- `sources/`：固定 revision 的完整上游文件和全部许可；`manifest.json` 含上游核对后的 Git blob、长度和 SHA-256。ATW MIT © Andrew Branch 2023；publint MIT © Bjorn Lu and publint contributors 2026；Node 许可与第三方通知完整保留。
- `typescript-50762.json`、`taskview-head.json`、`dedup.json`：当前读到的外部状态与有界去重结果。

本次已有环境：Node 22.23.3、全局 TypeScript 5.8.3、macOS。没有安装这两个工具或修改全局文件。网页自报 TypeScript 5.6.1-rc / core 0.18.5，不是本地编译器版本。

复现时指向已存在的相应工具；输出目录必须不存在：

```sh
python3 reproduce.py --output /tmp/archify-resolution-fresh \
  --node /absolute/path/to/node-v22.23.3/bin/node \
  --tsc /absolute/path/to/typescript/bin/tsc
python3 verify.py
```

预期 `(tsc exit, Node exit)`：缺声明 `(2,0)`、补声明 `(0,0)`、缺运行文件 `(0,1)`。第一例 TS2322 和第三例 ERR_MODULE_NOT_FOUND 是被保存的原生结果。`verify.py` 检查既存归档，另一次复现的根路径不同，完整输出不可直接按字节比较。

浏览器复核：在 https://arethetypeswrong.github.io 的文件选择入口依次选择 `run-1` 的三个 tgz，不需要填写 npm 名字或发布包。读取网页自身版本；第三例展开 Details / entrypoints / . / resolutions / node16-esm / implementationResolution / trace，对照原生 Node stderr。该字段来自 TypeScript 模型，不是实际执行轨迹。未来网页或引擎版本变化应另存观察，不覆盖本次证据。

没有执行不可信第三方包，没有运行 publint、Node 16、最新 TypeScript 或上游 suite。没有改 Archify 产品代码，故未运行无关 renderer/core suite、构建 ZIP 或生成额外图页。静态报告不构成人类阅读收益证明。
