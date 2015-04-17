#!/usr/bin/env node
var harplit = require("../lib");
var program = require('commander');
var chalk = require('chalk');
var path = require('path');
var _ = require('lodash');
var async = require('async');
var fs = require('fs');
var semver = require('semver');
var filewalker = require('filewalker');
var config = require('../config/config.global');
var mongoose = require('mongoose');
var cypher = harplit.db.neo4j.cypher;


mongoose.connect(config.mongo.uri, function (err, db) {
  if (err) {
    console.log('Err: unsuccesfull connection');
  }
});

var evoModel = harplit.db.EvoVersion({db: mongoose});
var npmModel = harplit.db.npm({db: mongoose});

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
  async.each(advFiles, function(adv, callback) {
    npmModel.find({_id: adv.module_name}, function (err, docs) {
      if (docs.length !== 1) {
        return callback('Only one entry should be found!');
      }
      adv.versions = docs[0].versions;
      //TODO: Add this in utils as a function
      adv.vulnVersions = _.filter(docs[0].versions, function(ver) {
        return semver.satisfies(ver, semver.validRange(adv.vulnerable_versions));
      }); 
      return callback();
    });
  }, function(err) {
      if (!_.isEmpty(advFiles)) {
        return cb(null, advFiles);
      } else {
        return cb(null, []);
      }
      if (err) {
        return cb(err);
      }
  });
};

var getAllVunlerableMod = function(advFiles, cb) {
  var mods = [];
  async.each(advFiles, function(adv, callback) {
    var opts = {
      query: config.neo4j.query.findModules,
      params: {vuln_id: adv.module_name, adv_time: harplit.utils.getUTCtimestamp(new Date(adv.publish_date).toISOString())}
    }
    cypher(opts, function (err, data) {
      if (err) {
        return callback('Error occured with the result');
      }
      data.results[0].data.forEach(function(record) {
        mods.push({
          adv: adv,
          _id: record.row[0]._id,
          created: record.row[0].created
        });
      });
      return callback();
    });
  }, function(err) {
      if (!_.isEmpty(mods)) {
        return cb(null, mods);
      } else {
        return cb(null, []);
      }
      if (err) {
        return cb(err);
      }
  });
};

var getAllVersions = function(modList, cb) {
  async.each(modList, function(mod, callback) {
    var opts = {
      query: config.neo4j.query.getAllVersions,
      params: {mod_id: mod._id, adv_time: harplit.utils.getUTCtimestamp(new Date(mod.adv.publish_date).toISOString())}
    }
    cypher(opts, function (err, data) {
      if (err) {
        return callback('Error occured with the result');
      }
      mod.rawVersionData = data.results[0].data;
      return callback();
    });
  }, function(err) {
      if (!_.isEmpty(modList)) {
        return cb(null, modList);
      } else {
        return cb(null,[]);
      }
      if (err) {
        return cb(err);
      }
  });
};

var getAllDependenciesPerVersion = function(modList, cb) {
  async.each(modList, function(mod, callback) {
    async.each(mod.rawVersionData, function(snapshot, internalcb) {
      var opts = {
        query: config.neo4j.query.getAllDependencies,
        params: {_id: snapshot.row[0]._id}
      }
      mod.snapshots = [];
      cypher(opts, function (err, data) {
        if (err) {
          return internalcb('Error occured with the result');
        }
        snapshot.row[0].dependencies = [];
        delete snapshot.row[1].ver;
        data.results[0].data.forEach(function (depInfo) {
          depInfo.row[0]._id = depInfo.row[1];
          snapshot.row[0].dependencies.push(depInfo.row[0]);
        });
        mod.snapshots.push(_.extend(snapshot.row[0], snapshot.row[1]));
        return internalcb();
      });
    }, function(err) {
      if (err) {
        return callback(err);
      } else {
        delete mod.rawVersionData;
        return callback();
      }
  });
  }, function(err) {
      if (!_.isEmpty(modList)) {
        return cb(null, modList);
      } else {
        return cb(null, []);
      }
      if (err) {
        return cb(err);
      }
  });
};

var analyze = function(cb) { 
  return function(error, result) {
    if (error) {
      console.log('Something is wrong!');
    } else {
      async.each(result, function(module, callback) {
        evoModel.create(harplit.evoAnalyzer.analyze(module), function (err, small) {
          if (err) console.log(err);
          return callback();
        });
      }, function(err) {
        if (err) {
          console.log(err);
          return cb(err);
        }
        return cb();
      });
    }
  }
};
var startAnalyze = function(error, result) {
  if (error) {
    console.log('Something is wrong!'); 
  } else {
    async.each(result, function(advJSON, callback) {
      async.waterfall([
        init([advJSON]),
        getNPMdata,
        getAllVunlerableMod,
        getAllVersions,
        getAllDependenciesPerVersion
      ],analyze(callback));
    }, function(err){
      if (err) {
        console.log(err);
      }
      mongoose.connection.close();
    });
  }
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
    ],startAnalyze);
  });
program.parse(process.argv);

if(program.args.length < 1){
  program.help()
}