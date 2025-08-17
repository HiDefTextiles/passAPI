import os from 'os'



export const my_ip = () => {
	const networkInterfaces = os.networkInterfaces();
	const ipAddress = Object.values(networkInterfaces)
		.flat() // Puts all interface arrays into a single array
		.find(iface => iface && (iface.family === 'IPv4' && !iface.internal))?.address;
	return ipAddress
}


export const check_internet = async () => {
	try {
		await fetch(
			'https://www.google.com', { method: 'GET' }
		);
		return true
	} catch {
		return false
	}
}