import { Server } from 'socket.io';

let io;

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log('✅ Socket.IO server initializing...');
    io = new Server(res.socket.server, {
      path: '/api/socket',
    });

    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('🔥 New socket connected:', socket.id);

      socket.on('message', (msg) => {
        console.log('📨 Received message:', msg);
        socket.broadcast.emit('message', msg);
      });

      // 🚀 Add WebRTC signaling
      socket.on('call-offer', ({ offer, to, from, video }) => {
        socket.to(to).emit('call-offer', { offer, from, video });
      });

      socket.on('call-answer', ({ answer, to }) => {
        socket.to(to).emit('call-answer', { answer });
      });

      socket.on('ice-candidate', ({ candidate, to }) => {
        socket.to(to).emit('ice-candidate', { candidate });
      });

      socket.on('disconnect', () => {
        console.log('❌ Disconnected:', socket.id);
      });
    });
  }

  res.end();
}
