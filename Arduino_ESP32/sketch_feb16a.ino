#include <WiFi.h>
#include <WebServer.h>

// Replace with your network credentials
const char* ssid = "REPLACE_THIS";
const char* password = "REPLACE_THIS";

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

void setup() {
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

void loop() {
  // Read analog sensors
  currentTemp = analogRead(tempPin);
  currentSmoke = analogRead(smokePin);

  // Update web page
  server.handleClient();
  delay(10);
}
