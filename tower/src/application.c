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

