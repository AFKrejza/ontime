// Tower Kit documentation https://tower.hardwario.com/
// SDK API description https://sdk.hardwario.com/
// Forum https://forum.hardwario.com/

#include <application.h>
#include "display.h"

// Application initialization function which is called once after boot
void application_init(void)
{
	// Initialize logging
	twr_log_init(TWR_LOG_LEVEL_DUMP, TWR_LOG_TIMESTAMP_ABS);
	twr_log_debug("start");

	display_init();

	paint_screen(BLACK);
	outline_screen(GREEN);

	// draw_rect(8, 72, 8, 72, RED);

	// char *s1 = "Tungsten Cube";
	char *s2 = "Platypus";
	// char *s3 = "Dire Straits";
	// char *s4 = "Tortilla";
	// for (size_t i = 0; i < strlen(s1); i++)
	// 	draw_char(s1[i], 5 + i, 26, SIZE_S);
	// for (size_t i = 0; i < strlen(s2); i++)
	// 	draw_char(s2[i], 4 + i, 6, SIZE_M);
	// for (size_t i = 0; i < strlen(s3); i++)
	// 	draw_char(s3[i], 5 + i, 2, SIZE_L);
	// for (size_t i = 0; i < strlen(s4); i++)
	// 	draw_char(s4[i], 1 + i, 5, SIZE_XL);
	// clear_char(1, 5, SIZE_XL);

	// draw_rect(8, SCREEN_WIDTH, 8, (SCREEN_HEIGHT / 4) - 8, RED);
	// draw_rect(8, SCREEN_WIDTH, 8, SCREEN_HEIGHT / 4, RED);
	// draw_rect(8, SCREEN_WIDTH, 8, SCREEN_HEIGHT / 4, RED);

	// for (uint8_t i = 0; i < 2; i++)
	// {
	// 	const uint16_t col_start = 16;
	// 	const uint16_t col_end = SCREEN_WIDTH - 16;
	// 	const uint16_t row_start = 16 + i * 90;
	// 	const uint16_t row_end = 106 + i * 90;
		
	// 	draw_outline(col_start, col_end, row_start, row_end, WHITE);
	// 	draw_rect(col_start + 2, col_start + 2 + 90, row_start + 2, row_end - 2, GREEN);

	// 	const char *s = "Palmovka";
	// 	for (uint8_t j = 0; j < strlen(s); j++)
	// 	{
	// 		draw_char(s[j], 5 + j, i * 4 + 1, SIZE_L);
	// 	}
	// }

	for (uint16_t i = 0; i < strlen(s2); i++)
	{
		draw_char_a(s2[i], 5 + i * SIZE_L * 8, 5, SIZE_L);
	}

	

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

