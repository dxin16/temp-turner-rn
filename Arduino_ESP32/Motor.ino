#include <Arduino.h>
#include "driver/mcpwm.h"
#include "soc/mcpwm_reg.h"
#include "soc/mcpwm_struct.h"

const int kp = 2000;
const int ki = 1000;
const int kd = -1000;
const float dt = 0.1;
const int velFreq = 50;
const float offP = 0.029;
const float offV = 0.075;
const float gP = 1.05;
//const float gV;
const float powToAng = 1000;


//#include "linear_control.h"

const int pinPWMIn = 16;  // 16 corresponds to GPIO16
const int pinPWMOut = 17; 


float powInt = 0;
float powAWU = 0;
float powSum = 0;
float powSat = 0;
float dBarRef = 0;
float dBarCur = 0;

void setup_controllers(int pinPWMIn, int pinPWMOut) {
    ledcSetup(0, 910, 10);
    ledcAttachPin(pinPWMIn, 0);

    mcpwm_gpio_init(MCPWM_UNIT_0, MCPWM0A, pinPWMOut);
    mcpwm_config_t config0 = {};
        config0.frequency = velFreq;
        config0.cmpr_a = 0;
        config0.cmpr_b = 0;
        config0.counter_mode = MCPWM_UP_COUNTER;
        config0.duty_mode = MCPWM_DUTY_MODE_0;
    mcpwm_init(MCPWM_UNIT_0, MCPWM_TIMER_0, &config0);
}

void tempC(float tempRef, float tempCur, float& tempPre) {
    powInt += (tempRef - tempCur - powAWU) * dt * ki;
    powSum = (tempRef - tempCur) * kp + powInt - (tempCur - tempPre) / dt * kd;
    tempPre = tempCur;
    if (powSum > 1000) {
        powAWU = powSum - 1000;
        powSat = 1000;
    }
    else if (powSum < 0) {
        powAWU = -powSum;
        powSat = 0;
    }
    else {
        powAWU = 0;
        powSat = powSum;
    }
}

void motorC() {
    dBarRef = powSat / powToAng / gP;
    dBarCur = ledcRead(0) / 100 - offP;
    if ((dBarRef - dBarCur) > 0.011) {
        mcpwm_set_duty(MCPWM_UNIT_0, MCPWM_TIMER_0, MCPWM_GEN_A, (0.011 + offV) * 100);
    }
    else if ((dBarRef - dBarCur) < -0.011) {
        mcpwm_set_duty(MCPWM_UNIT_0, MCPWM_TIMER_0, MCPWM_GEN_A, (-0.011 + offV) * 100);
    }
    else {
        mcpwm_set_duty(MCPWM_UNIT_0, MCPWM_TIMER_0, MCPWM_GEN_A, (offV + dBarRef - dBarCur) * 100);
    }
}



float TargetValue1;
float CurrentValue2;
float tempPre;

void setup(){
  Serial.begin(115200);

  setup_controllers(pinPWMIn, pinPWMOut);
  TargetValue1 = analogRead(32);
  CurrentValue2 = analogRead(33);
  tempPre = CurrentValue2;
}

void loop(){
  
  // TargetValue1 = analogRead(32);
  // CurrentValue2 = analogRead(33);

  // // Serial.print(TargetValue1);
  // // Serial.print("\t"); // or Serial.print(" ")
  // // Serial.println(CurrentValue2);
  // // Serial.print("\t"); // or Serial.print(" ")

  // Serial.println();


  
  tempC(TargetValue1, CurrentValue2, tempPre);
  motorC();

}
