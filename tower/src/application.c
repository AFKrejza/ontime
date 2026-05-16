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

twr_led_t led;
twr_button_t button;
Assignment assignments[2];
static char buffer[ASSIGNMENTS_SIZE]; // only stores assignments
static uint32_t boot_time = 0;

static uint64_t gateway_id;

char current_time[6] = "00:00";
char battery_charge[4] = "100";

void clear_assignments(Assignment assignments[2]);
void extract_field(uint16_t *i, char *dest, uint16_t max_len);
bool parse_payload(uint64_t *tower_id);
static bool parse_current_time();
static bool is_digit(char c);

void button_event_handler(twr_button_t *self, twr_button_event_t event, void *param);
void radio_event_handler(twr_radio_event_t event, void *param);
void radio_string_callback(uint64_t *id, const char *topic, void *payload, void *param);
void display_ids_on_boot(uint64_t gateway_id, uint64_t tower_id);
void send_battery_charge();

twr_radio_sub_t subscriptions[] = {
	{ .topic = "assignment/-/data/set", .type = TWR_RADIO_SUB_PT_STRING, .callback = radio_string_callback, .param = NULL }
};

// typedef struct {
// 	bool data;
// 	bool times;
// } AssignmentUpdate;

// typedef struct {
// 	AssignmentUpdate assignment[2];
// } UpdateResult;

// UpdateResult updated_result;

// Application initialization function which is called once after boot
void application_init(void)
{
	twr_log_init(TWR_LOG_LEVEL_DUMP, TWR_LOG_TIMESTAMP_ABS);
	twr_log_debug("start init");

	boot_time = twr_tick_get();

	twr_button_init(&button, TWR_GPIO_BUTTON, TWR_GPIO_PULL_DOWN, 0);
	twr_button_set_event_handler(&button, button_event_handler, NULL);

	twr_led_init(&led, TWR_GPIO_LED, false, false);
	twr_module_battery_init();
	
	twr_radio_init(TWR_RADIO_MODE_NODE_LISTENING);
	twr_radio_pairing_request("tower-ontime", FW_VERSION);
	twr_led_pulse(&led, 2000);
	twr_radio_pub_string("tower_health", "mock health data");
	twr_radio_set_event_handler(radio_event_handler, NULL);
	twr_radio_set_subs(subscriptions, sizeof(subscriptions) / sizeof(subscriptions[0]));
	
	display_init();
	paint_screen(BLACK);
	
	twr_log_debug("end init");	
}

// Application task function (optional) which is called periodically if scheduled
void application_task(void)
{
	uint32_t now = twr_tick_get();
	if (now - boot_time >= 3600000) // restart & send health data each hour
	{
		send_battery_charge();
		twr_log_debug("hourly reboot");
		twr_tick_wait(100);
		NVIC_SystemReset();
	}
	twr_scheduler_plan_current_from_now(100000);
}

void button_event_handler(twr_button_t *self, twr_button_event_t event, void *param)
{
	(void) self;
	(void) param;

	if (event == TWR_BUTTON_EVENT_CLICK)
	{
		twr_log_debug("reset button clicked");
		NVIC_SystemReset();
	}
}

void radio_event_handler(twr_radio_event_t event, void *param)
{
	twr_log_debug("RADIO event: %d", (int)event);
	if (event == TWR_RADIO_EVENT_ATTACH)
	{
		twr_log_debug("RADIO: Attached to gateway");
	}
	else if (event == TWR_RADIO_EVENT_DETACH)
	{
		twr_log_debug("RADIO: Detached from gateway");
	}
	else if (event == TWR_RADIO_EVENT_ATTACH_FAILURE)
	{
		twr_log_debug("RADIO: Attach failure");
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
		display_ids_on_boot(gateway_id, tower_id);
	}

	if (payload == NULL)
	{
		twr_log_debug("Empty payload");
		return;
	}
	draw_status(BLUE);

	size_t len = strlen((const char *)payload);
	static size_t buffer_index = 0;
	if (*(const char *)payload == msg_start_char)
	{
		twr_log_debug("first msg");
		buffer_index = 0;
		// if there are no assignments (just []):
		if (strchr((const char *)payload, msg_end_char))
		{
			twr_log_info("Gateway has no assignments");
			twr_log_debug("%s", buffer);
			clear_assignments(assignments);
			goto draw;
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
		twr_log_debug("%s", buffer);
		// TODO: disable radio here
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
		twr_log_debug("malformed message / error, clearing buffer");
		draw_status(RED); // flash
		twr_tick_wait(500);
		draw_status(BLACK);
		goto cleanup;
	}
	bool updated = parse_payload(&tower_id);
	if (updated)
	{
		draw:
		draw_current_time(current_time);
		draw_battery_charge(battery_charge);
		draw_assignments(assignments);
	}

	// prevent garbage
	cleanup:
	memset(buffer, 0, sizeof(buffer));
	buffer_index = 0;

	draw_status(GREEN);
}

bool parse_payload(uint64_t *tower_id)
{
	bool is_updated = false;
	char tower_id_string[13];
	snprintf(tower_id_string, sizeof(tower_id_string), "%012llx", *tower_id);
		
	parse_current_time();

	uint16_t i = 0;
	uint8_t assignment_index = 0;
	while (i < strlen(buffer))
	{
		if (assignment_index >= 2)
			break;

		Assignment new;
		
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

		if (strcmp(battery_charge, new_battery_charge) != 0 )
		{
			memcpy(battery_charge, new_battery_charge, 4);
		}

		if (strcmp(assignments[assignment_index].line_number, new.line_number) != 0 ||
			strcmp(assignments[assignment_index].line_direction, new.line_direction) != 0 ||
			strcmp(assignments[assignment_index].stop_name, new.stop_name) != 0)
		{
			strncpy(assignments[assignment_index].line_number, new.line_number, sizeof(assignments[assignment_index].line_number));
			strncpy(assignments[assignment_index].line_direction, new.line_direction, sizeof(assignments[assignment_index].line_direction));
			strncpy(assignments[assignment_index].stop_name, new.stop_name, sizeof(assignments[assignment_index].stop_name));
			assignments[assignment_index].type = new.type;
			is_updated = true;
		}
		if (strcmp(assignments[assignment_index].next_time, new.next_time) != 0 ||
			strcmp(assignments[assignment_index].leave_in, new.leave_in) != 0)
		{
			strncpy(assignments[assignment_index].next_time, new.next_time, sizeof(assignments[assignment_index].next_time));
			strncpy(assignments[assignment_index].leave_in, new.leave_in, sizeof(assignments[assignment_index].leave_in));
			is_updated = true;
		}
		
		assignment_index++;

		// twr_log_debug("Number:    %s", new.line_number);
		// twr_log_debug("Direction: %s", new.line_direction);
		// twr_log_debug("Name:      %s", new.stop_name);
		// twr_log_debug("Time:      %s", new.next_time);
		// twr_log_debug("Leave in:  %s", new.leave_in);
		// twr_log_debug("Type:      %d", new.type);
	}
	return is_updated;
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
	// null the rest otherwise there'll be junk values
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

// charge: 100 at 3V, 0 at 2V. Tower still works at 2.4V (charge 40)
void send_battery_charge()
{
	const uint64_t tower_id = twr_radio_get_my_id();
	char tower_id_string[13];
	snprintf(tower_id_string, sizeof(tower_id_string), "%012llx", tower_id);
	twr_module_battery_measure();
	int charge_percentage = -1;
	twr_module_battery_get_charge_level(&charge_percentage);
	twr_log_debug("Charge: %d", charge_percentage);
	char charge_string[4] = {0};
	snprintf(charge_string, sizeof(charge_string), "%d", charge_percentage);

	// id,charge
	char msg[17] = {0};
	memcpy(msg, tower_id_string, 12);
	msg[12] = ',';
	snprintf(msg + 13, sizeof(msg) - 13, "%s", charge_string);
	twr_log_debug("%s", msg);
	twr_radio_pub_string("tower_health", msg);
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
