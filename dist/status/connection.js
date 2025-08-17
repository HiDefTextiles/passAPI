var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import os from 'os';
export const my_ip = () => {
    var _a;
    const networkInterfaces = os.networkInterfaces();
    const ipAddress = (_a = Object.values(networkInterfaces)
        .flat() // Puts all interface arrays into a single array
        .find(iface => iface && (iface.family === 'IPv4' && !iface.internal))) === null || _a === void 0 ? void 0 : _a.address;
    return ipAddress;
};
export const check_internet = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield fetch('https://www.google.com', { method: 'GET' });
        return true;
    }
    catch (_a) {
        return false;
    }
});
//# sourceMappingURL=connection.js.map