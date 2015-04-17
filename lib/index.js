//Analyzers
module.exports.evoAnalyzer = require('./analyzer/evoAnalyzer');
module.exports.compAnalyzer = require('./analyzer/compareAnalyzer');
//Database related
module.exports.db = {
  neo4j: require('./neo4j'),
  npm: require('./model/Npm'),
  EvoVersion: require('./model/EvoVersion')
};
//utils
module.exports.utils = require('./analyzer/utils');



