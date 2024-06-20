import { body } from "express-validator";
import { SerialPort } from "serialport";
import { parser, writeDataToArduino } from "./serial.js";
import { validationCheck } from "./validation.js";
import { constants } from "buffer";
import { wss } from "../app.js";
import WebSocket from "ws";
// import { writeDataToArduino, parser } from './serial.js'

export var nr = 0;
let old_nr = -1;
export const postrequests = [];
const sendit = () => wss.clients.forEach((client) => {
	console.log('what')
	if (client.readyState === WebSocket.OPEN) {
		client.send(JSON.stringify(
			{ nr, postrequests }
		));
	}
});
const handler = (start, pattern, msg) => {
	sendit()
	const munstur = pattern[nr++].replaceAll(',', '').split('');
	// nr += 1;
	const litur = Math.max(...munstur);
	// ((status === "R" && nr % 2 !== 0) || (nr > 1 && status === "L" && nr % 2 === 0))
	// 	&& nr < pattern.length &&
	writeDataToArduino(`${start}${munstur.map(stak => Number(stak == 0)).join().replaceAll(',', '')}`);
	console.log(`litur=${litur} ${(msg && msg[nr - 1]) ? ', msg: ' + msg[nr - 1] : ''}`)
}
export const postnr = [
	body("nr").trim()
		.escape()
		.notEmpty()
		.withMessage('missing nr value')
		.isInt()
		.withMessage('has to be integer.'),
	validationCheck,
	async (req, res) => {
		// { nr } = req.body;
		const new_nr = Number.parseInt(req.body.nr)
		nr = new_nr < nr ? new_nr : nr;
		sendit();
		const { start, pattern, msg } = postrequests[0];
		handler(start, pattern, msg);
		res.json('línu breytt')
	}
]
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
		)
		.withMessage('pattern has to be a array of pattern strings including only integer values between 0 and 4'),
	body("pattern")
		.trim()
		.notEmpty()
		.custom(
			pattern => pattern.every(
				row => {
					return typeof row === 'string' && row.replaceAll(',', '').split('').every(v => Number.isInteger(Number(v)) && v >= 0 && v <= 4)
				}
			)
		)
		.withMessage(
			'pattern rows may only include integer values 0 to 4 and must be arrays or strings'
		)
	,
	body('msg')
		.custom(msg => Array.isArray(msg))
		.withMessage('msg should be an array of messages to show')
		.optional(true),
	validationCheck,
	async (req, res) => {
		const { start, pattern, msg } = req.body;
		postrequests.push({ start, pattern, msg });
		if (postrequests.length === 1) {
			nr = 0;
			handler(start, pattern, msg)  // byrjar ferlið
			res.json("Munstur sett í vinnslu.");
		} else {
			res.json(`Munstur sett í bið, þú ert númer ${postrequests.length} í röðinni ;)`);
			sendit();
		}
	}
]

parser.on('data', data => {
	if (postrequests.length) {
		let i = 1;
		const { start, pattern, msg } = postrequests[0];
		const linur = pattern.length;
		((data === "R" && nr % 2 !== 0) || (nr > 1 && data === "L" && nr % 2 === 0))
			&& nr < linur && handler(start, pattern, msg);
		if (nr >= linur) {
			postrequests.shift();
			nr = 0;
			if (postrequests[0]) {
				nr = 0;
				const newpattern = postrequests[0]
				handler(newpattern.start, newpattern.pattern, newpattern.msg)
			}
		}
	}
	console.log(data, nr)
}
)