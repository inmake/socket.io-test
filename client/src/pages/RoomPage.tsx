/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../socket";

interface Message {
  username: string;
  message: string;
  isPrivate?: boolean;
}

function RoomPage() {
  const { id: roomId } = useParams();
  const [username, setUsername] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [toUsername, setToUsername] = useState<string>("");
  const [users, setUsers] = useState<any[]>([]); // { [key: string]: any }

  function connect() {
    if (username === "") return;

    socket.auth = { roomId, username };
    socket.connect();

    socket.on("connect", () => {
      console.log("connect", socket.id);

      setIsConnected(true);
    });

    socket.on("new_message", (data) => {
      console.log("data", data);
      setAllMessages((prev) => [...prev, data]);
    });

    socket.on("new_message_to_user", ({ fromUsername, message }) => {
      console.log(`${fromUsername}: ${message}`);
      setAllMessages((prev) => [
        ...prev,
        { username: fromUsername, message, isPrivate: true },
      ]);
    });

    socket.on("join_user", (data) => {
      setUsers(data);
    });

    socket.on("leave_user", (data) => {
      setUsers(data);
    });
  }

  function sendMessage() {
    socket.emit("send_message", message);
    setAllMessages((prev) => [...prev, { username, message }]);
    setMessage("");
  }

  function sendMessageToUser() {
    socket.emit("send_message_to_user", username, toUsername, message);
    setAllMessages((prev) => [
      ...prev,
      { username: `${username} to ${toUsername}`, message },
    ]);
  }

  return (
    <div className="p-8 flex flex-col gap-4 w-[400px]">
      {!isConnected ? (
        <>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="px-4 py-3 border border-black w-full"
          />

          <button
            onClick={connect}
            className="px-4 py-3 border border-black hover:bg-gray-200"
          >
            Connect
          </button>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            <p>ONLINE USERS:</p>
            <div className="">
              {users.map((user) => (
                <p>{user.username}</p>
              ))}
            </div>
          </div>
          <div className="flex gap-16">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="min-w-[400px] flex flex-col gap-4"
            >
              <input
                type="text"
                placeholder="Private Username"
                value={toUsername}
                onChange={(e) => setToUsername(e.target.value)}
                className="px-4 py-3 border border-black w-full"
              />
              <button
                onClick={sendMessageToUser}
                className="px-4 py-3 border border-black w-full hover:bg-gray-200"
              >
                sendMessageToUser
              </button>
            </form>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="min-w-[400px] flex flex-col gap-4"
            >
              <input
                type="text"
                className="px-4 py-3 border border-black w-full"
                placeholder="Введите ваше сообщение..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                type="submit"
                onClick={sendMessage}
                className="px-4 py-3 border border-black hover:bg-gray-200"
              >
                Send
              </button>
            </form>
          </div>
          <div className="">
            {allMessages.map(({ username, message, isPrivate }, index) => (
              <p key={index} className={`${isPrivate ? "bg-gray-400" : ""}`}>
                {username}: {message}
              </p>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default RoomPage;
