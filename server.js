const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = 3000;

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.on('run-script', () => {
    const script = exec('node script.js');

    script.stdout.on('data', (data) => {
      socket.emit('log', data.toString());
    });

    script.stderr.on('data', (data) => {
      socket.emit('log', `ERROR: ${data.toString()}`);
    });

    script.on('close', (code) => {
      socket.emit('log', `Script finished with code ${code}`);
      socket.emit('script-finished'); // Emitir evento cuando el script termina
    });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
