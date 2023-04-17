#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include "temp_turner_fbss.h"

// Replace with your network credentials
const char* ssid = "iPhone Chyi";
const char* password = "hijason123";

// Create an instance of the web server
WebServer server(80);

// Analog pins for temperature and smoke sensors
const int tempPin = 34;
const int smokePin = 35;

// Current temperature and smoke level
int currentTemp = 0;
int currentSmoke = 0;

// Target temperature
int targetTemp = 0;

double temp_ref = 0;
double temp_cur = 0;
  


void setup() {

  //For fbss
  setup_fbss(16, 18, &temp_ref, &temp_cur);
  temp_ref = (double) analogRead(34) / 1300;
  temp_cur = (double) analogRead(35) / 1300;


  // Initialize serial communication
  Serial.begin(115200);

  //Start from Web:
  // Connect to Wi-Fi network
  WiFi.begin(ssid, password);
  Serial.println("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println(".");
  }

  // Print local IP address
  Serial.println("Connected to Wi-Fi");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  // Route for the root web page
  server.on("/", HTTP_GET, [](){
    String html = "<html><body>";
    html += "<h1>Current Temperature: " + String(currentTemp) + "</h1>";
    html += "<h1>Current Smoke Level: " + String(currentSmoke) + "</h1>";
    html += "<h1>Target Temperature: " + String(targetTemp) + "</h1>";
    html += "<form method='POST' action='/target'>";
    html += "<label for='temp'>Target Temperature:</label>";
    html += "<input type='number' id='temp' name='temp'>";
    html += "<input type='submit' value='Submit'>";
    html += "</form></body></html>";
    server.send(200, "text/html", html);
  });

  // Route for setting the target temperature
  server.on("/target", HTTP_POST, [](){
    targetTemp = server.arg("temp").toInt();
    server.send(200, "text/plain", "Target temperature set to: " + String(targetTemp));
  });

  // Start the server
  server.begin();

  // Initialize analog pins
  pinMode(tempPin, INPUT);
  pinMode(smokePin, INPUT);
}

#define SAMPLE_SIZE 1000

uint16_t temp_record[SAMPLE_SIZE];
uint16_t temp_index = 0;
int over_Sample(int currentTemp){
  temp_record[temp_index] = currentTemp;
  temp_index++;
  if (temp_index > SAMPLE_SIZE) temp_index = 0;
  
  int sum = 0;
  for(int i = 0; i < sizeof(temp_record) / sizeof(temp_record[0]); i++){
    
    sum += temp_record[i];
    
  }
  return sum / SAMPLE_SIZE;
}


void loop() {

  //For fbss
  temp_ref = (double) targetTemp;
  temp_cur = (double) currentTemp;
  Serial.print("Reference Temp = ");
  Serial.println(temp_ref);
  Serial.print("Current Temp = ");
  Serial.println(temp_cur);
  actuate_fbss();
  print_info();




  // Read analog sensors
  currentTemp = analogRead(tempPin);
  currentTemp = over_Sample(currentTemp);
  currentTemp = (currentTemp + 160) / 6;

  currentSmoke = analogRead(smokePin);

  // Update web page
  server.handleClient();
  delay(10);
}