import dotenv from "dotenv";
import { createSchema, dropSchema, insertVel } from "./db.js";
// WILL SETUP OR RESET DATABASE

dotenv.config();

export async function create() {
	const drop = await dropSchema();
	if (drop) {
		console.info("schema dropped");
	} else {
		console.info("schema not dropped, exiting");
		process.exit(-1);
	}
	const result = await createSchema();
	if (result) {
		console.info("schema created");
		await insertVel(Number(process.env.vel_id), 'test', true)
	} else {
		console.info("schema not created");
	}
}

create().catch((err) => {
	console.error("Error creating running setup", err);
});