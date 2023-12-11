import { io } from "socket.io-client";

export const socket = io("http://192.168.1.171:3000", { autoConnect: false });
