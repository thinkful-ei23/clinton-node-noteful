'use strict';

// Load Express into the file
const express = require('express');

const { PORT } = require('./config');
const { logger } = require('./middleware/logger');
const itemsRouter = require('./router/notes.router');

// Create an Express application
const app = express();

app.use(logger);

// Create a static webserver
app.use(express.static('public'));

// Parses incoming requests that contain JSON and
// makes them available on `req.body`
app.use(express.json());

app.use(itemsRouter);

app.get('/boom', (req, res, next) => {
  throw new Error('Boom!!');
});

app.use(function (req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  res.status(404).json({ message: 'Not Found' });
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});

app.listen(PORT, function () {
  console.info(`Server listening on ${this.address().port}`);
}).on('error', err => {
  console.error(err);
});
