const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = 3001;

const unifiedCSVDirectory = path.join(__dirname, 'unified_csv_files');

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint para descargar un archivo CSV específico
app.get('/download-csv/:filename', (req, res) => {
  const fileName = req.params.filename;
  const filePath = path.join(unifiedCSVDirectory, fileName);

  res.download(filePath, fileName, (err) => {
    if (err) {
      console.error('Error al descargar el archivo:', err);
      res.status(500).send('Error al descargar el archivo');
    }
  });
});

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
      socket.emit('script-finished'); // Frena el spinner en el frontend
      
      // Leer la lista de archivos CSV unificados después de que el script finalice
      fs.readdir(unifiedCSVDirectory, (err, files) => {
        if (err) {
          console.error('Error al leer archivos unificados:', err);
          return;
        }

        // Filtrar solo archivos CSV
        const csvFiles = files.filter(file => path.extname(file) === '.csv');
        
        // Emitir evento con la lista de archivos CSV
        socket.emit('csv-files-ready', csvFiles);
      });
    });
  });

  socket.on('request-csv-files', () => {
    // Emitir la lista de archivos CSV disponibles
    fs.readdir(unifiedCSVDirectory, (err, files) => {
      if (err) {
        console.error('Error al leer archivos unificados:', err);
        return;
      }

      const csvFiles = files.filter(file => path.extname(file) === '.csv');
      socket.emit('csv-files-ready', csvFiles);
    });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
