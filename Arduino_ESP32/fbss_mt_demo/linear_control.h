#include <Arduino.h>
#include "driver/mcpwm.h"
#include "soc/mcpwm_reg.h"
#include "soc/mcpwm_struct.h"

const float kp = 1200.0;
const float ki = 1200.0;
const float kd = -1200.0;
const float dt = 1;
//const float gAWU = 0.01;
const float powMax = 1000;
const float periodIn = 0.0010989;
const int freqOut = 50;
const float offP = 0.029 + 0.05;
const float offV = 0.075;
const float gP = 1.0504;
//const float gV;
const float kMotor = 0.1;
const float dBarVMax = 0.003;
const float powToAng = 2000;

//enum capture_edge_type {PWM_RISING, PWM_FALLING};

void setup_controllers(int, int, int);
void tempC(float, float, float&);
void motorC();
//float readFeedbackPWM(int);
void setRisingEdgeTime();
void setFallingEdgeTime();