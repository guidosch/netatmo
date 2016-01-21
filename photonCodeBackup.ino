int led = D0;
int motionSensor = D1;
int sensorValue;
unsigned int FIVE_MINUTES_MILLIS = 1000*10;
unsigned long currentTime;
unsigned long lastCloudEvent = 0;
unsigned long lastUDPEvent = 0;
unsigned long lastCheck = 0;


//loxone muss immer gleiche ip haben --> next router mit mac to dhcp server
UDP Udp;
unsigned int localPort = 8777;
unsigned int remotePort = 8765;
IPAddress remoteIP(192, 168, 1, 44);
unsigned char str[6] = {108, 111, 120, 111, 110, 101}; //loxone




void setup() {
    pinMode(led,OUTPUT);
    pinMode(motionSensor,INPUT);
    Particle.variable("motionSensor", &sensorValue, INT);
    currentTime = millis();
    Serial.begin(9600);
    Serial.println("Sending UPD to ip: 192.168.1.44 and port: 8765");
    Serial.print("Local IP is: ");
    Serial.println(WiFi.localIP());
    Udp.begin(localPort);
}

void loop() {
    sensorValue = digitalRead(motionSensor);
    ledToggle(sensorValue);
    
    if (sensorValue) {
        currentTime = millis();
        cloudEvent();
        udpEvent();
        checkLoxoneServer();
    }
}


int ledToggle(int value) {
    if (value) {
        digitalWrite(led,HIGH);
        return 1;
    }
    else {
        digitalWrite(led,LOW);
        return 0;
    }

}

void udpEvent() {
    if (WiFi.ready()) {
        if (currentTime-lastUDPEvent > FIVE_MINUTES_MILLIS) {
            //repeat UDP paket 3 times with delay
            for (int i=0; i < 3; i++) {
                Serial.println("Writing UDP");
                Udp.beginPacket(remoteIP, remotePort);
                Udp.write(str, 6);
                Udp.endPacket();
                lastUDPEvent = millis();
                delay(200);
            }
        }
    }
}

void cloudEvent(){
    if (currentTime-lastCloudEvent > FIVE_MINUTES_MILLIS) {
        Serial.println("Sending cloud event");
        bool response = Particle.publish("motion-detected");
        if (!response){
            Serial.println("Sending cloud event failed");
        }
        lastCloudEvent = millis();
    }
}

void checkLoxoneServer() {
    if (currentTime-lastCheck > FIVE_MINUTES_MILLIS) {
        if (WiFi.ready()) {
            int response = WiFi.ping(remoteIP, 3);
            if (response == 3){
                Serial.println("Loxone server is here");
            } else {
                Serial.println("Loxone server not reachable!");
            }
            lastCheck = millis();
        } else {
            Serial.print("Wifi is not working...SSID is: ");
            Serial.println(WiFi.SSID());
        }
    }
}
