import express, { Request, Response } from 'express';
import { cors } from './lib/cors.js';
import { router } from './routes/api.js';
import { writeDataToArduino, parser } from './lib/serial.js'
import os from 'os'

export const app = express();

app.use(express.json());

app.use(cors);
app.use(router);

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
	console.log(os.networkInterfaces())
	const networkInfo = os.networkInterfaces().wlan0 || os.networkInterfaces().eth0 || os.networkInterfaces().WiFi // athugar fyrir linux og windows
	console.info(`Server running at ${networkInfo ?
		(
			Number.parseFloat(networkInfo[0].address) && networkInfo[0].address
			|| Number.parseFloat(networkInfo[1].address) && networkInfo[1].address // skilar ip tölu af tölvu
		)
		: 'https://localhost'}:${port}`);
});