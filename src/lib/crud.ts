import { body } from "express-validator";




export const postPattern = [
	body("start")
		.trim()
		.escape()
		.notEmpty()
		.withMessage('Missing start value. Vantar start gildi')
		.isInt({ min: -90, max: 89 })
		.withMessage(`start has to be a integer between -90 and 89.
		start þarf a vera heiltala á bilinu -90 til 89`),
	body("pattern")
		.trim()
		.notEmpty()
		.custom(pattern => Array.isArray(pattern)
			&& pattern.every(row => Array.isArray(row))
			&& pattern.every(row => row.every(
				(value: number | null | number) => value && Number.isInteger(value) && (value >= 0) && (value <= 4))))
		.withMessage('pattern has to be a array of arrays (matrix) including only integer values between 0 and 4')

]