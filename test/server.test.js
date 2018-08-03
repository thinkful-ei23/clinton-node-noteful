'use strict';

const { app, runServer, closeServer } = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Reality check', function() {

  it('true should be true', function() {
    expect(true).to.be.true;
  });

  it('2 + 2 should equal 4', function() {
    expect(2 + 2).to.equal(4);
  });

});

describe('Express static', function() {

  it('GET request "/" should return the index page', function() {
    return chai.request(app)
      .get('/')
      .then(function (res) {
        expect(res).to.exist;
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      });
  });

});

describe('404 handler', function() {

  it('should respond with 404 when given a bad path', function() {
    return chai.request(app)
      .get('/DOES/NOT/EXIST')
      .then(function(res) {
        expect(res).to.have.status(404);
      });
  });

});


describe('Notes Database', function() {

  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  it('should return full list of 10 default notes', function() {
    return chai
      .request(app)
      .get('/api/notes')
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body.length).to.equal(10);

        const expectedKeys = ['id', 'title', 'content'];
        res.body.forEach(function(note) {
          expect(note).to.be.a('object');
          expect(note).to.include.keys(expectedKeys);
        });
      });
  });

  it('should return correct search results for a valid query', function() {
    const searchTerm = 'government';
    return chai
      .request(app)
      .get(`/api/notes/?searchTerm=${searchTerm}`)
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body.length).to.be.above(0);
        res.body.forEach(function(note) {
          expect(note).to.be.a('object');
          expect(note).to.have.all.keys('id', 'title', 'content');
          expect(note.title).to.include(searchTerm);
        });
      });
  });

  it('should return empty array for an invalid query', function() {
    const searchTerm = 'dogs';
    return chai
      .request(app)
      .get(`/api/notes/?searchTerm=${searchTerm}`)
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body.length).to.equal(0);
      });
  });

  it('should return correct note object', function() {
    let id;
    let title;
    let content;
    return chai
      .request(app)
      .get('/api/notes')
      .then(function(res) {
        id = res.body[0].id;
        title = res.body[0].title;
        content = res.body[0].content;
        return chai
          .request(app)
          .get(`/api/notes/${id}`);
      })
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body.id).to.equal(id);
        expect(res.body.title).to.equal(title);
        expect(res.body.content).to.equal(content);
      });
  });

  it('should respond with a 404 for an invalid id', function() {
    return chai
      .request(app)
      .get('/api/notes/DOESNOTEXIST')
      .then(function(res) {
        expect(res).to.have.status(404);
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('message');
        expect(res.body.message).to.equal('Not Found');
      });
  });

  it('should create and return a new item with location header when provided valid data', function() {
    const newNote = { title: 'dogs are cool', content: 'stuff about dogs' };
    return chai
      .request(app)
      .post('/api/notes')
      .send(newNote)
      .then(function(res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('id', 'title', 'content');
        expect(res.body.id).to.not.equal(null);
        expect(res.body).to.deep.equal(
          Object.assign(newNote, { id: res.body.id })
        );
        expect(res.headers.location).to.include(res.body.id);
      });
  });

  it('should return an object with `missing title` message', function() {
    const newNote = { title: '', content: 'uh-oh, no title!' };
    return chai
      .request(app)
      .post('/api/notes')
      .send(newNote)
      .then(function(res) {
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('message', 'error');
        expect(res.body.message).to.equal('Missing `title` in request body');
        expect(res.body.error.status).to.equal(400);
      });
  });

});
