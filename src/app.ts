import * as http from "http";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import * as crypto from "crypto";

const privateKey = fs.readFileSync(
  path.join(__dirname, "..", "server-key.pem"),
  "utf8",
);

function encrypt(data: string, publicKey: string): string {
  const buffer = Buffer.from(data, "utf-8");
  const encrypted = crypto.publicEncrypt(publicKey, buffer);
  return encrypted.toString("base64");
}

function decrypt(data: string): string {
  const buffer = Buffer.from(data, "base64");
  const decrypted = crypto.privateDecrypt(privateKey, buffer);
  return decrypted.toString("utf-8");
}

function getLocalIP() {
  const networkInterfaces = os.networkInterfaces();

  for (const interfaceName in networkInterfaces) {
    const interfaceInfo = networkInterfaces[interfaceName];
    if (interfaceInfo === undefined) continue;
    for (const iface of interfaceInfo) {
      if (iface.family !== "IPv4" || iface.internal) continue;
      return iface.address;
    }
  }
  return "No local IP found";
}

const server = http.createServer((req, res) => {
  let contentraw = "";

  req.on("data", (chunk) => {
    contentraw += chunk;
  });

  req.on("end", () => {
    try {
      const content = JSON.parse(contentraw);
      const data = decrypt(content.data);

      res.writeHead(200, { "content-type": "text/plain" });
      res.end(encrypt(data, content.key));
    } catch (error: any) {
      console.log(error);
    }
  });
});

const PORT = 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://${getLocalIP()}:${PORT}`);
});
