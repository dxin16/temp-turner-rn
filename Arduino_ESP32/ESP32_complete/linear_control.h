#ifndef LINEAR_CONTROL_H
#define LINEAR_CONTROL_H

#include <stdarg.h>
#include <climits>

enum class Controller_Type {p, pi, pd, pid};

class Linear_Controller {
private:
  Controller_Type type;
  double kp;
  double ki;
  double kd;
  bool has_clamping;
  double integrator_min;
  double integrator_max;
  double actuator_min;
  double actuator_max;
  double* a_target_signal;
  double* a_feedback_signal;
  double* a_output_signal;
  double pre;
  double out_p;
  double out_i;
  double out_d;
  double out_sum;

  void clamp();
  void limit();
  
public:
  void setup_controller(Controller_Type, bool, ...);
  void connect_signals(double*, double*, double*);
  void actuate(double);
  void make_zero();
};

#endif
