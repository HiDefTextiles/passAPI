import { body } from "express-validator";
import { parser, writeDataToArduino } from "./serial.js";
import { validationCheck } from "./validation.js";
import { separateColors } from "./saebba.js";
import { wss } from "../app.js";
import WebSocket from "ws";
import { getNextPattern } from "../db/db.js";
// import { writeDataToArduino, parser } from './serial.js'

export var nr = 0;
let stream = { status: false, start: -20 };
export const postrequests = [];
let previousPostrequest = null; // Cache for the previous postrequest
const sendit = () => {
	const currentPostrequest = postrequests[0];
	const payload = { nr };

	if (previousPostrequest && JSON.stringify(currentPostrequest) === JSON.stringify(previousPostrequest)) {
		// Only send nr if postrequests[0] is the same as the previous one
		payload.nr = nr;
	} else {
		// Send both nr and postrequests
		payload.nr = nr;
		payload.postrequests = postrequests;
		previousPostrequest = currentPostrequest; // Update the cache
	}

	wss.clients.forEach((client) => {
		if (client.readyState === WebSocket.OPEN) {
			client.send(JSON.stringify(payload));
		}
	});
};

const handler = (start, pattern, msg) => {
	sendit();
	const munstur = String(pattern[nr]).replaceAll(',', '').split('');
	const litur = Math.max(...munstur);
	// ((status === "R" && nr % 2 !== 0) || (nr > 1 && status === "L" && nr % 2 === 0))
	// 	&& nr < pattern.length && 
	const sp = (Math.abs(start) > 9 ? start : `0${Math.abs(start)}`);
	const stilling = munstur.map(stak => Number(stak == 0)).join().replaceAll(',', '')
	writeDataToArduino(`${start < 0 ? sp : `+${sp}`}${stilling}`);
	// console.log(`litur=${litur} ${(msg && msg[nr]) ? ', msg: ' + msg[nr] : ''}`);
	nr += 1;
};

const get = async (start) => {
	// console.log('test');
	writeDataToArduino('s!');
	const response = await getNextPattern();
	if (!response) {
		return
	}
	const matrixFormatted = response.matrix.split(';').map(stak => stak.split('').map(stak => Number.parseInt(stak)));
	// console.log(matrixFormatted, 't')
	const pattern = separateColors(matrixFormatted);
	// console.log(pattern[0], 't')
	postrequests.push({ start, pattern });
	if (postrequests.length === 1) {
		nr = 0;
		handler(start, pattern)  // byrjar ferlið
		// res.json("Munstur sett í vinnslu.");
	} else {
		// res.json(`Munstur sett í bið, þú ert númer ${postrequests.length} í röðinni ;)`);
		sendit();
	}
	console.log('yes')
	writeDataToArduino(`s!`);
}

export const postnr = [
	body("nr")
		.trim()
		.escape()
		.notEmpty()
		.withMessage('missing nr value')
		.isInt()
		.withMessage('has to be integer.'),
	validationCheck,
	async (req, res) => {
		// { nr } = req.body;
		const new_nr = Number.parseInt(req.body.nr)
		nr = new_nr !== nr ? new_nr : nr;
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
					return typeof row === 'string' && row.replaceAll(',', '').split('').every(stak => Number.isInteger(Number(stak)) && stak >= 0 && stak <= 4)
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

export const deletePattern = [
	async (req, res) => {
		postrequests.shift();
		sendit();
		res.json('búið að eyða munstri');
	}
]

export const dbPattern = [
	body("start")
		.trim()
		.escape()
		.notEmpty()
		.withMessage('Missing start value. Vantar start gildi')
		.isInt({ min: -90, max: 89 })
		.withMessage(`start has to be a integer between -90 and 89.
		start þarf a vera heiltala á bilinu -90 til 89`),
	validationCheck,
	async (req, res) => {
		if (!dbp) {
			res.json('Enginn munstur í bið í db.')
		} else {
			const { start } = req.body
			stream.start = Number.isNaN(start) ? Number.parseInt(start) : start;
			stream.status = TRUE;
			console.log(stream);
		}
	}
]

parser.on('data', data => {
	console.log(data, nr);
	if (postrequests.length) {
		const { start, pattern, msg } = postrequests[0];
		// console.log(pattern);
		const linur = pattern.length;
		((data === "R" && nr % 2 !== 0) || (nr > 1 && data === "L" && nr % 2 === 0))
			&& nr < linur && handler(start, pattern, msg);
		if (nr >= linur) {
			postrequests.shift();
			nr = 0;
			if (postrequests[0]) {
				nr = 0;
				const newpattern = postrequests[0];
				handler(newpattern.start, newpattern.pattern, newpattern.msg);
			} else {
				sendit()
			}
		}
	} else if (stream.status && data == 'L') {
		get(stream.start)
	}
	else {
		sendit();
	};
}
)