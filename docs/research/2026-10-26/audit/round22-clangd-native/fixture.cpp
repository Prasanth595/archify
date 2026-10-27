
    void callee(int);
    void caller1() {
      callee(42);
    }
    void caller2() {
      caller1();
      caller1();
    }
    void caller3() {
      caller1();
      caller2();
    }
  