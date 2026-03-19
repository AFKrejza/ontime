// Tower Kit documentation https://tower.hardwario.com/
// SDK API description https://sdk.hardwario.com/
// Forum https://forum.hardwario.com/

#include <application.h>
#include "display.h"

twr_led_t led;

// Application initialization function which is called once after boot
void application_init(void)
{
	// Initialize logging
	twr_log_init(TWR_LOG_LEVEL_DUMP, TWR_LOG_TIMESTAMP_ABS);
	twr_log_debug("start");

	twr_led_init(&led, TWR_GPIO_LED, false, false);
	twr_module_battery_init(); // TODO: use to check battery module voltage
	
	twr_radio_init(TWR_RADIO_MODE_NODE_SLEEPING);
	twr_radio_pairing_request("tower-ontime", FW_VERSION);
	twr_led_pulse(&led, 2000);

	display_init();

	paint_screen(BLACK);
	// outline_screen(GREEN);


	Line_Data cesko;
	char s[] = "151 Ceskomoravska";
	char c[] = "15:50";
	char l[] = "5m";
	char sn[] = "Klicov";
	strncpy(cesko.headsign, s, sizeof(cesko.headsign));
	strncpy(cesko.next_time, c, sizeof(cesko.next_time));
	strncpy(cesko.leave_in, l, sizeof(cesko.leave_in));
	strncpy(cesko.stop_name, sn, sizeof(cesko.stop_name));
	cesko.type = 1;
	
	Line_Data vyso;
	char s2[] = "136 Jizni Mesto";
	char c2[] = "15:50";
	char l2[] = "5m";
	char sn2[] = "Novovysocanska";
	strncpy(vyso.headsign, s2, sizeof(vyso.headsign));
	strncpy(vyso.next_time, c2, sizeof(vyso.next_time));
	strncpy(vyso.leave_in, l2, sizeof(vyso.leave_in));
	strncpy(vyso.stop_name, sn2, sizeof(vyso.stop_name));
	vyso.type = 1;

	Line_Data *lines[] = { &cesko, &vyso };

	draw_stops(lines);

	// for (uint16_t i = 0; i < strlen(s2); i++)
	// {
	// 	draw_char_a(s2[i], 5 + i * SIZE_L * 8, 5, SIZE_L);
	// }

	

	twr_log_debug("end text");
	draw_image(350, 240, BUS);
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

