import { body } from "express-validator";
import { SerialPort } from "serialport";
import { ReadlineParser } from "serialport";
// import { writeDataToArduino, parser } from './serial.js'

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
			&& pattern.every(row => {
				console.log(row)
				return Array.isArray(row)
			})
			&& pattern.every(row => row.every(
				(value) => {
					console.log(value);
					return value && Number.isInteger(value) && (value >= 0) && (value <= 4)
				}
			)))
		.withMessage('pattern has to be a array of pattern strings including only integer values between 0 and 4'),
	async (req, res) => {
		const { start, pattern } = req.body;
		console.log(`${start}${pattern[0].replace(',', '')}`);
		res.json(`${start}${pattern[0].replace(',', '')}`)
	}

]