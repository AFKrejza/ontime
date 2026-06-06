// Tower Kit documentation https://tower.hardwario.com/
// SDK API description https://sdk.hardwario.com/
// Forum https://forum.hardwario.com/

#include <application.h>
#include "display.h"

#define ASSIGNMENTS_SIZE 10 * sizeof(Assignment) + 200

#define TOWER_ID_SIZE 13 // includes null byte

#define msg_start_char '['
#define msg_end_char ']'
#define delimiter '|'
#define assignment_start_char '{'
#define assignment_end_char '}'

static bool has_display = true; // for headless

twr_led_t led;
twr_button_t button;
Assignment assignments[2];
static char buffer[ASSIGNMENTS_SIZE];

static uint64_t gateway_id;

char current_time[6] = "00:00";
const char battery_charge[4] = "100";
const int charge_percentage = 100;

void clear_assignments(Assignment assignments[2]);
void extract_field(uint16_t *i, char *dest, uint16_t max_len);
UpdateResult parse_payload(uint64_t *tower_id);
static bool parse_current_time();
static bool is_digit(char c);
static void refresh_display(UpdateResult updated_fields);

void button_event_handler(twr_button_t *self, twr_button_event_t event, void *param);
void radio_event_handler(twr_radio_event_t event, void *param);
void radio_string_callback(uint64_t *id, const char *topic, void *payload, void *param);
void display_ids_on_boot(uint64_t gateway_id, uint64_t tower_id);
void send_status();

twr_radio_sub_t subscriptions[] = {
	{ .topic = "assignment/-/data/set", .type = TWR_RADIO_SUB_PT_STRING, .callback = radio_string_callback, .param = NULL }
};

static bool radio_attached = false;

// Application initialization function which is called once after boot
void application_init(void)
{
	twr_log_init(TWR_LOG_LEVEL_DUMP, TWR_LOG_TIMESTAMP_ABS);
	twr_log_info("start init");

	twr_button_init(&button, TWR_GPIO_BUTTON, TWR_GPIO_PULL_DOWN, 0);
	twr_button_set_event_handler(&button, button_event_handler, NULL);

	twr_led_init(&led, TWR_GPIO_LED, false, false);
	
	twr_radio_init(TWR_RADIO_MODE_NODE_LISTENING);
	twr_radio_pairing_request("tower-ontime", FW_VERSION);
	twr_led_pulse(&led, 2000);
	twr_radio_set_event_handler(radio_event_handler, NULL);
	twr_radio_set_subs(subscriptions, sizeof(subscriptions) / sizeof(subscriptions[0]));
	
	if (has_display)
	{
		display_init();
		draw_string("OnTime", 6, 200, 140, 3, WHITE);
		twr_tick_wait(500);
		paint_screen(BLACK);
	} else {
		twr_log_info("Running headless");
	}

	twr_scheduler_plan_current_from_now(3000);
	twr_log_info("end init");	
}

void application_task(void)
{
	send_status();

	twr_scheduler_plan_current_from_now(60000);
}

void button_event_handler(twr_button_t *self, twr_button_event_t event, void *param)
{
	(void) self;
	(void) param;

	if (event == TWR_BUTTON_EVENT_CLICK)
	{
		twr_log_info("reset button clicked");
		NVIC_SystemReset();
	}
}

void radio_event_handler(twr_radio_event_t event, void *param)
{
	// twr_log_info("RADIO event: %d", (int)event);
	switch (event)
	{
		case TWR_RADIO_EVENT_INIT_FAILURE:
			twr_log_error("RADIO: Init failure");
			break;
		case TWR_RADIO_EVENT_INIT_DONE:
			twr_log_info("RADIO: Init done");
			break;
		case TWR_RADIO_EVENT_ATTACH:
			twr_log_info("RADIO: Attached to gateway");
			radio_attached = true;
			break;
		case TWR_RADIO_EVENT_ATTACH_FAILURE:
			twr_log_error("RADIO: Attach failure");
			break;
		case TWR_RADIO_EVENT_DETACH:
			twr_log_info("RADIO: Detached from gateway");
			radio_attached = false;
			break;
		case TWR_RADIO_EVENT_SCAN_FIND_DEVICE:
			twr_log_info("RADIO: Scanning to find device");
			break;
		case TWR_RADIO_EVENT_PAIRED:
			twr_log_info("RADIO: Paired");
			break;
		case TWR_RADIO_EVENT_UNPAIRED:
			twr_log_info("RADIO: Unpaired");
			break;
		case TWR_RADIO_EVENT_TX_DONE:
			twr_log_info("RADIO: TX Done");
			break;
		case TWR_RADIO_EVENT_TX_ERROR:
			twr_log_error("RADIO: TX Error");
			break;
		default:
			break;
	}
}

void radio_string_callback(uint64_t *id, const char *topic, void *payload, void *param)
{
	(void) topic;
	(void) param;

	uint64_t tower_id = twr_radio_get_my_id();

	
	if (!gateway_id)
	{
		gateway_id = *id;
		twr_log_info("  Tower ID: %llx", tower_id);
		twr_log_info("Gateway ID: %llx", gateway_id);
		if (has_display) display_ids_on_boot(gateway_id, tower_id);
	}

	if (payload == NULL)
	{
		twr_log_info("Empty payload");
		return;
	}
	if (has_display) draw_status(BLUE);

	size_t len = strlen((const char *)payload);
	static size_t buffer_index = 0;
	if (*(const char *)payload == msg_start_char)
	{
		twr_log_info("first msg");
		buffer_index = 0;
		// if there are no assignments (just []):
		if (strchr((const char *)payload, msg_end_char))
		{
			twr_log_info("Gateway has no assignments");
			clear_assignments(assignments);
			goto draw; // to wipe the screen
		}
		else
		{
			memcpy(buffer, payload, len);
			buffer_index += len;
			return;
		}
	}
	else if (strchr((const char *)payload, msg_end_char)) // checks if last chunk
	{
		// twr_log_debug("last msg");
		memcpy(buffer + buffer_index, payload, len);
		buffer_index += len;
		buffer[buffer_index] = '\0';
		twr_log_info("%s", buffer);
	}
	else if (buffer_index > 0)
	{
		// twr_log_debug("mid msg");
		memcpy(buffer + buffer_index, payload, len);
		buffer_index += len;
		buffer[buffer_index] = '\0';
		return;
	}
	else
	{
		twr_log_warning("malformed message / error, clearing buffer");
		if (has_display) draw_status(RED); // flash
		twr_tick_wait(500);
		if (has_display) draw_status(BLACK);
		goto cleanup;
	}
	UpdateResult updated_fields = parse_payload(&tower_id);
	draw:
	if (has_display) refresh_display(updated_fields);

	// prevent garbage
	cleanup:
	memset(buffer, 0, sizeof(buffer));
	buffer_index = 0;

	if (has_display) draw_status(GREEN);
}

UpdateResult parse_payload(uint64_t *tower_id)
{
	UpdateResult updated_fields = {0}; // for partial updating
	char tower_id_string[13];
	snprintf(tower_id_string, sizeof(tower_id_string), "%012llx", *tower_id);
		
	parse_current_time();
	updated_fields.current_time = true;

	uint16_t i = 0;
	uint8_t assignment_index = 0;
	size_t len = strlen(buffer);
	while (i < len)
	{
		if (assignment_index >= 2)
			break;

		Assignment new = {0};
		
		// go to the next ID
		while (buffer[i] != assignment_start_char && buffer[i])
			i++;
		i++;
	
		// get ID and verify
		char new_id[TOWER_ID_SIZE];
		uint16_t k = 0;
		while (buffer[i] != delimiter && buffer[i] != '\0' && k < TOWER_ID_SIZE - 1)
		{
			new_id[k++] = buffer[i++];
		}
		new_id[k] = '\0';
	
		// go to the end of the current assignment
		if (strncmp(new_id, tower_id_string, strlen(new_id)) != 0)
		{
			while (buffer[i] != assignment_end_char && buffer[i] != '\0')
				i++;
			if (buffer[i] == assignment_end_char)
				i++;

			continue;
		}

		// know it's one of this tower's assignments
		// assignments are in the same order as previous requests

		char new_battery_charge[4] = {0};
		char tmp[2] = {0};
		i++;
		extract_field(&i, new_battery_charge, sizeof(new_battery_charge));
		extract_field(&i, new.line_number, sizeof(new.line_number));
		extract_field(&i, new.line_direction, sizeof(new.line_direction));
		extract_field(&i, new.stop_name, sizeof(new.stop_name));
		extract_field(&i, new.next_time, sizeof(new.next_time));
		extract_field(&i, new.leave_in, sizeof(new.leave_in));
		extract_field(&i, tmp, sizeof(tmp));
		new.type = (uint8_t) tmp[0] - '0';

		if (buffer[i] == assignment_end_char)
			i++;

		if (new_battery_charge[0] && strcmp(battery_charge, new_battery_charge) != 0)
		{
			// memcpy(battery_charge, new_battery_charge, 4);
			updated_fields.battery_charge = true;
		}

		if (strcmp(assignments[assignment_index].line_number, new.line_number) != 0 ||
			strcmp(assignments[assignment_index].line_direction, new.line_direction) != 0 ||
			strcmp(assignments[assignment_index].stop_name, new.stop_name) != 0)
		{
			strncpy(assignments[assignment_index].line_number, new.line_number, sizeof(assignments[assignment_index].line_number));
			strncpy(assignments[assignment_index].line_direction, new.line_direction, sizeof(assignments[assignment_index].line_direction));
			strncpy(assignments[assignment_index].stop_name, new.stop_name, sizeof(assignments[assignment_index].stop_name));
			assignments[assignment_index].type = new.type;
			updated_fields.assignment[assignment_index].static_info = true; 
		}
		if (strcmp(assignments[assignment_index].next_time, new.next_time) != 0 ||
			strcmp(assignments[assignment_index].leave_in, new.leave_in) != 0)
		{
			strncpy(assignments[assignment_index].next_time, new.next_time, sizeof(assignments[assignment_index].next_time));
			strncpy(assignments[assignment_index].leave_in, new.leave_in, sizeof(assignments[assignment_index].leave_in));
			updated_fields.assignment[assignment_index].times = true;
		}
		
		assignment_index++;

		twr_log_debug("Number:    %s, Direction: %s, Name: %s, Time: %s, Leave in: %s, Type: %d", 
			new.line_number, 
			new.line_direction, 
			new.stop_name, 
			new.next_time, 
			new.leave_in, 
			new.type);
	}
	return updated_fields;
}

void extract_field(uint16_t *i, char *dest, uint16_t max_len)
{
	uint16_t j = 0;
	while (buffer[*i] != delimiter && buffer[*i] != msg_end_char && buffer[*i] != '\0' && j < max_len - 1)
	{
		dest[j] = buffer[*i];
		(*i)++;
		j++;
	}
	// padding
	while (j < max_len)
	{
		dest[j] = '\0';
		j++;
	}

	if (buffer[*i] == delimiter)
		(*i)++;
}

void clear_assignments(Assignment assignments[2])
{
	for (uint8_t i = 0; i < 2; i++)
	{
		memset(&assignments[i].leave_in, 0 , LEAVE_IN_SIZE);
		memset(&assignments[i].line_direction, 0, LINE_DIRECTION_SIZE);
		memset(&assignments[i].line_number, 0 , LINE_NUMBER_SIZE);
		memset(&assignments[i].next_time, 0, NEXT_TIME_SIZE);
		memset(&assignments[i].stop_name, 0, STOP_NAME_SIZE);
		memset(&assignments[i].type, 0, sizeof(assignments[i].type));
	}
}

// update last seen
void send_status()
{
	const uint64_t tower_id = twr_radio_get_my_id();
	char tower_id_string[13];
	snprintf(tower_id_string, sizeof(tower_id_string), "%012llx", tower_id);
	twr_radio_pub_string("tower_health", tower_id_string);
}

// always displays gateway and tower Id for 5 seconds on boot
void display_ids_on_boot(uint64_t gateway_id, uint64_t tower_id)
{
	char g_id[13] = {0};
	char t_id[13] = {0};
	snprintf(g_id, sizeof(g_id), "%012llx", gateway_id);
	snprintf(t_id, sizeof(t_id), "%012llx", tower_id);

	char gateway_id_string[25] = "Gateway ID: ";
	char tower_id_string[25] = "Tower ID:   ";

	strncat(gateway_id_string, g_id, 12);
	strncat(tower_id_string, t_id, 12);
	
	draw_ids(gateway_id_string, tower_id_string);
	twr_tick_wait(5000);
	clear_ids();
}

static bool parse_current_time()
{
	uint16_t i = 1;
	while (buffer[i] && i < 6)
	{
		if (i != 3 && !is_digit(buffer[i])) return false;
		current_time[i - 1] = buffer[i];
		i++;
	}
	return true;
}

static bool is_digit(char c)
{
	return c >= '0' && c <= '9';
}

static void refresh_display(UpdateResult updated_fields)
{
	if (updated_fields.current_time == true)
		draw_current_time(current_time);

	// if (updated_fields.battery_charge == true)
		// draw_battery_charge(battery_charge);
		
	draw_assignments(assignments, updated_fields);
}
