import { WebSocketServer } from 'ws';
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

const PORT = 4308;
const server = new WebSocketServer({ port: PORT });
console.log(`Server on ws://${getLocalIP()}:${PORT}`);

server.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

  ws.send('something');
});

