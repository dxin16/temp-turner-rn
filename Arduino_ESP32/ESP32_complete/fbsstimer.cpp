#include <Arduino.h>
#include "temp_turner_fbss.h"

double temp_ref = 0;
double temp_cur = 0;

void setup() {
  Serial.begin(115200);
  pinMode(34, INPUT);
  pinMode(35, INPUT);
  temp_ref = (double) analogRead(34) / 1300;
  temp_cur = (double) analogRead(35) / 1300;
  //delay(2000);
  setup_fbss(16, 18, 0, &temp_ref, &temp_cur);
}

void loop() {
  temp_ref = (double) analogRead(34) / 1300;
  temp_cur = (double) analogRead(35) / 1300;
  Serial.print("Reference Temp = ");
  Serial.println(temp_ref);
  Serial.print("Current Temp = ");
  Serial.println(temp_cur);
  //actuate_fbss();
  process_pwm_signals_fbss();
  actuate_motor_controller();
  print_info();
  //delay(500);
}
