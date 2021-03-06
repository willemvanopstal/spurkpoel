
/*
 Spurkpoel observatory
 willem van opstal, march 2022

 - OneWire temperature sensor DSB1820
   - 4.7kOhm resistor between +5V and DATA.
 - Analog pressure sensor
   0.5 - 4.5V, 0 - 10 psi

 Libraries to download and include:
 - OneWire (manager)
 - DallasTemperature (manager)
   
*/

#include <OneWire.h>
#include <DallasTemperature.h>

#define ONE_WIRE_BUS 12 // temperature sensor pin

const int pressurePin = A7;
const int ledPin = LED_BUILTIN;

float tempC = 0.0;
float pressureMbar = 0.0;
float depthMm = 0.0;

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

void setup() {
  pinMode(pressurePin, INPUT);
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);

  Serial.begin(9600);
  Serial.println("Spurkpoel observatory has started observing!");

  sensors.begin();
}

void loop() {
  sensors.requestTemperatures();
  tempC = sensors.getTempCByIndex(0);

  int pressureVoltage = analogRead(pressurePin);
  /*
    0PSI = 0.5V, 10PSI = 4.5V
    0bar = 0.5V, 0.689476bar = 4.5V
    0mbar = (1023 / 10) = 102.3 = 102b
    689.476mbar = 1023 - (1023 / 10) = 921.7 = 922b
    mbar/bit = 689.476 / (922 - 102) = 0.84082439 mbar/bit

    mmH20 = mbar * 10.19716
  */
  pressureMbar = ( pressureVoltage - 102) * 0.84082439;

  Serial.print("temp: ");
  Serial.print(tempC);
  Serial.print("C pressure: ");
  Serial.print(pressureMbar);
  Serial.print("mbar depth: ");
  Serial.print(depthMm);
  Serial.println(" mm");
}
