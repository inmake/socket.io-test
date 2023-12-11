import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: "*" });
const port = 3000;

app.use(cors());

app.get("/", function (req, res) {
  res.json({ ok: 1 });
});

io.on("connection", (socket) => {
  console.log("user connected", socket.handshake.auth);

  const { username } = socket.handshake.auth;

  socket.on("send_message", (message) => {
    console.log(message);
    socket.broadcast.emit("new_message", { username, message });
  });

  socket.on("disconnect", function () {
    console.log("user disconnected");
  });
});

server.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
