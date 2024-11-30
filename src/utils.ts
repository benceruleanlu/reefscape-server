import * as os from 'os';

export function getLocalIP() {
	const networkInterfaces = os.networkInterfaces();

	for (const interfaceName in networkInterfaces) {
		const interfaceInfo = networkInterfaces[interfaceName];
		if (interfaceInfo === undefined) continue;
		for (const iface of interfaceInfo) {
			if (iface.family !== 'IPv4' || iface.internal) continue;
			return iface.address;
		}
	}
	return 'No local IP found';
}
