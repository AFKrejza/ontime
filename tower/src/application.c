// Tower Kit documentation https://tower.hardwario.com/
// SDK API description https://sdk.hardwario.com/
// Forum https://forum.hardwario.com/

#include <application.h>
#include "display.h"

twr_led_t led;
twr_button_t button;

void button_event_handler(twr_button_t *self, twr_button_event_t event, void *param);

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
	twr_radio_pub_string("/general", "it works");

	twr_button_init(&button, TWR_GPIO_BUTTON, TWR_GPIO_PULL_DOWN, 0);
	twr_button_set_event_handler(&button, button_event_handler, NULL);
	
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
	cesko.type = 0;
	
	Line_Data vyso;
	char s2[] = "136 Jizni Mesto";
	char c2[] = "15:50";
	char l2[] = "5m";
	char sn2[] = "Novovysocanska";
	strncpy(vyso.headsign, s2, sizeof(vyso.headsign));
	strncpy(vyso.next_time, c2, sizeof(vyso.next_time));
	strncpy(vyso.leave_in, l2, sizeof(vyso.leave_in));
	strncpy(vyso.stop_name, sn2, sizeof(vyso.stop_name));
	vyso.type = 0;

	Line_Data *lines[] = { &cesko, &vyso };

	draw_stops(lines);

	twr_log_debug("end text");
	draw_image(0, 240, 1, 1);
	draw_image(40, 240, 1, 2);
	draw_image(130, 240, BUS, 1);
	draw_image(180, 240, BUS, 2);

	draw_image(290, 240, 2, 1);
	draw_image(360, 240, 2, 2);

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

void button_event_handler(twr_button_t *self, twr_button_event_t event, void *param)
{
	if (event == TWR_BUTTON_EVENT_CLICK)
	{
		twr_log_debug("click");
		NVIC_SystemReset();
	}
}