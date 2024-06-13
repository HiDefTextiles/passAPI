import { SerialPort } from "serialport";
import { ReadlineParser } from "serialport";

// const port = new SerialPort('/dev/ttyACM')
/**
 * Skilar list af hlutum með path, locationId sem segir til um hvaða port a vel;
 * Skiptir máli ef fleiri en einn Serial, annars bara taka stak núll
 */
const portobj = await SerialPort.list().then(port => port.filter(i => i.serialNumber));
const com = portobj[0];
if (!com) {
	console.log('gekk ekki að tengjast arduino í gegnum serial port // fann ekki serial port');
	process.exit()
}
com.baudRate = 115200;
// com.autoOpen = false;
// com.dtrEnable = false;
const portSerial = new SerialPort(com)
/**
 * Les gögn frá arduino
 * parser.on('data', data => {
 *	console.log('got word from arduino:', data);
 * });
 */
export const parser = portSerial.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// Read the port data
portSerial.on("open", () => {
	console.log('serial port open');
});

/**
 * Les g0gn frá arduino
 */
parser.on('data', data => {
	// console.log('got word from arduino:', data); // Þetta virkar líka
});

/**
 * Sendir streng á arduino;
 * @param {string | number} message 
 * @returns boolean
 */
export function writeDataToArduino(message) {
	portSerial.write(message + '!\n', (err) => {
		if (err) {
			return false;
		}
		return true;
	});
}