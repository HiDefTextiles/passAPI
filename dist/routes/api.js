var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import { catchErrors } from '../lib/catch-errors.js';
import { communicationTest, connectArduino, dbPattern, deletePattern, getImage, postFiles, postMake, postPattern, postnr } from '../lib/control.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getDrives } from '../lib/control.js';
import { my_ip } from '../status/connection.js';
import { portSerial, writeDataToArduino } from '../lib/serial.js';
import { execFile } from 'child_process';
export const APIrouter = express.Router();
export function index(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        res.json([
            {
                href: '/pattern',
                method: ['GET', 'POST'],
                description: {
                    GET: "Redirects to GUI /",
                    POST: "Sends a pattern to the passap",
                    DELETE: "Removes the current pattern from the queue"
                },
                requestBody: {
                    POST: {
                        description: "The format of the data send with the post request",
                        format: {
                            type: "object",
                            properties: {
                                start: {
                                    type: "number",
                                    range: [-90, 89],
                                    description: 'The number of the beginning needle for the pattern on the passap bed.'
                                },
                                pattern: {
                                    type: "Array< Array<number> | string<number> >",
                                    range: [0, 4],
                                    description: "A array of strings OR arrays  containing a pattern of the integer value 0 for empty and 1-4 for each color, odd numbered lines are for the movement from the color picker to the other end and the even ones the vice versa.",
                                }
                            },
                            required: ["start", "pattern"]
                        }
                    }
                }
            },
            {
                href: '/drives',
                method: ['GET'],
                description: {
                    GET: "Returns JSON of all drives accessible"
                }
            }
        ]);
    });
}
APIrouter.get('/', catchErrors(index));
// APIrouter.get('/pattern',)
APIrouter.post('/pattern', postPattern);
APIrouter.delete('/pattern', deletePattern);
APIrouter.get('/pattern', (req, res) => {
    res.redirect('../');
    // const __filename = fileURLToPath(import.meta.url);
    // const __dirname = dirname(__filename);
    // res.sendFile(path.join(__dirname, '../public/status.html'));
});
APIrouter.post('/nr', postnr);
APIrouter.get('/ip', (req, res) => {
    const ipAddress = my_ip();
    const api = ipAddress ? ` & https://${ipAddress}:${3000}/api` : '';
    console.log(ipAddress);
    res.json({
        res_ip: ipAddress,
        req_ip: req.ip,
        api,
    });
});
APIrouter.get('/arduino', connectArduino);
// APIrouter.post('/imageSearch', imageSearch)
APIrouter.get('/drives', getDrives);
APIrouter.post('/files', postFiles);
APIrouter.post('/getImage', getImage);
APIrouter.post('/make', postMake);
APIrouter.post('/switch', (req, res) => {
    if (!portSerial) {
        const skilabod = encodeURIComponent("Enginn tenging við arduino");
        res.redirect('../?msg=' + skilabod);
    }
    // const buffer = Buffer.from([255])
    // console.log(`Buffer: ${buffer.byteLength}`)
    if (!portSerial) {
        return false;
    }
    const dataToSend = new Uint8Array([255]);
    writeDataToArduino(dataToSend);
    const skilabod = encodeURIComponent("Breytti um átt");
    res.redirect('../?msg=' + skilabod);
});
APIrouter.post('/GoStop', (req, res) => {
    if (!portSerial) {
        const skilabod = encodeURIComponent("Enginn tenging við arduino");
        res.redirect('../?msg=' + skilabod);
    }
    // const buffer = Buffer.from([254])
    // console.log(`Buffer: ${buffer.byteLength}`)
    if (!portSerial) {
        return false;
    }
    const dataToSend = new Uint8Array([254]);
    writeDataToArduino(dataToSend);
    const skilabod = encodeURIComponent("Stoppaði/Kveikti á motor");
    res.redirect('../?msg=' + skilabod);
});
APIrouter.post('/api/stream', dbPattern);
// APIrouter.get('/butt_o_nest/:ms', buttontest)
APIrouter.post('/test', communicationTest);
APIrouter.post('/start-access-point', (req, res) => {
    // console.log
    const scriptPath = path.join(__dirname, 'scripts', 'start_ap.sh');
    // Execute the script
    execFile('sudo', [scriptPath], (error, stdout, stderr) => {
        if (error) {
            console.error(`execFile error: ${error}`);
            console.error(`stderr: ${stderr}`);
            return res.status(500).json({ message: `Failed to start AP: ${stderr}` });
        }
        console.log(`stdout: ${stdout}`);
        res.status(200).json({ message: 'Access Point started successfully! SSID: Kiosk-WiFi' });
    });
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
APIrouter.post('/set-wifi', (req, res) => {
    const { ssid, password } = req.body;
    if (!ssid || !password) {
        return res.status(400).json({ message: 'SSID and password are required.' });
    }
    console.log(`Received request to connect to Wi-Fi: ${ssid}`);
    const scriptPath = path.join(__dirname, 'scripts', 'set_wifi.sh');
    // Execute the script with SSID and password as arguments
    execFile('sudo', [scriptPath, ssid, password], (error, stdout, stderr) => {
        if (error) {
            console.error(`execFile error: ${error}`);
            console.error(`stderr: ${stderr}`);
            return res.status(500).json({ message: `Failed to set Wi-Fi: ${stderr}` });
        }
        console.log(`stdout: ${stdout}`);
        res.status(200).json({ message: 'Wi-Fi configured successfully!' });
    });
});
//# sourceMappingURL=api.js.map