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

io.on("connection", async (socket) => {
  console.log(socket.rooms);
  console.log(socket.id);

  console.log("user connected", socket.handshake.auth);

  const { roomId, username } = socket.handshake.auth;

  const fetchSockets = await io.sockets.fetchSockets();
  let allSockets = [];

  for (const socket of fetchSockets) {
    const { id } = socket;
    const { username } = socket.handshake.auth;

    allSockets.push({ id, username, roomId });
  }

  console.log(allSockets);

  socket.join(roomId);
  io.to(roomId).emit("join_user", allSockets);

  socket.on("send_message", (message) => {
    console.log(message);
    socket.broadcast.to(roomId).emit("new_message", { username, message });
  });

  socket.on(
    "send_message_to_user",
    async (fromUsername, toUsername, message) => {
      const allSockets = await io.sockets.fetchSockets();

      console.log(allSockets);

      for (const socket of allSockets) {
        const { username } = socket.handshake.auth;

        if (toUsername === username) {
          console.log(
            "Send message from",
            fromUsername,
            "to",
            toUsername,
            ":",
            message
          );

          console.log(socket.id);

          io.to(socket.id).emit("new_message_to_user", {
            fromUsername,
            message,
          });
        }
      }
    }
  );

  // socket.on("send_message_to_username", (username, message) => {
  //   io.sockets;
  // });

  socket.on("disconnect", function () {
    console.log("user disconnected");
    // socket.leave(roomId);

    socket.leave(roomId);
    allSockets = allSockets.filter((item) => item.id != socket.id);
    io.to(roomId).emit("leave_user", allSockets);
    console.log(allSockets);
  });
});

server.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
