#include "linear_control.h"

float powP = 0;
float powI = 0;
float powD = 0;
//float powAWU = 0;
float powSum = 0;
float powSat = 0;
float dBarRef = 0;
float dBarCur = 0;
float motorActu = 0;
//float feedbackOnTime = 0;
//float feedbackOffTime = 0;
volatile unsigned long risingEdgeTime = 0;
volatile unsigned long fallingEdgeTime = 0;
volatile int feedbackPulseWidth = offP;
volatile bool firstFallingEdge = false;

void setup_controllers(int pinPWMIn0, int pinPWMIn1, int pinPWMOut) {
    //pinMode(pinPWMIn,INPUT);

    mcpwm_gpio_init(MCPWM_UNIT_0, MCPWM_CAP_0, pinPWMIn0);
    mcpwm_capture_config_t configIn0 = {
      .cap_edge = MCPWM_POS_EDGE,
      .cap_prescale = 1,
      .capture_cb = (cap_isr_cb_t) setRisingEdgeTime,
      .user_data = NULL
    };
    mcpwm_capture_enable_channel(MCPWM_UNIT_0, MCPWM_SELECT_CAP0, &configIn0);

    mcpwm_gpio_init(MCPWM_UNIT_0, MCPWM_CAP_1, pinPWMIn1);
    mcpwm_capture_config_t configIn1 = {
      .cap_edge = MCPWM_NEG_EDGE,
      .cap_prescale = 1,
      .capture_cb = (cap_isr_cb_t) setFallingEdgeTime,
      .user_data = NULL
    };
    mcpwm_capture_enable_channel(MCPWM_UNIT_0, MCPWM_SELECT_CAP1, &configIn1);

    mcpwm_gpio_init(MCPWM_UNIT_0, MCPWM0A, pinPWMOut);
    mcpwm_config_t configOut = {
      .frequency = freqOut,
      .cmpr_a = offV * 100,
      .cmpr_b = 0,
      .duty_mode = MCPWM_DUTY_MODE_0,
      .counter_mode = MCPWM_UP_COUNTER
    };
    mcpwm_init(MCPWM_UNIT_0, MCPWM_TIMER_0, &configOut);
    //mcpwm_timer_set_resolution
}

void tempC(float tempRef, float tempCur, float& tempPre) {
    powP = (tempRef - tempCur) * kp;
    powI += (tempRef - tempCur) * dt * ki;
    powD = (tempCur - tempPre) / dt * kd;
    powSum = powP + powI - powD;
  /*Serial.print("P Power = ");
  Serial.println(powP);
  Serial.print("I Power = ");
  Serial.println(powI);
  Serial.print("D Power = ");
  Serial.println(powD);
  Serial.print("Power Sum = ");
  Serial.println(powSum);*/
    tempPre = tempCur;
    if ((powSum > powMax && tempCur > tempRef) || (powSum < 0 && tempCur < tempRef)) { // clamping
      powI = 0;
      powSum = powP + powI - powD;
    }
    if (powSum > powMax) {
      powSat = powMax;
    }
    else if (powSum < 0) {
      powSat = 0;
    }
    else {
      powSat = powSum;
    }
  /*Serial.print("Stove Power = ");
  Serial.println(powSat);*/
}

void motorC() {
    dBarRef = powSat / powToAng / gP;
    //dBarCur = readFeedbackPWM(pinPWMIn) - offP;
    dBarCur = feedbackPulseWidth / (periodIn * 1000000) - offP;
    motorActu = kMotor * (dBarRef - dBarCur);
    if (motorActu > dBarVMax) {
        mcpwm_set_duty(MCPWM_UNIT_0, MCPWM_TIMER_0, MCPWM_GEN_A, (dBarVMax + offV) * 100);
    }
    else if ( motorActu < -dBarVMax) {
        mcpwm_set_duty(MCPWM_UNIT_0, MCPWM_TIMER_0, MCPWM_GEN_A, (-dBarVMax + offV) * 100);
    }
    else {
        mcpwm_set_duty(MCPWM_UNIT_0, MCPWM_TIMER_0, MCPWM_GEN_A, (motorActu + offV) * 100);
    }
  
  /*Serial.print("Reference Pos = ");
  Serial.println(gP * (dBarRef));
  Serial.print("Current Pos = ");
  Serial.println(gP * (dBarCur));
  Serial.print("\n\n");*/
}

/*float readFeedbackPWM (int pinPWMIn) {
  feedbackOnTime = pulseIn(pinPWMIn, HIGH);
  feedbackOffTime = pulseIn(pinPWMIn, LOW);
  return feedbackOnTime / (feedbackOnTime + feedbackOffTime);
}*/

void setRisingEdgeTime() {
  noInterrupts();
  risingEdgeTime = micros();
  if (firstFallingEdge) {
    if (risingEdgeTime < fallingEdgeTime) {
      feedbackPulseWidth = ULONG_MAX - fallingEdgeTime + risingEdgeTime + 1;
    }
    else {
      feedbackPulseWidth = risingEdgeTime - fallingEdgeTime;
    }
  }
  firstFallingEdge = false;
  interrupts();
}

void setFallingEdgeTime() {
  noInterrupts();
  fallingEdgeTime = micros();
  firstFallingEdge = true;
  interrupts();
}
