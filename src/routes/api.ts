import express, { Request, Response } from 'express';
import { catchErrors } from '../lib/catch-errors.js';
import { postPattern } from '../lib/crud.js'
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
export const router = express.Router();

export async function index(req: Request, res: Response) {
	res.json(
		[
			{
				href: '/pattern',
				method: ['GET', 'POST'],
				description: {
					GET: "Returns a dynamic client side web page with status of pattern",
					POST: "Sends a pattern to the passap"
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

			}
		]
	)
}

router.get('/', catchErrors(index));

// router.get('/pattern',)
router.post('/pattern', postPattern)
router.get('/pattern', (req, res) => {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);
	res.sendFile(path.join(__dirname, '../public/status.html'));
})
