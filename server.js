'use strict';

// Load Express, Morgan, Config, and Router into the file
const express = require('express');
const morgan = require('morgan');
const { PORT } = require('./config');
const notesRouter = require('./router/notes.router');

// Create an Express application
const app = express();

// Log all requests with Morgan
app.use(morgan('dev'));

// Create a static webserver
app.use(express.static('public'));

// Parse incoming requests that contain JSON and
// make them available on `req.body`
app.use(express.json());

// Route all requests to `/api` through the router
app.use('/api', notesRouter);

// Default 404 error
app.use(function (req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Catch-all error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: app.get('env') === 'development' ? err : {}
  });
});

// Declare `server` for use in `startServer` and `stopServer`
let server;

// Starts the server and returns a Promise, providing a way
// to asynchronously start the server in the test code.
function startServer() {
  return new Promise((resolve, reject) => {
    server = app
      .listen(PORT, () => {
        console.log(`Starting server. Your app is listening on port ${PORT}`);
        resolve(server);
      })
      .on('error', err => {
        reject(err);
      });
  });
}

// Stops the server and returns a Promise, providing a way
// to asynchronously stop the server in the test code.
function stopServer() {
  return new Promise((resolve, reject) => {
    console.log('Closing server');
    server.close(err => {
      if (err) {
        reject(err);
        // Need an empty `return` line so that we don't
        // also call `resolve()` below
        return;
      }
      resolve();
    });
  });
}

// Listen for incoming connections
if (require.main === module) {
  startServer().catch(err => {
    if (err.code === 'EADDRINUSE') {
      const stars = '*'.repeat(80);
      console.error(`${stars}\nEADDRINUSE (Error Address In Use). Please stop other web servers using port ${PORT}\n${stars}`);
    }
    console.error(err);
  });
}

// Export for testing
module.exports = { app, startServer, stopServer };
