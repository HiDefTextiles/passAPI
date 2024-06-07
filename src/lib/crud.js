import { body } from "express-validator";
import { SerialPort } from "serialport";
import { parser, writeDataToArduino } from "./serial.js";
// import { writeDataToArduino, parser } from './serial.js'

let nr = 0;

const postrequests = [];

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
		const linur = pattern.length;
		postrequests.push({ start, pattern })
		if (postrequests.length === 0) {
			nr = 0;
			writeDataToArduino(`${start}${pattern[nr++].replace(',', '')}`); // byrjar ferlið
			res.json("Munstur sett í vinnslu.")
		} else {
			res.json(`Munstur sett í bið, þú ert númer ${postrequests.length} í röðinni ;)`)
		}
		// nr = 0;
		// writeDataToArduino(`${start}${pattern[nr++].replace(',', '')}`); // byrjar ferlið
		// if ( nr < linur - 1 )
		// console.log(`${start}${pattern[0].replace(',', '')}`);
		// res.json(`${start}${pattern[0].replace(',', '')}`)
	}
]

parser.on('data', data => {
	if (postrequests) {
		const { start, pattern } = postrequests[0];
		const linur = pattern.length;

		((data === "R" && nr % 2 === 0) || (nr > 0 && data === "L" && nr % 2 !== 0))
			&& nr < linur && writeDataToArduino(`${start}${pattern[nr++].replace(',', '')}`);
		if (nr === linur - 1) {
			postrequests.shift();
		}
	}
	console.log(data, nr, linur);
}
)