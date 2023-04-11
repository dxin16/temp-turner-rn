#include "temp_turner_fbss.h"

volatile uint32_t last_edge_time = 0;
volatile bool first_falling_edge = false;
volatile int feedback_pulse_width_cur = 0;

unsigned long time_pre = 0;
unsigned long time_cur = 0;
int feedback_pulse_width_pre = 0;
int feedback_pulse_width_med = 0;
int feedback_pulse_width_window_chron[window_size] = {0};
int feedback_pulse_width_window_sort[window_size] = {0};
uint8_t window_idx = 0;
int rot_idx = 0;
double power_signal = 0;
double dbar_vel_signal = 0;
double dbar_ang_feedback_signal = 0;
double dbar_ang_target_signal = 0;
double d_ang_init_offset = 0;

Linear_Controller temp_controller;
Linear_Controller ang_controller;

bool read_pwm(mcpwm_unit_t mcpwm, mcpwm_capture_channel_id_t cap_channel, const cap_event_data_t *edata, void *user_data) {
  if ((edata->cap_edge) == MCPWM_NEG_EDGE) {
    last_edge_time = edata->cap_value;
    first_falling_edge = true;
  }
  else if (first_falling_edge && ((edata->cap_edge) == MCPWM_POS_EDGE)) {
    feedback_pulse_width_cur = edata->cap_value - last_edge_time;
    first_falling_edge = false;
  }
  return true;
}

/*void setup_timer(int ch) {
  controller_timer = timerBegin(0, 8000, true);
  timerAttachInterrupt(controller_timer, &actuate_temp_controller_isr, true);
  timerAlarmWrite(controller_timer, 1000, true); // 10 Hz
  timerAlarmEnable(controller_timer);
}*/


void setup_fbss(int pin_in, int pin_out, double* a_temp_target_signal, double* a_temp_feedback_signal) {
  temp_controller.setup_controller(Controller_Type::pi, true, 600.0, 800.0, 0.0, 1000.0, -100000.0, 100000.0);
  ang_controller.setup_controller(Controller_Type::p, false, 0.1, -0.4, 0.4);  
  setup_pwm(pin_in, pin_out);
  connect_controllers(a_temp_target_signal, a_temp_feedback_signal);
  calibrate_fbss();
}

void calibrate_fbss() {
  while(feedback_pulse_width_window_sort[0] == 0){
    Serial.print("Currentpw = ");
    Serial.println(feedback_pulse_width_med);
    Serial.print("prepw = ");
    Serial.println(feedback_pulse_width_pre);
    process_pwm_feedback();
  }
  process_pwm_feedback();
  process_pwm_feedback();
  process_pwm_feedback();
  Serial.println("done array");
  d_ang_init_offset = calc_duty(feedback_pulse_width_med);
  rot_idx = 0;
  dbar_ang_feedback_signal = 0;
}

void setup_pwm(int pin_in, int pin_out) {
    mcpwm_gpio_init(MCPWM_UNIT_0, MCPWM_CAP_0, pin_in);
    mcpwm_capture_config_t config_in = {
      .cap_edge = MCPWM_BOTH_EDGE,
      .cap_prescale = 1,
      .capture_cb = &read_pwm,
      .user_data = NULL
    };
    mcpwm_capture_enable_channel(MCPWM_UNIT_0, MCPWM_SELECT_CAP0, &config_in);

    mcpwm_gpio_init(MCPWM_UNIT_0, MCPWM0A, pin_out);
    mcpwm_config_t config_out = {
      .frequency = freq_out,
      .cmpr_a = d_vel_offset,
      .cmpr_b = 0,
      .duty_mode = MCPWM_DUTY_MODE_0,
      .counter_mode = MCPWM_UP_COUNTER
    };
    mcpwm_init(MCPWM_UNIT_0, MCPWM_TIMER_0, &config_out);
    //mcpwm_timer_set_resolution
}

void connect_controllers(double* a_temp_target_signal, double* a_temp_feedback_signal) {
  temp_controller.connect_signals(a_temp_target_signal, a_temp_feedback_signal, &power_signal);
  ang_controller.connect_signals(&dbar_ang_target_signal, &dbar_ang_feedback_signal, &dbar_vel_signal);
}

void process_pwm_target() {
  dbar_ang_target_signal = power_signal / pow_over_ang / ang_over_dbar;
}

static double calc_duty(int pulse_width) {
  return (double) pulse_width / 80000000.0 * freq_in * 100;
}

void process_pwm_feedback() {
  feedback_pulse_width_window_chron[window_idx] = feedback_pulse_width_cur;
  window_idx += 1;
  if (window_idx >= window_size) {
    window_idx = 0;
  }
  feedback_pulse_width_pre = feedback_pulse_width_med;
  feedback_pulse_width_med = filter_window_median(feedback_pulse_width_window_chron, feedback_pulse_width_window_sort, window_size);
  
  if (feedback_pulse_width_med < (feedback_pulse_width_pre - 2600.0)) {
    rot_idx += 1;
  }
  else if (feedback_pulse_width_med > (feedback_pulse_width_pre + 2600.0)) {
    rot_idx -= 1;
  }
  
  if (rot_idx == 0) {
    dbar_ang_feedback_signal = calc_duty(feedback_pulse_width_med) - d_ang_init_offset;
  }
  else if (rot_idx > 0) {
    dbar_ang_feedback_signal = (d_ang_max - d_ang_init_offset) + (calc_duty(feedback_pulse_width_med) - d_ang_min) + (rot_idx - 1);
  }
  else if (rot_idx < 0) {
    dbar_ang_feedback_signal =  -(d_ang_init_offset - d_ang_min) - (d_ang_max - calc_duty(feedback_pulse_width_med)) - (rot_idx + 1);
  }
}

void actuate_fbss() {
  time_cur = micros();
  temp_controller.actuate((double) (time_cur - time_pre) / 1000000.0);
  process_pwm_target();
  process_pwm_feedback();
  ang_controller.actuate((double) (time_cur - time_pre) / 1000000.0);
  if (dbar_vel_signal < 0.12 && dbar_vel_signal > -0.12) {
    dbar_vel_signal = 0; 
  }
  set_motor_vel();
  time_pre = time_cur;
}

void set_motor_vel() {
  mcpwm_set_duty(MCPWM_UNIT_0, MCPWM_TIMER_0, MCPWM_GEN_A, dbar_vel_signal + d_vel_offset);
}

void print_info() {
  /*Serial.print("fdbk pre=");
  Serial.println(feedback_pulse_width_pre);
  Serial.print("dc = ");
  Serial.println(calc_duty(feedback_pulse_width_med));*/
  Serial.print("power=");
  Serial.println(power_signal);
  Serial.print("dbar angle tar=");
  Serial.println(dbar_ang_target_signal);
  Serial.print("vel=");
  Serial.println(dbar_vel_signal);
  Serial.print("dbar angle cur=");
  Serial.println(dbar_ang_feedback_signal);
  Serial.print("rotidx=");
  Serial.println(rot_idx);
  Serial.println();
}