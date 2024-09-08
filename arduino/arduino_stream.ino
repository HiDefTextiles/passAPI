// - Constant declarations
#define PIN_CSENSE 2
#define PIN_CREF 4
#define PIN_NEEDLE_RTL 5
#define PIN_NEEDLE_LTR 6
// - buttonPins
#define switchPin 10
#define colPin 11
#define goStopPin 12
#define endPin 13

// - Variable declarations
volatile uint8_t csenseNow = 0;
volatile uint8_t crefNow = 0;
volatile uint8_t direction = 2;
volatile uint8_t state = 0;
volatile int counter = 0;
int input = -10;
int array[179] = {0};
int arraysize = 10;

void setup()
{
	Serial.begin(115200);

	pinMode(PIN_CSENSE, INPUT_PULLUP);
	pinMode(PIN_CREF, INPUT_PULLUP);
	attachInterrupt(digitalPinToInterrupt(PIN_CSENSE), interrupt_CSENSE, CHANGE);

	pinMode(PIN_NEEDLE_LTR, OUTPUT);
	digitalWrite(PIN_NEEDLE_LTR, HIGH);
	pinMode(PIN_NEEDLE_RTL, OUTPUT);
	digitalWrite(PIN_NEEDLE_RTL, HIGH);
}

void loop()
{
	serialStream();
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
		int start = (input < 0) ? input + 90 : input + 89;
		int index = counter - 26 - start;

		switch (state)
		{
		case 31: // 0 1
			if (index + 10 >= 0 && index + 10 < arraysize)
			{
				digitalWrite(PIN_NEEDLE_RTL, array[index + 10]);
			}
			else if (index < -11 && direction != 1)
			{
				Serial.println('L');
				direction = 1;
			}
			break;

		case 40: // 1 9
			counter--;
			break;

		case 41: // 1 1
			if (index >= 0 && index < arraysize)
			{
				digitalWrite(PIN_NEEDLE_LTR, array[index]);
			}
			else if (index > arraysize && direction != 0)
			{
				Serial.println('R');
				direction = 0;
			}
			counter++;
			break;

		case 30: // 0 0
			if (index > arraysize && direction != 0)
			{
				Serial.println('R');
				direction = 0;
			}
			break;

		default:
			break;
		}
	}
}

void serialStream()
{
	while (Serial.available() != 0)
	{
		String inputString = Serial.readStringUntil('!');
		int lengd = inputString.length();

		if (lengd > 3) // allir strengir minni en 3 opnir fyrir sér skipanir
		{
			arraysize = lengd - 3;
			int tala = (inputString.charAt(1) - '0') * 10 + (inputString.charAt(2) - '0');
			input = (inputString.charAt(0) == '+') ? tala : -tala;
			for (int i = 3; i < lengd; i++)
			{
				array[i - 3] = inputString.charAt(i) - '0';
			}
		}
		else if (lengd == 1)
		{
			if (inputString.charAt(0) == 's')
			{
				buttonPress(goStopPin);
			}
		}
	}
	return;
}

void buttonPress(int pin)
{
	digitalWrite(pin, LOW);
	delay(20);
	digitalWrite(pin, HIGH);
}