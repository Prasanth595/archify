#include <cstdio>

static void show(const char* mode, const char* stage, int result, int outer) {
  std::printf("%s|%s|result=%d|outer=%d\n", mode, stage, result, outer);
}

int main() {
  {
    int n = 1;
    auto f = [n]() mutable { return ++n; };
    n = 10;
    int result = f();
    show("value", "first", result, n);
    auto g = f;
    result = f();
    show("value", "original-after-copy", result, n);
    result = g();
    show("value", "copied-closure", result, n);
  }
  {
    int n = 1;
    auto f = [&n]() { return ++n; };
    n = 10;
    int result = f();
    show("reference", "first", result, n);
    auto g = f;
    result = f();
    show("reference", "original-after-copy", result, n);
    result = g();
    show("reference", "copied-closure", result, n);
  }
  {
    int n = 1;
    int& alias = n;
    auto f = [alias]() mutable { return ++alias; };
    n = 10;
    int result = f();
    show("alias-by-value", "first", result, n);
    auto g = f;
    result = f();
    show("alias-by-value", "original-after-copy", result, n);
    result = g();
    show("alias-by-value", "copied-closure", result, n);
  }
}
