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

  it('should return full list of 10 notes', function() {
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

  it('should return empty array for an incorrect query', function() {
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

});
