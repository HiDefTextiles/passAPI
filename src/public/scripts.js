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
* @param {HTMLElement} element Element sem á að tæma
*/
function empty(element) {
	if (!element || !element.firstChild) {
		return;
	}
	while (element.firstChild) {
		element.removeChild(element.firstChild);
	}
}


document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('integerForm').addEventListener('submit', function (event) {
		event.preventDefault(); // Prevent the default form submission

		const integerValue = document.getElementById('integerInput').value;

		// Make a POST request to the same server
		fetch('/api/nr', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ nr: parseInt(integerValue, 10) })
		})
	})
	const socket = new WebSocket('ws://localhost:3001');

	socket.onmessage = function (event) {
		const obj = JSON.parse(event.data);
		if (obj && obj.postrequests) {
			const value = document.getElementById('server-value');
			const gamlagildi = value.innerHTML;
			const nyttgildi = obj.postrequests.length;
			value.innerText = nyttgildi;
			const nails = document.body.querySelector('#bed');
			const sequence = document.body.querySelector('#munstur');
			if (obj.postrequests[0]) {
				const pattern = obj.postrequests[0].pattern;
				const linur = pattern.length
				const start = Number(obj.postrequests[0].start);
				if (pattern && ((nyttgildi !== gamlagildi && nyttgildi <= gamlagildi) || (nyttgildi && !sequence.childElementCount))) {
					empty(nails);
					empty(sequence);
					let end = 0;
					pattern.forEach((stak, num) => {
						const pattmeontheback = stak.replaceAll(',', '').split('');
						end = pattmeontheback.length;
						sequence.appendChild(
							el('tr', { class: `${num === obj.nr ? 'mark' : ''}`, id: String(num) + 'l' }, el('th', {}, num),
								...pattmeontheback.map(values => el('td', {}, values)), el('td', {}, obj.postrequests[0].msg && obj.postrequests[0].msg[num] || '')
							)
						)
					})
					nails.appendChild(
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
				}
			}
			const mark = document.body.querySelector('.mark');
			if (sequence.childElementCount && mark && (Number.parseInt(mark.id) !== Number(obj.nr))) {
				mark.classList.remove('mark')
				const newmark = document.getElementById(`${obj.nr}l`);
				newmark && newmark.classList.add('mark')
			}
		}
	};

	socket.onopen = function (event) {
		console.log("WebSocket is open now.");
	};

	socket.onclose = function (event) {
		console.log("WebSocket is closed now.");
	};

	socket.onerror = function (error) {
		console.log("WebSocket error:", error);
	};
})