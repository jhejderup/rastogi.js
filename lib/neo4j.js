/*
 * NEO4J
 *
 * Handful utilities for interacting with neo4j graph database
 *
 * @method {object} query - HTTP API using cypher that supports batch mode
 * @return {object} public interface
 */
function Neo4J(options) {
  'use strict';
  options = options || {};
  var request = require('request');
  var config = require('../config/config.global');
  var _ = require('lodash');
  var postQuery;
  var cypher = function(options, cb) {
    options.batch = options.batch || false;
    if (!options.batch) {
      if (!options.query || !options.params) {
        throw new Error('both query and params is needed!');
      }
      if (!_.isString(options.query) || !_.isObject(options.params)) {
        throw new Error('query should be a string and params an object!');
      }
      postQuery = [{
        statement: options.query,
        parameters: options.params
      }];
    }
    if (options.batch) {
      if (!options.stmts) {
        throw new Error('list of statements is needed!');
      }
      if (!_.isArray(options.stmts)) {
        throw new Error('stmts is not an array!');
      }
      postQuery = options.stmts;
    }
    request.post({
      uri: config.neo4j.uri,
      json: {
        statements: postQuery
      }
    }, function(err, res) {
      if (err) {
        return cb(err);
      }
      return cb(null, res.body);
    });
  };
  return {
    cypher: cypher
  };
}
module.exports = new Neo4J();
