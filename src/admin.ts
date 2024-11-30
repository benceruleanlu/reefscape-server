import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
let accessed = false;
let socket: WebSocket;

export function init() {
  wss.on('connection', function (ws) {
    if (accessed) ws.close();

    accessed = true;
    socket = ws;
    console.log("Admin page accessed.")

    ws.send(JSON.stringify({ type: "all", data: Array.from(whitelistQueue.keys()) }));
    console.log(Array(whitelistQueue.keys()));

    ws.on('message', function (data) {
      let msg = JSON.parse(data.toString());
      let sn = msg.studentNumber;
      if (whitelistQueue.has(sn)) {
        if (msg.accepted) {
          whitelistQueue.get(sn).whitelisted();
        } else {
          whitelistQueue.get(sn).rejected();
        }
      }
    });

    ws.on('close', function () { accessed = false; console.log("Admin page closed."); });
  });

  app.use(express.static(path.join(__dirname, '..', 'public')));

  const PORT = 3000;
  server.listen(PORT, function () {
    console.log(`Admin page on http://127.0.0.1:${PORT}`);
  });

  process.on('exit', server.close);
}

const whitelistQueue: Map<number, any> = new Map<number, any>();
export function queueWhitelist(studentNumber: number, whitelisted: () => void, rejected: () => void) {
  if (whitelistQueue.has(studentNumber)) rejected();

  whitelistQueue.set(studentNumber, { 
    whitelisted: function () { whitelisted(); deleteFromQueue(studentNumber); }, 
    rejected: function () { rejected(); deleteFromQueue(studentNumber); } 
  });

  if (!socket || !accessed) return;
  socket.send(JSON.stringify({ type: "add", studentNumber: studentNumber }));
}

export function deleteFromQueue(studentNumber: number) {
  if (whitelistQueue.has(studentNumber)) whitelistQueue.delete(studentNumber);

  if (!socket || !accessed) return;
  socket.send(JSON.stringify({ type: "del", studentNumber: studentNumber }));
}

