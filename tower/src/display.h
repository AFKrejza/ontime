#include <twr.h>

// Uses RGB 565
// https://barth-dev.de/online/rgb565-color-picker/
#define WHITE 0xFFFF
#define RED   0xF800
#define GREEN 0x07E0
#define BLUE  0x001F
#define BLACK 0x0000
#define WHITE 0xFFFF

// text size; enlarges draw_char bitmaps. 1 = 8x8 (original), 2 = 16x16, 4 = 32x32 etc.
// Adding bigger sizes will need chunked transfer like in draw_rect due to exceeding BUFFER_SIZE
enum Text_Size {
	SIZE_S = 1,
	SIZE_M = 2,
	SIZE_L = 3,
	SIZE_XL = 4
};

// index for images bitmap array
enum Transport_Type {
	BUS,
	METRO,
	TRAM
};

void clear_char(uint16_t grid_x, uint16_t grid_y, uint8_t text_size);
void display_init();
void draw_char(unsigned char c, uint16_t grid_x, uint16_t grid_y, uint8_t text_size);
void draw_image(uint16_t col, uint16_t row , uint8_t type);
void draw_rect(uint16_t col_start, uint16_t col_end, uint16_t row_start, uint16_t row_end, uint16_t color);
void draw_pixel(uint16_t row, uint16_t col, uint16_t color);
void outline_screen(const uint16_t color);
void paint_screen(uint16_t color);
