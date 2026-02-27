// Tower Kit documentation https://tower.hardwario.com/
// SDK API description https://sdk.hardwario.com/
// Forum https://forum.hardwario.com/

#include <application.h>

void draw_pixel(uint16_t row, uint16_t col, uint16_t color);
void reset_screen();

// Application initialization function which is called once after boot
void application_init(void)
{
    // Initialize logging
    twr_log_init(TWR_LOG_LEVEL_DUMP, TWR_LOG_TIMESTAMP_ABS);
    twr_log_debug("meow");

    // twr_spi_init(TWR_SPI_SPEED_1_MHZ,);

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
    
    twr_spi_init(TWR_SPI_SPEED_1_MHZ, TWR_SPI_MODE_0);

    // reset display
    twr_gpio_set_output(TWR_GPIO_P1, 0);
    twr_delay_us(10000);
    twr_gpio_set_output(TWR_GPIO_P1, 1);
    twr_delay_us(60000); twr_delay_us(60000);

    // sleep out
    uint8_t cmd = 0x11;
    twr_gpio_set_output(TWR_GPIO_P15, 0);
    twr_gpio_set_output(TWR_GPIO_P0, 0);
    twr_spi_transfer(&cmd, NULL, 1);
    twr_gpio_set_output(TWR_GPIO_P15, 1);

    twr_delay_us(62000); twr_delay_us(62000); // minimum 120ms

    

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
    uint8_t madctl = 0x48;   // typical: MX | BGR
    twr_spi_transfer(&madctl, NULL, 1);
    twr_gpio_set_output(TWR_GPIO_P15, 1);
	
	reset_screen();

    // turn display on (it flickers)
    cmd = 0x29;
    twr_gpio_set_output(TWR_GPIO_P15, 0);
    twr_gpio_set_output(TWR_GPIO_P0, 0);
    twr_spi_transfer(&cmd, NULL, 1);
    twr_gpio_set_output(TWR_GPIO_P15, 1);


    // set address window and print a pixel

    // column address
    uint16_t x = 150;
    cmd = 0x2A;

    twr_gpio_set_output(TWR_GPIO_P15, 0);

    twr_gpio_set_output(TWR_GPIO_P0, 0);
    twr_spi_transfer(&cmd, NULL, 1);

    twr_gpio_set_output(TWR_GPIO_P0, 1);

    uint8_t data_x[4] =
    {
        x >> 8,
        x & 0xFF,
        x >> 8,
        x & 0xFF
    };

    twr_spi_transfer(&data_x, NULL, 4);
    twr_gpio_set_output(TWR_GPIO_P15, 1);

    // column address
    uint16_t y = 100;
    cmd = 0x2B;

    twr_gpio_set_output(TWR_GPIO_P15, 0);

    twr_gpio_set_output(TWR_GPIO_P0, 0);
    twr_spi_transfer(&cmd, NULL, 1);

    twr_gpio_set_output(TWR_GPIO_P0, 1);

    uint8_t data_y[4] =
    {
        y >> 8,
        y & 0xFF,
        y >> 8,
        y & 0xFF
    };

    twr_spi_transfer(&data_y, NULL, 4);
    twr_gpio_set_output(TWR_GPIO_P15, 1);


    // memory write and send the pixel

    cmd = 0x2C;
    twr_gpio_set_output(TWR_GPIO_P15, 0);

    // command
    twr_gpio_set_output(TWR_GPIO_P0, 0);
    twr_spi_transfer(&cmd, NULL, 1);

    // pixel data
    twr_gpio_set_output(TWR_GPIO_P0, 1);

    uint8_t pixel[2] =
    {
        0xF8, // high byte
        0x00  // low byte
    };

    twr_spi_transfer(pixel, NULL, 2);
    twr_gpio_set_output(TWR_GPIO_P15, 1);

	for (short i = 0; i < 240; i++)
	{
		draw_pixel(i, 5, 0x67f);
	}

	/* amogus:
	66, 4


	*/


	// very slowly prints a square
	// for (int i = 0; i < 127; i++)
	// {
	// 	for (int j = 0; j < 127; j++)
	// 	{
	// 		draw_pixel(i, j, 0xff00); // red // TODO: make an 'enum' or some mapping of colors to hex codes
	// 	}
	// }
    
    // twr_log_debug("%d, %d\n", (int)twr_gpio_get_mode(TWR_GPIO_P0), (int)twr_gpio_get_output(TWR_GPIO_P0));
}

// Application task function (optional) which is called periodically if scheduled
void application_task(void)
{
    // static int counter = 0;

    // Log task run and increment counter
    // twr_log_debug("APP: Task run (count: %d)", ++counter);

    twr_scheduler_plan_current_from_now(1000);

    // toggles from LOW to HIGH
    // twr_gpio_get_mode(TWR_GPIO_P0) == 1 ? twr_gpio_set_mode(TWR_GPIO_P0, TWR_GPIO_MODE_INPUT) : twr_gpio_set_mode(TWR_GPIO_P0, TWR_GPIO_MODE_OUTPUT);
    // twr_log_debug("%d, %d\n", (int)twr_gpio_get_mode(TWR_GPIO_P0), (int)twr_gpio_get_output(TWR_GPIO_P0));
}

// https://hello.lumiere-couleur.com/app/16bit-colorpicker/
// row 
void draw_pixel(uint16_t row, uint16_t col, uint16_t color)	// TODO: what the fuck am i doing
{
	uint8_t cmd;

    // set column address
	cmd = 0x2A; 
    twr_gpio_set_output(TWR_GPIO_P15, 0);
    twr_gpio_set_output(TWR_GPIO_P0, 0);
    twr_spi_transfer(&cmd, NULL, 1);
    twr_gpio_set_output(TWR_GPIO_P0, 1);
    uint8_t col_data[4] =
    { // TODO: review bitwise AND and bitshifting
        col >> 8,
		col & 0xff,
        col << 8,
		col & 0xff
    };
    twr_spi_transfer(col_data, NULL, 4);
    twr_gpio_set_output(TWR_GPIO_P15, 1);

	// set row address
    cmd = 0x2B; 
    twr_gpio_set_output(TWR_GPIO_P15, 0);
    twr_gpio_set_output(TWR_GPIO_P0, 0);
    twr_spi_transfer(&cmd, NULL, 1);
    twr_gpio_set_output(TWR_GPIO_P0, 1);

    uint8_t row_data[4] =
    { // TODO: review bitwise AND and bitshifting
        row >> 8,
		row & 0xff,
        row << 8,
		row & 0xff
    };
    twr_spi_transfer(row_data, NULL, 4);
    twr_gpio_set_output(TWR_GPIO_P15, 1);


	// write 1 pixel
    cmd = 0x2C; 
    twr_gpio_set_output(TWR_GPIO_P15, 0);
    twr_gpio_set_output(TWR_GPIO_P0, 0);
    twr_spi_transfer(&cmd, NULL, 1);
    twr_gpio_set_output(TWR_GPIO_P0, 1);

	// sets color
    uint8_t pixels[2] = {
		color >> 8,
		color & 0xff
	};

	twr_spi_transfer(pixels, NULL, 2);
    twr_gpio_set_output(TWR_GPIO_P15, 1);
}

// sets all pixels black
void reset_screen()
{
	uint16_t width = 240;
    uint16_t height = 320;
    uint8_t cmd = 0x2A; // column address

    twr_gpio_set_output(TWR_GPIO_P15, 0);
    twr_gpio_set_output(TWR_GPIO_P0, 0);
    twr_spi_transfer(&cmd, NULL, 1);
    twr_gpio_set_output(TWR_GPIO_P0, 1);
    uint8_t col_data[4] = {0,0,(width-1)>>8,(width-1)&0xFF};
    twr_spi_transfer(col_data, NULL, 4);
    twr_gpio_set_output(TWR_GPIO_P15, 1);

    cmd = 0x2B; // row address
    twr_gpio_set_output(TWR_GPIO_P15, 0);
    twr_gpio_set_output(TWR_GPIO_P0, 0);
    twr_spi_transfer(&cmd, NULL, 1);
    twr_gpio_set_output(TWR_GPIO_P0, 1);
    uint8_t row_data[4] = {0,0,(height-1)>>8,(height-1)&0xFF};
    twr_spi_transfer(row_data, NULL, 4);
    twr_gpio_set_output(TWR_GPIO_P15, 1);

    cmd = 0x2C; // write memory
    twr_gpio_set_output(TWR_GPIO_P15, 0);
    twr_gpio_set_output(TWR_GPIO_P0, 0);
    twr_spi_transfer(&cmd, NULL, 1);
    twr_gpio_set_output(TWR_GPIO_P0, 1);

    // fill pixels with black
    uint8_t pixels[2] = {0x00, 0x00};
    for(uint32_t i = 0; i < width*height; i++)
    {
        twr_spi_transfer(pixels, NULL, 2);
    }
    twr_gpio_set_output(TWR_GPIO_P15, 1);
}