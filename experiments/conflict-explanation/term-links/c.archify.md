# 为什么 root 1 无解？ {#answer}

这个固定输入登记的五个 foo 候选都依赖 bar，但没有提供任何 bar 版本，因此 root 1 无解。[](source:fixture)

- baz 1 已在输入中登记，但这份归约后的解释没有引用 baz。
- 归约后的报告省略了 bar 没有可用版本的陈述。
- 预期结果为 NoSolution；这次求解不会产生成功选定的依赖版本集合。

@answer scope="固定测试输入 · 上游断言 · 未运行求解器"
@meta locale=zh-CN
@source license title="PubGrub · MPL-2.0 许可全文" url=https://github.com/pubgrub-rs/pubgrub/blob/2b32d6a1b0b7b6021d2658a274d6fb7b613c5796/LICENSE
@source fixture title="PubGrub 固定测试 · MPL-2.0" url=https://github.com/pubgrub-rs/pubgrub/blob/2b32d6a1b0b7b6021d2658a274d6fb7b613c5796/tests/examples.rs#L229-L268

## 输入与结果 {#context}

root 1 声明依赖 foo 和 baz，范围都是任意版本。已登记的 foo 候选为五个整数版本 {1,2,3,4,5}，每个都声明依赖任意版本的 bar。[baz 1](node:declared.baz) 没有依赖；输入没有提供 [bar](node:declared.bar) 的版本。

测试断言归约后解释树引用的包集合为 root、foo、bar；baz 不在这份解释内。这不主张原因的最小性或唯一性，也不表示输入没有 baz。这里展示的是上游预期断言，未在本次运行求解器。

## 未归约的完整报告 {#full-report}

```text
Because there is no available version for bar and foo 1 | 2 | 3 | 4 | 5 depends on bar, foo 1 | 2 | 3 | 4 | 5 is forbidden.
And because there is no version of foo in <1 | >1, <2 | >2, <3 | >3, <4 | >4, <5 | >5 and root 1 depends on foo, root 1 is forbidden.
```

## 归约后的完整报告 {#collapsed-report}

```text
Because foo depends on bar and root 1 depends on foo, root 1 is forbidden.
```

`collapse_no_versions` 简化的是解释树，未改动输入。这份较短报告不再明说输入没有提供 bar 版本，也隐藏了 foo 候选与其余不可用版本的细节；应结合完整输入和未归约报告阅读。

## 上游完整测试函数 {#function}

以下完整函数摘自 PubGrub 固定提交，按 MPL-2.0 提供。原始文件及完整许可随实验保存。[](source:fixture) [](source:license)

```rust
#[test]
fn confusing_with_lots_of_holes() {
    let mut dependency_provider = OfflineDependencyProvider::<&str, NumVS>::new();

    // root depends on foo...
    dependency_provider.add_dependencies(
        "root",
        1u32,
        vec![("foo", Ranges::full()), ("baz", Ranges::full())],
    );

    for i in 1..6 {
        // foo depends on bar...
        dependency_provider.add_dependencies("foo", i as u32, vec![("bar", Ranges::full())]);
    }

    // This package is part of the dependency tree, but it's not part of the conflict
    dependency_provider.add_dependencies("baz", 1u32, vec![]);

    let Err(PubGrubError::NoSolution(mut derivation_tree)) =
        resolve(&dependency_provider, "root", 1u32)
    else {
        unreachable!()
    };
    assert_eq!(
        &DefaultStringReporter::report(&derivation_tree),
        r#"Because there is no available version for bar and foo 1 | 2 | 3 | 4 | 5 depends on bar, foo 1 | 2 | 3 | 4 | 5 is forbidden.
And because there is no version of foo in <1 | >1, <2 | >2, <3 | >3, <4 | >4, <5 | >5 and root 1 depends on foo, root 1 is forbidden."#
    );
    derivation_tree.collapse_no_versions();
    assert_eq!(
        &DefaultStringReporter::report(&derivation_tree),
        "Because foo depends on bar and root 1 depends on foo, root 1 is forbidden."
    );
    assert_eq!(
        derivation_tree.packages(),
        // baz isn't shown.
        Set::from_iter(&["root", "foo", "bar"])
    );
}
```

## 声明范围与冲突解释范围 {#scope-map}

连线表示输入中的依赖声明，约束均为任意版本。五个已登记的 foo 整数候选 {1,2,3,4,5} 合并显示，未选择具体版本；bar 是被引用但没有登记版本的包名。图不表示安装结果、求解顺序或完整内部证明。

@tree id=declared title="输入声明：候选版本合并显示"
| root | root 1 | - |
| foo | foo {1,2,3,4,5} | root |
| bar | bar：未提供版本 | foo |
| baz | baz 1 | root |

| 包名 | 登记版本 | 归约后引用 |
| --- | --- | --- |
| root | 1 | 是 |
| foo | {1,2,3,4,5}，图中合并 | 是 |
| bar | 空；仅被依赖声明引用 | 是 |
| baz | 1 | 否；仍在输入中 |
