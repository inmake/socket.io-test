/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { socket } from "./socket";

interface Message {
  username: string;
  message: string;
}

function App() {
  const [username, setUsername] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [allMessages, setAllMessages] = useState<Message[]>([]);

  function connect() {
    if (username === "") return;

    socket.auth = { username };
    socket.connect();

    socket.on("connect", () => {
      console.log("connect");

      setIsConnected(true);
    });

    socket.on("new_message", (data) => {
      console.log("data", data);
      setAllMessages((prev) => [...prev, data]);
    });
  }

  function sendMessage() {
    socket.emit("send_message", message);
    setAllMessages((prev) => [...prev, { username, message }]);
    setMessage("");
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
          {/* <div className="">list users</div> */}
          <div className="flex gap-2">
            <form onSubmit={(e) => e.preventDefault()}>
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
            {allMessages.map(({ username, message }, index) => (
              <p key={index} className="">
                {username}: {message}
              </p>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
