import express, { Request, Response } from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { WebSocketServer } from "ws";
import { app } from '../app.js'
export const previewRouter = express.Router();

// const server = http.createServer(express());
// const wss = new WebSocket.Server({ server });

// let value = 0;

// // Serve static files from the "public" directory
// // app.use(express.static(join(__dirname, 'public')));

// // WebSocket connection handler
// wss.on('connection', (ws) => {
// 	console.log('New client connected');

// 	// Send the value to the client when they connect
// 	ws.send(value);

// 	// Optional: you can also handle incoming messages from the client
// 	ws.on('message', (message) => {
// 		console.log('Received:', message);
// 	});

// 	ws.on('close', () => {
// 		console.log('Client disconnected');
// 	});
// });

// // Update the value every second and broadcast to all connected clients
// setInterval(() => {
// 	value++;
// 	wss.clients.forEach((client) => {
// 		if (client.readyState === WebSocket.OPEN) {
// 			client.send(value);
// 		}
// 	});
// }, 1000);
// previewRouter.post('/', async (req, res) => {
// 	await fetch(
// 		'http://localhost:3000/api/nr', {
// 		method: 'POST',
// 		headers: {
// 			"Content-Type": "application/json",
// 			// 'Content-Type': 'application/x-www-form-urlencoded',
// 		},
// 		body: JSON.stringify(req.body)
// 	}
// 	)
// })

previewRouter.get('/', (req, res) => {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);
	res.sendFile(join(__dirname, '../public/status.html'));
})

previewRouter.get('/make', (req, res) => {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);
	res.sendFile(join(__dirname, '../public/make.html'));
})