var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import dotenv from "dotenv";
import { createSchema, dropSchema, insertVel } from "../db/db.js";
// WILL SETUP OR RESET DATABASE
dotenv.config();
export function create() {
    return __awaiter(this, void 0, void 0, function* () {
        const drop = yield dropSchema();
        if (drop) {
            console.info("schema dropped");
        }
        else {
            console.info("schema not dropped, exiting");
            process.exit(-1);
        }
        const result = yield createSchema();
        if (result) {
            console.info("schema created");
            yield insertVel(Number(process.env.vel_id), 'test', true);
        }
        else {
            console.info("schema not created");
        }
    });
}
create().catch((err) => {
    console.error("Error creating running setup", err);
});
//# sourceMappingURL=setup.js.map