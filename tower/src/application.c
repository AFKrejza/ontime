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

	Line_Data cesko;
	char c_ln[] = "151";
	char c_ld[] = "Ceskomoravska";
	char c_nt[] = "15:50";
	char c_li[] = "5m";
	char c_sn[] = "Klicov";
	strncpy(cesko.line_number, c_ln, sizeof(cesko.line_number));
	strncpy(cesko.next_time, c_nt, sizeof(cesko.next_time));
	strncpy(cesko.line_direction, c_ld, sizeof(cesko.line_direction));
	strncpy(cesko.leave_in, c_li, sizeof(cesko.leave_in));
	strncpy(cesko.stop_name, c_sn, sizeof(cesko.stop_name));
	cesko.type = 0;
	
	Line_Data vyso;
	char v_ln[] = "136";
	char v_ld[] = "Jizni Mesto";
	char v_nt[] = "15:50";
	char v_li[] = "5m";
	char v_sn[] = "Novovysocanska";
	strncpy(vyso.line_number, v_ln, sizeof(vyso.line_number));
	strncpy(vyso.next_time, v_nt, sizeof(vyso.next_time));
	strncpy(vyso.line_direction, v_ld, sizeof(vyso.line_direction));
	strncpy(vyso.leave_in, v_li, sizeof(vyso.leave_in));
	strncpy(vyso.stop_name, v_sn, sizeof(vyso.stop_name));
	vyso.type = 0;

	Line_Data *lines[] = { &cesko, &vyso };

	draw_assignments(lines);


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