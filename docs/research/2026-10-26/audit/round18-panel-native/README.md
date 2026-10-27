# PR #1027 与 dev：原生 semantic lens 面板的有界对照

本记录只读评估现有 [PR #1027](https://github.com/tt-a1i/archify/pull/1027) 与 dev，不是新实现或合并后的组合验证。固定 dev `d5d979493bba650b3995836afd379cd249f2d0dd`、PR head `c393fc7fbc321d5b6c4685ca35cd612b75d64083`；两侧已分叉，dev 独有 38 个提交、PR 独有 16 个提交，不能把两份独立结果解释成合并后的行为。PR 作者为 [jahfaliabdulrahman-dev](https://github.com/jahfaliabdulrahman-dev)。Archify 使用 [Apache 2.0](https://github.com/tt-a1i/archify/blob/d5d979493bba650b3995836afd379cd249f2d0dd/LICENSE)，引用的源码和生成物归其贡献者所有。

## 生成与证据边界

长图复用此前已测量的 25-span 示例，本轮未重新测量其构建耗时；单节点短图是刻意构造的有效夹具。两个相同输入分别在两个冻结源码上各运行一次 `finalize waterfall`。四次退出码均为 0，每次 `validate`、`deliver`、`check` 和已实际运行的 `browser-check` 均为 pass，见 [运行记录](evidence/render-summary.json) 和各 [delivery 收据](artifacts/)。这不等于视觉验收或完整产品验收。两组各自的主 SVG 均逐字节相同，HTML 整体不同；方法和哈希见 [artifact comparison](evidence/artifact-comparison.json)。两个源清单各 238 文件在完成后再次核对，内容无变化；见 [PR 清单](evidence/archify-round18-pr1027-source-inventory.json) 与 [dev 清单](evidence/base-source-inventory.json)。

## UI 观察

本地记录共 20 条、10 张截图，由协调人检查；[原始观察](ui/observations.json)、[受控对照](ui/controlled-comparison.json) 和 [Clear 检查](ui/clear-control-check.json) 保留测量。以下是该夹具与视口下的几何、命中测试，不是辅助技术测试：

- 长图在受控第二次比较中，`scrollY=0` 时两侧面板 top 670.375、bottom 928.695，Copy 和 Clear 中心未命中；`scrollY=320` 时面板 top 350.375、bottom 608.695，三个控件中心均命中。横向停靠位置不同，不能声称完整几何一致。
- 短图顶部面板 top 16.070，容器可见裁切顶部约 84.695；Close 中心未命中。六条 Escape 记录均回到 launcher。没有选中项时 Copy 隐藏且矩形为零是 [已有逻辑](https://github.com/tt-a1i/archify/blob/d5d979493bba650b3995836afd379cd249f2d0dd/viewer/semantic-lens.js#L333)，不作为失败。
- 最初长图记录中 dev 的两个滚动位置为 509 / 742，PR 为 0 / 320，不能公平比较；原始截图保留，以上结论使用相同滚动位置的第二次受控记录。

这些结果指出现有面板在该夹具中的可见性与命中边界；不能由此推断 PR 导致问题、合并后仍会复现、真实用户理解收益或跨设备行为。未发布 PR 评论，也未在本次记录中宣称 CI 或屏幕阅读器验证。

## 用两份冻结 checkout 复现

准备两份独立、包含各自依赖的 checkout，分别固定到上述 dev 和 PR SHA；确认 Node 及浏览器检查所需依赖可用。本轮使用官方 Node 22.23.2。下面从本审计目录执行，输出到新建临时目录，不调用安装器或改动 live installation：

```sh
DEV_CHECKOUT=/absolute/path/to/dev-checkout
PR_CHECKOUT=/absolute/path/to/pr-checkout
AUDIT_DIR="$PWD"
OUT_DIR="$(mktemp -d)"
for side in dev pr1027; do
  if [ "$side" = dev ]; then source_dir="$DEV_CHECKOUT"; else source_dir="$PR_CHECKOUT"; fi
  mkdir -p "$OUT_DIR/$side"
  for sample in waterfall-en zero-relationships; do
    node "$source_dir/archify/bin/archify.mjs" finalize waterfall \
      "$AUDIT_DIR/inputs/$sample.json" "$OUT_DIR/$side/$sample.html" \
      --json --out-dir "$OUT_DIR/$side/$sample-receipts" --browser-check
  done
done
```

固定版本、浏览器、输出和收据应一并保存；这里的命令复现生成与 gate，不会自动复现上述交互测量。现场输出和命令见 [artifacts](artifacts/) 与 [脚本记录](evidence/render.py.txt)。
