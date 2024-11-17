import * as http from 'http';
import * as os from 'os';

function getLocalIP() {
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

const server = http.createServer((req, res) => {
	res.writeHead(200, { 'Content-Type': 'text/plain' });
	res.end('Absolute Robotics reefscape app HTTP Server');
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
	console.log(`Server running at http://${getLocalIP()}:${PORT}`);
});
