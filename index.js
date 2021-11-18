//! Webcam live streaming with WebSockets and Base64

//* We want to stream live video from the webcam to any connected client.

//* A possible solution:
//* Send each frame from the webcam to a websocket server wich will send the frame to an array of clients.

//! 0. initialization

//* >> mkdir wsServer && cd wsServer && npm init -y && npm i -S ws express && touch index.js client.html streamer.html

//! 1. dependencies:
const path = require('path');
const express = require('express');
const WebSocket = require('ws');
const app = express();

//! 2.1 set-up WebSocket and http ports:
const WS_PORT = process.env.WS_PORT || 3001;
const HTTP_PORT = process.env.HTTP_PORT || 3000;
//! 2.2 instantiate WebSocket:
const wsServer = new WebSocket.Server({ port: WS_PORT }, () => console.log(`WS server is listening at ws://localhost:${WS_PORT}`));
//! 2.3 array of connected WebSocket clients:
let connectedClients = [];
//! 2.4 WebSocket server set-up:
wsServer.on('connection', (ws, req) => {
    console.log('Connected');
    // add new connected client
    connectedClients.push(ws);
   
    // listen for messages from the streamer, the clients will not send anything so we don't need to filter
    ws.on('message', data => {
        
        // send the base64 encoded frame to each connected ws
        connectedClients.forEach((ws, i) => {
            if (ws.readyState === ws.OPEN) { // check if it is still connected
                ws.send(data); // send
            } 
            else { // if it's not connected remove from the array of connected ws
                connectedClients.splice(i, 1);
            }
        });
    });
});

//! 3. HTTP stuff:
//! 3.1 'client' endpoint: 
app.get('/client', (req, res) => res.sendFile(path.resolve(__dirname, './client.html')));
//! 3.2 'streamer' endpoint:
app.get('/streamer', (req, res) => res.sendFile(path.resolve(__dirname, './streamer.html')));
app.listen(HTTP_PORT, () => console.log(`HTTP server listening at http://localhost:${HTTP_PORT}`));

//? Why it is so laggy ?
//? Well, we should not forget that Base64 encoding is less efficient than the raw binary. If you want, you can use GZIP or even LZ77 to compress the base64 string although keep in mind that it may not have the best compression rate(because of the randomness of the base64). It’s up to you.