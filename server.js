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

// Parses incoming requests that contain JSON and
// makes them available on `req.body`
app.use(express.json());

// Route all requests to `/api` through the router
app.use('/api', notesRouter);

// Set default 404 error
app.use(function (req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  res.status(404).json({ message: 'Not Found' });
});

//
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});

let server;

function runServer() {
  return new Promise((resolve, reject) => {
    server = app
      .listen(PORT, () => {
        console.log(`Your app is listening on port ${PORT}`);
        resolve(server);
      })
      .on('error', err => {
        reject(err);
      });
  });
}

function closeServer() {
  return new Promise((resolve, reject) => {
    console.log('Closing server');
    server.close(err => {
      if (err) {
        reject(err);
        // so we don't also call `resolve()`
        return;
      }
      resolve();
    });
  });
}

// Listen for incoming connections
if (require.main === module) {
  app.listen(PORT, function () {
    console.info(`Server listening on ${this.address().port}`);
  }).on('error', err => {
    console.error(err);
  });
}

// Export for testing
module.exports = { app, runServer, closeServer };
