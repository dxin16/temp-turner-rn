#include "linear_control.h"

float tempRef = 1;
float tempCur = 0;
float tempPre = 0;

void setup() {
  Serial.begin(115200);
  pinMode(12, INPUT);
  tempCur = (float) analogRead(36) / 1300;
  tempPre = tempCur;
  setup_controllers(16, 17, 18);
}

void loop() {
  Serial.print("Reference Temp = ");
  Serial.println(tempRef);
  tempCur = (float) analogRead(36) / 1300;
  Serial.print("Current Temp = ");
  Serial.println(tempCur);
  tempC(tempRef, tempCur, tempPre);
  motorC();
  //delay(100);
}