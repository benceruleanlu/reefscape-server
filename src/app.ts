import { WebSocketServer } from 'ws';
import * as utils from './utils';
import * as db from './database';
import * as admin from './admin';

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

const PORT = 4308;
const server = new WebSocketServer({ port: PORT });
console.log(`Server on ws://${utils.getLocalIP()}:${PORT}`);

admin.init();

server.on('connection', function connection(ws) {
  ws.on('error', console.error);

  let studentNumber: number;
  let name: string;
  let whitelisted = false;

  ws.on('message', function (data) {
    try {
      let msg = JSON.parse(data.toString());

      if (msg.action === "verify") {
        if (studentNumber) {
          ws.send("Only one person per session.");
          return;
        }

        studentNumber = msg.studentNumber;

        if (scouters.has(studentNumber)) {
          whitelisted = true;
          name = scouters.get(studentNumber).name;

          console.log(`Connection from ${studentNumber} (${name})`);
          ws.send(`Hello ${name}!`);
        } else {
          console.log(`Wating to whitelist new scouter ${studentNumber}`)
          ws.send("Waiting for whitelist.");

          admin.queueWhitelist(studentNumber, function () {
            whitelisted = true;
            ws.send("Whitelisted!");

            db.insertScouter(studentNumber, "");
            scouters.set(studentNumber, { student_number: studentNumber, name: "" });
          }, function () { ws.send("Rejected!"); ws.close(); });
        }
      } 
      else if (msg.action === "name-change") {
        if (!whitelisted) {
          ws.send("Not whitelisted.");
          return;
        }

        //
      }
    } catch (err) {
      console.error(err);
    }
  });

  ws.on('close', function () { 
    if (whitelisted) { console.log(`Scouter ${studentNumber} (${name}) disconnected.`) }
    else {
      admin.deleteFromQueue(studentNumber);
    }
  });
});

