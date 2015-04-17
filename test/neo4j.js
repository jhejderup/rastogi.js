var expect = require('chai').expect;
var request    = require('request');
var sinon      = require('sinon');

describe('Neo4J', function() {
  describe('cypher-sync-tests', function() {
    var cypher = require('../lib/neo4j').cypher;
     it('should throw an error if no parameters are passed', function () {
      expect(function() {
        cypher(function(res,err){});
      }).to.throw(Error);
    });
    
    it('should throw an error if not the "stmts" parameter is provided', function () {
      expect(function() {
        var options = {};
        options.batch = true;
        
        cypher(options,function(res,err){});
      }).to.throw(Error);
    });
    
    it('should throw an error if not the "stmts" parameter is provided', function () {
      expect(function() {
        var options = {};
        options.batch = true;
        
        cypher(options,function(res,err){});
      }).to.throw(Error);
    });
    
    it('should throw an error if not the "query" parameter is provided', function () {
      expect(function() {
        var options = {};
        options.params = "asdsa";
        
        cypher(options,function(res,err){});
      }).to.throw(Error);
    });
    
    it('should throw an error if not the "params" parameter is provided', function () {
      expect(function() {
        var options = {};
        options.query = "asdsa";
        cypher(options,function(res,err){});
      }).to.throw(Error);
    });
    it('should throw an error if the "params" & "query" parameter are objects', function () {
      expect(function() {
        var options = {};
        options.query = {hello:'hello'};
        options.params = {hello:'hello'};
        cypher(options,function(res,err){});
      }).to.throw(Error);
    });
    it('should throw an error if the "params" & "query" parameter are arrays', function () {
      expect(function() {
        var options = {};
        options.query = [];
        options.params = [];
        cypher(options,function(res,err){});
      }).to.throw(Error);
    });
  });
  
  describe('cypher-async-tests', function() {
    var cypher = require('../lib/neo4j').cypher;
    
    before(function(done){
      sinon
      .stub(request, 'post')
      .yields(null, JSON.stringify({body: "rows"}));
      done();
    });
    after(function(done){
      request.post.restore();
      done();
    });
    it('making a query call', function(done){ //TODO: Learn more with mocking
      var options = {};
      options.query = 'MATCH (ps:PackageState{_id:{_id}})-[d:`DEPENDS_ON`]->(pDep:Package) \n RETURN d, pDep._id';;
      options.params = {_id:'hapi'};
      cypher(options, function(err, result){
        if(err) return done(err);
        done();
      });
    });
  });
});