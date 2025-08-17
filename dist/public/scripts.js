// const { type } = require("os");
let totalPatternLines = 0;


let currentWebsocketStatusIcon = '🔁'
// import path from "path"
/**
 * Tekið úr vefforitun 1 hjá Ólafi-osk
 * Býr til element með nafni og bætir við öðrum elementum eða texta nóðum.
 * @param {string} name Nafn á elementi
 * @param  {...string | HTMLElement} children Hugsanleg börn: önnur element eða strengir
 * @returns {HTMLElement} Elementi með gefnum börnum
 */
function el(name, attributes = {}, ...children) {
	const e = document.createElement(name);
	for (const key of Object.keys(attributes)) {
		e.setAttribute(key, attributes[key]);
	}
	for (const child of children) {
		if (typeof child === 'string' || typeof child === 'number') {
			e.appendChild(document.createTextNode(child.toString()));
		} else {
			e.appendChild(child);
		}
	}
	return e;
}

/**
 * range of numbers
 * https://www.freecodecamp.org/news/javascript-range-create-an-array-of-numbers-with-the-from-method/
 * @param {*} start 
 * @param {*} stop 
 * @param {*} step 
 * @returns 
 */
const arrayRange =
	(start, stop, step) =>
		Array.from({ length: (stop - start) / step + 1 }, (value, index) => start + index * step)

/**
* Tekið úr vefforitun 1 hjá Ólafi-osk
* Fjarlægir öll börn `element`.
* @param {HTMLElement | Element} element Element sem á að tæma
*/
function empty(element) {
	if (!element || !element.firstChild) {
		return;
	}
	while (element.firstChild) {
		element.removeChild(element.firstChild);
	}
}
/**
 * Gemini
 * @param {number} bytes
 * @param {number} decimals accuracy of results
 */
function formatBytes(bytes, decimals = 2) {
	if (!+bytes) return '0 Bytes';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

const check_internet = async () => {
	try {
		const response = await fetch('https://www.google.com/favicon.ico?_=' + new Date().getTime(), {
			method: 'HEAD', // HEAD request is faster as it only gets headers
			mode: 'no-cors', // Important to avoid CORS errors
			cache: 'no-cache'
		});
		return true
	} catch {
		return false
	}
}

const tilBakaElement = (main) => {
	main.appendChild(el('a', { href: '/', class: 'button borderItem', style: 'grid-column: 1;grid-row: 1;' }, el('h2', {}, 'Til baka 🏡')))
}

const einnTilBakaElement = (main, parentPath) => {
	main.appendChild(
		el(
			'button'
			, { class: 'button', onclick: `getFiles('${parentPath.includes('\\\\') ? parentPath : parentPath.replaceAll('\\', '\\\\')}')`, style: 'grid-column: 3;grid-rows: 1;' }
			, '👈 Til baka í 📁: ' + parentPath
		)
	)
}


// Add these two new functions to the end of your scripts.js file

// Replace the old popup functions with this one in scripts.js



/**
 * 
 * @param {HTMLElement | string} main 
 * @returns 
 */
const infoElement = (main) => {
	if (socket) {
		socket.send('y')
	}
	// check_internet()
	const htmlEl = el(
		'a', { href: "/info", class: "button borderItem", style: `${typeof main == 'string' ? main : 'grid-column: 5;grid-row: 1;'}` },
		el(
			'h2', {}, 'Info/Error'
		),
		el(
			'div',
			// "width: fit-content;display: flex;flex-direction: row;text-align: center;align-self: center;justify-self: center;margin: 0 auto;"
			{ style: "width: fit-content;display: flex;flex-direction: row;text-align: center;align-self: center;justify-self: center;margin: 0 auto;" },
			el(
				'p', { class: 'WebSocketStatus' }, currentWebsocketStatusIcon
			),
			el(
				'p',
				{ class: "SeriaclCommunicationStatus" }

			),
			el(
				'p',
				{ class: "NetworkCommunicationStatus" }
			)
		)
	)
	if (typeof main != 'string') {
		main.appendChild(
			htmlEl
		)
	} else {
		return htmlEl
	}
	// main.getElementsByClassName('SerialCommunicationStatus')
	// const ncs = main.getElementsByClassName('NetworkCommunicationStatus')
	// if (ncs && ncs[0]) {
	// 	check_internet().then(
	// 		bool => { ncs[0].innerHTML = bool ? '✅' : '⛔'; }
	// 	)
	// }
}

async function getDrives() {
	const response = await fetch("/api/drives", { method: 'GET' });
	if (!response) {
		alert('Enginn drif!, villa.')
		return
	}
	const drives = await response.json()
	if (!drives || drives.length < 1) {
		alert('Fann enginn drif!')
		return
	}
	const main = document.body.children[0]
	empty(main)
	tilBakaElement(main)
	// main.appendChild(el('a', { href: '/', class: 'button borderItem', style: 'grid-column: 1;grid-row: 1;' }, el('h2', {}, 'Til baka')))
	// main.appendChild()
	infoElement(main)
	main.appendChild(
		el(
			'ol',
			{ style: 'width:100%;padding-right:0 !important;align-self:center;justify-self:center;grid-column: 1 / 6;grid-row:2 / 5;overflow-x:hidden;;overflow-y: scroll;max-heigth: 240px;padding:0 !important;margin:auto;', class: 'file-list' }
			, ...drives.map(stak => el('li', { style: 'margin: 15px;' },
				el(
					'button',
					{ class: 'button', onclick: `getFiles('${(stak.mountpoints[0].path.replaceAll('\\', '\\\\'))}')` },
					`${stak.mountpoints[0].path} 💾 ${stak.description} ${stak.isUSB ? stak.busType : stak.device} ${formatBytes(stak.size)}`
				)
			)
			)
		)
	)
}


async function getImage(pathDir) {
	const extra = ('\\'.includes(pathDir[-1]) && !'\\'.includes(pathDir[-2]))
	const response = await fetch(
		'/api/getImage',
		{
			method: 'POST', body: JSON.stringify({
				path: pathDir.includes('\\') ?
					(pathDir.includes('\\\\') ? pathDir : (pathDir.replaceAll('\\', '\\\\')))
					: (extra ? pathDir[-1] + '\\' : pathDir)
			}), headers: {
				'Content-Type': 'application/json'
			}
		}
	)
	const content = await response.json()

	while (pathDir && '\\'.includes(pathDir)) {
		pathDir = pathDir.slice(0, -1)
	}
	pathDir = pathDir.replaceAll('\\', '\\\\').split('\\').filter(stak => stak).slice(0, -1).join('\\') + '\\'
	const main = document.body.children[0]
	empty(main)
	tilBakaElement(main)
	einnTilBakaElement(main, pathDir)
	let colors = ['transparent', '#ffffff', '#000000', '#6D86E3', '#E3C46D']
	main.appendChild(
		el('div', {
			class: 'borderItem main-layout',
			style: 'grid-row:2/4; grid-column:1/6; max-width:480px; display:grid; grid-template-columns: 60px 60px 360px; max-height:160px;'
		},
			// --- Column 1: Number of Colors Buttons ---
			el('div', {
				class: 'form-container',
				style: 'width: 60px; display: grid; grid-template-rows: repeat(4, 40px);'
			},
				el('input', { type: 'radio', id: 'plan-1-color', name: 'litir', value: '1' }),
				el('label', { for: 'plan-1-color', class: 'button borderItem' }, '1 litur'),

				el('input', { type: 'radio', id: 'plan-2-colors', name: 'litir', value: '2', checked: true }),
				el('label', { for: 'plan-2-colors', class: 'button borderItem' }, '2 litir'),

				el('input', { type: 'radio', id: 'plan-3-colors', name: 'litir', value: '3' }),
				el('label', { for: 'plan-3-colors', class: 'button borderItem' }, '3 litir'),

				el('input', { type: 'radio', id: 'plan-4-colors', name: 'litir', value: '4' }),
				el('label', { for: 'plan-4-colors', class: 'button borderItem' }, '4 litir')
			),

			// --- Column 2: Live Color Pickers ---
			el('div', {
				class: 'color-picker-container',
				style: 'width: 60px; display: grid; grid-template-rows: repeat(4, 40px); place-items: center;'
			},
				// Create 4 color pickers. We use a loop for clarity.
				...[1, 2, 3, 4].map(i =>
					el('input', {
						type: 'color',
						class: 'color-picker',
						style: 'height: 100%;margin:0;',
						'data-color-index': i, // Link this picker to an index in the colors array.
						value: colors[i],
						onchange: 'changePreviewColors(event)' // Pass the event object
					})
				)
			),

			// --- Column 3: Placeholder for the Image/Pattern Preview ---
			// Start with the user's uploaded image. It will be replaced by the pattern.
			el('div', { id: 'patternPreviewContainer', style: 'width: 360px; height: 160px; display: grid; place-items: center;' },
				el('img', {
					id: 'imagePreview',
					src: content.imageData,
					style: 'object-fit: contain; max-width:358px; max-height:158px;',
					class: 'file-list',
					alt: 'Myndin sem þú valdir á að vera hér'
				})
			)
		)
	);
	main.appendChild(
		el(
			'div',
			{
				id: 'patternMakeForm',
				class: 'form',
				method: "POST",
				style: "grid-row: 4; grid-column: 1 / 6; display: grid; grid-template-columns: 80px 80px 160px 160px; gap: 0;"
			},
			el(
				'button',
				{
					type: 'button',
					class: 'button uppDown',
					style: 'height: 100%;font-size: 32px;',
					onclick: "changeValue(-1)",
				},
				'-'
			),
			el(
				'button',
				{
					type: 'button',
					class: 'button uppDown',
					style: 'height: 100%;font-size: 32px;',
					onclick: "changeValue(+1)",
				},
				'+'
			),

			// --- START: Updated Section ---
			// This container now holds the input and the unit.
			// It sits in the same grid cell the input used to occupy.
			el('div', { class: 'input-with-unit' },
				el(
					'input',
					{
						type: 'number',
						min: '1',
						max: '179',
						id: 'integerInput',
						name: 'integerInput',
						required: true,
						value: '42', // Added a default value
						inputmode: 'numeric',
						pattern: '[0-9]*',
						style: 'text-align: center; font-size: 64px; padding: 0 !important;grid-row:1;grid-column:1;' // Adjusted padding
					}
				),
				el('span', { class: 'unit-label' }, 'nálar')
			),
			// --- END: Updated Section ---

			el(
				'button',
				{
					type: 'button',
					class: 'buttonGo button',
					onclick: `makePattern()`
				},
				'Búa til munstur 🤔?'
			),
			el(
				'input',
				{
					type: 'hidden',
					id: 'imageData',
					name: 'imageData',
					value: `${content.imageData}`
				}
			)
		)
	);
}
/**
 * Updates the preview grid colors live when a color picker is changed.
 * @param {Event} event - The input event from the color picker.
 */
function changePreviewColors(event) {
	// 1. Find the main preview container.
	const previewGrid = document.getElementById('imagePreview');

	// 2. Get the new color and the index from the picker that triggered the change.
	const picker = event.target;
	if (!previewGrid || !picker) return
	const newColorValue = picker.value; // e.g., "#ff0000"
	const colorIndexToUpdate = picker.dataset.colorIndex; // e.g., "1"

	// 3. Find all cells in the grid that have the matching data-color-index.
	//    This will return an empty list if the grid hasn't been rendered yet,
	//    which safely prevents errors.
	const cellsToUpdate = previewGrid.querySelectorAll(
		`.pattern-cell[data-color-index="${colorIndexToUpdate}"]`
	);
	if (!cellsToUpdate) return

	// 4. Loop through all the found cells and update their background color.
	cellsToUpdate.forEach(cell => {
		cell.style.backgroundColor = newColorValue;
	});
}
/**
 * Renders or re-renders the pattern preview grid by dynamically
 * getting color values from the page's color pickers.
 * @param {number[][]} patternMatrix - The 2D array of color indexes.
 */
function renderPatternPreview(patternMatrix) {
	const previewContainer = document.getElementById('imagePreview');
	if (!previewContainer) return;

	// --- START: Dynamic Color Palette Creation ---
	// Build the color palette from the current values of the color pickers.
	const colorPickers = document.querySelectorAll('.color-picker');
	const matrix = typeof patternMatrix === 'string' ? JSON.parse(patternMatrix) : patternMatrix;

	// Index 0 can be a default background color.
	const colorPalette = { 0: 'transparent' };

	if (colorPickers.length > 0) {
		// --- IF YES: Use the colors from the pickers ---
		// console.log("Color pickers found, using their values.");
		colorPickers.forEach(picker => {
			const index = picker.dataset.colorIndex;
			colorPalette[index] = picker.value;
		});
	} else {
		// --- IF NO: Use a default set of colors ---
		console.log("No color pickers found, using default palette.");
		colorPalette[1] = '#000000'; // Default for color 1: Black
		colorPalette[2] = '#6D86E3'; // Default for color 2: Blue
		colorPalette[3] = '#E3C46D'; // Default for color 3: Yellow
		colorPalette[4] = '#FFFFFF'; // Default for color 4: White
	}
	// --- END: Dynamic Color Palette Creation ---

	const newPreview = el('div', {
		id: 'imagePreview',
		style: `
            display: grid;
            grid-template-columns: repeat(${matrix[0].length}, 2px);
            width: ${matrix.length * 2}px;
            gap: 0;
            max-height: 160px;
            overflow-y: scroll;
            overflow-x: hidden;
            align-content: start;
        `
	},
		...matrix.flat().map(colorIndex =>
			el('div', {
				class: 'pattern-cell',
				'data-color-index': colorIndex,
				// The rest of the function now uses the dynamically built palette.
				style: `width: 2px; height: 2px; background-color: ${colorPalette[colorIndex]};`
			})
		)
	);
	// const matrixJSON = JSON.stringify(patternMatrix);
	// localStorage.setItem('userPatternMatrix', matrixJSON);
	previewContainer.replaceWith(newPreview);
}

async function makePattern() {
	// Find the selected radio button
	const selectedRadio = document.querySelector("input[name='litir']:checked");
	// Check if an option was selected
	if (!selectedRadio) {
		alert('Vinsamlegast veldu fjölda lita.'); // "Please select the number of colors."
		return;
	}
	const integerInput = document.getElementById('integerInput')
	if (!integerInput) {
		alert('Fann ekki breidd munsturs')
		return
	}
	const inputImage = document.getElementById('imageData')
	if (!inputImage) {
		alert('Fann ekki mynd fyrir munstur')
		return
	}
	const width = integerInput.value;
	const imageData = inputImage.value;
	const litir = selectedRadio.value;
	const response = await fetch('/api/make',
		{
			method: 'POST',
			body: JSON.stringify({ imageData, width, litir }),
			headers: {
				'Content-Type': 'application/json'
			}

		}
	)
	if (!response || !response.ok) {
		alert('villa: ' + response.status + response.statusText)
		return
	}
	const fylki = await response.json()
	const preview = document.getElementById('imagePreview')
	if (!preview) {
		alert('fann ekki preview glugga til að sýna munstur.')
		return
	}
	const matrixJSON = JSON.stringify(fylki);
	localStorage.setItem('userPatternMatrix', matrixJSON);
	renderPatternPreview(
		fylki
	)

	// document.getElementById('selectPattern')
	if (!document.getElementById('setupPattern')) {
		const buatil = document.getElementsByClassName('buttonGo')[0]
		buatil.className = "buttonChange button"
		buatil.innerHTML = "🤔 Breyta munstri??"
		const main = document.getElementsByClassName('grid')[0] || document.body.children[0]
		main.appendChild(
			el(
				'button',
				{
					id: 'setupPattern',
					onclick: 'setupPattern()',
					style: 'grid-row:1;grid-column:5;font-size:1.25rem;',
					class: 'button buttonGo'
				},
				'😎 Gera munstur'
			)
		)

	}
	// document.body.childNodes[0]
	// .appendChild(el('a', { href: "/info", class: "button borderItem", style: 'grid-column: 5;grid-row: 1;' },
	// 	el('h2', {}, 'Info/Error'), el('p', { class: 'WebSocketStatus' }, currentWebsocketStatusIcon)
	// ))
}


function separateColors(matrix) {
	const res = [];
	// const numRows = matrix.length;
	const numCols = matrix[0].length;

	// Determine the maximum value in the matrix to know how many colors we have
	const max = Math.max(...matrix.flat());

	for (const row of matrix) {
		// Initialize an object to hold separate color lists
		const lists = {};
		for (let i = 1; i <= max; i++) {
			lists[i] = new Array(numCols).fill(0);
		}

		// Fill the color lists based on the row values
		for (let idx = 0; idx < numCols; idx++) {
			const value = row[idx];
			if (lists[value]) {
				lists[value][idx] = value;
			}
		}

		// Add each color list twice to the result
		for (let i = 1; i <= max; i++) {
			if (lists[i].some(val => val !== 0)) { // Only add if there's at least one non-zero value
				res.push([...lists[i]]);
				res.push([...lists[i]]);
			}
		}
	}

	return res;
}


async function PatternSubmitForm(parent) {
	// const old = (document.getElementById('integerInput'))?.remove()
	const fylki = localStorage.getItem('userPatternMatrix');
	// const fylki_2 = separateColors(fylki);
	if (!fylki) {
		alert('Fann ekki munstur')
		return
	}
	const matrix = JSON.parse(fylki)
	const fylki_2 = separateColors(matrix);

	const height = matrix.length
	const width = height && matrix[0].length
	// const line = matrix
	const min = -90
	const max = 89 - width
	const mid = (min + max - ((min + max) % 2)) / 2
	empty(parent)
	const selectedRadio = document.querySelector("input[name='litir']:checked");
	parent.append(
		el(
			'button',
			{ style: 'font-size:32px;color:#000;max-width:100%;max-height:100%;grid-row:1;grid-column:1;z-index:999;', type: 'button', onClick: 'event.target.parentElement.parentElement.remove()', class: 'button buttonStopp' },
			'✖'
		),
		el('p', { style: 'grid-column:1;grid-row:1;margin-bottom:-2em;height:fit-content;padding-top:85px;pointer-events:none;' }, '-90'),
		el('h2', { style: 'grid-column:2;grid-row:1;' }, 'Prjónum! 🏇🏻🧶', el('div', { style: "display: inline-block; transform: scaleX(-1);" }, '🏇🏻')),
		el('p', { style: 'grid-column:2;grid-row:1;margin-bottom:-2em;height:fit-content;padding-top:85px;pointer-events:none;' }, `Veldu fyrstu nál:`),
		el('p', { style: 'grid-column:3;grid-row:1;margin-bottom:-2em;height:fit-content;padding-top:85px;pointer-evens:none;' }, `${89 - width}`),
		el(
			'button',
			{ style: 'font-size:32px;color:#000;max-width:100%;max-height:100%;grid-column:3;grid-row:1;inde:9999;', type: 'button', onClick: 'setupPattern()', class: 'button buttonChange' },
			'👈'
		),
		el(
			'form',
			{
				style: 'grid-column:1/4;grid-row:2/4;width:100%;height:100%;display:grid;grid-template-columns:64px 64px 128px 64px 64px;grid-template-rows:repeat(2,1fr);gap:0;',
				method: 'post',
				action: '/api/pattern'
			},
			el(
				'button',
				{
					type: 'button',
					class: 'button uppDown',
					style: 'height: 100%;font-size: 32px;°,grid-column:1;grid-row:1;padding:0;',
					onclick: "changeValue(-10,'integerInputStart')",
				},
				'10'
			),
			el(
				'button',
				{
					type: 'button',
					class: 'button uppDown',
					style: 'height: 100%;font-size: 32px;grid-column:2;grid-row:1;padding:0;',
					onclick: "changeValue(-1,'integerInputStart')",
				},
				'-1'
			),
			el(
				'input',
				{
					type: 'number',
					min: min,
					max: max,
					id: 'integerInputStart',
					name: 'start',
					required: true,
					value: mid, // Added a default value
					inputmode: 'numeric',
					pattern: '[0-9]*',
					style: 'text-align: center; font-size: 64px; padding: 0 !important;grid-row:1;grid-column:3;' // Adjusted padding
				}
			),
			el(
				'button',
				{
					type: 'button',
					class: 'button uppDown',
					style: 'height: 100%;font-size: 32px;padding:0;',
					onclick: "changeValue(+1,'integerInputStart')",
				},
				'+1'
			),
			el(
				'button',
				{
					type: 'button',
					class: 'button uppDown',
					style: 'height: 100%;font-size: 32px;padding:0;',
					onclick: "changeValue(+10,'integerInputStart')",
				},
				'10'
			),
			el(
				'ul',
				{ style: 'text-align:left;padding-left:1.25em;grid-column:1/3;grid-row:2;margin-top:-0.1em;' },
				el('li', { style: 'list-style-type:none;margin-left:-1em;margin-bottom:-0.25em;' }, 'Munstur:'),
				el('li',
					{},
					`Hæð: ${height}`
				),
				el('li',
					{},
					`Breidd: ${width}`
				),
				el('li',
					{},
					`Fjöldi lita: ${selectedRadio && selectedRadio.value}`
				)
			),
			el(
				`${!socket ? 'div' : 'button'}`,
				{
					type: !socket ? 'button' : 'submit',
					class: 'button buttonGo' + (!socket ? ' invalidButton' : ''),
					style: 'grid-column:3;grid-row:2;padding-top:0;padding-bottom:0;',
					id: 'initiate-knitting',
				},
				'Byrja! 🚀'
			),
			el(
				'div',
				// "width: fit-content;display: flex;flex-direction: row;text-align: center;align-self: center;justify-self: center;margin: 0 auto;"
				{ style: "display: flex;flex-direction: row;text-align: center;align-self: center;justify-self: center;margin: 0 auto;grid-column:4/6;grid-row:2;" },
				el(
					'p', { class: 'WebSocketStatus', style: 'height:fit-content !important;' }, currentWebsocketStatusIcon
				),
				el(
					'p',
					{ class: "SeriaclCommunicationStatus", style: 'height:fit-content !important;' }

				),
				el(
					'p',
					{ class: "NetworkCommunicationStatus", style: 'height:fit-content !important;' }
				)
			),
			el(
				'input',
				{
					type: 'hidden',
					name: 'pattern',
					id: 'patternMatrixInput',
					value: JSON.stringify(fylki_2)
				},
			)
		))
	// "SeriaclCommunicationStatus"
	const hiddenInput = document.getElementById('patternMatrixInput');
	if (!hiddenInput) {
		alert('Gat ekki set munstur í beiðni, reyndu aftur')
		return
	}
	if (socket) {
		socket.send('yes')
	} else {
		const initiate = document.getElementById('initiate-knitting');
		if (initiate) {
			initiate.classList.add('invalidButton');
			initiate.onclick = (ev) => alert("Enging tenging við bakenda")
		}
	}
}

async function setupPattern() {
	const main = document.getElementsByClassName('grid')[0] || document.body.children[0];
	const oldPopup = document.getElementsByClassName('popup-cover');
	let saveForDelete
	if (oldPopup && oldPopup[0]) {

		saveForDelete = oldPopup[0]
	}
	main.appendChild(
		el('div',
			{ class: 'popup-cover', style: 'width:100vw;height:100vh;background-color:transparent;' },
			el(
				'div',
				{
					class: 'borderItem popup', style: 'max-width:80%;max-height:80%;'
				},
				el(
					'button',
					{ style: 'font-size:32px;color:#000;max-width:100%;max-height:100%;grid-row:1;grid-column:1;', type: 'button', onClick: 'event.target.parentElement.parentElement.remove()', class: 'button buttonStopp' },
					'✖'
				),

				el(
					'button',
					{ style: 'font-size:32px;color:#000;max-width:100%;max-height:100%;grid-column:3;grid-row:1;', type: 'button', onClick: 'PatternSubmitForm(event.target.parentElement)', class: 'button buttonGo' },
					'👉'
				),
				el('h2', { style: 'grid-row:1;grid-column:2;color:#000;' }, 'Athugið! 🧐')
				,
				el('ol',
					{ style: 'color:#000;grid-row:2/4;grid-column:1/4;list-style-type: decimal;padding:0;list-style-position: inside;gap:0.25em;text-align:start;' },
					el('li', { style: 'color:#000;' }, 'Var sleði í upphafsstöðu þegar arduino fékk straum?'),
					el('li', { style: 'color:#000;' }, 'Er ég tengdur Arduino?', el('strong', { style: 'color:#000;' }, ' Ef ekki:'),
						el('ol', { style: 'list-style-type:lower-alpha;text-align:center;' }, el('li', { style: 'color:#000;' }, 'Setja sleða á byrjunar reit'), el('li', { style: 'color:#000;' }, 'Tengjast Arduino.'))),
					el('li', { style: 'color:#000;' }, 'Er mótorinn stilltur á áttina til hægri?', el('strong', { style: 'color:#000;' }, ' Ef ekki:')),
					el('ol', { style: 'list-style-type:lower-alpha;text-align:center;' }, el('li', { style: 'color:#000;' }, 'Vinsamlegast snúðu um átt'))
					, el('li', { style: 'color:#000;' }, 'Þú ert að fara að stilla upphafsnál og byrja að prjóna ',
						el('ol', { style: 'list-style-type:lower-alpha;text-align:center;' }, el('li', { style: 'color:#000;' }, el('strong', { style: 'color:#000;' }, 'Ertu tilbúin?'))))),
			))


	)


	if (saveForDelete) {
		saveForDelete.remove()
	}
}


/**
 * 
 * @param {string} pathDir path to search 
 * @returns 
 */
async function getFiles(pathDir) {
	let extra = '\\'.includes(pathDir[-1])
	while (extra) {
		pathDir = pathDir.slice(0, -1)
		extra = '\\'.includes(pathDir[-1])
	}
	const response = await fetch('/api/files', {
		method: 'post', body: JSON.stringify({
			path: pathDir.includes('\\') ?
				(pathDir.includes('\\\\') ? pathDir : (pathDir.replaceAll('\\', '\\\\')))
				: (pathDir)
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	}
	)
	const { parentPath, files } = await response.json()
	const main = document.getElementsByClassName('grid')[0] || document.body.children[0]
	empty(main)
	tilBakaElement(main)
	if (files.length) {
		parentPath && ('\\'.includes(parentPath.trim().slice(0, 1)) ? main.appendChild(
			el(
				'button',
				{
					class: "button borderItem",
					onClick: "getDrives()",
					style: "grid-row:1;grid-column:3;"
				},
				'👈 Til baka í lista af drifum 💾'
			)
		) : einnTilBakaElement(main, parentPath))
		main.appendChild(
			el(
				'ol',
				{ style: 'grid-column: 1 / 6;grid-row:2 / 5;overflow-x:hidden;overflow-y: scroll;max-height: 240px !important', class: 'file-list' }
				, ...files.map(file => el('li', {},
					el(
						'button',
						{ class: 'button', onClick: (file.image ? `getImage('${file.newPath.includes('\\\\') ? file.newPath : file.newPath.replaceAll('\\', '\\\\')}')` : `getFiles('${file.newPath.includes('\\\\') ? file.newPath : file.newPath.replaceAll('\\', '\\\\')}')`) },
						`${file.name} ${file.image ? '🖼️' : '📁'}`
					)
				))
			)
		)
	} else {
		main.appendChild(
			el(
				'button'
				, { class: 'button', onclick: `getFiles('${parentPath.includes('\\\\') ? parentPath : parentPath.replaceAll('\\', '\\\\')}')`, style: 'grid-column: 1 / 6;grid-rows: 3 / 5;' }
				, 'Engar myndir eða möppur, smelltu hér til að fara 👈 til baka í fyrri möppu' + ' 📁'
			)
		)
	}
	infoElement(main)
	return
}

// scripts.js

// This function replaces the old, complex highlightRow
// In scripts.js

function updateUICounters(currentLineIndex) {
	const numElement = document.getElementById('number');
	const input = document.getElementById('integerInput');

	// Ensure the index is a valid number before proceeding.
	const currentIndex = Number(currentLineIndex);
	if (isNaN(currentIndex)) return;

	// Update the line counter display (e.g., "4/240")
	if (numElement && totalPatternLines > 0) {
		numElement.innerHTML = `${currentIndex + 1}/${totalPatternLines}`;
	}

	// --- CORRECTED LOGIC ---
	// Also update the input field to show the 1-based line number.
	if (input) {
		input.value = currentIndex + 1;

		if (totalPatternLines > 0 && input.max != totalPatternLines) {
			input.max = totalPatternLines; // The max should be the total number of lines.
		}
	}
	// --- END CORRECTION ---
}
function highlightRow(currentLineIndex) {
	const numElement = document.getElementById('number');
	const input = document.getElementById('integerInput');

	// Update the line counter display (e.g., "51/200")
	if (numElement && totalPatternLines > 0) {
		numElement.innerHTML = `${Number(currentLineIndex) + 1}/${totalPatternLines}`;
	}

	// Keep the input field value in sync
	if (input) {
		input.value = currentLineIndex;
		if (totalPatternLines > 0 && input.max != (totalPatternLines - 1)) {
			input.max = totalPatternLines - 1;
		}
	}
}

function changeValue(delta, id = 'integerInput') {
	const input = document.getElementById(id);
	if (!input) return
	const step = parseFloat(input.step) || 1;
	const min = input.min === "" ? -Infinity : parseFloat(input.min);
	const max = input.max === "" ? Infinity : parseFloat(input.max);
	let value = parseFloat(input.value) || 0;
	value = Math.min(max, Math.max(min, value + delta * step));
	input.value = value;
}

async function connectSerial(event) {
	const btn = event.target;
	btn.display = 'display:none;';
	const resJson = await fetch(
		'/api/arduino',
		{
			method: 'GET'
		}
	)
	alert(await resJson.json() + ' | ' + 'Er tenging rétt og örugg?');
	setTimeout(() => { btn.display = '' }, 120_000)
	return
}
// In scripts.js

async function deleteCurrentPattern() {
	// Optional: Ask the user for confirmation
	if (confirm('Ertu viss um að þú viljir eyða núverandi munstri?')) {
		try {
			const response = await fetch('/api/pattern', {
				method: 'DELETE'
			});

			// If the request was successful, the backend will redirect.
			// But we can also force a reload on the client side to see the change.
			if (response.ok) {
				// The backend redirect should handle this, but this is a fallback.
				window.location.reload();
			} else {
				alert('Villa kom upp við að eyða munstri.');
			}

		} catch (error) {
			console.error('Error deleting pattern:', error);
			alert('Gat ekki eytt munstri.');
		}
	}
}


let socket;

function setupKeyboardListeners() {
	const inputs = document.querySelectorAll(
		'input[type="text"], input[type="password"], input[type="email"], input[type="search"], input[type="url"], textarea'
	);

	const showKeyboard = () => {
		fetch('/api/keyboard/show', { method: 'POST' });
	};

	const hideKeyboard = () => {
		fetch('/api/keyboard/hide', { method: 'POST' });
	};

	inputs.forEach(input => {
		input.addEventListener('focus', showKeyboard);
		input.addEventListener('blur', hideKeyboard);
	});
}

// Run the setup when the page loads
window.addEventListener('load', setupKeyboardListeners);


const connect = () => {
	const WebSocketStatus = document.body.querySelector('.WebSocketStatus')
	socket = new WebSocket('ws://localhost:3001');
	let errorBoolean = false;

	socket.onmessage = function (event) {
		const obj = JSON.parse(event.data);
		console.log("Received from WebSocket:", obj)
		const value = document.getElementById('server-value');
		const nyttgildi = obj.length; // `obj` is the parsed data from the WebSocket

		if (value && nyttgildi) {
			value.innerText = nyttgildi;
		};

		if (obj.postrequestLength !== undefined) {
			totalPatternLines = obj.postrequestLength;
		}

		const nails = document.body.querySelector('#bed');
		const sequence = document.body.querySelector('#munstur');

		if (obj && obj.postrequest && obj.postrequest.pattern && obj.postrequest.pattern.length > 0) {
			const patternChunk = obj.postrequest.pattern;
			const activeIndex = obj.activeIndexInChunk;
			const trueCurrentLine = obj.nr;

			nails && empty(nails);
			sequence && empty(sequence);

			const paddingOffset = 3 - activeIndex;

			for (let i = 0; i < 7; i++) {
				const gridRowClass = `gridrow${i + 1}`;
				const dataIndex = i - paddingOffset;

				if (dataIndex >= 0 && dataIndex < patternChunk.length) {
					const rowData = patternChunk[dataIndex];
					const pattmeontheback = Array.isArray(rowData) ? rowData : String(rowData).replaceAll(',', '').split('');
					const classList = [gridRowClass];

					// CORRECTED: This now correctly marks the active row
					if (dataIndex === activeIndex) {
						classList.push('mark');
					}

					const trueNum = Number(trueCurrentLine) || 0;
					const activeNum = Number(activeIndex) || 0;
					const actualLineNumber = (trueNum - activeNum) + dataIndex;

					sequence && sequence.appendChild(
						el('tr', {
							class: classList.join(' '),
							id: String(actualLineNumber) + 'l'
						},
							el('th', {}, `${actualLineNumber + 1}`),
							...pattmeontheback.map(values => el('td', values > 0 ? { class: 'activeNeedle' } : { class: 'inactiveNeedle' }, ''))
						)
					);

				} else {
					sequence && sequence.appendChild(
						el('tr', { class: gridRowClass }, el('th', {}))
					);
				}
			}

			// Rebuild the header
			if (patternChunk.length > 0) {
				const start = Number(obj.postrequest.start);
				const end = patternChunk[0].length;
				nails && nails.appendChild(
					el('tr', {},
						el('th', {}, 'nr'),
						...(arrayRange(start, start + (end - 1), 1).map(nl => {
							const positonlCheck = (nl === start) || (nl === start + (end - 1));
							return el('th', positonlCheck ? { class: "thead" } : {}, (positonlCheck ? nl : ''));
						}))
					)
				);
			}

		} else {
			nails && empty(nails);
			sequence && empty(sequence);
			const messageRow = el('tr', { style: 'display: block; padding: 3em 0;' });
			const messageCell = el('td', { style: 'text-align: center; font-style: italic; opacity: 0.8;' }, 'Ekkert munstur í vinnslu.');
			messageRow.appendChild(messageCell);
			sequence && sequence.appendChild(messageRow);
		}

		if (obj) {
			const arduinoElements = document.querySelectorAll(".SeriaclCommunicationStatus");
			arduinoElements.forEach(el => el.innerHTML = obj.portSerial ? '✅' : '⛔');
		}

		if (obj.nr !== undefined) {
			updateUICounters(obj.nr);
		}
	};

	// onopen, onclose, onerror functions remain the same...
	socket.onopen = function (event) {
		if (WebSocketStatus) currentWebsocketStatusIcon = WebSocketStatus.innerHTML = '✅';
		errorBoolean = false;
		console.info("WebSocket is open now.");
	};
	socket.onclose = function (event) {
		if (WebSocketStatus) currentWebsocketStatusIcon = WebSocketStatus.innerHTML = '⛔';
		console.info("WebSocket is closed now.");
		try {
			for (let i = 1; !errorBoolean && i < 3 && WebSocketStatus && WebSocketStatus.innerHTML == '⛔'; i++) {
				setTimeout(connect, 30000 * i);
			}
		} catch (e) {
			console.info('Gat ekki endurhlaðið tengingi')
		}
	};
	socket.onerror = function (error) {
		errorBoolean = true
		if (WebSocketStatus) currentWebsocketStatusIcon = WebSocketStatus.innerHTML = '⚠ villa';
		console.log("WebSocket error:", error);
	};
};
document.addEventListener('DOMContentLoaded', () => {
	const bs = document.getElementById('loading')
	// const WebSocketStatus = document.body.querySelector('.WebSocketStatus')

	connect();
	const re = document.getElementById('reconnect')
	if (re) {
		re.onclick = connect
	}
})

// Replace the old popup functions with this one in scripts.js

/**
 * Gets the pattern from localStorage, renders it using our new function,
 * and displays it in a popup.
 */
function showStoredPatternPopup() {
	const main = document.querySelector('.grid') || document.body;
	const matrixJSON = localStorage.getItem('userPatternMatrix');
	if (!matrixJSON) {
		alert('ekkert munstur til að sýna')
		return
	}
	// Remove any existing popup
	const oldPopup = document.querySelector('.popup-cover');
	if (oldPopup) oldPopup.remove();

	let content;


	// Create the popup with the content
	const popup = el('div',
		{ class: 'popup-cover', style: 'width:100vw;height:100vh;background-color:transparent;' },
		el(
			'div',
			{
				class: 'borderItem popup', style: 'max-width:80%;max-height:80%;display:grid;grid-template-columns:1fr;grid-template-rows:2.5rem 1fr;'
			},
			el('div', { style: 'display:grid;grid-template-columns: 1fr 1fr;grid-template-rows:1fr;gap:1em;width:100%;max-width:80vw;max-height:2.5rem;' },
				el(
					'button',
					{ style: 'font-size:32px;color:#000;max-width:100%;max-height:100%;grid-row:1;grid-column:1;padding-bottom:0;padding-top:0;', type: 'button', onClick: 'event.target.parentElement.parentElement.parentElement.remove()', class: 'button buttonStopp' },
					'✖'
				),

				el('h2', { style: 'color:#000; margin-top: 10px;' }, 'Vistað Munstur'),
			),
			el('div', { id: 'imagePreview' })
			// Insert either the pattern preview or the "not found" message
			// content
		)
	);

	main.appendChild(popup);
	renderPatternPreview(JSON.parse(matrixJSON))
	// const a = document.getElementById("imagePreview")
	// a?.style = "display:grid;"
}