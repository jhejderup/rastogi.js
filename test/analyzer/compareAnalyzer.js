var expect = require('chai').expect;

describe('CompareAnalyzer', function () {
  var compare = require('../../lib/analyzer/compareAnalyzer');
  describe('analyzer',function () {
    it('should throw an error if not all parameters are provided', function () {
      expect(function() {
        compare.analyze();
      }).to.throw(Error);
      expect(function() {
        var prev = {test: 'test'};
        compare.analyze(prev);
      }).to.throw(Error);
       expect(function() {
         var prev = {test: 'test'};
         var curr = {test: 'test'};
        compare.analyze(curr, prev);
      }).to.throw(Error);    
    });
     it('should throw an error if the parameters are empty', function () {
       expect(function() {
         var advInfo = {};
         var prev, curr = [];
         compare.analyze(prev, curr, advInfo);
      }).to.throw(Error);    
    });
    it('should return an array if all parameters are provided correctly', function () {
      var compare = require('../../lib/analyzer/compareAnalyzer');
       var advInfo = {
         verList: ['1.0.0','1.0.1','1.0.2','2.0.0','2.0.1'],
         vulnList: ['1.0.0','1.0.1','1.0.2']
       };
      var prevList = [{type:'dep', range: '<2.0.0'}];
      var currList = [{type:'dep', range: '<2.0.1'}];
      var res = compare.analyze(prevList, currList, advInfo);
      expect(res).to.be.an('array').and.not.empty;
      expect(res.length).to.equal(1);
    });
  });
  
  if (process.env.NODE_ENV === 'test') { 
    describe('compNumVersion', function () {
      it('should return not used if the length is zero',function() {
        var prev = 0;
        var curr = 0;
        var res = compare._private.compNumVersion(prev,curr);
        expect(res).to.be.an('object');
        expect(res).to.have.to.have.deep.property('depUsage.prev','not used');
        expect(res).to.have.to.have.deep.property('depUsage.curr','not used'); 
      });
      it('should return used in curr if a dependency is introduced',function() {
        var prev = 0;
        var curr = 1;
        var res = compare._private.compNumVersion(prev,curr);
        expect(res).to.be.an('object');
        expect(res).to.have.to.have.deep.property('depUsage.prev','not used');
        expect(res).to.have.to.have.deep.property('depUsage.curr','used'); 
      });
      it('should return used in curr if a dependency is introduced',function() {
        var prev = 0;
        var curr = 1;
        var res = compare._private.compNumVersion(prev,curr);
        expect(res).to.be.an('object');
        expect(res).to.have.to.have.deep.property('depUsage.prev','not used');
        expect(res).to.have.to.have.deep.property('depUsage.curr','used'); 
      });
      it('should return not used in curr if a dependency is removed',function() {
        var prev = 1;
        var curr = 0;
        var res = compare._private.compNumVersion(prev,curr);
        expect(res).to.be.an('object');
        expect(res).to.have.to.have.deep.property('depUsage.prev','used');
        expect(res).to.have.to.have.deep.property('depUsage.curr','not used'); 
      });
      it('should return used in curr&prev if there is no change',function() {
        var prev = 1;
        var curr = 1;
        var res = compare._private.compNumVersion(prev,curr);
        expect(res).to.be.an('object');
        expect(res).to.have.to.have.deep.property('depUsage.prev','used');
        expect(res).to.have.to.have.deep.property('depUsage.curr','used'); 
      });
      it('should return used+ if the dep is declered in more places',function() {
        var prev = 1;
        var curr = 5;
        var res = compare._private.compNumVersion(prev,curr);
        expect(res).to.be.an('object');
        expect(res).to.have.to.have.deep.property('depUsage.prev','used');
        expect(res).to.have.to.have.deep.property('depUsage.curr','used+'); 
      });
      it('should return used if the dep is less declered',function() {
        var prev = 6;
        var curr = 3;
        var res = compare._private.compNumVersion(prev,curr);
        expect(res).to.be.an('object');
        expect(res).to.have.to.have.deep.property('depUsage.prev','used+');
        expect(res).to.have.to.have.deep.property('depUsage.curr','used'); 
      });
    });
    
    describe('compType', function () {
      it('if the dep type is same, it should return and object with that prop',function() {
        var prev = 'dep';
        var curr = 'dep';
        var res = compare._private.compType(prev,curr);
        expect(res).to.be.an('object');
        expect(res).to.have.to.have.deep.property('depType.status','same');
        expect(res).to.have.to.have.deep.property('depType.from','dep');
      });
       it('if dep type is different it should return that',function() {
        var prev = 'dep';
        var curr = 'dev';
        var res = compare._private.compType(prev,curr);
        expect(res).to.be.an('object');
        expect(res).to.have.to.have.deep.property('depType.status','changed');
        expect(res).to.have.to.have.deep.property('depType.from','dep');
        expect(res).to.have.to.have.deep.property('depType.to','dev');
      });
      it('should throw an error if the parametrs are not of right type', function () {
        expect(function() {
           var prev = {};
           var curr = 'dev';
           var res = compare._private.compType(prev,curr);
         }).to.throw(Error);
        expect(function() {
           var prev = [];
           var curr = 'dev';
           var res = compare._private.compType(prev,curr);
         }).to.throw(Error);
        expect(function() {
           var prev = 234;
           var curr = 'dev';
           var res = compare._private.compType(prev,curr);
         }).to.throw(Error);
       });
      it('should throw an error if the parametrs are empty', function () {
        expect(function() {
           var prev = '';
           var curr = '';
           var res = compare._private.compType(prev,curr);
         }).to.throw(Error);
       });
    });
  };
});


