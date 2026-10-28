# jq 的 `.` 此刻指向谁？ {#jq-current-input}

`as` 绑定一个值后，后续表达式仍接收绑定前的输入。普通管道则把左侧输出传给右侧。找不到负责人时，先检查 `.` 指向谁。

- 两种正确写法输出相同，但构造结果前的 `.` 不同。[](source:run)
- 错误写法也可能退出成功，却把负责人变成 `null`。[](source:run)
- jq 手册已经解释这条规则；下图把四组观测放在一起。[](source:manual)

@answer scope="四组固定查询 · jq-1.7.1-apple · 手工观测点"
@meta locale=zh-CN repo_url=https://github.com/tt-a1i/archify repo_revision=b7feaa95486db5128b5bebdd1f68ea8d91c5f3ed
@source run title="两次原生回放：命令、退出码、stdout、stderr、观测值" url=https://github.com/tt-a1i/archify/tree/b7feaa95486db5128b5bebdd1f68ea8d91c5f3ed/experiments/jq-current-input/evidence
@source manual title="jq 1.7 手册 · Stephen Dolan / jq contributors · CC BY 3.0" url=https://github.com/jqlang/jq/blob/71c2ab509a8628dbbad4bc7b3f98a64aa90d3297/docs/content/manual/v1.7/manual.yml
@source input title="完整输入：两项任务与负责人映射" path=experiments/jq-current-input/fixtures/input.json lines=1:16
@source bindOwners title="A：先绑定负责人映射" path=experiments/jq-current-input/fixtures/bind-owners.plain.jq lines=1:1
@source pipeOwners title="B：直接把当前输入换成映射" path=experiments/jq-current-input/fixtures/pipe-owners.plain.jq lines=1:1
@source bindJobs title="C：逐项绑定任务，保留整份输入" path=experiments/jq-current-input/fixtures/bind-jobs.plain.jq lines=1:1
@source lostRoot title="D：切到任务后，整份输入不在当前点上" path=experiments/jq-current-input/fixtures/lost-root.plain.jq lines=1:1

## A 与 B：同一份输入，两次独立运行 {#contrast}

图上的两条路线是两个查询的对照，不是一次执行中的条件分支。`root` 表示含 `owners` 和 `jobs` 的整份输入。[](source:input)

@workflow id=context-flow title="绑定保留输入，管道替换输入"
| root | 整份输入 | backend | source:input |
| kept | 绑定后仍是 root | backend | source:bindOwners |
| replaced | 管道后仅有 owners | backend | source:pipeOwners |
| jobs | 每次一项 job | backend | source:bindOwners |
| fail | 无 jobs，报错 | backend | source:pipeOwners |
| names | Mina 与 Bo | backend | source:bindOwners |
| root > kept | as |
| root > replaced | 管道 |
| kept > jobs | .jobs[] |
| replaced > fail | .jobs[] |
| jobs > names | 变量查表 |

@steps id=context-steps
| inspect-input | 整份输入 | owners 把 u1、u2 映射到 Mina、Bo；jobs 中有 compile、test 两项任务。 | context-flow | root |
| keep-input | 绑定后仍是 root | A 将映射绑定给 $owners；观测点上的当前值仍包含 owners 和 jobs。 | context-flow | kept |
| inspect-job | 每次一项 job | .jobs[] 分别产生 compile 和 test。此时 .owner 是 u1 或 u2；$owners 仍可用。 | context-flow | jobs |
| read-result | Mina 与 Bo | $owners[.owner] 用当前任务的 owner 查已绑定映射，得到两个名字。 | context-flow | names |
| replace-input | 管道后仅有 owners | B 的 .owners 把当前输入变成映射，只剩 u1 和 u2 两个键。 | context-flow | replaced |
| read-error | 无 jobs，报错 | 该映射没有 jobs 字段，.jobs 为 null；.jobs[] 报错，退出码为 5。 | context-flow | fail |

## 每条查询实际运行了什么？ {#queries}

A 保存映射，随后逐项读取任务。[](source:bindOwners)

@code id=query-a source=bindOwners language=jq

B 把当前输入直接换成映射。[](source:pipeOwners)

@code id=query-b source=pipeOwners language=jq

C 每次绑定一个任务，让当前输入继续保留整份数据。[](source:bindJobs)

@code id=query-c source=bindJobs language=jq

D 切到任务后，又试图从当前任务里读 owners。[](source:lostRoot)

@code id=query-d source=lostRoot language=jq

## 相同输出，也可能经过不同上下文 {#results}

“构造前当前值”来自查询中手工插入的观测点。这里比较 JSON 值，不推断对象身份或内存复制。[](source:run)

| 查询 | 构造前当前值 | 可用的绑定 | owner 输出 | 退出码 |
| --- | --- | --- | --- | --- |
| A | 每次一项 job | $owners 映射 | Mina、Bo | 0 |
| B | 未进入构造；当前值已变成 owners 映射 | 无 | 无输出 | 5 |
| C | 整份 root，观测两次 | 每次一项 $job | Mina、Bo | 0 |
| D | 每次一项 job | 无 | null、null | 0 |

@callout level=warning title="退出成功，不等于字段读对了"
| D 中 .owners[.owner] 是从当前 job 查映射。当前 job 没有 owners；本次两个结果的 owner 都为 null。 |

## 怎样复核这张图？ {#verify}

- [ ] 对照完整输入，确认 owners 与 jobs 位于同一层。
- [ ] 对照每组 plain 与 marked 输出；两者的 stdout 和退出码一致。
- [ ] 打开 observed.json，区分 current 值和额外绑定的变量。
- [ ] 将原生输出与图中的 A、B、C、D 逐项对应。

```sh title="在新目录重放四组查询"
python3 experiments/jq-current-input/fixtures/reproduce.py /tmp/jq-context-fresh
```

两次回放各运行 9 次命令、记录 18 个观测值。脚本只运行本机 jq；没有执行 jnv、jqp、jaq 或 gojq。没有测量读者理解率或阅读速度。[](source:run)

任务与负责人数据改编自 jq 手册的文章与作者示例，并增加三组对照及观测点。手册作者为 Stephen Dolan 与 jq contributors，文档采用 [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)。[](source:manual)
