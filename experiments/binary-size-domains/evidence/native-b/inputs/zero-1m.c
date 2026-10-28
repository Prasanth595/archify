/* Original Archify research fixture; not upstream Bloaty test data. */
volatile unsigned char payload[1048576] = {0};
int main(void) { return payload[0]; }
