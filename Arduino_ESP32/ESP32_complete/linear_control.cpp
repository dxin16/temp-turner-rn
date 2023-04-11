#include "linear_control.h"
#include <Arduino.h>

void Linear_Controller::setup_controller(Controller_Type _type, bool _has_clamping, ...) {
  type = _type;
  has_clamping = _has_clamping;
  va_list args;
  va_start(args, _has_clamping);
  kp = va_arg(args, double);
  if (type == Controller_Type::pi) {
    ki = va_arg(args, double);
    kd = 0;
  }
  else if (type == Controller_Type::pd) {
    ki = 0;
    kd = va_arg(args, double);
  }
  else if (type == Controller_Type::pid) {
    ki = va_arg(args, double);
    kd = va_arg(args, double);
  }
  else {
    ki = 0;
    kd = 0;
  }
  actuator_min = va_arg(args, double);
  actuator_max = va_arg(args, double);
  if (has_clamping) {
    integrator_min = va_arg(args, double);
    integrator_max = va_arg(args, double);
  }
  va_end(args);
  a_target_signal = NULL;
  a_feedback_signal = NULL;
  out_i = 0;
  out_sum = 0;
}

void Linear_Controller::connect_signals(double* _a_target_signal, double* _a_feedback_signal, double* _a_output_signal) {
  a_target_signal = _a_target_signal;
  a_feedback_signal = _a_feedback_signal;
  a_output_signal = _a_output_signal;
}

void Linear_Controller::actuate(double dt) {
  out_p = (*a_target_signal - *a_feedback_signal) * kp;
  out_i += (*a_target_signal - *a_feedback_signal) * ki * dt;
  out_d = (*a_feedback_signal - pre) * kd / dt;
  out_sum = out_p + out_i - out_d;
  if (has_clamping) {
    clamp();
  }
  limit();
  pre = *a_feedback_signal;
  //Serial.println(out_sum);
  *a_output_signal = out_sum;
}

void Linear_Controller::make_zero() {
  out_i = 0;
  out_sum = 0;
  *a_output_signal = 0;
}

void Linear_Controller::clamp() {
  if (out_i > integrator_max) {
    out_i = integrator_max;
  }
  else if (out_i < integrator_min) {
    out_i = integrator_min;
  }
  if (((out_sum > actuator_max) && (*a_feedback_signal > *a_target_signal)) || ((out_sum < actuator_min) && (*a_feedback_signal < *a_target_signal))) {
    out_i = 0;
  }
  out_sum = out_p + out_i - out_d;
}

void Linear_Controller::limit() {
  if (out_sum > actuator_max) {
    out_sum = actuator_max;
  }
  else if (out_sum < actuator_min) {
    out_sum = actuator_min;
  }
}
