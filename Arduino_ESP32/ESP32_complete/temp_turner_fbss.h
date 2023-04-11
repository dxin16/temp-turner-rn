#ifndef TEMP_TURNER_FBSS_H
#define TEMP_TURNER_FBSS_H

#include <Arduino.h>
#include "driver/mcpwm.h"
#include "soc/mcpwm_reg.h"
#include "soc/mcpwm_struct.h"
#include "linear_control.h"
#include "median_window_filter.h"

const double freq_in = 910.0;
const int freq_out = 50;
const double d_ang_min = 2.9;
const double d_ang_max = 97.1;
const double d_vel_offset = 7.5;
const double dbar_ang_moe = 50;
const double dbar_vel_moe = 0.02;
const double pulse_width_moe = 6;
const double ang_over_dbar = 1 / (d_ang_max - d_ang_min + 1);
const double pow_over_ang = 1100.0;
const uint8_t window_size = 11;

bool read_pwm(mcpwm_unit_t, mcpwm_capture_channel_id_t, const cap_event_data_t*, void*);

void setup_fbss(int, int, double*, double*);
void actuate_fbss();
void print_info();

static void calibrate_fbss();
static void setup_pwm(int, int);
static void connect_controllers(double*, double*);
static void process_pwm_target();
static void process_pwm_feedback();
static double calc_duty(int);
static void set_motor_vel();

#endif
