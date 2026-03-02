// Tower Kit documentation https://tower.hardwario.com/
// SDK API description https://sdk.hardwario.com/
// Forum https://forum.hardwario.com/

#include <application.h>

#define SCREEN_WIDTH 320
#define SCREEN_HEIGHT 240
#define LETTER_SIZE  8 // = width or height; letters are squares. TODO: rename it, it's misleading
#define MAX_LETTER_X SCREEN_WIDTH / LETTER_SIZE
#define MAX_LETTER_Y SCREEN_HEIGHT / LETTER_SIZE
#define BUFFER_SIZE 64

// Uses RGB 565
// https://barth-dev.de/online/rgb565-color-picker/
// const uint16_t RED   = 0xF800;
// const uint16_t GREEN = 0x07E0;
// const uint16_t BLUE  = 0x001F;
// const uint16_t BLACK = 0x0000;
#define WHITE 0xFFFF
#define RED   0xF800
#define GREEN 0x07E0
#define BLUE  0x001F
#define BLACK 0x0000
#define WHITE 0xFFFF

uint16_t BG_COLOR = BLACK;
uint16_t TEXT_COLOR = WHITE;

// commands for command()
const uint8_t SET_COL = 0x2A;
const uint8_t SET_ROW = 0x2B;

// TODO: check if it's 0 initialized
const unsigned char grid[SCREEN_WIDTH / LETTER_SIZE][SCREEN_HEIGHT / LETTER_SIZE]; // for letters

void clear_char(uint16_t grid_x, uint16_t grid_y);
void command(uint8_t cmd);
void display_init();
void draw_char_8(unsigned char c, uint16_t grid_x, uint16_t grid_y);
void draw_rect(uint16_t col_start, uint16_t col_end, uint16_t row_start, uint16_t row_end, uint16_t color);
void draw_pixel(uint16_t row, uint16_t col, uint16_t color);
void outline_screen(const uint16_t COLOR);
void reset_background();
void set_address(uint8_t axis, uint16_t start, uint16_t end);
void start_pixel_stream();

// Application initialization function which is called once after boot
void application_init(void)
{
    // Initialize logging
    twr_log_init(TWR_LOG_LEVEL_DUMP, TWR_LOG_TIMESTAMP_ABS);
    twr_log_debug("start");

	display_init();
	// reset_background(); // disable for faster boot
    draw_rect(0, SCREEN_WIDTH - 1, 0, SCREEN_HEIGHT - 1, BLACK);

	// outline_screen(BLUE);
    draw_rect(0, SCREEN_WIDTH - 1, 0, 0, RED); // bottom
    draw_rect(0, 0, 0, SCREEN_HEIGHT - 1, BLUE); // left

	// draw_rect(50, 100, 50, 200, GREEN);

	for (int i = 65; i <= 70; i++)
	{
		draw_char_8(i, 2 - 65 + i, 4);
	}
	draw_char_8('A', 20, 4);

}

// Application task function (optional) which is called periodically if scheduled
void application_task(void)
{
    // static int counter = 0;

    // Log task run and increment counter
    // twr_log_debug("APP: Task run (count: %d)", ++counter);

    twr_scheduler_plan_current_from_now(1000);
}

// TODO: make this a draw_rect wrapper
void draw_pixel(uint16_t row, uint16_t col, uint16_t color)
{
	uint8_t cmd;

	set_address(SET_COL, col, col);
	set_address(SET_ROW, row, row);

    cmd = 0x2C;
    command(cmd);

	// sets color
    uint8_t color_data[2] = {
		color >> 8,
		color & 0xFF
	};

	twr_spi_transfer(color_data, NULL, 2);
    twr_gpio_set_output(TWR_GPIO_P15, 1);
}

// sets all pixels black TODO: use draw_rect
void reset_background()
{
	uint8_t cmd;

	cmd = 0x2A; // address column
    command(cmd);
    uint8_t col_data[4] = {
		0,
		0,
		(SCREEN_HEIGHT-1) >> 8,
		(SCREEN_HEIGHT-1) & 0xFF
	};
    twr_spi_transfer(col_data, NULL, 4);
    twr_gpio_set_output(TWR_GPIO_P15, 1);

	cmd = 0x2B; // address row
    command(cmd);
    uint8_t row_data[4] = {
		0,
		0,
		(SCREEN_WIDTH-1) >> 8,
		(SCREEN_WIDTH-1) & 0xFF
	};
    twr_spi_transfer(row_data, NULL, 4);
    twr_gpio_set_output(TWR_GPIO_P15, 1);

	start_pixel_stream();

    // fill pixels with black
    uint8_t color_data[2] = {
		0x00,
		0x00
	};
	
    for(uint32_t i = 0; i < SCREEN_WIDTH * SCREEN_HEIGHT; i++)
        twr_spi_transfer(color_data, NULL, 2);

    twr_gpio_set_output(TWR_GPIO_P15, 1);
}

// TODO: document set_address, start_pixel_stream, and command

// axis is either SET_COL or SET_ROW (0x2A or 0x2B)
// defines the memory region it'll write to
void set_address(uint8_t axis, uint16_t start, uint16_t end)
{
	command(axis);
    uint8_t axis_range[4] =
    {
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

void outline_screen(const uint16_t COLOR)
{
    for (short i = 0; i < SCREEN_WIDTH; i++)
    {
        draw_pixel(i, SCREEN_HEIGHT - 1, COLOR);
        draw_pixel(i, 0, COLOR);
    }
    for (short i = 0; i < SCREEN_HEIGHT; i++)
    {
        draw_pixel(SCREEN_WIDTH - 1, i, COLOR);
        draw_pixel(0, i, COLOR);
    }
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
    madctl = madctl + 0; // MY
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

    // turn display on (it flickers)
    cmd = 0x29;
    command(cmd);
}

// TODO: draw_pixel and draw_line could be wrappers for this instead of their own functions
// draw rectangle, this is the drawing primitive
void draw_rect(uint16_t col_start, uint16_t col_end, uint16_t row_start, uint16_t row_end, uint16_t color)
{
    uint8_t color_data[2] = { // most then least significant
		color >> 8,
		color & 0xFF
	};

    uint16_t width  = (col_end - col_start + 1);
    uint16_t height = (row_end - row_start + 1);
    uint32_t byte_count = 2 * width * height; // 16 bit colors

    uint16_t chunk_count = byte_count / BUFFER_SIZE;
    uint16_t remainder = byte_count % BUFFER_SIZE;
    uint8_t buffer[BUFFER_SIZE];

    for (uint16_t i = 0; i < BUFFER_SIZE; i += 2) {
        buffer[i] = color >> 8;
        buffer[i + 1] = color & 0xFF;
    }

	set_address(SET_COL, col_start, col_end);
	set_address(SET_ROW, row_start, row_end);
	start_pixel_stream();
    for (uint16_t i = 0; i < chunk_count; i++)
		twr_spi_transfer(buffer, NULL, BUFFER_SIZE);
    for (uint16_t i = 0; i < remainder; i += 2)
		twr_spi_transfer(color_data, NULL, 2);

    twr_gpio_set_output(TWR_GPIO_P15, 1);
}

// TODO: add draw_char which uses 16x16 letters and draw_char_8 for 8x8
void draw_char_8(unsigned char c, uint16_t grid_x, uint16_t grid_y) // x, y of bottom left corner
{
    // reads the bitmap backwards and puts color bytes into the buffer in reverse order because the display refreshes from bottom to top.

    char *bitmap = font8x8_basic[c]; // defines rows from top to bottom

	uint32_t byte_count = 2 * LETTER_SIZE * LETTER_SIZE;
	uint8_t buffer[2 * LETTER_SIZE * LETTER_SIZE];
	uint32_t buffer_index = byte_count - 1;

    for (uint8_t i = 0; i < 8; i++)
    {
		for (int j = 7; j >= 0; j--)
		{
			uint16_t color;
			bool bit = bitmap[i] >> j & 1;
			if (bit)
				color = TEXT_COLOR;
			else
				color = BG_COLOR;

			buffer[buffer_index]     = color >> 8;
			buffer[buffer_index - 1] = color & 0xFF;
			buffer_index -= 2;
		}
    }

	const uint16_t col_start = grid_x * LETTER_SIZE;
	const uint16_t col_end   = col_start + LETTER_SIZE - 1;
	const uint16_t row_start = grid_y * LETTER_SIZE;
	const uint16_t row_end   = row_start + LETTER_SIZE - 1;

	clear_char(grid_x, grid_y);
	set_address(SET_COL, col_start, col_end);
	set_address(SET_ROW, row_start, row_end);
	start_pixel_stream();
	twr_spi_transfer(buffer, NULL, byte_count);

	twr_gpio_set_output(TWR_GPIO_P15, 1);
}

void clear_char(uint16_t grid_x, uint16_t grid_y)
{
	draw_rect(
		grid_x * LETTER_SIZE,
		grid_x * LETTER_SIZE + LETTER_SIZE - 1,
		grid_y * LETTER_SIZE,
		grid_y * LETTER_SIZE + LETTER_SIZE - 1,
		BG_COLOR
	);
}
