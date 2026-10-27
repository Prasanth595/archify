# Batch 17 独立交付只读核对

**Ready，限于保存证据的一致性和下述范围；无阻塞项。** 未重跑测试、finalize 或浏览器，未处理或修改隐藏资源。2026-10-28 快照；root 更新 README 复现目录后重新核对 188 项 manifest，全部路径、SHA-256、字节数匹配，无未列文件。

- 148 条 native raw/public 映射中，143 个明确本地 raw 路径及全部 public 内容、字节、hash、声明的 home 前缀替换均一致；其余 5 条 `source: workspace input` 是非路径身份标记，公开输入存在，raw/public 声明哈希和字节均与输入一致，不能称为对独立原始路径的核验。17 条 UI harness raw/public 映射和转换均匹配。本机 `/tmp` raw 文件不保证永久保存。
- 五输入 × 双臂的 10 份 delivery 和 finalize receipt 的 input/artifact hash 与文件吻合，四 gate 均 pass，browserCheck requested/ran 均 true。两次 zero 失败回执与各自原始输入 hash 匹配，分别 deliver fail 和 validate fail，各自无 HTML；未混入最终成功数。
- 独立抽取五对主 SVG 均字节相同，hash/长度与 comparison.json 一致。19 条 DOM observation、17 张 PNG 均存在，所关联截图尺寸与记录 viewport 一致；八组比较的选中节点/边数、URL、记录面板几何与 observation 一致。英文 900 高配对几何一致；1100 高补充组不一致，README 正确排除其几何像素比较。中文 zoom 两侧都是 null，无法证明 zoom 一致，README 已指出；不将其他人的截图检查冒充本次视觉复验。
- 无 locale override 双臂默认，显式 en override 双臂保留 title、instruction 和 guide 三项，observations 与 README 一致。长图底部及短图顶部裁切、窄画布限制均按 README 保留，不作为修复或移动/AT 验收。
- 保存日志记录 focused 46/46、core 19/19，15 个 canonical SVG 一致；独立源码审查另记其范围及翻译限制。bundle 只有 JSON、文本、脚本、patch、HTML 和 PNG 等证据，未发现无关依赖或二进制。

本结果不证明 hosted CI、合并、安装、全面语言质量或人类理解收益。
