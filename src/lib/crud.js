import { body } from "express-validator";
import { SerialPort } from "serialport";
import { ReadlineParser } from "serialport";

export const postPattern = [
	body("start")
		.trim()
		.escape()
		.notEmpty()
		.withMessage('Missing start value. Vantar start gildi')
		.isInt({ min: -90, max: 89 })
		.withMessage(`start has to be a integer between -90 and 89.
		start þarf a vera heiltala á bilinu -90 til 89`),
	body("pattern")
		.trim()
		.notEmpty()
		.custom(pattern => Array.isArray(pattern)
			&& pattern.every(row => Array.isArray(row))
			&& pattern.every(row => row.every(
				(value) => value && Number.isInteger(value) && (value >= 0) && (value <= 4))))
		.withMessage('pattern has to be a array of arrays (matrix) including only integer values between 0 and 4'),
	async (req, res) => {
		const { start, pattern } = req.body;
		SerialPort.list().then(port => {
			const com = port.filter(i => i.serialNumber)[0];
			com['baudRate'] = 115200;
			com.DtrEnable = false;
			const portSerial = new SerialPort(com)
			const parser = portSerial.pipe(new ReadlineParser({ delimiter: '\n' }));
			parser.on('data', data => {
				console.log('received', data);
			});
			portSerial.write(`${start}${pattern[0][0]}`, (err) => {
				if (err) {
					return console.log('Error on write: ', err.message);
				}
				console.log('message written');
			});
		});
	}

]