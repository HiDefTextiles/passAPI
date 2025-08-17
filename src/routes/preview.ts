import express, { Request, Response } from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { WebSocketServer } from "ws";
import { app } from '../app.js'
export const previewRouter = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


previewRouter.get('/', (req, res) => {
	res.sendFile(join(__dirname, '../public/status.html'));
})

previewRouter.get('/pattern', (req, res) => {
	res.sendFile(join(__dirname, '../public/pattern.html'));
})

previewRouter.get('/make', (req, res) => {
	res.sendFile(join(__dirname, '../public/make.html'));
})

previewRouter.get('/info', (req, res) => {
	res.sendFile(join(__dirname, '../public/info.html'));
})


previewRouter.get('/wifi', (req, res) => {
	res.sendFile(join(__dirname, '../public/wifi.html'));

})