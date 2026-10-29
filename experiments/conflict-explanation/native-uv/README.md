# uv：本地候选范围的原生执行对照

2026-10-29，第 57 批。继续既有 `codex/lab-conflict-explanation`，基线 `4805f166d0c3078f06e7b309f1594c788b79ee5f`。这是 uv 的完整离线合成输入及实测输出，不是运行原 PubGrub Rust fixture，也没有重演 open3d 的历史索引。

**处置：补齐原生基线，暂不新增图或 importer。** 本例的 uv 完整错误已经说清 bar 不在本次提供的包位置中，不能把它弱化为“bar 在公网不存在”。baz 出现在输入和成功解中，未出现在失败解释中；原生文字已经足以支持这两个判断。没有读者实验，不能据此断言额外图示改善或损害理解。旧 Archify A/B/C/D 产物不变；此执行不追认旧 Tree 模型，也不把 Python 版本语义等同于 Rust 整数版本集合。

## 输入、执行和控制

[probe.py](probe.py) 用 Python 标准库生成八个确定字节的 wheel。每个仅含 METADATA、WHEEL、RECORD，没有 Python 模块、入口点、源码包或构建脚本。完整目录与摘要见 [wheel-manifest.json](wheel-manifest.json)，顶层要求为 [root==1](requirements.in)。

| 输入 | 本地候选 | 实测结果 |
| --- | --- | --- |
| 缺少 bar | root 1 要求任意 foo、baz；foo 1–5 各要求任意 bar；baz 1 无依赖，共七个 wheel | exit 1；stdout 为空；完整 stderr 明确 `provided package locations`，没有提到 baz |
| 提供 bar | 同一目录、同一要求，仅增加一个包含 bar 1 的 find-links 目录 | exit 0；选定 bar==1、baz==1、foo==5、root==1 |

原生完整命令保存在每次 run.json；不要仅复制 uv 输出头部的命令，它没有列出这次实际传入的 find-links。最终命令固定 Python 3.15、aarch64-apple-darwin，使用 `--offline --no-index --no-cache --no-python-downloads --no-managed-python --no-build` 和显式空 [uv.toml](uv.toml)。只继承 PATH、HOME、TMPDIR、LC_ALL，不继承 UV/PIP/虚拟环境变量。没有运行 install、sync、包代码、网络 registry 或构建步骤。

已安装程序自报 `uv 0.13.1 (Homebrew 2026-10-14 aarch64-apple-darwin)`；可执行文件 SHA-256 为 `cfe5e5695316639f9820e8e57d0732e8a361311c03f1ea1786f4fc879cebf4c5`。宿主 macOS 26.7.2 arm64，生成器 Python 3.15.0。没有重新构建或证明该 Homebrew 二进制与 Git 源码逐字对应。

## 保留的运行与页面证据

- [run1/run.json](run1/run.json)：首轮目标为 Python 3.12，尚无 no-build 参数，两个结果已分别为 1/0，但 stderr 警告本机没有 3.12，将用 3.15.0 构建依赖。全部输入仍是 wheel。保留 [当时脚本](run1/probe.py)和原始 stdout/stderr，没有删除警告或声称执行了 Python 3.12。
- [run2/run.json](run2/run.json)、[run3/run.json](run3/run.json)：改为现有 Python 3.15 并明确禁用 build 后的两次运行。失败 stdout/stderr 与成功 stdout 字节一致；成功 stderr 分别报告 0.58ms / 0.61ms。原始计时保留，不据此比较性能。
- [index.html](index.html) 是 [build-view.py](build-view.py) 从 run2 四份完整流生成的审阅包装，**不是 uv 原生 GUI**；不截断提示或替换错误措辞。[DOM 记录](browser/observation.json)核对四份文本全部与原文件相等，HTML SHA 同时记录。
- [总览实拍](browser/native-output-overview.png)、[滚动后页脚实拍](browser/native-output-footer.png)均在 Ego 空间 3 / p1 实际拍摄并逐张查看，1291×762。页面高 798px，首张底边接近边界说明；第二张显示完整页脚。End 键后的 DOM 记录在滚动动画中为 scrollY=16.5，不用该瞬时数值声称截图最终位置。没有窄屏、辅助技术或 uv GUI 验收。
- [verify.py](verify.py)检查 wheel 中的声明、RECORD、完整目录、日志与命令身份、复跑、源码 blob、DOM 文本和旧实验字节；[verification.json](verification.json)保存结果。[manifest.json](manifest.json)列出整个新增包的文件 SHA-256 和字节数，排除自身。

## 复现

需要已有 uv 和 Python；脚本不安装或下载依赖。保持 fixture 目录不变，从仓库根目录运行，使用新的输出目录名，避免覆盖历史记录：

```sh
python3 experiments/conflict-explanation/native-uv/probe.py replay-local
python3 experiments/conflict-explanation/native-uv/verify.py
python3 experiments/conflict-explanation/native-uv/build-view.py
python3 -m http.server 8877 --bind 127.0.0.1 --directory experiments/conflict-explanation/native-uv
```

打开本机的 `/index.html`。build-view 默认展示冻结的 run2；新 replay-local 结果需直接阅读其中的文件，不能把旧页面误认成新运行。verify 检查冻结 run1/2/3；新运行应另行比对 exit、四个包与原始文本。浏览器 `.mjs` 是本次空间 3 的操作记录，不应在别人的同编号空间直接重放。不同 uv 版本可能改变报告措辞和选取策略；当前结果不保证跨版本字节一致。

## 来源、查重与限制

包声明形状借鉴 [pubgrub-rs/pubgrub@2b32d6a1 的 confusing_with_lots_of_holes](https://github.com/pubgrub-rs/pubgrub/blob/2b32d6a1b0b7b6021d2658a274d6fb7b613c5796/tests/examples.rs#L229-L268)。原 [完整源码](../source/examples.rs) 与 [MPL-2.0](../source/LICENSE) 已由此分支保留。Python wheel 生成与审阅包装是本轮原创；没有复制求解器实现。PEP 440 的版本与候选域不是原来的整数集合，uv 也不是原库的同一运行。当前 PubGrub 主分支是 353134f5，旧 fixture 的固定版本不随之更换。Rust priority-queue 的本地 crate archive/source 预查没有命中，未尝试编译、补装或宣称原库执行失败。

uv [0.13.1 标签](https://github.com/astral-sh/uv/tree/62faed3351cfee2121b3c28b937b1f4b93233a93)对应 commit 62faed3351；保留原 [compile 文档](source/compile.md)、[MIT](source/LICENSE-MIT)、[Apache-2.0](source/LICENSE-APACHE)，三个文件均与 [Git blob](source/blobs.json)一致。标签是 lightweight commit ref；一次误用 annotated-tag endpoint 的 404 也保留在 [远程记录](remote-and-source.json)。对 contents endpoint 的一次 JSON 解码失败源于连接器返回原始文本，随后通过 git tree 读取 blob 元数据；不是产品执行失败。

开工前核对 333 条远程 head，复用现有方向，没有重开同题分支。对 Archify 的 pubgrub/uv issue 与 PR 分别查询；仅 uv 命中 #1012 Windows lstat 和 #208 生成性能，标题所述不是此本地求解输入。这是有界查重，不证明全库没有关联工作。task-view 已在前批覆盖，本批没有把它重新算作新发现。

成本止于八个 metadata-only wheel、一次有界命令驱动器和静态证据包装。没有共享 renderer/schema/Skill/依赖修改，没有通用报告 parser。源码、fixture 和记录需按固定版本人工维护。未运行项目测试套件、上游全套测试或 hosted CI；没有自然任务、完整 registry、安装/运行结果、唯一最小冲突或人类阅读收益证据。Codex 完成来源核对、代码、执行和页面检查；没有声称人类已审阅。仅远程分支交付，不提新 PR、不合并、不发布、不安装。

全量 staged diff-check 保留三条 EOF 空行提示，均来自原始 Ego stdout；[检查记录](whitespace-check.json)区分这一结果与排除原始浏览器日志后的 authored 检查通过，没有改写日志来消除提示。本轮检查后已停止 8877 本机服务，研究页回到 about:blank。
