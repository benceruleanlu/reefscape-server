## How to run App

1. Install dependencies

```bash
npm install
```

2. Generate a certificate and private key pair

```bash
openssl req -newkey rsa:2048 -nodes -keyout server-key.pem -x509 -out server-cert.pem
```

Move `server-cert.pem` to the corresponding [reefscape-app](https://github.com/benceruleanlu/reefscape-app) in `assets/`. 

3. Start the server

```bash
npm start
```

