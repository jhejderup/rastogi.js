#!/usr/bin/env node
var harplit = require("../lib");
var program = require('commander');
var chalk = require('chalk');
var path = require('path');
var _ = require('lodash');
var async = require('async');
var fs = require('fs');
var filewalker = require('filewalker');
var config = require('../config/config.global');
var mongoose = require('mongoose');
var npmModel = harplit.db.npm;
var cypher = harplit.db.neo4j.cypher;


mongoose.connect(config.mongo.uri, function (err, db) {
  if (err) {
    console.log('Err: unsuccesfull connection');
  }
});


var init = function(path, cb) {
  return function(cb) {
    cb(null, path);
  }
};

var findAdvisories = function(folderPath, cb) {
  var advFiles = [];
  filewalker(folderPath)
    .on('file', function(p, s) {
        if (path.extname(p) === '.json') {
          try {
            var json = JSON.parse(fs.readFileSync(folderPath + '/' + p, 'utf8'));
            advFiles.push(json);
          } catch (err) {
            return cb(err);
          }
        }
    })
    .on('error', function(err) {
      return cb(err);
    })
    .on('done', function() {
      if (!_.isEmpty(advFiles)) {
        return cb(null, advFiles);
      } else {
        throw new Error('No advisories were found!'); 
      }
  
    })
  .walk();
};

var getNPMdata = function(advFiles, cb) {
  var npmModel = harplit.db.npm({db: mongoose});
  var npmDocs = [];
  async.each(advFiles, function(adv, callback) {
    npmModel.find({_id: adv.module_name}, function (err, docs) {
      if (docs.length !== 1) {
        return callback('Only one entry should be found!');
      }
      npmDocs.push({
        adv: adv,
        meta: docs[0]
      });
      return callback();
    });
  }, function(err) {
      if (!_.isEmpty(npmDocs)) {
        return cb(null, npmDocs);
      } else {
        throw new Error('No entries were found in the database!');
      }
      if (err) {
        return cb(err);
      }
  });
};

var getAllVunlerableMod = function(npmDocs, cb) {
  async.each(npmDocs, function(npmDoc, callback) {
    var opts = {
      query: config.neo4j.query.findModules,
      params: {vuln_id: npmDoc.adv.module_name, adv_time: harplit.utils.getUTCtimestamp(new Date(npmDoc.adv.publish_date).toISOString())}
    }
    cypher(opts, function (err, data) {
      if (err) {
        return callback('Error occured with the result');
      }
      npmDoc.rawDep = data.results[0].data;
      return callback();
    });
  }, function(err) {
      if (!_.isEmpty(npmDocs)) {
        return cb(null, npmDocs);
      } else {
        throw new Error('No entries were found in the database!');
      }
      if (err) {
        return cb(err);
      }
  });
};

var getAllVersions= function(npmDocs, cb) {
};

var final = function(error, result) {
  if (error) {
    console.log('Something is wrong!'); 
  } else {
    console.log(JSON.stringify(result));
  }
  mongoose.connection.close()
};



program
  .version('0.0.1');
program
  .command('evoAnalyzer [path]')
  .usage('start the evoAnalyzer provided a path to advisories')
  .description('Runs evoAnalyzer and saves data in mongodb')
  .action(function (path, program) {
    async.waterfall([
      init(path || config.adv.defaultFolder),
      findAdvisories,
      getNPMdata,
      getAllVunlerableMod
    ],final);
  });


program.parse(process.argv);

if(program.args.length < 1){
  program.help()
}