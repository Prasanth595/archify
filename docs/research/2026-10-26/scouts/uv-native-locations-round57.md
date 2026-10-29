# 第 57 批：uv 本地候选范围的原生执行证据

2026-10-29。上一批 Porcupine 实际执行改变了原生基线的证据状态；本批继续补齐已有方向，不开同题分支。实验已推送 [codex/lab-conflict-explanation@5df448ec0](https://github.com/tt-a1i/archify/blob/5df448ec077f4e84ca5b53f6f4b386a3c9a61b25/experiments/conflict-explanation/native-uv/README.md)，远程完整 SHA 为 5df448ec077f4e84ca5b53f6f4b386a3c9a61b25。没有新 PR。

## 查重与输入选择

先保存 [333 条远程 head](../audit/remote-branches-round57.txt)；相对上批，仅看到上一批交付的 operation-order 与 research hub 前进。conflict-explanation 仍为 4805f166d，dev 仍为 847146aeb。现有 [冲突解释研究](dependency-conflict-reading.md)已经包含 PubGrub 与 uv，不能把它们当作新发现；task-view 也已在前批覆盖。本轮 pubgrub/uv 的 issue、PR 分开查询，只有 uv 命中 Windows lstat #1012 与生成性能 #208，标题范围不同；[查询记录](https://github.com/tt-a1i/archify/blob/5df448ec077f4e84ca5b53f6f4b386a3c9a61b25/experiments/conflict-explanation/native-uv/remote-and-source.json)保留计数与命中，不能作为全局无重复证明。

本机有 Rust 工具链，但 priority-queue 的 crate archive/source 预查无命中；没有补装或试图修改求解器以绕过依赖。原 PubGrub Rust fixture 仍未执行。uv 已安装为 0.13.1，因此选择有界的原创 Python 分发包对应例：root 1 要求任意 foo/baz，foo 1–5 各要求任意 bar，baz 1 无依赖。八个 wheel 均只有 METADATA/WHEEL/RECORD，无包代码或构建脚本；这是合成输入，不是 open3d 历史索引或 Rust 整数版本模型的等价性证明。

## 实测与复跑

| 本地输入 | 结果 | 阅读边界 |
| --- | --- | --- |
| 七个基础 wheel，不提供 bar | exit 1；完整报告明确 bar 不在 provided package locations 中 | 不能推论公网没有 bar；报告没提 baz 不等于输入缺 baz |
| 保持基础输入，仅增加 bar 1 的 find-links 目录 | exit 0；bar==1、baz==1、foo==5、root==1 | 是求解结果，没有安装或运行这些包 |

[完整记录与复现](https://github.com/tt-a1i/archify/blob/5df448ec077f4e84ca5b53f6f4b386a3c9a61b25/experiments/conflict-explanation/native-uv/README.md)保留三个运行目录。首轮目标 Python 3.12 不可用，uv 提示将用本机 3.15.0 构建依赖；完整警告及当时脚本保留，没有声称执行了 Python 3.12。末轮改用已有 3.15 并禁用 build，保持 offline/no-index/no-cache/no-python-downloads/no-managed-python、显式空配置与环境变量白名单。两次末轮失败 stdout/stderr 和成功 stdout 字节一致；成功 stderr 仅 0.58ms/0.61ms 计时不同，不作性能基准。

## 实际页面与来源

![原始输出审阅包装实拍](https://raw.githubusercontent.com/tt-a1i/archify/5df448ec077f4e84ca5b53f6f4b386a3c9a61b25/experiments/conflict-explanation/native-uv/browser/native-output-overview.png)

该页是从 run2 四份完整原始流生成的静态审阅包装，不是 uv 原生 GUI、Archify 新阅读器或原生图形导出。四段 DOM 文本逐字匹配原文件，HTML SHA 绑定本地服务文件；两张 1291×762 截图均逐张查看。首张底边接近边界说明，滚动后第二张显示完整页脚；滚动过程的瞬时坐标没有伪装为稳定终点。未测窄屏、辅助技术或人类理解速度。服务已停止，空间 3 / p1 回到 about:blank。

uv 0.13.1 的 lightweight 标签固定到 62faed3351；原 compile 文档、MIT、Apache-2.0 三份文件与 Git blob 一致。已安装 Homebrew 二进制单独记录 SHA，不以标签证明二进制构建来源。原 PubGrub 测试和 MPL-2.0 继续由既有实验保存；没有复制求解器实现。tag endpoint 的 404 与 contents 返回文本导致的 JSON 读取失败也有说明，不算产品缺陷。

[验证记录](https://github.com/tt-a1i/archify/blob/5df448ec077f4e84ca5b53f6f4b386a3c9a61b25/experiments/conflict-explanation/native-uv/verification.json)覆盖八个 wheel 的声明与 RECORD、完整目录、原始日志身份、复跑、三个上游 blob、四段 DOM、两张 PNG 和 156 个未改的历史文件。新增包 [manifest](https://github.com/tt-a1i/archify/blob/5df448ec077f4e84ca5b53f6f4b386a3c9a61b25/experiments/conflict-explanation/native-uv/manifest.json)登记 50 份文件、388657 bytes，排除 manifest 自身。原始浏览器日志导致全量 diff-check 三条 EOF 空行提示；排除原始日志后的 authored 检查通过，二者分开记录。没有改写旧 Archify A/B/C/D 或宣称运行产品/上游全套测试、hosted CI。

## 筛选结论

原生完整报告已经保留包位置边界；完整成功解又证明本合成输入中的 baz 仍被选中。当前没有证据说明追加依赖图能给读者带来足够增益，因此只保留可复现证据，不新增图、通用 parser 或共享运行时。成本为分支中的 fixture、命令驱动器与静态审阅包装，后续按版本人工维护。原 PubGrub 执行、open3d 冻结索引与真实读者收益仍是不同的未验证事项。持续目标保持 active；仅推远程分支，不提新 PR、不合并、不发布、不安装。
