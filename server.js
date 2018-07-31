'use strict';

const express = require('express');
// Load array of notes
const data = require('./db/notes');

const app = express();

const { PORT } = require('./config');
const { logger } = require('./middleware/logger');

// INSERT EXPRESS APP CODE HERE...
app.use(logger);

app.use(express.static('public'));

app.get('/api/notes', (req, res) => {
  const searchTerm = req.query.searchTerm;
  let filteredData = data;
  if (searchTerm) {
    filteredData = filteredData.filter(item => JSON.stringify(item).includes(searchTerm));
  }
  
  res.json(filteredData);
});

app.get('/api/notes/:id', (req, res) => {
  const id = req.params.id;
  const filteredData = data.find(item => item.id === Number(id));
  res.json(filteredData);
});

app.listen(PORT, function () {
  console.info(`Server listening on ${this.address().port}`);
}).on('error', err => {
  console.error(err);
});
