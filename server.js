import express from "express";
import { WebSocketServer } from "ws";
import http from "http";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.static("public")); // serve index.html, images, etc.

const clients = new Map();
const fishImages = ["fish1.png", "fish2.png", "fish3.png", "fish4.png"];

function broadcastAll() {
  const data = Array.from(clients.values());
  const msg = JSON.stringify({ type: "update", data });
  for (const ws of clients.keys()) ws.send(msg);
}

wss.on("connection", (ws) => {
  const id = Date.now().toString(36);
  const fish = fishImages[Math.floor(Math.random() * fishImages.length)];
  clients.set(ws, { id, fish, x: 0, y: 0 });

  ws.send(JSON.stringify({ type: "init", id, fish }));

  ws.on("message", (msg) => {
    const data = JSON.parse(msg);
    if (data.type === "move") {
      const user = clients.get(ws);
      if (user) {
        user.x = data.x;
        user.y = data.y;
        broadcastAll();
      }
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
    broadcastAll();
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Fishpond running on port " + PORT));