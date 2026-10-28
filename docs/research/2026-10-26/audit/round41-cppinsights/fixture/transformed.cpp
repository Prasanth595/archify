#include <cstdio>

static void show(const char * mode, const char * stage, int result, int outer)
{
  printf("%s|%s|result=%d|outer=%d\n", mode, stage, result, outer);
}

int main()
{
  {
    int n = 1;
        
    class __lambda_10_14
    {
      public: 
      inline constexpr int operator()()
      {
        return ++n;
      }
      
      // private: 
      int n;
      public: 
      // inline constexpr __lambda_10_14(const __lambda_10_14 &) noexcept = default;
    };
    
    __lambda_10_14 f = __lambda_10_14{n};
    n = 10;
    int result = f.operator()();
    show("value", "first", result, n);
    __lambda_10_14 g = __lambda_10_14(f);
    result = f.operator()();
    show("value", "original-after-copy", result, n);
    result = g.operator()();
    show("value", "copied-closure", result, n);
  }
  {
    int n = 1;
        
    class __lambda_22_14
    {
      public: 
      inline constexpr int operator()() const
      {
        return ++n;
      }
      
      // private: 
      int & n;
      public: 
      // inline constexpr __lambda_22_14(const __lambda_22_14 &) noexcept = default;
    };
    
    __lambda_22_14 f = __lambda_22_14{n};
    n = 10;
    int result = f.operator()();
    show("reference", "first", result, n);
    __lambda_22_14 g = __lambda_22_14(f);
    result = f.operator()();
    show("reference", "original-after-copy", result, n);
    result = g.operator()();
    show("reference", "copied-closure", result, n);
  }
  {
    int n = 1;
    int & alias = n;
        
    class __lambda_35_14
    {
      public: 
      inline constexpr int operator()()
      {
        return ++alias;
      }
      
      // private: 
      int alias;
      public: 
      // inline constexpr __lambda_35_14(const __lambda_35_14 &) noexcept = default;
    };
    
    __lambda_35_14 f = __lambda_35_14{alias};
    n = 10;
    int result = f.operator()();
    show("alias-by-value", "first", result, n);
    __lambda_35_14 g = __lambda_35_14(f);
    result = f.operator()();
    show("alias-by-value", "original-after-copy", result, n);
    result = g.operator()();
    show("alias-by-value", "copied-closure", result, n);
  }
  return 0;
}
