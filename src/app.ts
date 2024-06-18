import express, { Request, Response } from 'express';
import { cors } from './lib/cors.js';
import { APIrouter } from './routes/api.js';
import { writeDataToArduino, parser } from './lib/serial.js'
import os from 'os'
import { previewRouter } from './routes/preview.js';
import http from 'http';
import WebSocket, { WebSocketServer } from "ws";

export const app = express();

let value = 0;

app.use(express.json());

app.use(cors);
app.use('/', previewRouter)
app.use('/api', APIrouter);

const port = process.env.PORT || 3000;

app.use((_req: Request, res: Response) => {
	res.status(404).json({ error: 'not found' });
});

app.use((err: Error, _req: Request, res: Response) => {
	if (
		err instanceof SyntaxError &&
		'status' in err &&
		err.status === 400 &&
		'body' in err
	) {
		return res.status(400).json({ error: 'invalid json' });
	}
	return res
		.status(500)
		.json({ error: err.message ?? 'internal server error' });
});

// app.listen(port, () => {
// 	console.log(`Server running at http://localhost:${port}/`);
// });

app.listen(port, () => {
	// console.log(os.networkInterfaces())
	const networkInfo = os.networkInterfaces().wlan0 || os.networkInterfaces().eth0 || os.networkInterfaces().WiFi // athugar fyrir linux og windows
	console.info(`Server running at https://localhost:${port} ${networkInfo ? '& ' +
		(
			Number.parseFloat(networkInfo[0].address) && networkInfo[0].address
			|| Number.parseFloat(networkInfo[1].address) && networkInfo[1].address // skilar ip tölu af tölvu
			|| Number.parseFloat(networkInfo.splice(-1)[0].address) && networkInfo.splice(-1)[0].address
		)
		: 'port'}:${port}`);
});

const server = http.createServer(app);
const wss = new WebSocketServer({ port: 3001 });
wss.on('connection', (ws) => {
	console.log('New client connected');

	// Send the value to the client when they connect
	ws.send(value);

	// Optional: you can also handle incoming messages from the client
	ws.on('message', (message) => {
		console.log('Received:', message);
	});

	ws.on('close', () => {
		console.log('Client disconnected');
	});
});

// Update the value every second and broadcast to all connected clients
setInterval(() => {
	value++;
	wss.clients.forEach((client) => {
		if (client.readyState === WebSocket.OPEN) {
			client.send(value);
		}
	});
}, 1000);