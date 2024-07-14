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

function highlightRow(rowIndex) {
	const num = document.getElementById('number');
	let sin = 0;

	const joke = document.getElementById(`munstur`);

	const rows = joke.children;

	// rows[rowIndex].classList.add('current');
	// console.log(sin++);

	// Remove existing highlights
	for (let i = 0; i < rows.length; i++) {
		rows[i].classList.remove('highlight');
		if (i > rowIndex - 5 && i < rowIndex + 3) {
			rows[i].classList.add('highlight');
			rows[i].classList.add(`gridrow${rowIndex - i - 1 < 0 ? 5 + i - rowIndex : i - rowIndex + 5}`)
			rows[i].classList.remove('not_it');
		} else {
			!rows[i].classList.contains('not_it') && rows[i].classList.add('not_it')
		}
		// rows[i].classList.add('lowlight');
	}
	if (num) {
		num.innerHTML = `${!rowIndex ? 0 : rowIndex - 1}/${rows.length}`
	}

	// // Add highlight to the selected row and the surrounding rows
	// for (let i = Math.max(rowIndex - 3, 0); i <= Math.min(rowIndex + 3, rows.length - 1); i++) {
	// 	rows[i].classList.add('highlight');
	// }
	return true
}



document.addEventListener('DOMContentLoaded', () => {
	const bs = document.getElementById('loading')
	document.getElementById('integerForm').addEventListener('submit', function (event) {
		event.preventDefault(); // Prevent the default form submission
		bs?.classList.add('loading')
		const integerValue = document.getElementById('integerInput').value;
		// Make a POST request to the same server
		fetch('/api/nr', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ nr: parseInt(integerValue, 10) })
		}).then(stak => stak.status === 200 && highlightRow(parseInt(integerValue, 10)) && bs?.classList.remove('loading'));
	});
	document.getElementById('patternDeleteForm').addEventListener('submit', (event) => {
		event.preventDefault();
		if (window.confirm('Viltu eyða núverandi munstri?')) {
			fetch('/api/pattern', {
				method: 'DELETE'
			})
		}
	})
	const socket = new WebSocket('ws://localhost:3001');
	const WebSocketStatus = document.body.querySelector('.WebSocketStatus')


	socket.onmessage = function (event) {
		const obj = JSON.parse(event.data);
		console.log(obj.nr)
		// obj && obj.nr && highlightRow(obj.nr);
		if (obj && obj.postrequests) {
			const value = document.getElementById('server-value');
			const gamlagildi = value?.innerHTML;
			const nyttgildi = obj.postrequests.length;
			if (value) value.innerText = nyttgildi;
			const nails = document.body.querySelector('#bed');
			const sequence = document.body.querySelector('#munstur');
			if (obj.postrequests.length) {
				const pattern = obj.postrequests[0].pattern;
				const linur = pattern.length
				const start = Number(obj.postrequests[0].start);
				if (pattern && ((gamlagildi && nyttgildi !== gamlagildi && nyttgildi <= gamlagildi) || (nyttgildi && !sequence?.childElementCount))) {
					nails && empty(nails);
					sequence && empty(sequence);
					let end = 0;
					pattern.forEach((stak, num) => {
						const pattmeontheback = stak.replaceAll(',', '').split('');
						end = pattmeontheback.length;
						sequence && sequence.appendChild(
							el('tr', { class: `${num === (obj.nr !== 0 ? obj.nr - 1 : 0) ? 'mark' : ''} not_it`, id: String(num) + 'l' }, el('th', {}, num),
								...pattmeontheback.map(values => el('td', {}, values)), el('td', {}, obj.postrequests[0].msg && obj.postrequests[0].msg[num] || '')
							)
						)
					})
					nails && nails.appendChild(
						el('tr', {},
							el('th', {}, 'nr'),
							...(arrayRange(start, start + (end - 1), 1).map(
								nl => el('th', {}, nl)
							)), el('th', {}, 'msg')
						)
					)
					const tala = document.getElementById("integerInput");
					if (tala && (tala.max != linur - 1)) {
						tala.max = linur - 1
					}
					highlightRow(obj.nr)
					// highlightRow(obj.nr)
				}
			} else {
				empty(nails);
				empty(sequence);
			}
			const mark = document.body.querySelector('.mark');
			if (sequence && sequence.childElementCount && mark && (Number.parseInt(mark.id) !== Number(obj.nr))) {
				mark.classList.remove('mark')
				const newmark = document.getElementById(`${obj.nr ? obj.nr - 1 : 0}l`);
				newmark && newmark.classList.add('mark')
				// document
				highlightRow(obj.nr);
				// const num = document.getElementById('number')
			}
		}
	};

	socket.onopen = function (event) {
		if (WebSocketStatus) WebSocketStatus.innerHTML = '✅ tenging virk';
		console.log("WebSocket is open now.");
	};

	socket.onclose = function (event) {
		if (WebSocketStatus) WebSocketStatus.innerHTML = '⛔ tenging slökkt';
		console.log("WebSocket is closed now.");
	};

	socket.onerror = function (error) {
		if (WebSocketStatus) WebSocketStatus.innerHTML = '⚠ tenging villa';
		console.log("WebSocket error:", error);
	};
})