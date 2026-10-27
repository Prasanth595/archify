#include <stdlib.h>

#define NOINLINE __attribute__((noinline))

NOINLINE char *allocate_buffer(void) { return malloc(16); }
NOINLINE char *allocate_route(void) { return allocate_buffer(); }
NOINLINE void release_buffer(char *p) { free(p); }
NOINLINE void release_route(char *p) { release_buffer(p); }
NOINLINE unsigned char read_buffer(volatile char *p) { return (unsigned char)p[5]; }
NOINLINE unsigned char read_route(volatile char *p) { return read_buffer(p); }
NOINLINE unsigned char scenario(void) {
    char *p = allocate_route();
    if (!p) return 0;
    release_route(p);
    return read_route(p);
}
int main(void) { return scenario(); }
