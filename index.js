import { SerialPort } from "serialport";
import { ReadlineParser } from "serialport";

// const port = new SerialPort('/dev/ttyACM')
/**
 * Skilar list af hlutum með path, locationId sem segir til um hvaða port a vel;
 * Skiptir máli ef fleiri en einn Serial, annars bara taka stak núll
 */
export const portobj = await SerialPort.list().then(port => port.filter(i => i.serialNumber));
const com = portobj[0];
if (com) {
	com['baudRate'] = 115200;
	com.dtr = false;
	// com.autoOpen = false;
	// com.dtrEnable = false;
	const portSerial = new SerialPort(com)
	const parser = portSerial.pipe(new ReadlineParser({ delimiter: '\r\n' }));
	function writeDataToArduino(message) {
		portSerial.write(message + '\n', (err) => {
			if (err) {
				return console.log('Error on write: ', err.message);
			}
			console.log('Message written to Arduino:', message);
		});
	}

	// Read the port data
	portSerial.on("open", () => {
		console.log('serial port open');
		// parser.on('data', data => {
		// 	console.log('Data received:', data);
		// });
		// portSerial.write('test\n')

		portSerial.set({ dtr: false, rts: false }, (err) => {
			if (err) {
				return console.log('Error setting control signals:', err.message);
			}
			console.log('DTR and RTS disabled');

			// Write data to the serial port
			// writeDataToArduino('Hello Arduino!');
		});

	});

	// portSerial.write('test\n')

	/**
	 * Les g0gn frá arduino
	 */
	parser.on('data', data => {
		console.log('got word from arduino:', data);
		// portSerial.write('test\n')
	});
	/**
	 * Sendir streng á arduino
	 */
	// [0, 1, 2, 3, 4, 5].forEach(
	// 	stak => portSerial.write('test\n', (err) => {
	// 		if (err) {
	// 			return console.log('Error on write: ', err.message);
	// 		}
	// 		console.log('message written');
	// 	}));

	// portSerial.ReadlineParser()
	// portSerial.close()
}
// com['baudRate'] = 115200;
// const portSerial = new SerialPort(com)
// const parser = portSerial.pipe(new ReadlineParser({ delimiter: '\n' }));

// Read the port data
// portSerial.on("open", () => {
// 	console.log('serial port open');
// });

/**
 * Les g0gn frá arduino
 */
// parser.on('data', data => {
// 	console.log('got word from arduino:', data);
// });

/**
 * Sendir streng á arduino
 */
// portSerial.write('hello from node\n', (err) => {
// 	if (err) {
// 		return console.log('Error on write: ', err.message);
// 	}
// 	console.log('message written');
// });
// portSerial.ReadlineParser()
// portSerial.close()