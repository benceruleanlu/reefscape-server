import { WebSocketServer } from 'ws';
import * as os from 'os';
import * as db from './database';

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

const scouters: Map<number, any> = new Map<number, any>();
(async function () {
  await db.init();

  const fromDB = await db.getScouters();
  for (let i = 0; i < fromDB.length; i++) {
    let scouter = fromDB[i];
    scouters.set(scouter.student_number, scouter);
  }

  console.log("Database initialized.");
})();

server.on('connection', function connection(ws) {
  ws.on('error', console.error);

  let studentNumber: number;
  let name: string;
  let whitelisted = false;

  ws.on('message', function message(data) {
    try {
      let msg = JSON.parse(data.toString());

      if (msg.action === "verify") {
        studentNumber = msg.studentNumber;
        console.log(`Connection from ${studentNumber}`);

        if (scouters.has(studentNumber)) {
          whitelisted = true;
          name = scouters.get(studentNumber).name;
          ws.send(`Hello ${name}!`);
        } else {
          ws.send("Waiting for whitelist.");
        }
      }
    } catch (err) {
      console.error(err);
    }
  });

  ws.on('close', function () { console.log(`Scouter ${studentNumber} disconnected.`) });
});

