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