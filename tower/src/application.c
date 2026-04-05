// Tower Kit documentation https://tower.hardwario.com/
// SDK API description https://sdk.hardwario.com/
// Forum https://forum.hardwario.com/

#include <application.h>
#include "display.h"

#define ASSIGNMENTS_SIZE 2 * sizeof(Assignment) + 200 // TODO: calculate the maximum JSON size

twr_led_t led;
twr_button_t button;
Assignment assignments[2];
char assignment_buffer[ASSIGNMENTS_SIZE];


void button_event_handler(twr_button_t *self, twr_button_event_t event, void *param);
void radio_event_handler(twr_radio_event_t event, void *param);
void radio_string_callback(uint64_t *id, const char *topic, void *payload, void *param);

twr_radio_sub_t subscriptions[] = {
	{ .topic = "assignment", .type = TWR_RADIO_SUB_PT_STRING, .callback = radio_string_callback, .param = NULL }
};

// Application initialization function which is called once after boot
void application_init(void)
{
	twr_log_init(TWR_LOG_LEVEL_DUMP, TWR_LOG_TIMESTAMP_ABS);
	twr_log_debug("start init");

	twr_button_init(&button, TWR_GPIO_BUTTON, TWR_GPIO_PULL_DOWN, 0);
	twr_button_set_event_handler(&button, button_event_handler, NULL);

	twr_led_init(&led, TWR_GPIO_LED, false, false);
	twr_module_battery_init(); // TODO: use to check battery module voltage
	
	twr_radio_init(TWR_RADIO_MODE_NODE_LISTENING);
	twr_radio_pairing_request("tower-ontime", FW_VERSION);
	twr_led_pulse(&led, 2000);
	twr_radio_pub_string("tower_health", "mock health data");
	// twr_radio_set_event_handler(radio_event_handler, NULL);
	twr_radio_set_subs(subscriptions, sizeof(subscriptions) / sizeof(subscriptions[0]));
	
	display_init();
	paint_screen(BLACK);

	twr_log_debug("end init");

	char c_ln[] = "151";
	char c_ld[] = "Ceskomoravska";
	char c_nt[] = "15:50";
	char c_li[] = "5m";
	char c_sn[] = "Klicov";
	strncpy(assignments[0].line_number, c_ln, sizeof(assignments[0].line_number));
	strncpy(assignments[0].next_time, c_nt, sizeof(assignments[0].next_time));
	strncpy(assignments[0].line_direction, c_ld, sizeof(assignments[0].line_direction));
	strncpy(assignments[0].leave_in, c_li, sizeof(assignments[0].leave_in));
	strncpy(assignments[0].stop_name, c_sn, sizeof(assignments[0].stop_name));
	assignments[0].type = 0;
	
	char v_ln[] = "136";
	char v_ld[] = "Jizni Mesto";
	char v_nt[] = "15:50";
	char v_li[] = "5m";
	char v_sn[] = "Novovysocanska";
	strncpy(assignments[1].line_number, v_ln, sizeof(assignments[1].line_number));
	strncpy(assignments[1].next_time, v_nt, sizeof(assignments[1].next_time));
	strncpy(assignments[1].line_direction, v_ld, sizeof(assignments[1].line_direction));
	strncpy(assignments[1].leave_in, v_li, sizeof(assignments[1].leave_in));
	strncpy(assignments[1].stop_name, v_sn, sizeof(assignments[1].stop_name));
	assignments[1].type = 0;

	draw_assignments(assignments);

	
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
	(void) self;
	(void) param;

	if (event == TWR_BUTTON_EVENT_CLICK)
	{
		twr_log_debug("click");
		NVIC_SystemReset();
	}
}

// make it try to reconnect
void radio_event_handler(twr_radio_event_t event, void *param)
{

}

void radio_string_callback(uint64_t *id, const char *topic, void *payload, void *param)
{
	(void) id;
	(void) topic;
	(void) param;

	if (payload == NULL)
	{
		twr_log_debug("Empty payload");
		return;
	}
	twr_log_debug("test");

	strncpy(assignment_buffer, (const char*)payload, sizeof(assignment_buffer) - 1);
	assignment_buffer[ASSIGNMENTS_SIZE - 1] = '\0';
	paint_screen(BLUE);
	draw_char(assignment_buffer[0], 0, 300, 3);
	draw_char(assignment_buffer[1], 48, 300, 3);
	twr_log_debug("%s", (char*)assignment_buffer);
	twr_radio_pub_string("tower_health", "function called");
}