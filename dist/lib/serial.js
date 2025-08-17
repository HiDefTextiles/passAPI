import { SerialPort } from "serialport";
import { ReadlineParser } from "serialport";
import { broadcast, wss } from "../app.js";

// const port = new SerialPort('/dev/ttyACM')
/**
 * Skilar list af hlutum með path, locationId sem segir til um hvaða port a vel;
 * Skiptir máli ef fleiri en einn Serial, annars bara taka stak núll
 */
// console.log(await SerialPort.list())
const portobj = await SerialPort.list().then(port => port.filter(i => i.serialNumber));
const com = portobj[0];
if (!com) {
	console.log('gekk ekki að tengjast arduino í gegnum serial port // fann ekki serial port');
	// process.exit()
	// Hér þarf að koma merki sem berst í notenda viðmótið.
}

// com.baudRate = 115200;
// com.autoOpen = false;
// com.dtrEnable = false;
// const portSerial = new SerialPort(com)
/**
 * Les gögn frá arduino
 * parser.on('data', data => {
 *	console.log('got word from arduino:', data);
 * });
 */
// export const parser = portSerial.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// Read the port data
// portSerial.on("open", () => {
// console.log('serial port open');
// });

/**
 * Les g0gn frá arduino
 */
// parser.on('data', data => {
// 	// console.log('got word from arduino:', data); // Þetta virkar líka
// });

/**
 * Sendir streng á arduino;
 * @param {any} message 
 * @returns boolean
 */
export function writeDataToArduino(message) {
	if (typeof message == 'string') {
		message += '\n'
	}
	portSerial.write(message, (err) => {
		if (err) {
			return false;
		}
		return true;
	});
}

export let portSerial = null;
export let parser = null;
let isConnecting = false;

/**
 * Finds the correct serial port for the Arduino.
 * You can make this more specific by checking for a vendorId or productId.
 */
async function findArduinoPort() {
	try {
		const ports = await SerialPort.list();
		// Look for a port with a serial number, a common sign of a real device
		const arduinoPortInfo = ports.find(p => p.serialNumber);
		if (arduinoPortInfo) {
			console.log('Arduino found at port:', arduinoPortInfo.path);
			return arduinoPortInfo.path;
		}
	} catch (err) {
		console.error("Error listing serial ports:", err);
	}
	console.log('Could not find an Arduino port.');
	return null;
}

/**
 * Connects to the Arduino on the given path.
 * Sets up all the necessary event listeners.
 */
function connect(path) {
	if (!path) return;

	// The constructor needs an options object with path and baudRate
	portSerial = new SerialPort({
		path: path,
		baudRate: 115200,
		autoOpen: true, // Let it open automatically
	});

	parser = portSerial.pipe(new ReadlineParser({ delimiter: '\r\n' }));

	portSerial.on('open', () => {
		console.log('Serial port open');
		broadcast({ portSerial: !!portSerial });
	});

	portSerial.on('close', () => {
		console.log('Serial port closed. Arduino may have been disconnected.');
		portSerial = null; // Clear the port object
		parser = null;
		broadcast({ portSerial: !!portSerial })
		// wss.c
	});

	portSerial.on('error', (err) => {
		console.error('Serial port error:', err.message);
	});

	// You can listen to the parser for data from the Arduino
	// parser.on('data', data => console.log('Data from Arduino:', data));
}

/**
 * Disconnects and reconnects the serial port.
 * Can be triggered by a button in your GUI.
 */
export async function resetConnection() {
	if (isConnecting) {
		// console.log("Connection attempt already in progress.");
		return "Connection attempt already in progress."
	}

	isConnecting = true;

	// If a port is already open, close it gracefully
	if (portSerial && portSerial.isOpen) {
		await new Promise(resolve => portSerial.close(resolve));
	}

	portSerial = null;
	parser = null;

	const path = await findArduinoPort();

	if (path) {
		connect(path);
	} else {
		if (wss) {
			wss.clients.forEach((client) => {
				if (client.readyState === WebSocket.OPEN) {
					client.send(JSON.stringify({ portSerial: !!portSerial }));
				}
			})
		}
	}

	isConnecting = false;
	if (portSerial) {
		return true
	} else return false
}

/**
 * 
 * @param {Array<number>} message 
 * @returns 
 */
export function senddByteToArduino(message) {
	// console.log(message)
	message.unshift(message.length)
	// console.log(message)
	const buffer = Buffer.from(message)
	// console.log(`Buffer: ${buffer.byteLength}`)
	if (!portSerial) {
		return false
	}
	portSerial.write(buffer, (err) => {
		if (err) {
			console.error('Error on write:', err.message);
		} else {
			console.log('Pattern sent successfully.');
		}
	})
	return true
}

// Initial connection attempt when the server starts
resetConnection();