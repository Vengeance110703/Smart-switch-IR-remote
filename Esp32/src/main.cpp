#include <Arduino.h>
#include "Preferences.h"
#include <HTTPClient.h>
#include <WiFi.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>

Preferences pref;

const char *ssid = "Sheth 2.4 Ghz";
const char *password = "all161803";

String serverName = "http://192.168.29.8:3000";

int relay[] = {18, 19};
int manual[] = {22, 23};

String httpGETRequest(String serverName)
{
  WiFiClient client;
  HTTPClient http;

  http.begin(client, serverName);

  int httpResponseCode = http.GET();

  String payload = "{}";

  if (httpResponseCode > 0)
  {
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    payload = http.getString();
    payload.remove(0, 1);
    payload.remove(payload.length() - 1, 1);
  }
  else
  {
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
  }

  http.end();

  return payload;
}

void httpPUTRequest(String serverName, boolean state)
{
  WiFiClient client;
  HTTPClient http;

  http.begin(client, serverName);

  http.addHeader("Content-Type", "application/json");

  JsonDocument doc;
  doc["state"] = state;

  String payload;
  serializeJson(doc, payload);

  int httpResponseCode = http.PUT(payload);

  if (httpResponseCode > 0)
  {
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
  }
  else
  {
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
  }

  http.end();
}

boolean checkState(int id)
{
  String payload = httpGETRequest(serverName + "/state/" + (String)id);
  JsonDocument doc;
  DeserializationError err = deserializeJson(doc, payload);
  if (err)
  {
    Serial.println(err.c_str());
    Serial.println("error");
  }
  return doc["state"];
}

void changeState(boolean state, int id, String device)
{
  String switch_id = device + (String)id;
  if (pref.getBool(switch_id.c_str()) != state)
  {
    pref.putBool(switch_id.c_str(), state);
    if (pref.getBool(((String)id).c_str()) != state)
    {
      pref.putBool(((String)id).c_str(), state);
      digitalWrite(relay[id - 1], !state);
      if (device == "manual")
      {
        httpPUTRequest(serverName + "/state/" + (String)id, state);
      }
    }
  }
}

void setup()
{
  Serial.begin(115200);
  pref.begin("switch", false);

  // Wifi Connect
  WiFi.begin(ssid, password);
  Serial.println("Connecting");
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Connected to WiFi network with IP Address : ");
  Serial.println(WiFi.localIP());

  // Get Default State
  String dState = "[" + httpGETRequest(serverName + "/state") + "]";
  Serial.println(dState);
  JsonDocument doc;
  DeserializationError err = deserializeJson(doc, dState);

  if (err)
  {
    Serial.println(err.c_str());
  }

  // Set Default State
  for (int i = 0; i < 2; i++)
  {
    pinMode(manual[i], INPUT_PULLUP);
    digitalWrite(manual[i], HIGH);
    pinMode(relay[i], OUTPUT);
    digitalWrite(relay[i], !(boolean)doc[i]["state"]);
    Serial.println((boolean)doc[i]["state"]);
  }
}

void loop()
{
  for (int i = 0; i < 2; i++)
  {
    int serverState = checkState(i + 1);
    changeState(serverState, i + 1, "server");
  }
  delay(250);
  for (int i = 0; i < 2; i++)
  {
    boolean manualState = !(digitalRead(manual[i]));
    changeState(manualState, i + 1, "manual");
  }
  delay(250);
}
