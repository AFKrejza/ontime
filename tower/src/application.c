// Tower Kit documentation https://tower.hardwario.com/
// SDK API description https://sdk.hardwario.com/
// Forum https://forum.hardwario.com/

#include <application.h>

void draw_pixel(uint16_t row, uint16_t col, uint16_t color);
void set_address(uint8_t axis, uint16_t data);
void command(uint8_t cmd);
void write_memory();
void reset_background();
void display_init();

void outline_screen();

const uint16_t width = 320;
const uint16_t height = 240;

// commands for command()
const uint8_t SET_COL = 0x2A;
const uint8_t SET_ROW = 0x2B;

// Uses RGB 565
// https://barth-dev.de/online/rgb565-color-picker/
const uint16_t RED   = 0xF800;
const uint16_t GREEN = 0x07E0;
const uint16_t BLUE  = 0x001F;

// Application initialization function which is called once after boot
void application_init(void)
{
    // Initialize logging
    twr_log_init(TWR_LOG_LEVEL_DUMP, TWR_LOG_TIMESTAMP_ABS);
    twr_log_debug("start");

	display_init();
	reset_background();

	outline_screen();


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

	set_address(SET_COL, col);
	set_address(SET_ROW, row);

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

// sets all pixels black NOTE: height and width must be flipped here for some reason
void reset_background()
{
	uint8_t cmd;

	cmd = 0x2A; // address column
    command(cmd);
    uint8_t col_data[4] = {
		0,
		0,
		(height-1) >> 8,
		(height-1) & 0xFF
	};
    twr_spi_transfer(col_data, NULL, 4);
    twr_gpio_set_output(TWR_GPIO_P15, 1);

	cmd = 0x2B; // address row
    command(cmd);
    uint8_t row_data[4] = {
		0,
		0,
		(width-1) >> 8,
		(width-1) & 0xFF
	};
    twr_spi_transfer(row_data, NULL, 4);
    twr_gpio_set_output(TWR_GPIO_P15, 1);

    cmd = 0x2C; // write memory
    command(cmd);

    // fill pixels with black
    uint8_t color_data[2] = {0x00, 0x00};
    for(uint32_t i = 0; i < width*height; i++)
    {
        twr_spi_transfer(color_data, NULL, 2);
    }
    twr_gpio_set_output(TWR_GPIO_P15, 1);
}

// TODO: document set_address, write_memory, and command

// axis is either SET_ROW or SET_COL (0x2B or 0x2A)
void set_address(uint8_t axis, uint16_t data)
{
	command(axis);
    uint8_t axis_data[4] =
    {
        data >> 8,
		data & 0xFF,
        data >> 8,
		data & 0xFF
    };
    twr_spi_transfer(axis_data, NULL, 4);
    twr_gpio_set_output(TWR_GPIO_P15, 1);
}

void write_memory()
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

void draw_line(uint16_t row, uint16_t col, uint16_t color)
{
	uint8_t cmd;

    // set column address
	cmd = 0x2A; 
    command(cmd);
    uint8_t col_data[4] =
    {
        col >> 8,
		col & 0xFF,
        col >> 8,
		col & 0xFF
    };
    twr_spi_transfer(col_data, NULL, 4);
    twr_gpio_set_output(TWR_GPIO_P15, 1);

	// set row address
    cmd = 0x2B; 
    command(cmd);
    uint8_t row_data[4] =
    {
        row >> 8,
		row & 0xFF,
        row >> 8,
		row & 0xFF
    };
    twr_spi_transfer(row_data, NULL, 4);
    twr_gpio_set_output(TWR_GPIO_P15, 1);


	// write 1 pixel
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

void outline_screen()
{
    for (short i = 0; i < width; i++)
    {
        draw_pixel(i, height - 1, BLUE);
        draw_pixel(i, 0,BLUE);
    }
    for (short i = 0; i < height; i++)
    {
        draw_pixel(width - 1, i, BLUE);
        draw_pixel(0, i, BLUE);
    }
}


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
    uint8_t madctl = 0x48;   // MX horizontal mirror and BGR colors
    twr_spi_transfer(&madctl, NULL, 1);
    twr_gpio_set_output(TWR_GPIO_P15, 1);

    // turn display on (it flickers)
    cmd = 0x29;
    command(cmd);
}

// void draw_char(unsigned char c, )
// {

// }