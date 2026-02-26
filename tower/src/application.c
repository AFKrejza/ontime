// Tower Kit documentation https://tower.hardwario.com/
// SDK API description https://sdk.hardwario.com/
// Forum https://forum.hardwario.com/

#include <application.h>
#include <twr_lis2dh12.h>

void event_handler(twr_lis2dh12_t *accel, twr_lis2dh12_event_t event, void *event_param);

twr_lis2dh12_t accel;
twr_lis2dh12_result_g_t accel_result;

// Application initialization function which is called once after boot
void application_init(void)
{
    // Initialize logging
    twr_log_init(TWR_LOG_LEVEL_DUMP, TWR_LOG_TIMESTAMP_ABS);
    twr_log_debug("FINALLY");

    twr_lis2dh12_init(&accel, TWR_I2C_I2C0, 0x19); // where's the 0x19 from
    twr_lis2dh12_set_event_handler(&accel, event_handler, NULL);
    twr_lis2dh12_set_update_interval(&accel, 1000);

}

// Application task function (optional) which is called periodically if scheduled
void application_task(void)
{
    // static int counter = 0;

    // Log task run and increment counter
    // twr_log_debug("APP: Task run (count: %d)", ++counter);

    // Plan next run of this task in 1000 ms
    twr_scheduler_plan_current_from_now(1000);
}

void event_handler(twr_lis2dh12_t *accel, twr_lis2dh12_event_t event, void *event_param)
{
    (void) accel, (void) event_param;

    if (event == TWR_LIS2DH12_EVENT_UPDATE)
    {
        twr_lis2dh12_get_result_g(accel, &accel_result);
        twr_log_debug("%f, %f, %f\n", accel_result.x_axis, accel_result.y_axis, accel_result.z_axis);
    }
    else
        twr_log_debug("error");
}
