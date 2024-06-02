import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import xss from 'xss';



export const stringValidator = ({
	field = '',
	minLength = 0,
	maxLength = 0,
	optional = false,
} = {}) => {
	const val = body(field)
		.trim()
		.isString()
		.isLength({
			min: minLength || undefined,
			max: maxLength || undefined,
		})
		.withMessage(
			[
				field,
				minLength ? `min ${minLength} character` : '',
				maxLength ? `max ${maxLength} characters` : '',
			]
				.filter((i) => Boolean(i))
				.join(' '),
		);

	if (optional) {
		return val.optional();
	}

	return val;
};

export const validationCheck = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const validation = validationResult(req);
	if (!validation.isEmpty()) {
		return res.status(400).json({ errors: validation.array() });
	}
	return next();
};

// XSS sanitizer 
export const xssSanitizer = (param: string) =>
	body(param).customSanitizer((v) => xss(v));
