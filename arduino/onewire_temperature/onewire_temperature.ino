#include <OneWire.h>
#include <DallasTemperature.h>

float temp = 0.0;
int oneWireBus = 5;
OneWire oneWire(oneWireBus);
DallasTemperature sensors(&oneWire);

 /*
          0PSI = 0.5V, 10PSI = 4.5V
          0bar = 0.5V, 0.689476bar = 4.5V
          0mbar = (1023 / 10) = 102.3 = 102b
          689.476mbar = 1023 - (1023 / 10) = 921.7 = 922b
          mbar/bit = 689.476 / (922 - 102) = 0.84082439 mbar/bit
      
          mmH20 = mbar * 10.19716
        */

 void setup() {
    Serial.begin(9600);
    Serial.println("Bas on Tech - 1-wire temperatuur sensor");
    sensors.begin();
}

// Herhaal oneindig
void loop() {

    sensors.requestTemperatures();
    temp = sensors.getTempCByIndex(0);

    Serial.print("Temperatuur is: ");
    Serial.println(temp);

     delay(1000);
 
 }
