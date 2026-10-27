# Git Machete 原生状态对照

固定 [git-machete 9578cc2a38d5dbca3c0551857802b28bfb1255ee](https://github.com/VirtusLab/git-machete/tree/9578cc2a38d5dbca3c0551857802b28bfb1255ee)。完整MIT许可与署名保留在 [LICENSE.git-machete](LICENSE.git-machete)，[49个Git blob](source-blob-manifest.tsv)对应48个Python文件和LICENSE。作者与root分别核对源码哈希；不在Archify产品里引入该库。

## 问题与观察

同一个四层声明堆栈root→develop→feature→child，在develop中squash feature后，默认检测输出`m-feature`；`--squash-merge-detection=none`输出`x-feature`并列feature的两个提交。两条状态命令均exit0，stderr为空。

这两种结果不矛盾：[root的额外Git查询](root-replay.json)确认develop与feature的tree SHA相同，但feature不是develop祖先（`merge-base --is-ancestor`退出1）。内容已合入和原提交可达是两个不同问题；`.git/machete`的声明边也不是Git parent边。

这是改编自[上游完整测试](https://github.com/VirtusLab/git-machete/blob/9578cc2a38d5dbca3c0551857802b28bfb1255ee/tests/test_status.py#L304-L465)的合成临时仓库。本地没有remote，没有upstream测试中的ahead of origin行；没有运行后续traverse、rebase或删除分支，也不复现Git Town #4222。不能据此保证实际用户仓库可安全同步。

## 复现

使用已有Git与Python。取得上述固定上游源码checkout后，在本目录执行（不安装依赖，不使用用户工作仓库）：

```sh
env -i PATH=/opt/homebrew/bin:/usr/bin:/bin /bin/bash ./probe-fresh.sh /absolute/path/to/pinned/git-machete
```

PATH应指向本机已有的Git/Python3；已验证环境是Python3.15.0和Apple Git2.50.1。脚本先核对固定源码清单，在新建的`/tmp/archify-stack-replay.*`目录建立合成历史，保留它供检查。脚本没有删除动作，不覆盖已有目录。使用干净进程环境、禁用Git全局/系统配置并指向本地空hooks目录；不改写HOME。

原始两次记录和root第三次独立复现分开保存，commit ID和临时目录不同；不能把它们称为同一个仓库运行。第一次脚本使用固定目录并重设子进程HOME，作为历史证据存于[historical](historical/)，不是推荐命令。第二次改用新目录并取消HOME设置；root仅将清单位置改成脚本目录、临时仓库移到独立/tmp目录，并明确使用无过滤的blob hash，然后验证这个可移植脚本。三次都观察到m/x差异，不是三个人类阅读试验。

## 证据与边界

[作者最终回执](fresh-receipt.txt)、[root回执](root-replay.json)、[完整输出](root-replay.stdout)和[文件清单](manifest.json)记录对应身份。初次取得源码曾发生下载超时、克隆中断和SSL EOF，后通过固定raw文件及Git blob校验；原始残片保留在本地，未发布。回执记录各session退出状态，初始无session下载只有当前进程检查，不伪造完整历史生命周期。

[配置读取审计](config-read-audit.txt)是源码检索。代码库另有托管服务凭证读取路径；本例不配置remote或托管选项，未发现status路径调用它，但没有系统调用跟踪，故不声称整个进程只读取仓库文件。没有安装、网络push、Archify源码改变、浏览器验收或速度收益结论。

这份原生证据用于否决“两个状态冲突，所以需要另造Git图”的假设。若未来有真实完整交接任务，再与带模式说明的原生`status -l`和`fork-point --explain`对照；当前不新增Archify图或同步器。
