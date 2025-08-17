// - Constant declarations
#define PIN_CSENSE 2
#define PIN_CREF 4
#define PIN_NEEDLE_RTL 5
#define PIN_NEEDLE_LTR 6
#define switchPin 11
#define goStopPin 12
#define okPin 13

// map to pin status // idea to be able to check status of buttons
bool buttonState[14];

// - Variable declarations
volatile uint8_t csenseNow = 0;
volatile uint8_t crefNow = 0;
volatile char direction = 'L';
volatile uint8_t state = 0;
volatile int counter = 0;
volatile bool changed = false;
uint8_t messageLength = 0;
uint8_t messageCounter = 0;
uint8_t color = 0;
// volatile uint8_t needleBed[23] = {255, 0, 255, 0, 255, 0, 255, 0, 255, 0, 255, 0, 255, 0, 255, 0, 255, 0, 255, 0, 255, 0, 255}; // 23bytes = (179needles + 7)/8bits-1
// volatile uint8_t needleBed[23] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0}; // 23bytes = (179needles + 7)/8bits-1
// volatile uint8_t input = 0;
volatile uint8_t needleBed[23];
int rightEnd = 179;
int leftEnd = 0;
void setup()
{
	Serial.begin(115200);
	// NeedleBed Reset
	memset(needleBed, 255, sizeof(needleBed));
	// Light Sensors
	pinMode(PIN_CSENSE, INPUT_PULLUP);
	pinMode(PIN_CREF, INPUT_PULLUP);
	attachInterrupt(digitalPinToInterrupt(PIN_CSENSE), interrupt_CSENSE, CHANGE);
	// Motor control buttons
	pinMode(goStopPin, OUTPUT);
	digitalWrite(goStopPin, HIGH);
	pinMode(switchPin, OUTPUT);
	digitalWrite(switchPin, HIGH);
	pinMode(okPin, OUTPUT);
	digitalWrite(okPin, HIGH);
	// Pattern control, magnet output
	pinMode(PIN_NEEDLE_LTR, OUTPUT);
	digitalWrite(PIN_NEEDLE_LTR, HIGH);
	pinMode(PIN_NEEDLE_RTL, OUTPUT);
	digitalWrite(PIN_NEEDLE_RTL, HIGH);
	buttonState[switchPin] = false;
	buttonState[goStopPin] = false;
	buttonState[okPin] = false;
}

void loop()
{
	serialStream();
	if (changed)
	{
		directionChange();
	}
	int index = counter - 26;
	switch (state)
	{
	case 30: // 0 1 // 01
			 // if ((index >= (leftEnd - 11)) && (index < (rightEnd - 11)))
			 // {
		needlePosition(PIN_NEEDLE_RTL, index + 11);
		// }
		// else
		if ((index < (leftEnd - 20)) && (direction != 'L'))
		{
			direction = 'L'; // LTR
			changed = true;
		}
		break;

	case 41: // 1 0 // 40
		// if ((index >= (leftEnd - 11)) && (index < (rightEnd - 11)))
		// {
		needlePosition(PIN_NEEDLE_RTL, index + 11);
		// }
		// Serial.println(counter);
		break;

	case 40: // 1 1 // 41
			 // if ((index > leftEnd-1) && (index < (rightEnd+1)))
			 // {
		needlePosition(PIN_NEEDLE_LTR, index - 1);
		// (gto[0] & (1 << 4))>0
		// }
		// else
		if (index > (rightEnd + 12) && direction != 'R')
		{
			// Serial.println('R');
			direction = 'R'; // RTL
			changed = true;
			// changeDirection()
		}
		// counter++;
		// Serial.println(counter);
		break;

	case 31: // 0 0 // 30
			 // if ((index > (leftEnd + 1)) && (index < (rightEnd+1)))
			 // {
		needlePosition(PIN_NEEDLE_LTR, index - 1);
		// (gto[0] & (1 << 4))>0
		// }
		break;

	default:
		break;
	}
	// Serial.println(counter);
}

// Interrupt Service Routine
void interrupt_CSENSE()
{
	uint8_t csenseNew = digitalRead(PIN_CSENSE);
	if (csenseNow != csenseNew)
	{
		crefNow = digitalRead(PIN_CREF);
		csenseNow = csenseNew;
		state = ((crefNow + 3) * 10) + csenseNow;
		switch (state)
		{
			// case 30: // 0 1 // 01
			// 	break;

		case 41: // 1 0 // 40
			counter--;
			// Serial.println(counter);
			break;

		case 40: // 1 1 // 41
			counter++;
			// Serial.println(counter);
			break;

			// case 31: // 0 0 // 30
			// 	break;

		default:
			break;
		}
	}
}

void serialStream()
{
	while (Serial.available() != 0)
	{
		byte currentMessage = Serial.read();
		if ((messageLength == 0) && (currentMessage < 24))
		{
			messageLength = currentMessage;
		}
		else if (messageLength > 0)
		{
			if (messageCounter == 0)
			{
				rightEnd = (messageLength - 2) * 8;
				leftEnd = rightEnd - ((currentMessage + 7) / 8);
				messageCounter++;
				return;
			}
			if (messageCounter == 1)
			{
				if (currentMessage != color && direction == 'R')
				{
					color = currentMessage;
					colorChange();
					// color change sequence
				}
				// color = (currentMessage > 0) ? currentMessage : color;
				// Serial.println();
				messageCounter++;
				return;
			};
			needleBed[(messageCounter++) - 2] = currentMessage;
			// messageCounter += 1;
			// Serial.println(currentMessage);
			// Serial.println
			if (messageCounter >= messageLength)
			{
				// buttonPress(goStopPin);
				// rightEnd = 179;
				messageCounter = messageLength = 0;
				// memset(needleBed, 255, sizeof(needleBed));
				delay(40);
				buttonPress(goStopPin);
				// Serial.println('e');
			};
		}
		else
		{
			switch (currentMessage)
			{
			case 255:
				buttonPress(switchPin);
			case 254:
				buttonPress(goStopPin);
			case 253:
				buttonPress(okPin);
			case 252:
				resetPosition();
			case 251:
				// counter = 0;
				direction = 'L';
			case 250:
				if (direction == 'R')
				{
					buttonPress(switchPin);
					buttonPress(goStopPin);
					while (counter > 0)
					{
					}
					buttonPress(goStopPin);
				}
			default:
				return;
			};
			return;
		}
	}
	return;
}

void buttonPress(int pin) // ytum a takka
{
	digitalWrite(pin, LOW);	 // press
	delay(20);				 // wait
	digitalWrite(pin, HIGH); // reser
	buttonState[pin] = !buttonState[pin];
}

void safeButtonPress(int pin, bool state)
{
	if (buttonState[pin] == state)
	{
		delay(50);
		buttonPress(pin);
	}
}

void resetPosition()
{
	if (counter > 0)
	{
		safeButtonPress(goStopPin, true);
		safeButtonPress(switchPin, false);
		safeButtonPress(goStopPin, false);
		while (counter > 0)
		{
		};
		safeButtonPress(goStopPin, true);
	}
	else if (counter < 0)
	{
		safeButtonPress(goStopPin, true);
		safeButtonPress(switchPin, true);
	}
}

void colorChange()
{
	if (buttonState[goStopPin] == true)
	{
		delay(50);
		buttonPress(goStopPin);
	}
	if (buttonState[switchPin] == true)
	{
		delay(50);
		buttonPress(switchPin);
	}
	delay(50);
	buttonPress(goStopPin);
	while (counter < 241)
	{
	};
	buttonPress(goStopPin);
	delay(1000);
	buttonPress(switchPin);
}

void directionChange()
{
	Serial.println(direction);
	changed = false;
	if (buttonState[goStopPin] == true)
	{
		buttonPress(goStopPin);
	}
	delay(50); // This might be too long, i don't remember the required timing inbetween presses 40+?
	buttonPress(switchPin);
}

void needlePosition(int pinNumber, int intIndex)
{
	if (intIndex >= 0 & intIndex < 180)
	{ // Breytum bara ef við erum á nálaborðinu.
		// int multipleOfEight = ()
		// bool boolCheck = intIndex == 0;
		int bitIndex = (intIndex) % 8;
		int byteIndex = (intIndex) / 8;

		digitalWrite(pinNumber, (needleBed[byteIndex] & (1 << (bitIndex))) > 0);

		// }
		// digitalWrite(pinNumber,(needleBed[byteIndex] & (1 << (bitIndex))) > 0);
	}
	return;
}