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

static uint8_t buffer[BUFFER_SIZE];

static inline void command(uint8_t cmd);
static inline void start_pixel_stream();
static inline void set_address(uint8_t axis, uint16_t start, uint16_t end);
static inline void set_col(uint16_t start, uint16_t end);
static inline void set_row(uint16_t start, uint16_t end);
static inline void send_data(void *source, void *destination, size_t length);

static void draw_line_direction(char direction[LINE_DIRECTION_SIZE], uint16_t box_col_start, uint16_t box_row_start);
static void draw_line_number(char line_number[LINE_NUMBER_SIZE], uint16_t box_col_start, uint16_t box_row_start);
static void draw_leave_in(char leave_in[LEAVE_IN_SIZE], uint16_t box_col_start, uint16_t box_row_start, bool language);
static void draw_next_time(char next_time[NEXT_TIME_SIZE], uint16_t box_col_start, uint16_t box_row_start, bool language);
static void draw_stop_name(char stop_name[STOP_NAME_SIZE], uint16_t box_col_start, uint16_t box_row_start);

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

// only supports up to text size 4 without chunked transfer
// draws any 8 byte bitmap where each byte is a line
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

	const uint16_t col_start = grid_x;
	const uint16_t col_end   = col_start + (text_size * LETTER_EDGE) - 1;
	const uint16_t row_start = grid_y;
	const uint16_t row_end   = row_start + (text_size * LETTER_EDGE) - 1;

	set_col(col_start, col_end);
	set_row(row_start, row_end);
	start_pixel_stream();
	send_data(buffer, NULL, byte_count);
}

void clear_char(uint16_t col_start, uint16_t row_start, uint8_t text_size)
{
	draw_char(0, col_start, row_start, text_size);
}

// hollow rectangle
void draw_outline(uint16_t col_start, uint16_t col_end, uint16_t row_start, uint16_t row_end, uint16_t color)
{
	draw_rect(col_start, col_end, row_start, row_start, color); // top
	draw_rect(col_start, col_end, row_end, row_end, color); // bottom
	draw_rect(col_start, col_start, row_start, row_end, color); // left
	draw_rect(col_end, col_end, row_start, row_end, color); // right
}

// used for drawing the 32x32 bus/metro/tram icons
void draw_image(uint16_t col, uint16_t row , uint8_t type, uint8_t img_size)
{
	twr_log_debug("type: %d", type);
	const uint8_t (*bitmap)[4] = images_32x32[type];
	uint32_t buffer_index = 0;

	set_col(col, col + 32 * img_size - 1);
	set_row(row, row + 32 * img_size - 1);
	start_pixel_stream();

	for (uint16_t i = 0; i < 32; i++)
	{
		for (uint16_t s = 0; s < img_size; s++)
		{
			for (uint16_t j = 0; j < 4; j++)
			{
				for (int16_t p = 7; p >= 0; p--)
				{
					bool bit = bitmap[i][j] >> p & 1;
					uint16_t color = bit ? BG_COLOR : TEXT_COLOR;
					for (uint16_t b = 0; b < img_size; b++)
					{
						buffer[buffer_index] = color >> 8;
						buffer[buffer_index + 1] = color & 0xFF;
						buffer_index += 2;
						if (buffer_index == BUFFER_SIZE)
						{
							send_data(buffer, NULL, BUFFER_SIZE);
							buffer_index = 0;
						}
					}
				}
			}
		}
	}
}

void draw_string(char *s, uint16_t length, uint16_t col_start, uint16_t row_start, uint8_t text_size)
{
	uint16_t char_col_start;
	uint16_t letter_width = text_size * LETTER_EDGE;

	for (uint16_t i = 0; i < length; i++)
	{
		char_col_start = col_start + i * letter_width;
		draw_char( 
			s[i],
			char_col_start,
			row_start,
			text_size
		);
	}
}

void draw_assignments(Assignment assignments[])
{
	static bool language = true; // 1 english 0 czech

	const uint16_t box_height = 128;
	for (uint8_t i = 0; i < 2; i++)
	{
		const uint16_t box_col_start = 8;
		const uint16_t box_col_end = SCREEN_WIDTH - 1;
		const uint16_t box_row_start = 0 + i * box_height;
		const uint16_t box_row_end = box_height + i * box_height;

		if (assignments[i].stop_name[0] == '\0')
		{
			draw_rect(0, SCREEN_WIDTH - 1, box_row_start + i, box_row_end, BG_COLOR);
			continue;
		}

		draw_outline(box_col_start - 8, box_col_end, box_row_start, box_row_end, WHITE);
		draw_image(box_col_start, box_row_start + 40, assignments[i].type, 2);
		draw_line_direction(assignments[i].line_direction, box_col_start, box_row_start);
		draw_line_number(assignments[i].line_number, box_col_start, box_row_start);
		draw_stop_name(assignments[i].stop_name, box_col_start, box_row_start);
		draw_next_time(assignments[i].next_time, box_col_start, box_row_start, language);
		draw_leave_in(assignments[i].leave_in,   box_col_start, box_row_start, language);
	}
	language = language ? false : true;
}

// e.g. Jizni Mesto
static void draw_line_direction(char direction[LINE_DIRECTION_SIZE], uint16_t box_col_start, uint16_t box_row_start)
{
	uint8_t size = SIZE_L;
	uint16_t col_start = box_col_start + 96;
	uint16_t row_start = box_row_start + 8;
	draw_string(direction, LINE_DIRECTION_SIZE -1, col_start, row_start, size);
}

// e.g. 136
static void draw_line_number(char line_number[LINE_NUMBER_SIZE], uint16_t box_col_start, uint16_t box_row_start)
{
	uint8_t size = SIZE_L;
	uint16_t col_start = box_col_start;
	uint16_t row_start = box_row_start + 8;
	draw_string(line_number, LINE_NUMBER_SIZE -1, col_start, row_start, size);
}

// e.g. Zlicin
static void draw_stop_name(char stop_name[STOP_NAME_SIZE], uint16_t box_col_start, uint16_t box_row_start)
{
	uint8_t size = SIZE_M;
	uint16_t row_start = box_row_start + 36;
	uint16_t col_start = box_col_start + 96;
	draw_string(stop_name, STOP_NAME_SIZE -1, col_start, row_start, size);
}

// e.g. leave in x minutes
static void draw_leave_in(char leave_in[LEAVE_IN_SIZE], uint16_t box_col_start, uint16_t box_row_start, bool language)
{
	char *czech = "Odejdi za";
	char *english = "Leave in ";
	char *text = language ? english : czech;
	uint8_t size = SIZE_M;
	uint16_t col_start = box_col_start + 312;
	uint16_t row_start = box_row_start + 60;

	draw_string(text, strlen(text), col_start, row_start, size);
	
	size = SIZE_XL;
	row_start = row_start + 24;
	
	draw_string(leave_in, LEAVE_IN_SIZE -1, col_start, row_start, size);
}

// e.g. 16:24
static void draw_next_time(char next_time[NEXT_TIME_SIZE], uint16_t box_col_start, uint16_t box_row_start, bool language)
{
	uint16_t col_start = box_col_start + 100;
	uint16_t row_start = box_row_start + 60;
	uint8_t size = SIZE_M;
	
	char *english = "Departure";
	char *czech = "Odjezd   ";
	char *text = language ? english : czech;
	draw_string(text, strlen(text), col_start, row_start, size);

	row_start = row_start + 24;
	size = SIZE_XL;
	draw_string(next_time, NEXT_TIME_SIZE -1, col_start, row_start, size);
}

void draw_status(uint16_t color)
{
	draw_rect(160, 319, SCREEN_HEIGHT - 2, SCREEN_HEIGHT - 1, color);
}

void draw_ids(char gateway_id_string[25], char tower_id_string[25])
{
	uint8_t text_size = SIZE_M;
	draw_string(gateway_id_string, strlen(gateway_id_string), 32, 32, text_size);
	draw_string(tower_id_string, strlen(tower_id_string), 32, 70, text_size);
}

// wipes draw_ids
void clear_ids()
{
	uint8_t text_size = SIZE_M;
	char *empty = "                        ";
	draw_string(empty, strlen(empty), 32, 32, text_size);
	draw_string(empty, strlen(empty), 32, 70, text_size);
}

void draw_current_time(char current_time[6])
{
	uint8_t size = SIZE_L;
	draw_string(current_time, strlen(current_time), 16, SCREEN_HEIGHT - 8 - size * 8, size);
}

void draw_battery_charge(char battery_charge[4])
{
	uint8_t size = SIZE_L;
	char text[5] = "   %%";

	strncpy(text, battery_charge, 3);
	uint8_t len = 0;
	while (len < 3 && text[len])
		len++;

	text[len++] = '%';
	text[len] = '\0';
	draw_string(text, len, SCREEN_WIDTH - 16 - 96, SCREEN_HEIGHT - 8 - size * 8, size);
}
