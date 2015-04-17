var expect = require('chai').expect;

describe('Utils', function () {
  
  
  describe('getUTCtimestamp', function () {
    var utils = require('../../lib/analyzer/utils');
    it('should throw an error if an object is passed as parameter', function () {
      expect(function() {
        var obj = {};
        utils.getUTCtimestamp(obj);
      }).to.throw(Error);
    });
    it('should throw an error if an array is passed as parameter', function () {
      expect(function() {
        var arr = [];
        utils.getUTCtimestamp(arr);
      }).to.throw(Error);
    });
    it('should throw an error if an array is passed as parameter', function () {
      expect(function() {
        var arr = [];
        utils.getUTCtimestamp(arr);
      }).to.throw(Error);
    });
    it('should throw an error if the String is not an ISO 8601 time format', function () {
      expect(function() {
        var str = "Hey! I am not a timestamp";
        utils.getUTCtimestamp(str);
      }).to.throw(Error);
    });
    it('should throw an error if the String is empty', function () {
      expect(function() {
        var str = "";
        utils.getUTCtimestamp(str);
      }).to.throw(Error);
    });
    //NOTE: the timestamp are directly linked to my local timezone (CET), moment.js seems like a better option later on
    it('2015-01-05T03:00:00+00:00 should be 1420430400000', function () {
      var str = "2015-01-05T03:00:00+00:00";
      expect(utils.getUTCtimestamp(str)).to.equal(1420430400000);
    });
  });
  
  describe('isValidVersionFormat', function() {
    var utils = require('../../lib/analyzer/utils');
    it('should throw an error if an object is passed as parameter', function () {
      expect(function() {
        var obj = {};
        utils.isValidVersionFormat(obj);
      }).to.throw(Error);
    });
    it('should throw an error if an array is passed as parameter', function () {
      expect(function() {
        var arr = [];
        utils.isValidVersionFormat(arr);
      }).to.throw(Error);
    });
    it('should throw an error if an array is passed as parameter', function () {
      expect(function() {
        var arr = [];
        utils.isValidVersionFormat(arr);
      }).to.throw(Error);
    });
    it('should return false if it is a random string', function () {
      var str = "2015-01-05T03:00:00+00:00";
      expect(utils.isValidVersionFormat(str)).to.equal(false);
    });
    it('should return false if it is an empty string', function () {
      var str = "";
      expect(utils.isValidVersionFormat(str)).to.equal(false);
    });
    it('should return true if it is a version format like "1.3.4-beta"', function () {
      var str = "1.2.3-beta";
      expect(utils.isValidVersionFormat(str)).to.equal(true);
    });
    it('should return true if it is a version format like "234.1.2-23"', function () {
      var str = "234.1.2-23";
      expect(utils.isValidVersionFormat(str)).to.equal(true);
    });
    it('should return true if it is a version format like "4.1.2"', function () {
      var str = "4.1.2";
      expect(utils.isValidVersionFormat(str)).to.equal(true);
    });
  });
  describe('useStrictVersionNumber', function() {
    var utils = require('../../lib/analyzer/utils');
    it('should throw an error if an object is passed as parameter', function () {
      expect(function() {
        var obj = {};
        utils.useStrictVersionNumber(obj);
      }).to.throw(Error);
    });
    it('should throw an error if an array is passed as parameter', function () {
      expect(function() {
        var arr = [];
        utils.useStrictVersionNumber(arr);
      }).to.throw(Error);
    });
    it('should throw an error if an array is passed as parameter', function () {
      expect(function() {
        var arr = [];
        utils.useStrictVersionNumber(arr);
      }).to.throw(Error);
    });
    it('should return false if it is a random string', function () {
      var str = "2015-01-05T03:00:00+00:00";
      expect(utils.useStrictVersionNumber(str)).to.equal(false);
    });
    it('should return false if it is an empty string', function () {
      var str = "";
      expect(utils.useStrictVersionNumber(str)).to.equal(false);
    });
    it('should return false if it is a version format like "1.3.4-beta"', function () {
      var str = "1.2.3-beta";
      expect(utils.useStrictVersionNumber(str)).to.equal(false);
    });
    it('should return false if it is a version format like "234.1.2-23"', function () {
      var str = "234.1.2-23";
      expect(utils.useStrictVersionNumber(str)).to.equal(false);
    });
    it('should return true if it is a version format like "4.1.2"', function () {
      var str = "4.1.2";
      expect(utils.useStrictVersionNumber(str)).to.equal(true);
    });
  });
  
  
  describe('isVulnerable', function() {
    var utils = require('../../lib/analyzer/utils');
    it('should throw an error if no paramters are passed', function () {
      expect(function() {
        utils.isVulnerable();
      }).to.throw(Error);
    });
    it('should throw an error if no paramters are passed for modDepRange', function () {
      expect(function() {
        var params = {};
        params.depVerList = [];
        params.depVulnList = [];
        utils.isVulnerable(params);
      }).to.throw(Error);
    });
    it('should throw an error if no paramters are passed for depVerList', function () {
      expect(function() {
        var params = {};
        params.modeDepRange = "";
        params.depVulnList = [];
        utils.isVulnerable(params);
      }).to.throw(Error);
    });
      it('should throw an error if no paramters are passed for depVulnList', function () {
      expect(function() {
        var params = {};
        params.modeDepRange = "";
        params.depVerList = [];
        utils.isVulnerable(params);
      }).to.throw(Error);
    });
    it('Empty parameters should return an object with vulnerable false', function () {
      var params = {};
      params.modDepRange = "its is a string!";
      params.depVerList = [];
      params.depVulnList = [];
      var res = utils.isVulnerable(params);
      expect(res).to.be.an('object');
      expect(res).to.have.property('vuln').and.equal(false);
    });
    it('Example where the range includes vulnerable versions but does not resolve to one', function () {
      var params = {};
      params.modDepRange = "<2.0.2";
      params.depVerList = ['0.0.1','0.0.5','0.0.6','0.0.8','1.0.0','1.1.1','2.0.0','2.0.2'];
      params.depVulnList = ['0.0.1','0.0.5','0.0.6','0.0.8','1.0.0','1.1.1'];
      var res = utils.isVulnerable(params);
      expect(res).to.be.an('object');
      expect(res).to.have.property('vuln').and.equal(true);
      expect(res).to.have.property('resolve').and.equal(false);
      expect(res).to.have.property('maxSatis').and.equal('2.0.0');
    });
      it('Example where the range includes vulnerable versions but does resolve to vulnerable', function () {
      var params = {};
      params.modDepRange = "<2.0.0";
      params.depVerList = ['0.0.1','0.0.5','0.0.6','0.0.8','1.0.0','1.1.1','2.0.0','2.0.2'];
      params.depVulnList = ['0.0.1','0.0.5','0.0.6','0.0.8','1.0.0','1.1.1'];
      var res = utils.isVulnerable(params);
      expect(res).to.be.an('object');
      expect(res).to.have.property('vuln').and.equal(true);
      expect(res).to.have.property('resolve').and.equal(true);
      expect(res).to.have.property('maxSatis').and.equal('1.1.1');
    });
     it('Example where the range does not resolve to a vulnerable version', function () {
      var params = {};
      params.modDepRange = ">2.0.0";
      params.depVerList = ['0.0.1','0.0.5','0.0.6','0.0.8','1.0.0','1.1.1','2.0.0','2.0.2'];
      params.depVulnList = ['0.0.1','0.0.5','0.0.6','0.0.8','1.0.0','1.1.1'];
      var res = utils.isVulnerable(params);
      expect(res).to.be.an('object');
      expect(res).to.have.property('vuln').and.equal(false);
    });
  });
  
  describe('semverCompare', function() {
    var utils = require('../../lib/analyzer/utils');
    it('should throw an error if no paramters are passed', function () {
      expect(function() {
        utils.semverCompare();
      }).to.throw(Error);
    });
    it('should throw an error if an object is passed as parameters', function () {
      expect(function() {
        var obj1 = {};
        var obj2 = {};
        utils.semverCompare(obj1,obj2);
      }).to.throw(Error);
    });
    it('should throw an error if an array is passed as parameters', function () {
      expect(function() {
        var arr1 = [];
        var arr2 = [];
        utils.semverCompare(arr1,arr2);
      }).to.throw(Error);
    });
    it('should throw an error if an array is passed as parameters', function () {
      expect(function() {
        var arr1 = [];
        var arr2 = [];
        utils.semverCompare(arr1,arr2);
      }).to.throw(Error);
    });
    it('should be identical', function () {
        var ver1 = '1.1.1';
        var ver2 = '1.1.1';
        var res = utils.semverCompare(ver1,ver2);
        expect(res).to.be.an('object');
        expect(res).to.have.property('patch');
        expect(res).to.have.property('minor');
        expect(res).to.have.property('major');
        expect(res.patch).to.have.property('mitigation').and.equal('same');
    });
     it('should be a patch upgrade', function () {
        var ver1 = '1.1.1';
        var ver2 = '1.1.2';
        var res = utils.semverCompare(ver1,ver2);
        expect(res).to.be.an('object');
        expect(res).to.have.property('patch');
        expect(res).to.have.property('minor');
        expect(res).to.have.property('major');
        expect(res.patch).to.have.property('mitigation').and.equal('upgrade');
    });
    it('should be a patch downgrade', function () {
        var ver1 = '1.1.3';
        var ver2 = '1.1.2';
        var res = utils.semverCompare(ver1,ver2);
        expect(res).to.be.an('object');
        expect(res).to.have.property('patch');
        expect(res).to.have.property('minor');
        expect(res).to.have.property('major');
        expect(res.patch).to.have.property('mitigation').and.equal('downgrade');
    });
    it('should be a minor upgrade', function () {
        var ver1 = '1.1.3';
        var ver2 = '1.2.2';
        var res = utils.semverCompare(ver1,ver2);
        expect(res).to.be.an('object');
        expect(res).to.have.property('patch');
        expect(res).to.have.property('minor');
        expect(res).to.have.property('major');
        expect(res.minor).to.have.property('mitigation').and.equal('upgrade');
    });
    it('should be a minor downgrade', function () {
        var ver1 = '1.4.3';
        var ver2 = '1.2.2';
        var res = utils.semverCompare(ver1,ver2);
        expect(res).to.be.an('object');
        expect(res).to.have.property('patch');
        expect(res).to.have.property('minor');
        expect(res).to.have.property('major');
        expect(res.minor).to.have.property('mitigation').and.equal('downgrade');
    });
     it('should be a minor upgrade', function () {
        var ver1 = '1.1.3';
        var ver2 = '1.2.2';
        var res = utils.semverCompare(ver1,ver2);
        expect(res).to.be.an('object');
        expect(res).to.have.property('patch');
        expect(res).to.have.property('minor');
        expect(res).to.have.property('major');
        expect(res.minor).to.have.property('mitigation').and.equal('upgrade');
    });
    it('should be a major upgrade', function () {
        var ver1 = '1.4.3';
        var ver2 = '3.2.2';
        var res = utils.semverCompare(ver1,ver2);
        expect(res).to.be.an('object');
        expect(res).to.have.property('patch');
        expect(res).to.have.property('minor');
        expect(res).to.have.property('major');
        expect(res.major).to.have.property('mitigation').and.equal('upgrade');
    });
    it('should be a major downgrade', function () {
        var ver1 = '5.4.3';
        var ver2 = '3.2.2';
        var res = utils.semverCompare(ver1,ver2);
        expect(res).to.be.an('object');
        expect(res).to.have.property('patch');
        expect(res).to.have.property('minor');
        expect(res).to.have.property('major');
        expect(res.major).to.have.property('mitigation').and.equal('downgrade');
    });
    it('should throw an error if the version length dont match', function () {
      expect(function() {
        var ver1 = '5.4.3';
        var ver2 = '3.2.2.3';
        var res = utils.semverCompare(ver1,ver2);
      }).to.throw(Error);
    });
  
    describe('versionSort', function () {
      var utils = require('../../lib/analyzer/utils'); 
      it('should throw an error if its not a string', function () {
        expect(function() {
          var ver1 = {};
          var ver2 = {};
          var res = utils.versionSort(ver1,ver2);
        }).to.throw(Error);
      });
      it('version "1.0.0" should not be greater than "2.0.0"', function () {
        var ver1 = '1.0.0';
        var ver2 = '2.0.0';
        var res = utils.versionSort(ver1,ver2);
        expect(res).to.be.a('number');
        expect(res).to.equal(-1);
      });
      it('version "1.0.1" should be greater than "1.0.0"', function () {
        var ver1 = '1.0.1';
        var ver2 = '1.0.0';
        var res = utils.versionSort(ver1,ver2);
        expect(res).to.be.a('number');
        expect(res).to.equal(1);
      });
      it('version "1.1.0" should be greater than "1.0.0"', function () {
        var ver1 = '1.0.1';
        var ver2 = '1.0.0';
        var res = utils.versionSort(ver1,ver2);
        expect(res).to.be.a('number');
        expect(res).to.equal(1);
      });
      it('version "2.1.0" should be greater than "1.0.0"', function () {
        var ver1 = '2.0.1';
        var ver2 = '1.0.0';
        var res = utils.versionSort(ver1,ver2);
        expect(res).to.be.a('number');
        expect(res).to.equal(1);
      });
      it('version "1.0.0" should be identical to "1.0.0"', function () {
        var ver1 = '1.0.0';
        var ver2 = '1.0.0';
        var res = utils.versionSort(ver1,ver2);
        expect(res).to.be.a('number');
        expect(res).to.equal(0);
      });
    });
  });
});
