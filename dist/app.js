import express from 'express';
import { cors } from './lib/cors.js';
import { APIrouter } from './routes/api.js';
import { previewRouter } from './routes/preview.js';
import http from 'http';
import { WebSocketServer } from "ws";
import { nr, postrequests } from './lib/control.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { portSerial } from './lib/serial.js';
import { my_ip } from './status/connection.js';
export const app = express();
app.use('/', express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
const path = dirname(fileURLToPath(import.meta.url));
app.use(cors);
// app.use(express.bodyParser({ limit: '50mb' }));
app.use('/', express.static(join(path, 'public')));
app.use('/', previewRouter);
app.use('/api', APIrouter);
const port = process.env.PORT || 3000;
app.use((_req, res) => {
    res.status(404).json({ error: 'not found' });
});
app.use((err, _req, res) => {
    var _a;
    if (err instanceof SyntaxError &&
        'status' in err &&
        err.status === 400 &&
        'body' in err) {
        return res.status(400).json({ error: 'invalid json' });
    }
    return res
        .status(500)
        .json({ error: (_a = err.message) !== null && _a !== void 0 ? _a : 'internal server error' });
});
// app.listen(port, () => {
// 	console.log(`Server running at http://localhost:${port}/`);
// });
// 1. Get all network interfaces ONCE.
// const networkInterfaces = os.networkInterfaces();
// // 2. Find the first, non-internal IPv4 address in a safe, cross-platform way.
// const ipAddress = Object.values(networkInterfaces)
// 	.flat() // Puts all interface arrays into a single array
// 	.find(iface => iface && (iface.family === 'IPv4' && !iface.internal))?.address;
// // 3. Use the result in your log message.
// const networkLog = ipAddress ? ` & https://${ipAddress}:${port}` : '';
// console.info(`Server running at https://localhost:${port}${networkLog}`);
app.listen(port, () => {
    // console.log(os.networkInterfaces())
    // const networkInfo = os.networkInterfaces().wlan0 || os.networkInterfaces().eth0 || os.networkInterfaces().WiFi // athugar fyrir linux og windows
    const ipAddress = my_ip();
    const networkLog = ipAddress ? ` & https://${ipAddress}:${port}` : '';
    console.info(`Server running at https://localhost:${port}${networkLog}`);
    // console.info(`Server running at https://localhost:${port} ${networkInfo ? '& ' +
    // 	(
    // 		Number.parseFloat(networkInfo[0].address) && networkInfo[0].address
    // 		|| Number.parseFloat(networkInfo[1].address) && networkInfo[1].address // skilar ip tölu af tölvu
    // 		|| Number.parseFloat(networkInfo.splice(-1)[0].address) && networkInfo.splice(-1)[0].address
    // 	)
    // 	: 'port'}:${port}`);
});
const server = http.createServer(app);
export var wss = new WebSocketServer({ port: 3001 });
// wss.on('connection', (ws) => {
// 	console.log('New client connected');
// 	// Send the value to the client when they connect 
// 	// let currentPostrequest = { start: null, pattern: null, msg: null }
// 	// if (postrequests[0] && postrequests[0].pattern) {
// 	// 	const { start, pattern, msg } = postrequests[0]
// 	// 	const s = pattern
// 	// 	currentPostrequest = { start, pattern: s.slice(nr, Math.min(nr + 5, pattern.length)), msg }
// 	// }
// 	// // if ()
// 	// const a = postrequests[0] ? postrequests[0].pattern.length : null
// 	// ws.send(JSON.stringify(
// 	// 	{ nr, postrequest: currentPostrequest, portSerial: !!portSerial, length: postrequests.length, postrequestLength: a }
// 	// ));
// 	let currentPostrequest = { start: null, pattern: null, msg: null };
// 	let totalPatternLength = 0; // Default value
// 	if (postrequests[0] && postrequests[0].pattern) {
// 		const { start, pattern, msg } = postrequests[0];
// 		totalPatternLength = pattern.length; // Get the full length
// 		currentPostrequest = {
// 			start,
// 			// Send the slice starting from the current `nr`
// 			pattern: pattern.slice(nr, Math.min(nr + 6, totalPatternLength)),
// 			msg
// 		};
// 	}
// 	ws.send(JSON.stringify({
// 		nr, // The starting index of the slice
// 		postrequest: currentPostrequest,
// 		portSerial: !!portSerial,
// 		length: postrequests.length,
// 		postrequestLength: totalPatternLength // Send the correct total length
// 	}));
// 	// Optional: you can also handle incoming messages from the client
// 	ws.on('message', (message) => {
// 		ws.send(JSON.stringify(
// 			{ nr, portSerial: !!portSerial }
// 		));
// 		// console.log('Received:', message);
// 	});
// 	ws.on('close', () => {
// 		console.log('Client disconnected');
// 	});
// });
// app.ts
// app.ts
wss.on('connection', (ws) => {
    console.log('New client connected');
    let payload = {
        nr,
        postrequest: postrequests[0],
        length: postrequests.length,
        postrequestLength: 0,
        portSerial: !!portSerial,
        activeIndexInChunk: 0,
    };
    if (postrequests[0] && postrequests[0].pattern) {
        const { start, pattern, msg } = postrequests[0];
        payload.postrequestLength = pattern.length;
        // Correct slicing logic
        const sliceStart = Math.max(0, nr - 3);
        const sliceEnd = Math.min(pattern.length, nr + 4);
        const patternChunk = pattern.slice(sliceStart, sliceEnd);
        payload.activeIndexInChunk = nr - sliceStart;
        payload.postrequest = {
            start,
            pattern: patternChunk,
            msg,
        };
    }
    ws.send(JSON.stringify(payload));
    ws.on('message', (message) => {
        ws.send(JSON.stringify({ portSerial: !!portSerial }));
        // You can add more robust message handling here if needed
    });
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});
export const broadcast = (data) => {
    const jsonData = JSON.stringify(data);
    // console.log(`Broadcasting: ${Object.keys(jsonData)}`);
    // Iterate over all connected clients
    wss.clients.forEach((client) => {
        // Check if the client's connection is open before sending
        if (client.readyState === WebSocket.OPEN) {
            client.send(jsonData);
        }
    });
};
//# sourceMappingURL=app.js.map