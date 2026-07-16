import http from 'http';
import app from './app';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

console.log("PORT from env:", process.env.PORT);

const PORT = process.env.PORT || 5000;

console.log("Using PORT:", PORT);

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

server.listen(PORT, () => {
  console.log("SERVER STARTED");
  console.log(`Server is running on port ${PORT}`);
});