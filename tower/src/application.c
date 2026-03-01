// Tower Kit documentation https://tower.hardwario.com/
// SDK API description https://sdk.hardwario.com/
// Forum https://forum.hardwario.com/

#include <application.h>

#define SCREEN_WIDTH 320
#define SCREEN_HEIGHT 240
#define LETTER_SIZE  8
#define MAX_LETTER_X SCREEN_WIDTH / LETTER_SIZE
#define MAX_LETTER_Y SCREEN_HEIGHT / LETTER_SIZE
#define BUFFER_SIZE 64

// commands for command()
const uint8_t SET_COL = 0x2A;
const uint8_t SET_ROW = 0x2B;

// Uses RGB 565
// https://barth-dev.de/online/rgb565-color-picker/
const uint16_t RED   = 0xF800;
const uint16_t GREEN = 0x07E0;
const uint16_t BLUE  = 0x001F;
const uint16_t BLACK = 0x0000;

const unsigned char grid[SCREEN_WIDTH / 8][SCREEN_HEIGHT / 8];

void command(uint8_t cmd);
void display_init();
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

	draw_rect(50, 100, 50, 200, GREEN);



}

// Application task function (optional) which is called periodically if scheduled
void application_task(void)
{
    // static int counter = 0;

    // Log task run and increment counter
    // twr_log_debug("APP: Task run (count: %d)", ++counter);

    twr_scheduler_plan_current_from_now(1000);
}

// https://hello.lumiere-couleur.com/app/16bit-colorpicker/
// row 
void draw_pixel(uint16_t row, uint16_t col, uint16_t color)
{
	uint8_t cmd;

	set_address(SET_COL, col, col);
	set_address(SET_ROW, row, row);

    cmd = 0x2C; // write memory
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
void set_address(uint8_t axis, uint16_t start, uint16_t end) // add start and end since right now it only works for one pixel
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

// every 2 bytes are interpreted as 1 pixel
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
    twr_gpio_set_output(TWR_GPIO_P15, 0);
    twr_gpio_set_output(TWR_GPIO_P0, 0);
    twr_spi_transfer(&cmd, NULL, 1);

    twr_gpio_set_output(TWR_GPIO_P0, 1);

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
	set_address(SET_COL, col_start, col_end);
	set_address(SET_ROW, row_start, row_end);
    start_pixel_stream();

    uint8_t color_data[2] = { // most then least significant
		color >> 8,
		color & 0xFF
	};

    uint16_t width  = (col_end - col_start + 1);
    uint16_t height = (row_end - row_start + 1);
	uint32_t pixel_count = width * height;
    uint32_t byte_count = 2 * width * height;

    uint16_t chunk_count = byte_count / BUFFER_SIZE;
    uint16_t remainder = byte_count % BUFFER_SIZE;
    uint8_t buffer[BUFFER_SIZE];

    for (uint16_t i = 0; i < BUFFER_SIZE; i += 2) {
        buffer[i] = color >> 8;
        buffer[i + 1] = color & 0xFF;
    }

    for (uint16_t i = 0; i < chunk_count; i++)
		twr_spi_transfer(buffer, NULL, BUFFER_SIZE);
    for (uint16_t i = 0; i < remainder; i += 2)
		twr_spi_transfer(color_data, NULL, 2);

    twr_gpio_set_output(TWR_GPIO_P15, 1);
}

// void draw_rect(uint16_t col_start, uint16_t col_end, uint16_t row_start, uint16_t row_end, uint16_t color)
// {
// 	set_address(SET_COL, col_start, col_end);
// 	set_address(SET_ROW, row_start, row_end);
//     start_pixel_stream();

//     uint8_t color_data[2] = { // most then least significant
// 		color >> 8,
// 		color & 0xFF
// 	};

//     uint16_t width  = (col_end - col_start + 1);
//     uint16_t height = (row_end - row_start + 1);
// 	uint32_t pixel_count = width * height;
//     uint32_t byte_count = 2 * width * height;

//     uint16_t chunk_count = byte_count / BUFFER_SIZE;
//     uint16_t remainder = byte_count % BUFFER_SIZE;
//     uint8_t buffer[BUFFER_SIZE];

//     for (uint16_t i = 0; i < BUFFER_SIZE; i += 2) {
//         buffer[i] = color >> 8;
//         buffer[i + 1] = color & 0xFF;
//     }

// 	twr_spi_transfer(color_data, NULL, 2);
// 	twr_spi_transfer(color_data, NULL, 2);
// 	twr_spi_transfer(color_data, NULL, 2);
// 	twr_spi_transfer(color_data, NULL, 2);
// 	twr_spi_transfer(color_data, NULL, 2);

//     for (uint16_t i = 0; i < chunk_count; i++)
// 		twr_spi_transfer(buffer, NULL, BUFFER_SIZE);
//     for (uint16_t i = 0; i < remainder; i += 2)
// 		twr_spi_transfer(color_data, NULL, 2);


// 	// for (uint32_t i = 0; i < pixel_count; i++)
// 	// 	twr_spi_transfer(color_data, NULL, 2);

//     twr_gpio_set_output(TWR_GPIO_P15, 1);
// }


// idk if this is any better than draw_rect tbh
// void draw_line(uint16_t col, uint16_t row, uint8_t axis, uint8_t length, uint16_t color)
// {

// }

void draw_char(unsigned char c, uint16_t grid_x, uint16_t grid_y) // x, y of bottom left corner
{
    // { 0x0C, 0x1E, 0x33, 0x33, 0x3F, 0x33, 0x33, 0x00},   // U+0041 (A)

    const char *bitmap = font8x8_basic[c];



}
