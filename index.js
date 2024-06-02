import { SerialPort } from "serialport";
import { ReadlineParser } from "serialport";

// const port = new SerialPort('/dev/ttyACM')
var MYport;
/**
 * Skilar list af hlutum með path, locationId sem segir til um hvaða port a vel;
 * Skiptir máli ef fleiri en einn Serial, annars bara taka stak núll
 */
export const portobj = await SerialPort.list().then(port => port.filter(i => i.serialNumber));
const com = portobj[0];
com['baudRate'] = 115200;
const portSerial = new SerialPort(com)
const parser = portSerial.pipe(new ReadlineParser({ delimiter: '\n' }));

// Read the port data
// portSerial.on("open", () => {
// 	console.log('serial port open');
// });

/**
 * Les g0gn frá arduino
 */
parser.on('data', data => {
	console.log('got word from arduino:', data);
});

/**
 * Sendir streng á arduino
 */
portSerial.write('hello from node\n', (err) => {
	if (err) {
		return console.log('Error on write: ', err.message);
	}
	console.log('message written');
});
// portSerial.ReadlineParser()
// portSerial.close()