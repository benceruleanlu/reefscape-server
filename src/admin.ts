import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
let accessed = false;
let socket: WebSocket;

export function init(serverIP: string) {
  wss.on('connection', function (ws) {
    if (accessed) {
      ws.close();
      return;
    }

    accessed = true;
    socket = ws;
    console.log("Admin page accessed.")

    send({ type: "ip", ip: serverIP });
    send({ type: "all", data: Array.from(whitelistQueue.keys()) });

    ws.on('message', function (data) {
      let msg = JSON.parse(data.toString());
      let sn = msg.studentNumber;
      if (whitelistQueue.has(sn)) {
        if (msg.accepted) whitelistQueue.get(sn).whitelisted();
        else whitelistQueue.get(sn).rejected();
        deleteFromQueue(sn);
      }
    });

    ws.on('close', function () { accessed = false; console.log("Admin page closed."); });
  });

  app.use(express.static(path.join(__dirname, '..', 'public')));

  const PORT = 3000;
  server.listen(PORT, function () {
    console.log(`Admin page on http://127.0.0.1:${PORT}/admin.html`);
  });

  process.on('exit', server.close);
}

function send(data: any) {
  if (!socket || !accessed) return;
  socket.send(JSON.stringify(data));
}

const whitelistQueue: Map<number, any> = new Map<number, any>();
export function queueWhitelist(studentNumber: number, whitelisted: () => void, rejected: () => void) {
  if (whitelistQueue.has(studentNumber)) {
    rejected();
    return;
  }

  whitelistQueue.set(studentNumber, { 
    whitelisted: whitelisted, 
    rejected: rejected 
  });

  if (!socket || !accessed) return;
  send({ type: "add", studentNumber: studentNumber });
}

export function deleteFromQueue(studentNumber: number) {
  if (whitelistQueue.has(studentNumber)) whitelistQueue.delete(studentNumber);

  if (!socket || !accessed) return;
  send({ type: "del", studentNumber: studentNumber });
}

