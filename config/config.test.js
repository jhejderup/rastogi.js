var config = require('./config.global');

config.gulp = {};
config.jscs = {};

config.gulp.src = './lib/**/*.js';
config.gulp.tests = './test/**/*.js';
config.jscs.preset = 'airbnb'; 
//update the airbnb.json under "node_modules/gulp-jscs/jscs/presets" to include: "disallowMultipleVarDecl": true, and remove "requireMultipleVarDecl": "onevar"
//https://github.com/mbohal/node-jscs/commit/34a0356a66275a17a196d53cf9d5a57b5070b213



//override global
config.env = 'test';
config.hostname = 'test.example';
config.mongo.db = 'example_test';

module.exports = config;