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


	typedef struct line_data {
		char headsign[64];
		char time[64];
		char leave_in[64];
		char stop_name[64];
		uint8_t type; // enum
	} Line_Data;

	Line_Data cesko;
	char s[] = "151 Ceskomoravska";
	strncpy(cesko.headsign, s, sizeof(cesko.headsign));
	char c[] = "15:50";
	strncpy(cesko.time, c, sizeof(cesko.time));
	char l[] = "5 minutes";
	strncpy(cesko.leave_in, l, sizeof(cesko.leave_in));
	char sn[] = "Klicov";
	strncpy(cesko.stop_name, sn, sizeof(cesko.stop_name));
	cesko.type = 1;
	
	
	Line_Data vyso;
	char s2[] = "136 Jizni Mesto";
	strncpy(vyso.headsign, s2, sizeof(vyso.headsign));
	char c2[] = "15:50";
	strncpy(vyso.time, c2, sizeof(vyso.time));
	char l2[] = "5 minutes";
	strncpy(vyso.leave_in, l2, sizeof(vyso.leave_in));
	char sn2[] = "Novovysocanska";
	strncpy(vyso.stop_name, sn2, sizeof(vyso.stop_name));
	vyso.type = 1;

	Line_Data *stops[] = { &cesko, &vyso };

	for (uint8_t i = 0; i < 2; i++)
	{
		const uint16_t col_start = 0;
		const uint16_t col_end = SCREEN_WIDTH - 0;
		const uint16_t row_start = 0 + i * 90;
		const uint16_t row_end = 90 + i * 90;
		
		draw_outline(col_start, col_end, row_start, row_end, WHITE);
		draw_rect(col_start + 2, col_start + 92, row_start + 2, row_end - 2, GREEN);

		for (uint8_t j = 0; j < 2; j++)
		{
			for (uint16_t k = 0; k < strlen(stops[i]->headsign); k++)
			{
				uint8_t size = SIZE_L;
				draw_char_a(stops[i]->headsign[k], col_start + 100 + k * size * LETTER_EDGE, row_start + 6, size);
			}
			for (uint16_t k = 0; k < strlen(stops[i]->stop_name); k++)
			{
				uint8_t size = SIZE_L;
				draw_char_a(stops[i]->stop_name[k], col_start + 100 + k * size * LETTER_EDGE, row_start + 6 + LETTER_EDGE * size, size);
			}
			for (uint16_t k = 0; k < strlen(stops[i]->time); k++)
			{
				uint8_t size = SIZE_L;
				draw_char_a(stops[i]->time[k], col_start + 150 + k * size * LETTER_EDGE, row_start + 6 + 2 * LETTER_EDGE * size, size);
			}
		}
	}

	// for (uint16_t i = 0; i < strlen(s2); i++)
	// {
	// 	draw_char_a(s2[i], 5 + i * SIZE_L * 8, 5, SIZE_L);
	// }

	

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

