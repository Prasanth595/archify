# baz 写进 schema，为什么仍被拒绝？ {#schema-coverage}

案例 2 中，`baz` 分支失败，不能贡献属性覆盖。`anyOf` 成功，但 `baz` 仍未覆盖，整体校验失败。

- 写在 schema 中，不等于被成功分支覆盖。[](source:core)
- 两个分支同时成功时，`anyOf` 汇总两者的覆盖。[](source:core)
- 主错误只指出遗漏属性；分支原因来自额外的独立检查。[](source:run)

@answer scope="2020-12 固定四例 · Ajv 8.20.0 · 独立检查非执行轨迹"
@meta locale=zh-CN quality_profile=showcase
@source core title="JSON Schema 2020-12：anyOf 与 unevaluatedProperties" url=https://json-schema.org/draft/2020-12/json-schema-core
@source suite title="官方四例 · JSON-Schema-Test-Suite · Julian Berman · MIT" url=https://github.com/json-schema-org/JSON-Schema-Test-Suite/blob/89e83a74014617ffbe79a56d83d14d054cd11417/tests/draft2020-12/unevaluatedProperties.json
@source run title="本机完整校验与独立分支记录" url=https://github.com/tt-a1i/archify/blob/codex/lab-schema-annotations/experiments/schema-annotations/evidence/observations.json

## 案例 2 的覆盖如何汇总？ {#coverage}

输入为 `foo=foo`、`bar=bar`、`baz=not-baz`。图表示依据规范与独立检查得出的覆盖关系，不表示 Ajv 内部执行顺序。[](source:suite)

@architecture id=coverage-map title="案例 2：成功分支贡献覆盖"
| root-foo | 根属性 foo | backend | source:core |
| bar-ok | bar 分支成功 | backend | source:run |
| baz-no | baz 分支失败 | backend | source:run |
| quux-no | quux 分支失败 | backend | source:run |
| covered | 覆盖 foo、bar | backend | source:core |
| discarded | 不贡献覆盖 | backend | source:core |
| remaining | baz 未覆盖 | backend | source:run |
| root-foo > covered | foo |
| bar-ok > covered | bar |
| baz-no > discarded | const 不符 |
| quux-no > discarded | 属性缺失 |
| covered > remaining | 缺少 baz |
| discarded > remaining | baz 未贡献 |

@steps id=coverage-steps
| step-bar | bar 分支成功 | bar 等于要求的常量 bar，分支通过；anyOf 已满足。 | coverage-map | bar-ok |
| step-baz | baz 分支失败 | baz 是 not-baz，不等于常量 baz；该分支不能贡献覆盖。 | coverage-map | baz-no |
| step-quux | quux 分支失败 | 输入没有 quux，required 失败；缺失属性本身不会成为多余属性。 | coverage-map | quux-no |
| step-covered | 覆盖 foo、bar | 根 properties 覆盖 foo，成功分支覆盖 bar。 | coverage-map | covered |
| step-remaining | baz 未覆盖 | 输入属性减去覆盖集合，余下 baz；unevaluatedProperties 为 false，因此整体失败。 | coverage-map | remaining |

## 四个原始案例如何对照？ {#contrasts}

四例均含 `foo=foo`、`bar=bar`；其他字段如下。两种 `allErrors` 设置得到相同的整体结果。[](source:run)

| 案例 | 额外输入字段 | 成功分支 | 覆盖属性 | 未覆盖属性 | 整体结果 |
| --- | --- | --- | --- | --- | --- |
| 1 | 无 | bar | foo、bar | 无 | 通过 {good:通过} |
| 2 | baz=not-baz | bar | foo、bar | baz | 失败 {bad:失败} |
| 3 | baz=baz | bar、baz | foo、bar、baz | 无 | 通过 {good:通过} |
| 4 | baz=baz，quux=not-quux | bar、baz | foo、bar、baz | quux | 失败 {bad:失败} |

## 主诊断没有说出的原因是什么？ {#diagnostics}

案例 2 的完整主错误如下。开启 `allErrors` 后仍是这个结果。[](source:run)

```json title="案例 2：Ajv 主校验 errors"
[{"instancePath":"","schemaPath":"#/unevaluatedProperties","keyword":"unevaluatedProperties","params":{"unevaluatedProperty":"baz"},"message":"must NOT have unevaluated properties"}]
```

独立校验 `#/anyOf/1` 得到 `const` 失败，要求值为 `baz`。这是额外诊断，不能冒充主校验输出或执行轨迹。完整输入、schema 和两种配置的原始记录保留在 [观察包](source:run)。

@callout level=note title="anyOf 不是只保留第一个成功分支"
| 案例 3 同时成功的 bar、baz 分支都贡献覆盖。把它改读成 oneOf 或遇到第一次成功就停止收集，会误判此例。 |

## 如何复核这份解释？ {#verify}

- [ ] 对照官方原件，确认四个输入和 schema 没有被修改。
- [ ] 区分主校验结果、独立分支检查和本例的覆盖集合推导。
- [ ] 检查案例 3：两个分支成功时，整体仍通过。
- [ ] 检查案例 4：失败分支中的 quux 没有贡献覆盖。

范围只含这组固定 schema。没有模拟通用求值器，没有测量读者提效，也没有改变 Archify 的校验合同。
