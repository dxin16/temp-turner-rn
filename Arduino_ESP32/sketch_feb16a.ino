// Sensor is connected to GPIO 34 (Analog ADC1_CH6) 
const int pin_temp_sen = 34;
const int pin_smk_sen= 36;
const int pin_current_fb = 25;
const int pin_target_fb = 26;

//hi
// variable for storing the potentiometer value
int alg_temp_sen = 0;
int alg_smk_sen = 0;
int dgl_current_fb = 0;
int dgl_target_fb = 0;
int target_tmp_app = 0;


void setup() {
  Serial.begin(115200);
  delay(1000);
}

void loop() {
  // Reading potentiometer value
  alg_temp = analogRead(pin_temp_sen);
  smk_stove = analogRead(pin_smk_sen);
  Serial.println(alg_temp);
  Serial.println(smk_stove);


  //Communicated to App; send current temperature ane receive target temparature.
  //target_tmp_app = //HTTP request
  //Send current temperature.

  //Converting to analog signal for feedback system.
  dgl_current_fb = alg_temp/16

  dacWrite(pin_current_fb, Value);
  dacWrite(pin_target_fb, Value);


  delay(1000);
}