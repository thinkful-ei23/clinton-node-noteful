'use strict';

const express = require('express');
// Load array of notes
const data = require('./db/notes');

const app = express();

console.log('hello world!');

// INSERT EXPRESS APP CODE HERE...
app.use(express.static('public'));

// app.get('/', (req, res) => {
  
// });

app.listen(8080, function () {
  console.info(`Server listening on ${this.address().port}`);
}).on('error', err => {
  console.error(err);
});