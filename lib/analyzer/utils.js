/*
 * Utils
 *
 * A handful version utilties methods for the analyzer functions
 *
 * @return {object} public interface
 */
'use strict';
var _ = require('lodash');
var semver = require('semver');
var Utils = function() {};
/*
 * Timestamp converster from JSON to UTC
 * @param {String} JSON timestamp
 * @return {Number} UTC timestamp
 */
Utils.prototype.getUTCtimestamp = function(jsonTimestamp) {
  if (!_.isString(jsonTimestamp)) {
    throw new Error('Timestamp should be a string');
  }
  var time = new Date(jsonTimestamp);
  if (_.isNaN(time.getTime())) {
    throw new Error('Timestamp does not have correct ISO8601 time format');
  }
  return Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(),
                  time.getHours(), time.getMinutes(), time.getSeconds(),
                  time.getMilliseconds());
};
/*
 * Validates a version from the criteria based on semver lib
 * @param {String} version
 * @return {Bool}
 */
Utils.prototype.isValidVersionFormat = function(version) {
  if (!_.isString(version)) {
    throw new Error('The version should be a string');
  }
  return !_.isNull(semver.valid(version));
};
var isNumber = function (n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};
/*
 * Validates a version from the criteria that follows:
 *  'x.x.x.x', 'x.x.x', etc where 'x' is a number
 * does not take x.x.x-beta into consideration
 * @param {String} version
 * @return {Bool}
 */
Utils.prototype.useStrictVersionNumber = function (version) {
  if (!_.isString(version)) {
    throw new Error('The version should be a string');
  }
  var numArray = version.split('.');
  for (var i = 0; i < numArray.length; ++i) { 
    if(!isNumber(numArray[i])) {
      return false;
    }
  }
  return true;
};


/*
 * Dependency Vulnerability validation based on the semver library for a given module
 *
 * @param {Array} depVerList -  List of all versions for the advised dependency
 * @param {Array} modDepRange - Declered version range for the advised dependency in the given module
 * @param {Array} depVulnList - List of versions that are vulnerable for the advised dependency
 * @return {object} results
 */
Utils.prototype.isVulnerable = function(params) {
  params = params || {};
  var result = {};
  var modDepRange = params.modDepRange || '';
  var depVerList = params.depVerList || {};
  var depVulnList = params.depVulnList || {};
  if (!_.isString(modDepRange)) {
    throw new Error('The version range should be a string');
  }
  if (!_.isArray(depVerList) || !_.isArray(depVulnList)) {
    throw new Error('depVerList or depVulnList should be Arrays!');
  }
  //1. Does the declered range in the given module match any known vulnerable versions?
  var vulnVersions = _.filter(depVulnList, function(ver) { return semver.satisfies(ver, semver.validRange(modDepRange)); });
  //2. if yes -> does the range instruct npm to resolve to vulnerable version of the dependency?
  if (vulnVersions.length > 0) {
    result.vuln = true;
    //3. Find the the 'most highest' version it can resolve to
    var maxSatis = semver.maxSatisfying(depVerList, semver.validRange(modDepRange));
    if (maxSatis !== null) {
      result.maxSatis = maxSatis;
      //4. is the highest resolved version a vulnerable version?
      if (_.contains(vulnVersions, maxSatis)) {
        result.resolve = true;
      } else {
        result.resolve = false;
      }
    }
  } else {
    result.vuln = false;
  }
  return result;
};
/*
 * Method that will compare two version and determine whether it a major, minor or patch update
 * @param {string} verA -  version
 * @param {string} verB -  version
 * @return {object} result
 */
Utils.prototype.semverCompare = function(verA, verB) {
  var result = {};
  result.patch = {};
  result.minor = {};
  result.major = {};
  if (!_.isString(verA)) {
    throw new Error('verA should be a string');
  }
  if (!_.isString(verB)) {
    throw new Error('verB should be a string');
  }
  if (this.isValidVersionFormat(verA) && this.isValidVersionFormat(verB)) {
    var verArrA = verA.split('.');
    var verArrB = verB.split('.');
    //1. Should be of same length, and only 3 digits
    if (verArrA.length === verArrB.length && verArrA.length === 3) {
      if (verArrB[0] === verArrA[0]) { //major
        if (verArrB[1] === verArrA[1]) { //minor
          if (verArrB[2] === verArrA[2]) { //patch
            result.patch.mitigation = 'same';
          } else if (verArrB[2] > verArrA[2]) {
            result.patch.mitigation = 'upgrade';
          } else if (verArrB[2] < verArrA[2]) {
            result.patch.mitigation = 'downgrade';
          }
        } else if (verArrB[1] > verArrA[1]) {
          result.minor.mitigation = 'upgrade';
        } else if (verArrB[1] < verArrA[1]) {
          result.minor.mitigation = 'downgrade';
        }
      } else if (verArrB[0] > verArrA[0]) {
        result.major.mitigation = 'upgrade';
      } else if (verArrB[0] < verArrA[0]) {
        result.major.mitigation = 'downgrade';
      }
    } else {
      throw new Error('Should be of length 3 or its not the same length!');
    }
  } else {
    throw new Error('Not a valid version format!');
  }
  return result;
};
/*
 * Version Comporator for Array lists
 * Note: Supports only x.x.x where x is a number!
 * @param {string} v1 -  version
 * @param {string} v2 -  version
 * @return {object} result
 */
Utils.prototype.versionSort = function(v1, v2) {
  if (!_.isString(v1)) {
    throw new Error('v1 should be a string');
  }
  if (!_.isString(v2)) {
    throw new Error('v2 should be a string');
  }
  var v1parts = v1.split('.');
  var v2parts = v2.split('.');
  for (var i = 0; i < v1parts.length; ++i) {
    if (v2parts.length === i) {
      if (isNumber(v1parts[i]) && isNumber(v1parts[i])) {
        return v1parts[i] - v2parts[i];
      } else {
        return 1;
      }
    }
    if (v1parts[i] === v2parts[i]) {
      continue;
    } else if (v1parts[i] > v2parts[i]) {
      if (isNumber(v1parts[i]) && isNumber(v1parts[i])) {
        return v1parts[i] - v2parts[i];
      } else {
        return 1;
      }
    } else {
      if (isNumber(v1parts[i]) && isNumber(v1parts[i])) {
        return v1parts[i] - v2parts[i];
      } else {
        return -1;
      }
    }
  }
  if (v1parts.length !== v2parts.length) {
    return -1;
  }
  return 0;
};
module.exports = new Utils();
