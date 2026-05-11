import { io } from 'socket.io-client';

// Connect to the same origin
const socket = io('/'); 

export default socket;
