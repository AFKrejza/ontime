#include <twr.h>
#include "font8x8_basic.h"
#include "display.h"
#include "images.h"

#define BUFFER_SIZE 2048

#define PIN_CS TWR_GPIO_P15
#define PIN_DC TWR_GPIO_P0
#define PIN_RST TWR_GPIO_P1
#define PIN_MOSI TWR_GPIO_P13
#define PIN_CLK TWR_GPIO_P14

const uint16_t BG_COLOR = BLACK;
const uint16_t TEXT_COLOR = WHITE;

uint8_t buffer[BUFFER_SIZE];

void clear_char(uint16_t grid_x, uint16_t grid_y, uint8_t text_size);
void display_init();
void draw_char(unsigned char c, uint16_t grid_x, uint16_t grid_y, uint8_t text_size);
void draw_char_a(unsigned char c, uint16_t grid_x, uint16_t grid_y, uint8_t text_size);
void draw_image(uint16_t col, uint16_t row , uint8_t type);
void draw_outline(uint16_t col_start, uint16_t col_end, uint16_t row_start, uint16_t row_end, uint16_t color);
void draw_pixel(uint16_t row, uint16_t col, uint16_t color);
void draw_rect(uint16_t col_start, uint16_t col_end, uint16_t row_start, uint16_t row_end, uint16_t color);
static inline void command(uint8_t cmd);
static inline void start_pixel_stream();
static inline void set_address(uint8_t axis, uint16_t start, uint16_t end);
static inline void set_col(uint16_t start, uint16_t end);
static inline void set_row(uint16_t start, uint16_t end);
static inline void send_data(void *source, void *destination, size_t length);
void outline_screen(const uint16_t color);
void paint_screen(uint16_t color);

// defines the memory region it'll write to
static inline void set_address(uint8_t axis, uint16_t start, uint16_t end)
{
	command(axis);
	uint8_t axis_range[4] = {
		start >> 8,
		start & 0xFF,
		end >> 8,
		end & 0xFF
	};
	send_data(axis_range, NULL, 4);
}

static inline void set_col(uint16_t start, uint16_t end)
{
	set_address(0x2A, start, end);
}

static inline void set_row(uint16_t start, uint16_t end)
{
	set_address(0x2B, start, end);
}

static inline void send_data(void *source, void *destination, size_t length)
{
	twr_gpio_set_output(PIN_CS, 0);
	twr_gpio_set_output(PIN_DC, 1);
	twr_spi_transfer(source, destination, length);
}

static inline void start_pixel_stream()
{
	uint8_t cmd = 0x2C;
	command(cmd);
}

static inline void command(uint8_t cmd)
{
	twr_gpio_set_output(PIN_CS, 0);
	twr_gpio_set_output(PIN_DC, 0);
	twr_spi_transfer(&cmd, NULL, 1);
}

// sets GPIO for SPI and starts the display
void display_init()
{
	twr_gpio_init(PIN_CS);
	twr_gpio_init(PIN_DC);
	twr_gpio_init(PIN_RST);
	twr_gpio_init(PIN_MOSI);
	twr_gpio_init(PIN_CLK);
	
	twr_gpio_set_mode(PIN_DC, TWR_GPIO_MODE_OUTPUT);
	twr_gpio_set_mode(PIN_CS, TWR_GPIO_MODE_OUTPUT);
	twr_gpio_set_mode(PIN_RST, TWR_GPIO_MODE_OUTPUT);

	twr_gpio_set_output(PIN_DC, 1);
	twr_gpio_set_output(PIN_CS, 1);
	twr_gpio_set_output(PIN_RST, 1);
	
	twr_spi_init(TWR_SPI_SPEED_8_MHZ, TWR_SPI_MODE_0); // Worked at 1 MHZ as well

	// reset display
	twr_gpio_set_output(PIN_RST, 0);
	twr_delay_us(10000);
	twr_gpio_set_output(PIN_RST, 1);
	twr_delay_us(60000); twr_delay_us(60000);

	// sleep out
	uint8_t cmd = 0x11;
	command(cmd);

	twr_delay_us(62000); twr_delay_us(62000); // minimum 120ms for display start

	// set it to 16-bit color mode
	cmd = 0x3A;
	command(cmd);
	uint8_t data = 0x55;
	send_data(&data, NULL, 1);

	// set memory access control
	cmd = 0x36;   // MADCTL
	command(cmd);

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
	send_data(&madctl, NULL, 1);

	// turn display on
	cmd = 0x29;
	command(cmd);
}

// draw rectangle, shape drawing primitive
void draw_rect(uint16_t col_start, uint16_t col_end, uint16_t row_start, uint16_t row_end, uint16_t color)
{
	// TODO: We don't really need bounds checking imo since the screen regions will be calculated in advance.
	if (col_start > SCREEN_WIDTH  || 
		col_end   > SCREEN_WIDTH  || 
		row_start > SCREEN_HEIGHT || 
		row_end   > SCREEN_WIDTH
	) {
		twr_log_debug("Error in draw_rect: Exceeded screen dimensions");
		return;
	}
	if (col_start > col_end || row_start > row_end) {
		twr_log_debug("Error in draw_rect: start greater than end"); // TODO: do bounds checking everywhere? Not really needed.
		return;
	}

	uint16_t width  = (col_end - col_start + 1);
	uint16_t height = (row_end - row_start + 1);
	uint32_t byte_count = 2 * width * height;

	uint16_t chunk_count = byte_count / BUFFER_SIZE;
	uint16_t remainder = byte_count % BUFFER_SIZE;

	uint16_t set_buffer = byte_count < BUFFER_SIZE ? byte_count : BUFFER_SIZE;
	for (uint16_t i = 0; i < set_buffer; i += 2)
	{
		buffer[i] = color >> 8;
		buffer[i + 1] = color & 0xFF;
	}

	set_col(col_start, col_end);
	set_row(row_start, row_end);
	start_pixel_stream();

	for (uint16_t i = 0; i < chunk_count; i++)
		send_data(buffer, NULL, BUFFER_SIZE);
	send_data(buffer, NULL, remainder);
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

// draws any 8 byte bitmap where each byte is a line
void draw_char(unsigned char c, uint16_t grid_x, uint16_t grid_y, uint8_t text_size)
{
	// TODO: use bounds checking like draw_rect, implement chunked transfer, use absolute grid + decide on overflow or using another function to use the relative grid.	
	const uint8_t *bitmap = font8x8_basic[c];

	uint32_t byte_count = text_size * text_size * 2 * LETTER_EDGE * LETTER_EDGE; // only supports up to text size 4 without chunked transfer
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

	set_col(col_start, col_end);
	set_row(row_start, row_end);
	start_pixel_stream();
	send_data(buffer, NULL, byte_count);
}

// absolute positioning TODO: merge with draw_char
void draw_char_a(unsigned char c, uint16_t grid_x, uint16_t grid_y, uint8_t text_size)
{
	const uint8_t *bitmap = font8x8_basic[c];

	uint32_t byte_count = text_size * text_size * 2 * LETTER_EDGE * LETTER_EDGE; // only supports up to text size 4 without chunked transfer
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

	const uint16_t col_start = grid_x;
	const uint16_t col_end   = col_start + (text_size * LETTER_EDGE) - 1;
	const uint16_t row_start = grid_y;
	const uint16_t row_end   = row_start + (text_size * LETTER_EDGE) - 1;

	set_col(col_start, col_end);
	set_row(row_start, row_end);
	start_pixel_stream();
	send_data(buffer, NULL, byte_count);
}

// only needed when deleting, not for overwriting
void clear_char(uint16_t grid_x, uint16_t grid_y, uint8_t text_size)
{
	draw_char(0, grid_x, grid_y, text_size);
}

// like a hollow rectangle
void draw_outline(uint16_t col_start, uint16_t col_end, uint16_t row_start, uint16_t row_end, uint16_t color)
{
	draw_rect(col_start, col_end, row_start, row_start, color); // top
	draw_rect(col_start, col_end, row_end, row_end, color); // bottom
	draw_rect(col_start, col_start, row_start, row_end, color); // left
	draw_rect(col_end, col_end, row_start, row_end, color); // right
}

// void draw_string(unsigned char *s, uint16_t grid_x, uint16_t grid_y, uint8_t text_size)
// {
// 	for (uint16_t i = 0; i < strlen(s); i++)
// 	{
// 		uint16_t x = grid_x + text_size * i > SCREEN_WIDTH / text_size ? 
// 		draw_char(s[i], x, grid_y + text_size * i, text_size);
// 	}
// }

// TODO: use 32 cols (bits) per row
// used for drawing the bus/metro/tram icons
void draw_image(uint16_t col, uint16_t row , uint8_t type) // needs chunking for increasing image size
{
	const uint8_t *bitmap = images[type];
	uint32_t buffer_index = 0;

	for (uint16_t i = 0; i < 128; i++)
	{
		for (uint16_t j = 0; j < 8; j++)
		{
				bool bit = bitmap[i] >> j & 1;
				uint16_t color = bit ? TEXT_COLOR : BG_COLOR;
				buffer[buffer_index] = color >> 8;
				buffer[buffer_index + 1] = color & 0xFF;
				buffer_index += 2;
		}
	}

	set_col(col, col + 31);
	set_row(row, row + 31);
	start_pixel_stream();
	send_data(buffer, NULL, buffer_index + 1);
}

// e.g. 136 Jizni Mesto; TODO: define memory regions for each part
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
