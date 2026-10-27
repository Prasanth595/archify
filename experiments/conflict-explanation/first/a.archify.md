# 为什么 root 1 无解？ {#answer}

这个固定输入中，foo 的可用版本都依赖 bar，但 bar 没有可用版本，所以 root 1 无解。[](source:fixture)

- baz 属于输入声明，但不属于此冲突解释。
- 归约后的报告省略了 bar 没有可用版本的陈述。
- 结果是 NoSolution，不存在安装树。

@answer scope="固定测试输入 · 上游断言 · 未运行求解器"
@meta locale=zh-CN
@source fixture title="PubGrub 测试源码，固定版本" url=https://github.com/pubgrub-rs/pubgrub/blob/2b32d6a1b0b7b6021d2658a274d6fb7b613c5796/tests/examples.rs#L229-L268

## 输入与结果 {#context}

root 1 声明依赖 foo 和 baz，范围都是任意版本。foo 1 到 5 每个都声明依赖任意版本的 bar。baz 1 没有依赖；输入没有提供 bar 的版本。

冲突包集合是 root、foo、bar；baz 不在集合内。这是上游测试断言，不是本次运行求解器的日志。

## 未归约的完整报告 {#full-report}

```text
Because there is no available version for bar and foo 1 | 2 | 3 | 4 | 5 depends on bar, foo 1 | 2 | 3 | 4 | 5 is forbidden.
And because there is no version of foo in <1 | >1, <2 | >2, <3 | >3, <4 | >4, <5 | >5 and root 1 depends on foo, root 1 is forbidden.
```

## 归约后的完整报告 {#collapsed-report}

```text
Because foo depends on bar and root 1 depends on foo, root 1 is forbidden.
```

`collapse_no_versions` 让报告更短，但省略了 bar 没有可用版本的事实。读这行时，应结合上面的输入和未归约报告。

## 上游完整测试函数 {#function}

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
