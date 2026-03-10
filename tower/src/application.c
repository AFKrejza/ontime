// Tower Kit documentation https://tower.hardwario.com/
// SDK API description https://sdk.hardwario.com/
// Forum https://forum.hardwario.com/

#include <application.h>

#define SCREEN_WIDTH 480 // 2.4" 320
#define SCREEN_HEIGHT 320 // 2.4" 240
#define SCREEN_AREA SCREEN_WIDTH * SCREEN_HEIGHT
#define LETTER_EDGE  8 // DO NOT CHANGE TODO: it's bloated and changing it can destroy logic. GRID_EDGE would be better.
#define MAX_LETTER_X SCREEN_WIDTH / LETTER_EDGE
#define MAX_LETTER_Y SCREEN_HEIGHT / LETTER_EDGE
#define MAX_GLYPH_EDGE 32
#define MAX_GLYPH_AREA MAX_GLYPH_EDGE * MAX_GLYPH_EDGE
#define BUFFER_SIZE 2048

// Uses RGB 565
// https://barth-dev.de/online/rgb565-color-picker/
#define WHITE 0xFFFF
#define RED   0xF800
#define GREEN 0x07E0
#define BLUE  0x001F
#define BLACK 0x0000
#define WHITE 0xFFFF

uint16_t BG_COLOR = BLACK;
uint16_t TEXT_COLOR = WHITE;

// commands for set_address()
const uint8_t SET_COL = 0x2A;
const uint8_t SET_ROW = 0x2B;

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

uint8_t buffer[BUFFER_SIZE];

void clear_char(uint16_t grid_x, uint16_t grid_y, uint8_t text_size);
void command(uint8_t cmd);
void display_init();
void draw_char(unsigned char c, uint16_t grid_x, uint16_t grid_y, uint8_t text_size);
void draw_image(uint16_t col, uint16_t row , uint8_t type);
void draw_rect(uint16_t col_start, uint16_t col_end, uint16_t row_start, uint16_t row_end, uint16_t color);
void draw_pixel(uint16_t row, uint16_t col, uint16_t color);
void outline_screen(const uint16_t color);
void paint_screen(uint16_t color);
void set_address(uint8_t axis, uint16_t start, uint16_t end);
void start_pixel_stream();

// Application initialization function which is called once after boot
void application_init(void)
{
	// Initialize logging
	twr_log_init(TWR_LOG_LEVEL_DUMP, TWR_LOG_TIMESTAMP_ABS);
	twr_log_debug("start");

	display_init();

	paint_screen(BLACK);
	outline_screen(GREEN);

	draw_rect(8, 72, 8, 72, RED);

	char *s1 = "Tungsten Cube";
	char *s2 = "Platypus";
	char *s3 = "Dire Straits";
	char *s4 = "Tortilla";
	for (size_t i = 0; i < strlen(s1); i++)
		draw_char(s1[i], 5 + i, 26, SIZE_S);
	for (size_t i = 0; i < strlen(s2); i++)
		draw_char(s2[i], 4 + i, 6, SIZE_M);
	for (size_t i = 0; i < strlen(s3); i++)
		draw_char(s3[i], 5 + i, 2, SIZE_L);
	for (size_t i = 0; i < strlen(s4); i++)
		draw_char(s4[i], 1 + i, 5, SIZE_XL);
		
	clear_char(1, 5, SIZE_XL);

	twr_log_debug("end text");
	draw_image(350, 20, BUS);
	twr_log_debug("end");
}

// Application task function (optional) which is called periodically if scheduled
void application_task(void)
{
	// static int counter = 0;

	// Log task run and increment counter
	// twr_log_debug("APP: Task run (count: %d)", ++counter);

	twr_scheduler_plan_current_from_now(1000);
}

// axis is either SET_COL or SET_ROW (0x2A or 0x2B)
// defines the memory region it'll write to
void set_address(uint8_t axis, uint16_t start, uint16_t end)
{
	command(axis);
	uint8_t axis_range[4] = {
		start >> 8,
		start & 0xFF,
		end >> 8,
		end & 0xFF
	};
	twr_spi_transfer(axis_range, NULL, 4);
	twr_gpio_set_output(TWR_GPIO_P15, 1);
}

void start_pixel_stream()
{
	uint8_t cmd = 0x2C;
	command(cmd);
}

void command(uint8_t cmd)
{
	twr_gpio_set_output(TWR_GPIO_P15, 0);
	twr_gpio_set_output(TWR_GPIO_P0, 0);
	twr_spi_transfer(&cmd, NULL, 1);
	twr_gpio_set_output(TWR_GPIO_P0, 1);
}

// TODO: add variables for CS, CD etc in case I change the pin layout
// sets GPIO for SPI and starts the display
void display_init()
{
	twr_gpio_init(TWR_GPIO_P15); // CS
	twr_gpio_init(TWR_GPIO_P0);  // DC
	twr_gpio_init(TWR_GPIO_P1);  // RST
	twr_gpio_init(TWR_GPIO_P13); // SPI MOSI
	twr_gpio_init(TWR_GPIO_P14); // CLK
	
	twr_gpio_set_mode(TWR_GPIO_P0, TWR_GPIO_MODE_OUTPUT);
	twr_gpio_set_mode(TWR_GPIO_P15, TWR_GPIO_MODE_OUTPUT);
	twr_gpio_set_mode(TWR_GPIO_P1, TWR_GPIO_MODE_OUTPUT);

	// DC default DATA
	// set CS pin to output HIGH (idle)
	// set RST HIGH
	twr_gpio_set_output(TWR_GPIO_P0, 1);
	twr_gpio_set_output(TWR_GPIO_P15, 1);
	twr_gpio_set_output(TWR_GPIO_P1, 1);
	
	twr_spi_init(TWR_SPI_SPEED_8_MHZ, TWR_SPI_MODE_0); // Worked at 1 MHZ as well

	// reset display
	twr_gpio_set_output(TWR_GPIO_P1, 0);
	twr_delay_us(10000);
	twr_gpio_set_output(TWR_GPIO_P1, 1);
	twr_delay_us(60000); twr_delay_us(60000);

	// sleep out
	uint8_t cmd = 0x11;
	command(cmd);

	twr_delay_us(62000); twr_delay_us(62000); // minimum 120ms for display start

	// set it to 16-bit color mode
	cmd = 0x3A;
	twr_gpio_set_output(TWR_GPIO_P15, 0);
	twr_gpio_set_output(TWR_GPIO_P0, 0);
	twr_spi_transfer(&cmd, NULL, 1);
	uint8_t data = 0x55;
	twr_gpio_set_output(TWR_GPIO_P0, 1);
	twr_spi_transfer(&data, NULL, 1);
	twr_gpio_set_output(TWR_GPIO_P15, 1);

	// set memory access control
	cmd = 0x36;   // MADCTL
	command(cmd);

	// TODO: Add more legible settings, this sucks
	// Memory Data Access Control command for stuff like mirroring or flipping the display
	uint8_t madctl = 0;
	madctl = madctl + 1; // MY
	madctl = madctl << 1;
	madctl = madctl + 1; // MX
	madctl = madctl << 1;
	madctl = madctl + 1; // MV
	madctl = madctl << 1;
	madctl = madctl + 0; // ML
	madctl = madctl << 1;
	madctl = madctl + 1; // BGR
	madctl = madctl << 1;
	madctl = madctl + 0; // MH
	madctl = madctl << 2; // last 2 bits are unused
	twr_spi_transfer(&madctl, NULL, 1);
	twr_gpio_set_output(TWR_GPIO_P15, 1);

	// turn display on
	cmd = 0x29;
	command(cmd);
}

// draw rectangle, shape drawing primitive
void draw_rect(uint16_t col_start, uint16_t col_end, uint16_t row_start, uint16_t row_end, uint16_t color)
{
	if (col_start > SCREEN_WIDTH  || 
		col_end   > SCREEN_WIDTH  || 
		row_start > SCREEN_HEIGHT || 
		row_end   > SCREEN_WIDTH
	) {
		twr_log_debug("Error in draw_rect: Exceeded screen dimensions");
		return;
	}
	if (col_start > col_end || row_start > row_end) {
		twr_log_debug("Error in draw_rect: start greater than end"); // TODO: do bounds checking everywhere
		return;
	}

	uint16_t width  = (col_end - col_start + 1);
	uint16_t height = (row_end - row_start + 1);
	uint32_t byte_count = 2 * width * height; // 16 bit colors

	uint16_t chunk_count = byte_count / BUFFER_SIZE;
	uint16_t remainder = byte_count % BUFFER_SIZE;
	uint8_t buffer[BUFFER_SIZE];

	uint16_t set_buffer = byte_count < BUFFER_SIZE ? byte_count : BUFFER_SIZE;
	for (uint16_t i = 0; i < set_buffer; i += 2)
	{
		buffer[i] = color >> 8;
		buffer[i + 1] = color & 0xFF;
	}

	set_address(SET_COL, col_start, col_end);
	set_address(SET_ROW, row_start, row_end);
	start_pixel_stream();

	for (uint16_t i = 0; i < chunk_count; i++)
		twr_spi_transfer(buffer, NULL, BUFFER_SIZE);
	twr_spi_transfer(buffer, NULL, remainder);

	twr_gpio_set_output(TWR_GPIO_P15, 1);
}

void outline_screen(const uint16_t color)
{
		draw_rect(0, SCREEN_WIDTH - 1, 0, 0, color);
		draw_rect(0, SCREEN_WIDTH - 1, SCREEN_HEIGHT - 1, SCREEN_HEIGHT - 1, color);
		draw_rect(0, 0, 0, SCREEN_WIDTH -1, color);
		draw_rect(SCREEN_WIDTH - 1, SCREEN_WIDTH - 1, 0, SCREEN_HEIGHT -1, color);
}

// sets all pixels
void paint_screen(uint16_t color)
{
	draw_rect(0, SCREEN_WIDTH - 1, 0 , SCREEN_HEIGHT - 1, color);
}

void draw_pixel(uint16_t row, uint16_t col, uint16_t color)
{
	draw_rect(col, col, row, row, color);
}

// draws any 8 byte bitmap, where each byte is a line
void draw_char(unsigned char c, uint16_t grid_x, uint16_t grid_y, uint8_t text_size)
{
	const uint8_t *bitmap = font8x8_basic[c];

	uint32_t byte_count = text_size * text_size * 2 * LETTER_EDGE * LETTER_EDGE;
	uint32_t buffer_index = 0;

	for (uint8_t i = 0; i < 8 * text_size; i++)
	{
		for (uint16_t j = 0; j < 8 * text_size; j++)
		{
			uint16_t color;
			bool bit = bitmap[i / text_size] >> (j / text_size) & 1;
			if (bit)
				color = TEXT_COLOR;
			else
				color = BG_COLOR;

			buffer[buffer_index]     = color >> 8;
			buffer[buffer_index + 1] = color & 0xFF;
			buffer_index += 2;
		}
	}

	const uint16_t col_start = text_size * grid_x * LETTER_EDGE;
	const uint16_t col_end   = col_start + (text_size * LETTER_EDGE) - 1;
	const uint16_t row_start = text_size * grid_y * LETTER_EDGE;
	const uint16_t row_end   = row_start + (text_size * LETTER_EDGE) - 1;

	set_address(SET_COL, col_start, col_end);
	set_address(SET_ROW, row_start, row_end);
	start_pixel_stream();
	twr_spi_transfer(buffer, NULL, byte_count);
	twr_gpio_set_output(TWR_GPIO_P15, 1);
}

// only needed when deleting, not for overwriting
void clear_char(uint16_t grid_x, uint16_t grid_y, uint8_t text_size)
{
	draw_char(0, grid_x, grid_y, text_size);
}

// void draw_string(unsigned char *s, uint16_t grid_x, uint16_t grid_y, uint8_t text_size)
// {
// 	for (uint16_t i = 0; i < strlen(s); i++)
// 	{
// 		uint16_t x = grid_x + text_size * i > SCREEN_WIDTH / text_size ? 
// 		draw_char(s[i], x, grid_y + text_size * i, text_size);
// 	}
// }

// TODO: make this a draw_char wrapper and make all images collections of 8x8 bitmaps
// used for drawing the bus/metro/tram icon
void draw_image(uint16_t col, uint16_t row , uint8_t type)
{

}

// e.g. 136 Jizni Mesto
// void draw_headsign(char *s, )
// {

// }

// e.g. leave in x minutes
void draw_leave_in()
{

}

// e.g. next bus at 16:24
void draw_next_bus()
{

}
