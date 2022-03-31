#include <lmic.h>
#include <hal/hal.h>
#include <SPI.h>
#include <OneWire.h>
#include <DallasTemperature.h>

#define DEBUG

#ifdef DEBUG
  #define DEBUG_PRINT(x)  Serial.print (x)
  #define DEBUG_PRINTLN(x)  Serial.println (x)
#else
  #define DEBUG_PRINT(x)
  #define DEBUG_PRINTLN(x)
#endif

#define ONE_WIRE_BUS 5

const int pressurePin = A5;
const int ledPin = LED_BUILTIN;

float tempC = 0.0;
float pressureMbar = 0.0;
int pressureVoltage = 0;

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

static const u1_t PROGMEM APPEUI[8]={ 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 };
void os_getArtEui (u1_t* buf) { memcpy_P(buf, APPEUI, 8);}

static const u1_t PROGMEM DEVEUI[8]={ 0x62, 0xE9, 0x04, 0xD0, 0x7E, 0xD5, 0xB3, 0x70 };
void os_getDevEui (u1_t* buf) { memcpy_P(buf, DEVEUI, 8);}

static const u1_t PROGMEM APPKEY[16] = { 0x4A, 0x1B, 0xCF, 0xDE, 0x1C, 0xDA, 0x43, 0x06, 0x60, 0x0C, 0xFB, 0x08, 0x4D, 0x90, 0x7C, 0x6D };
void os_getDevKey (u1_t* buf) {  memcpy_P(buf, APPKEY, 16);}

static uint8_t payload[4];
static osjob_t sendjob;

const unsigned TX_INTERVAL = 60;

const lmic_pinmap lmic_pins = {
    .nss = 10,
    .rxtx = LMIC_UNUSED_PIN,
    .rst = 9,
    .dio = {2, 6, 7}
};

void printHex2(unsigned v) {
    v &= 0xff;
    if (v < 16)
        DEBUG_PRINT('0');
    Serial.println(v, HEX);
}

void onEvent (ev_t ev) {
    DEBUG_PRINT(os_getTime());
    DEBUG_PRINT(": ");
    switch(ev) {
        case EV_SCAN_TIMEOUT:
            DEBUG_PRINTLN(F("EV_SCAN_TIMEOUT"));
            break;
        case EV_BEACON_FOUND:
            DEBUG_PRINTLN(F("EV_BEACON_FOUND"));
            break;
        case EV_BEACON_MISSED:
            DEBUG_PRINTLN(F("EV_BEACON_MISSED"));
            break;
        case EV_BEACON_TRACKED:
            DEBUG_PRINTLN(F("EV_BEACON_TRACKED"));
            break;
        case EV_JOINING:
            DEBUG_PRINTLN(F("EV_JOINING"));
            break;
        case EV_JOINED:
            DEBUG_PRINTLN(F("EV_JOINED"));
            {
              u4_t netid = 0;
              devaddr_t devaddr = 0;
              u1_t nwkKey[16];
              u1_t artKey[16];
              LMIC_getSessionKeys(&netid, &devaddr, nwkKey, artKey);
              DEBUG_PRINT("netid: ");
              Serial.println(netid, DEC);
              DEBUG_PRINT("devaddr: ");
              Serial.println(devaddr, HEX);
              DEBUG_PRINT("AppSKey: ");
              for (size_t i=0; i<sizeof(artKey); ++i) {
                if (i != 0)
                  DEBUG_PRINT("-");
                printHex2(artKey[i]);
              }
              DEBUG_PRINTLN("");
              DEBUG_PRINT("NwkSKey: ");
              for (size_t i=0; i<sizeof(nwkKey); ++i) {
                      if (i != 0)
                              DEBUG_PRINT("-");
                      printHex2(nwkKey[i]);
              }
              DEBUG_PRINTLN();
            }
            LMIC_setLinkCheckMode(0);
            break;
        case EV_JOIN_FAILED:
            DEBUG_PRINTLN(F("EV_JOIN_FAILED"));
            break;
        case EV_REJOIN_FAILED:
            DEBUG_PRINTLN(F("EV_REJOIN_FAILED"));
            break;
        case EV_TXCOMPLETE:
            DEBUG_PRINTLN(F("EV_TXCOMPLETE (includes waiting for RX windows)"));
            if (LMIC.txrxFlags & TXRX_ACK)
              DEBUG_PRINTLN(F("Received ack"));
            if (LMIC.dataLen) {
              DEBUG_PRINT(F("Received "));
              DEBUG_PRINT(LMIC.dataLen);
              DEBUG_PRINTLN(F(" bytes of payload"));
            }
            // Schedule next transmission
            os_setTimedCallback(&sendjob, os_getTime()+sec2osticks(TX_INTERVAL), do_send);
            break;
        case EV_LOST_TSYNC:
            DEBUG_PRINTLN(F("EV_LOST_TSYNC"));
            break;
        case EV_RESET:
            DEBUG_PRINTLN(F("EV_RESET"));
            break;
        case EV_RXCOMPLETE:
            DEBUG_PRINTLN(F("EV_RXCOMPLETE"));
            break;
        case EV_LINK_DEAD:
            DEBUG_PRINTLN(F("EV_LINK_DEAD"));
            break;
        case EV_LINK_ALIVE:
            DEBUG_PRINTLN(F("EV_LINK_ALIVE"));
            break;
        case EV_TXSTART:
            DEBUG_PRINTLN(F("EV_TXSTART"));
            break;
        case EV_TXCANCELED:
            DEBUG_PRINTLN(F("EV_TXCANCELED"));
            break;
        case EV_RXSTART:
            break;
        case EV_JOIN_TXCOMPLETE:
            DEBUG_PRINTLN(F("EV_JOIN_TXCOMPLETE: no JoinAccept"));
            break;

        default:
            DEBUG_PRINT(F("Unknown event: "));
            DEBUG_PRINTLN((unsigned) ev);
            break;
    }
}

float checkTemp() {
  sensors.requestTemperatures();
  return sensors.getTempCByIndex(0);
}

float checkPressure() {
  pressureVoltage = analogRead(pressurePin);
  return ( pressureVoltage - 102) * 0.84082439;
}

void do_send(osjob_t* j){
    
    if (LMIC.opmode & OP_TXRXPEND) {
        DEBUG_PRINTLN(F("OP_TXRXPEND, not sending"));
    } else {
        
        tempC = checkTemp() / 100;    
        uint16_t payloadTemp = LMIC_f2sflt16(tempC);
        byte tempLow = lowByte(payloadTemp);
        byte tempHigh = highByte(payloadTemp);
        payload[0] = tempLow;
        payload[1] = tempHigh;
        
        pressureMbar = checkPressure() / 1000;
        uint16_t payloadPressure = LMIC_f2sflt16(pressureMbar);
        byte pressureLow = lowByte(payloadPressure);
        byte pressureHigh = highByte(payloadPressure);
        payload[2] = pressureLow;
        payload[3] = pressureHigh;
    
        DEBUG_PRINT("temp: ");
        DEBUG_PRINT(tempC*100);
        DEBUG_PRINT("C pressure: ");
        DEBUG_PRINT(pressureMbar*1000);
        DEBUG_PRINTLN("mbar");
      
        LMIC_setTxData2(1, payload, sizeof(payload)-1, 0);
        DEBUG_PRINTLN(F("Packet queued"));
    }
}

void setup() {

    pinMode(pressurePin, INPUT);
    pinMode(ledPin, OUTPUT);
    digitalWrite(ledPin, LOW);

    Serial.begin(9600);

    while(!Serial);
    DEBUG_PRINTLN("Spurkpoel observatory has started observing!");

    sensors.begin();

    os_init();
    LMIC_reset();
    LMIC_setLinkCheckMode(0);
    LMIC_setDrTxpow(DR_SF7, 14);
    do_send(&sendjob);
}

void loop() {
    os_runloop_once();
}
