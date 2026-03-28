#include <twr.h>

#define SCREEN_WIDTH 480 // 2.4" 320
#define SCREEN_HEIGHT 320 // 2.4" 240

#define LETTER_EDGE  8 // DO NOT CHANGE TODO: it's bloated and changing it can destroy logic. GRID_EDGE would be better.

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
	TRAM,
	TROLLEYBUS,
	TRAIN,
	FERRY
};

// TODO: define max sizes, ensure the server doesn't send too much data, figure out how to fit stuff if it's too long (see what PID does with the headsigns! Maybe it's not even a problem!)
#define LINE_NUMBER_SIZE 4 // assuming only 3 digits. TODO: verify this!
#define LINE_DIRECTION_SIZE 16 // 15 wide fits nicely
#define NEXT_TIME_SIZE 6 // 14:25 + \0
#define LEAVE_IN_SIZE 4 // 15m
#define STOP_NAME_SIZE 23 // whole screen

typedef struct line_data {
	char line_number[LINE_NUMBER_SIZE];
	char line_direction[LINE_DIRECTION_SIZE];
	char next_time[NEXT_TIME_SIZE];
	char leave_in[LEAVE_IN_SIZE];
	char stop_name[STOP_NAME_SIZE];
	uint8_t type; // references Transport_Type
} Line_Data;

void clear_char(uint16_t grid_x, uint16_t grid_y, uint8_t text_size);
void display_init();
void draw_char(unsigned char c, uint16_t grid_x, uint16_t grid_y, uint8_t text_size);
void draw_char_a(unsigned char c, uint16_t grid_x, uint16_t grid_y, uint8_t text_size);
void draw_image(uint16_t col, uint16_t row , uint8_t type, uint8_t size);
void draw_outline(uint16_t col_start, uint16_t col_end, uint16_t row_start, uint16_t row_end, uint16_t color);
void draw_rect(uint16_t col_start, uint16_t col_end, uint16_t row_start, uint16_t row_end, uint16_t color);
void draw_pixel(uint16_t row, uint16_t col, uint16_t color);
void draw_assignments(Line_Data *lines[]);
void outline_screen(const uint16_t color);
void paint_screen(uint16_t color);
