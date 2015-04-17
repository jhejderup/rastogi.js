'use strict';
var _ = require('lodash');
var utils = require('./utils');
var config = require('../../config/config.global');
var compare = require('./compareAnalyzer');
var EvoAnalyze = function() {};

var dynamicSort = function(property) {
  var sortOrder = 1;
  if (property[0] === '-') {
    sortOrder = -1;
    property = property.substr(1);
  }
  return function(a, b) {
    var result = utils.versionSort(a[property], b[property]);
    return result;
  };
};
var timeDiff = function(module) {
  var result = {};
  result.timeDiff = {};
  if (!_.isObject(module) || _.isEmpty(module)) {
    throw new Error('"module" should be an Object or is empty');
  }
  //basic info
  if (module.to === config.neo4j.latestTimestamp) {
    result.timeDiff.from = new Date(module.from).toISOString();
    result.timeDiff.to = 'latest';
  } else {
    result.timeDiff.from = new Date(module.from).toISOString();
    result.timeDiff.to = new Date(module.to).toISOString();
  }
  //time comparsion
  if (new Date(module.from).getTime() > new Date(module.publish_date).getTime()) {
    result.timeDiff.after = true;  //after advisory = true, before advisory = false
  } else {
    result.timeDiff.after = false;
  }
  result.timeDiff.days = Math.ceil(Math.abs(new Date(module.publish_date).getTime() - new Date(module.from).getTime()) / (1000 * 3600 * 24));
  return result;
};

EvoAnalyze.prototype.analyze = function(module) {
  module = module || {};
  var result = {};
  result.adv = {};
  if (!_.isObject(module) || _.isEmpty(module)) {
    throw new Error('"module" should be an Object or is was empty');
  }
  result.mod_id = module._id;
  result.adv.mod_id = module.adv.module_name;
  result.adv.published = new Date(module.adv.publish_date).toISOString();
  result.adv.vulnRange = module.adv.vulnerable_versions;
  result.adv.patchRange = module.adv.patched_versions;
  result.versionAnalysis = [];
  result.snapshots = [];
  module.snapshots = _.filter(module.snapshots, function(snapshot) {
    return utils.useStrictVersionNumber(snapshot.version);
  });
  module.snapshots.sort(dynamicSort('version'));
  for (var i = 0; i < module.snapshots.length; ++i) {
    var snapshot = {};
    snapshot.version = module.snapshots[i].version;
    module.snapshots[i].publish_date = module.adv.publish_date;
    snapshot = _.merge(snapshot, timeDiff(module.snapshots[i]));
    var getAdvDependencies = _.filter(module.snapshots[i].dependencies, function(dep) {
      return dep._id.toLowerCase() === result.adv.mod_id.toLowerCase();
    });
    if (getAdvDependencies.length > 0) {
      _.each(getAdvDependencies, function(dep) {
        var params = {};
        if (_.isString(dep.range)) {
          params.modDepRange = dep.range;
          params.depVerList = module.adv.versions;
          params.depVulnList = module.adv.vulnVersions;
          _.merge(snapshot, utils.isVulnerable(params));
        }
      });
    }
    if (i > 0) { //we cant compare the first version
      var prevModule = _.filter(module.snapshots[i - 1].dependencies, function(dep) {
        return dep._id.toLowerCase() === module.adv.module_name.toLowerCase();
      });
      var modInfo = {};
      modInfo.verList = module.adv.versions;
      modInfo.vulnList = module.adv.vulnVersions;
      modInfo.prevVersion = module.snapshots[i - 1].version;
      modInfo.currVersion = module.snapshots[i].version;
      result.versionAnalysis = _.union(result.versionAnalysis, compare.analyze(prevModule, getAdvDependencies, modInfo));
    }
    result.snapshots.push(snapshot);  
  }
  return result;
};
module.exports = new EvoAnalyze();
if (process.env.NODE_ENV === 'test') {
  module.exports._private = {
    dynamicSort: dynamicSort,
    timeDiff: timeDiff
  };
}
