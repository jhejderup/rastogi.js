/*
 * Compare
 *
 * Function that compares the dependency information difference
 * between two releases of a module
 *
 */
'use strict';
var _ = require('lodash');
var utils = require('./utils');
var Compare = function() {};
/*
 * compNumVersion
 * This checks the usage, is the dependency delcered in more places or less
 * @param {number} prevLength
 * @param {number} currLength
 * @return {object} result
 */
var compNumVersion = function(prevLength, currLength) {
  var depStatus = {};
  depStatus.depUsage = {};
  if (prevLength === 0 && currLength === 0) {
    depStatus.depUsage.prev = 'not used';
    depStatus.depUsage.curr = 'not used';
  } else if (prevLength === 0 && currLength === 1) {
    depStatus.depUsage.prev = 'not used';
    depStatus.depUsage.curr = 'used';
  } else if (prevLength === 1 && currLength === 1) {
    depStatus.depUsage.prev = 'used';
    depStatus.depUsage.curr = 'used';
  } else if (prevLength === 1 && currLength === 0) {
    depStatus.depUsage.prev = 'used';
    depStatus.depUsage.curr = 'not used';
  } else if (prevLength < currLength && currLength > 1) { //more declerations of the dep
    depStatus.depUsage.prev = 'used';
    depStatus.depUsage.curr = 'used+';
  } else if (prevLength > 1 && currLength < prevLength) { //less declerations of the dep
    depStatus.depUsage.prev = 'used+';
    depStatus.depUsage.curr = 'used';
  }
  return depStatus;
};

var compType = function(prevType, currType) {
  var result = {};
  result.depType = {};
  if (!_.isString(prevType) || _.isEmpty(prevType)) {
    throw new Error('"prevType" is not a String or is empty');
  }
  if (!_.isString(currType) || _.isEmpty(currType)) {
    throw new Error('"currType" is not a String or is empty');
  }
  if (prevType === currType) {
    result.depType.status = 'same';
    result.depType.from = prevType.toString();
  } else {
    result.depType.status = 'changed';
    result.depType.from = prevType.toString();
    result.depType.to = currType.toString();
  }
  return result;
};

/*
 * Compare dependency information between two versions
 * @param {object} prevSnapshot
 * @param {object} currSnapshot
 * @return {array} results
 */
Compare.prototype.analyze = function(prevSnapshot, currSnapshot, modInfo) {
  prevSnapshot = prevSnapshot || [];
  currSnapshot = currSnapshot || [];
  var results = [];
  var result = {};
  result.depType = {};
  result.depRange = {};
  result.meta = {};
  result.meta.prevVersion = modInfo.prevVersion;
  result.meta.currVersion = modInfo.currVersion;
  if (!_.isArray(prevSnapshot)) {
    throw new Error('"prevSnapshot" is not an Array');
  }
  if (!_.isArray(currSnapshot)) {
    throw new Error('"prevSnapshot" is not an Array');
  }
  if (!_.isObject(modInfo) || _.isEmpty(modInfo)) {
    throw new Error('"modInfo" is not an Object or is empty');
  }
  result = _.merge(result, compNumVersion(prevSnapshot.length, currSnapshot.length));
  if (prevSnapshot.length === currSnapshot.length) {
    for (var i = 0; i < currSnapshot.length; i++) {
      //check type, did type of the dependency change
      result = _.merge(result, compType(prevSnapshot[i].type, currSnapshot[i].type));
      //check range
      var prevVuln = result.depRange.prevVuln = utils.isVulnerable({
        modDepRange: prevSnapshot[i].range,
        depVerList:  modInfo.verList,
        depVulnList: modInfo.vulnList
      });
      var currVuln = result.depRange.currVuln = utils.isVulnerable({
        modDepRange: currSnapshot[i].range,
        depVerList:  modInfo.verList,
        depVulnList: modInfo.vulnList
      });
      result.depRange.compare = {};
      if (prevVuln.vuln === true && currVuln.vuln === true) {
        result.depRange.compare.status = 'same';
        if (prevVuln.resolve === true && currVuln.resolve === true) {
          result.depRange.compare.resolve = 'same';
        } else if (prevVuln.resolve === false && currVuln.resolve === true) {
          result.depRange.compare.resolve = 'changed+';
        } else if (prevVuln.resolve === true && currVuln.resolve === false) {
          result.depRange.compare.resolve = 'changed-';
        }
      } else if (prevVuln.vuln === true && currVuln.vuln === false) {
        result.depRange.compare.status = 'changed-';
      } else if (prevVuln.vuln === false && currVuln.vuln === true) {
        result.depRange.compare.status = 'changed+';
      }
      results.push(result);
    }
  }
  return results;
};

module.exports = new Compare();

if (process.env.NODE_ENV === 'test') {
  module.exports._private = {
    compNumVersion: compNumVersion,
    compType: compType
  };
}
