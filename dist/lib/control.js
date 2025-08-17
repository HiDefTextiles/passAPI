import { body } from "express-validator";
import { parser, portSerial, resetConnection, senddByteToArduino } from "./serial.js";
import { validationCheck } from "./validation.js";
import { imageToMatrix, separateColors } from "./saebba.js";
import { wss } from "../app.js";
import WebSocket from "ws";
import { getNextPattern } from "../db/db.js";
import drivelist from "drivelist";
import { readdir, access, readFile } from "fs/promises";
import { resolve } from "path";
// import { writeDataToArduino, parser } from './serial.js'

export var nr = 0;
let stream = { status: false, start: -20 };
export const postrequests = [];
let previousPostrequest = null; // Cache for the previous postrequest
// const sendit = () => {
// 	let payload = {
// 		nr, // The starting index of the slice
// 		postrequest: null,
// 		length: postrequests.length,
// 		postrequestLength: 0, // Total lines in the current pattern
// 		portSerial: !!portSerial,
// 	};

// 	if (postrequests[0] && postrequests[0].pattern) {
// 		const { start, pattern, msg } = postrequests[0];
// 		payload.postrequestLength = pattern.length; // Set the total length
// 		payload.postrequest = {
// 			start,
// 			// We send a slice of 6 rows for performance
// 			pattern: pattern.slice(nr, Math.min(nr + 6, payload.postrequestLength)),
// 			msg,
// 		};
// 	}

// 	// This logic to only send `nr` can be simplified by just sending the full payload.
// 	// The frontend can decide what to do with it.
// 	// We remove the `previousPostrequest` logic for simplicity and reliability.

// 	const jsonData = JSON.stringify(payload);
// 	wss.clients.forEach((client) => {
// 		if (client.readyState === WebSocket.OPEN) {
// 			client.send(jsonData);
// 		}
// 	});
// };
// // control.js

// control.js

const sendit = () => {
	let payload = {
		nr,
		postrequest: null,
		length: postrequests.length,
		postrequestLength: 0,
		portSerial: !!portSerial,
		activeIndexInChunk: 0,
	};

	if (postrequests[0] && postrequests[0].pattern) {
		const { start, pattern, msg } = postrequests[0];
		payload.postrequestLength = pattern.length;

		// --- CORRECT AND SIMPLE SLICING LOGIC ---
		const sliceStart = Math.max(0, nr - 3);
		const sliceEnd = Math.min(pattern.length, nr + 4);
		const patternChunk = pattern.slice(sliceStart, sliceEnd);

		payload.activeIndexInChunk = nr - sliceStart;
		// --- END ---

		payload.postrequest = {
			start,
			pattern: patternChunk,
			msg,
		};
	}

	const jsonData = JSON.stringify(payload);
	wss.clients.forEach((client) => {
		if (client.readyState === WebSocket.OPEN) {
			client.send(jsonData);
		}
	});
};
// const sendit = () => {
// 	let currentPostrequest;
// 	if (postrequests[0]) {
// 		const { start, pattern, msg } = postrequests[0];
// 		const s = pattern
// 		currentPostrequest = { start, pattern: s.slice(nr, Math.min(nr + 5, pattern.length)), msg, fullLength: pattern.length }
// 		// console.log(nr, currentPostrequest.pattern)
// 	}
// 	else {
// 		currentPostrequest = postrequests[0]

// 	}
// 	// const currentPostrequest = postrequests[0].splice(nr, Math.min(nr + 5, postrequests.length));
// 	// currentPostrequest = postrequests[0]
// 	const payload = { nr };

// 	if (previousPostrequest && JSON.stringify(currentPostrequest) === JSON.stringify(previousPostrequest)) {
// 		// Only send nr if postrequests[0] is the same as the previous one
// 		payload.nr = nr;
// 		payload.portSerial = !!portSerial;
// 		payload.length = postrequests.length;
// 	} else {
// 		// Send both nr and postrequests
// 		payload.nr = nr;
// 		payload.postrequests = currentPostrequest;
// 		payload.length = postrequests.length;
// 		payload.postrequestLength = postrequests[0] && postrequests.length
// 		payload.portSerial = !!portSerial;
// 		previousPostrequest = currentPostrequest; // Update the cache
// 	}

// 	wss.clients.forEach((client) => {
// 		if (client.readyState === WebSocket.OPEN) {
// 			client.send(JSON.stringify(payload));
// 		}
// 	});
// };

function bitsToBytes(bits) {
	const bytes = [];

	for (let i = 0; i < bits.length; i += 8) {
		const chunk = bits.slice(i, i + 8);

		// Pad with zeros on the right if needed
		while (chunk.length < 8) {
			const oldLength = chunk.length;
			chunk.length = 8;
			chunk.fill(1, oldLength, 8);
		}

		// Convert the chunk to a number
		const byte = chunk.reduce((acc, bit, index) => {
			return acc | (bit << (7 - index));
		}, 0);

		bytes.push(byte);
	}

	return bytes;
}



const handler = (start, pattern, msg) => {
	sendit();
	let munstur
	if (typeof pattern[nr] == 'string') {
		munstur = String(pattern[nr]).replaceAll(',', '').split('')
	}
	munstur = pattern[nr]
	// const munstur = String(pattern[nr]).replaceAll(',', '').split('');
	const litur = Math.max(...munstur);
	// ((status === "R" && nr % 2 !== 0) || (nr > 1 && status === "L" && nr % 2 === 0))
	// 	&& nr < pattern.length && 
	// int start = (input < 0) ? input + 90 : input + 89;

	// const sp = (Math.abs(start) > 9 ? start : `0${Math.abs(start)}`);
	const stilling = munstur.map(stak => Number(stak == 0))
	let parsedStart = Number.parseInt(start)
	parsedStart = (parsedStart <= 0) ? 90 + parsedStart : 89 + parsedStart
	const leftFill = new Array(parsedStart).fill(1)
	if (senddByteToArduino([stilling.length, litur].concat(bitsToBytes((leftFill.concat(stilling)))))) {
		nr += 1;

	}
	// writeDataToArduino(`${start < 0 ? sp : `+${sp}`}${stilling}`);
};

const get = async (start) => {
	// writeDataToArduino('s!');
	const response = await getNextPattern();
	if (!response) {
		return
	}
	const matrixFormatted = response.matrix.split(';').map(stak => stak.split('').map(stak => Number.parseInt(stak)));
	const pattern = separateColors(matrixFormatted);
	postrequests.push({ start, pattern });
	if (postrequests.length === 1) {
		nr = 0;
		handler(start, pattern)  // byrjar ferlið
		// res.json("Munstur sett í vinnslu.");
	} else {
		// res.json(`Munstur sett í bið, þú ert númer ${postrequests.length} í röðinni ;)`);
		sendit();
	}
	// writeDataToArduino(`s!`);
}

/**
 * Creates a delay for a specified number of milliseconds.
 * This function returns a Promise that resolves after the given time,
 * making it "awaitable".
 * * @param ms The number of milliseconds to wait.
 * @returns A Promise that resolves after the delay.
 */
function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export const postnr = [
	body("integerInput")
		.notEmpty()
		.withMessage('missing nr value')
		.isInt()
		.withMessage('has to be integer.'),
	validationCheck,
	async (req, res) => {
		if (postrequests.length == 0) {
			const skilabod = encodeURIComponent("Það er ekkert munstur í vinnslu")
			res.redirect('../?msg=' + skilabod)
		} else {
			const new_nr = (Number.parseInt(req.body.nr) || Number.parseInt(req.body.integerInput)) - 1
			nr = new_nr !== nr ? new_nr : nr;
			const { start, pattern, msg } = postrequests[0];
			handler(start, pattern, msg);
			res.redirect('../')
		}
	}
]
export const postPattern = [
	body("start")
		.notEmpty()
		.withMessage('Missing start value. Vantar start gildi')
		.isInt({ min: -90, max: 89 })
		.withMessage(`start has to be a integer between -90 and 89.
		start þarf a vera heiltala á bilinu -90 til 89`),
	body("pattern")
		.notEmpty().withMessage('Pattern is missing.')
		// STEP 1: SANITIZE THE STRING INTO A MATRIX
		// We use a custom sanitizer to safely parse the JSON string.
		// This will replace req.body.pattern with the actual JavaScript array.
		.customSanitizer(value => {
			try {
				// If the value is a string, parse it.
				if (typeof value === 'string') {
					return JSON.parse(value);
				}
				// If it's somehow already an array, just pass it through.
				return value;
			} catch (e) {
				// If JSON.parse fails, it's invalid. Return a non-array value
				// to make the next validation step fail.
				return null;
			}
		})
		// STEP 2: VALIDATE THE SANITIZED MATRIX
		// This custom validator now runs on the result of the sanitizer.
		// We can be confident that `pattern` is a parsed object, not a string.
		.custom(pattern => {
			// Check 1: Is it an array? (Catches parsing errors from the sanitizer)
			if (!Array.isArray(pattern) || pattern.length === 0) {
				return false;
			}
			// Check 2: Is it a 2D array where every row is also a non-empty array
			// and every cell is an integer between 0 and 4?
			return pattern.every(row =>
				Array.isArray(row) &&
				row.length > 0 &&
				row.every(cell => Number.isInteger(cell) && cell >= 0 && cell <= 4)
			)
		})
		.withMessage('Pattern must be a valid 2D array containing only integers from 0 to 4.'),
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
			// res.json("Munstur sett í vinnslu.");
			res.redirect('../')
		} else {
			const skilabod = encodeURIComponent(`"Þú ert númer ${postrequests.length} í röðinni"`)
			res.redirect(`../?msg=` + skilabod)

			// res.json(`Munstur sett í bið, þú ert númer ${postrequests.length} í röðinni ;)`);
			sendit();
		}
	}
]

export const deletePattern = [
	async (req, res) => {
		postrequests.shift();
		sendit();
		// res.json('búið að eyða munstri');
		const skilabod = encodeURIComponent("Munstri eydd.")
		res.json(skilabod)
	}
]

export const connectArduino = [
	async (req, res) => {
		resetConnection();
		res.json('Endurset tengingu, vinsamlegast bíðið.')
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
		}
	}
]

export const getDrives = [
	async (req, res) => {
		// const drives = await drivelist.list();
		// res.json(drives)
		const drive = await drivelist.list()
		res.json(drive)
	}
]

export const postFiles = [
	body("path")
		.optional(false)
		.notEmpty()
		.withMessage('Missing file path to search')
		.isString()
		.withMessage('path should be a string')
		.custom(
			async (value) => {
				const annoyingStep =
					value.includes('\\\\') ? value : value.replaceAll('\\', '\\\\')

				// const uselessStep = resolve(annoyingStep)
				try {

					// const 
					// 🛡️ First, resolve the path to prevent traversal attacks (e.g., ../)
					// const resolvedPath = path.resolve(value.replaceAll('\\', '\\\\'));
					// Then, check if we can access it
					const pathCheck = await readdir(annoyingStep);
				} catch (error) {
					// If fs.access fails, it throws an error. We catch it
					// and throw a new error to be caught by express-validator.
					// throw new Error('Path does not exist or is not accessible.');
					return false
				}
				return true
			}
		).withMessage('Not a valid path.'),
	validationCheck,
	async (req, res) => {
		const { path } = req.body
		const annoyingStep = path.includes('\\\\') ? path : path.replaceAll('\\', '\\\\')
		const parentPath = annoyingStep.split('\\\\').filter(v => v.length).slice(0, -1).join('\\') + '\\\\'
		const files = (await readdir(path, { withFileTypes: true })).map(
			stak => {
				const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.bmp'];
				const file = stak.isFile()
				const dir = stak.isDirectory()
				const name = stak.name
				const image = imageExtensions.some(extension => name.includes(extension))
				if (image || dir) return {
					name,
					dir,
					file,
					image,
					newPath: `${path}${stak.name}\\\\`
				}
				return {}
			}
		).filter(v => Object.keys(v).length)
		res.json(
			{
				parentPath,
				files
			}
		)
	}
]
// A function to figure out the image type from its extension
function getMimeType(filePath) {
	const ext = filePath.split('.').slice(-1)[0].toLowerCase();
	switch (ext) {
		case '.jpg':
		case '.jpeg':
			return 'image/jpeg';
		case '.png':
			return 'image/png';
		case '.gif':
			return 'image/gif';
		default:
			return 'application/octet-stream'; // Default for unknown types
	}
}

export const getImage = [
	async (req, res) => {
		const { path } = req.body;
		while (path && '\\'.includes(path[-1])) {
			path = path.slice(0, -1)
		}
		const imageFile = await readFile(path.includes('\\\\') ? path : path.replaceAll('\\', '\\\\'))
		const base64Data = imageFile.toString('base64');
		const mimeType = getMimeType(path)
		const dataUrl = `data:${mimeType};base64,${base64Data}`;
		res.json({ imageData: dataUrl })
	}
]

export const postMake = [
	async (req, res) => {
		const { imageData, width, litir } = req.body;
		if (!imageData || !width || !litir) {
			const problems = Object.entries({ imageData, width, litir }).filter(([key, val]) => !val)
			res.json(problems).status(400)
		}
		const fylki = await imageToMatrix(imageData, Number.parseInt(width.trim()), Number.parseInt(litir.trim()))
		res.json(fylki)
	}
]

parser && parser.on('data', data => {
	console.info(data, nr, 0)
	if (postrequests.length) {
		const { start, pattern, msg } = postrequests[0];
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

export const communicationTest = [
	async (req, res) => {
		// senddByteToArduino([99,
		// 	1, 99, 3]);
		if (req.body) {
			const { message } = req.body
			if (message) {
				senddByteToArduino(message)
			}
		}
	}
	// senddByteToArduino()
]

