/* Original Archify research fixture; not upstream Bloaty test data. */
volatile unsigned char payload[4096] = {1};
int main(void) { return payload[0]; }
