var expect = require('chai').expect;

describe('EvoAnalyzer', function () {
  var evo = require('../../lib/analyzer/evoAnalyzer');
  var config = require('../../config/config.test');
  describe('analyzer', function () {
    it('should throw an error if no parameters are passed', function () {
      expect(function() {
        evo.analyze();
      }).to.throw(Error);
    });
    it('should throw an error if an empty pbject is passed', function () {
      expect(function() {
        var obj = {};
        evo.analyze(obj);
      }).to.throw(Error);
    });
    //integration tests needed later
  });
  if (process.env.NODE_ENV === 'test') {
    describe('timeDiff', function () {
      it('should throw an error if no parameters are passed', function () {
        expect(function() {
          evo._private.timeDiff();
        }).to.throw(Error);
      });
       it('should throw an error if an empty object is passed', function () {
        expect(function() {
          var obj = {};
          evo._private.timeDiff(obj);
        }).to.throw(Error);
      });
      it('module with latest timestamp should show latest in the "to"-field', function () {
        var module = {};
        module.to = config.neo4j.latestTimestamp;
        module.from = 1420748140000; //2015-01-08
        module.publish_date = 1326053740000; //2012-01-08 21:15:40
        var res = evo._private.timeDiff(module);
        expect(res).to.be.an('object');
        expect(res).to.have.to.have.deep.property('timeDiff.to','latest');
      });
      it('module with to set from 8 jan and publish date to 2 jan, should have diff 6 days', function () {
        var module = {};
        module.to = config.neo4j.latestTimestamp;
        module.from = 1420748140000; //Thu, 08 Jan 2015 20:15:40 GMT
        module.publish_date = 1420229740000; // Fri, 02 Jan 2015 20:15:40 GMT
        var res = evo._private.timeDiff(module);
        expect(res).to.be.an('object');
        expect(res).to.have.to.have.deep.property('timeDiff.to','latest');
        expect(res).to.have.to.have.deep.property('timeDiff.days', 6);
        expect(res).to.have.to.have.deep.property('timeDiff.after', true);
        
      });
      it('publish date 8 jan, from 2 jan  should have diff 6 days and set to "before"', function () {
        var module = {};
        module.to = config.neo4j.latestTimestamp;
        module.publish_date = 1420748140000; //Thu, 08 Jan 2015 20:15:40 GMT
        module.from = 1420229740000; // Fri, 02 Jan 2015 20:15:40 GMT
        var res = evo._private.timeDiff(module);
        expect(res).to.be.an('object');
        expect(res).to.have.to.have.deep.property('timeDiff.to','latest');
        expect(res).to.have.to.have.deep.property('timeDiff.days', 6);
        expect(res).to.have.to.have.deep.property('timeDiff.after', false);
        
      });
      it('should convert unix timestamp to iso timestamp for to and from field', function () {
        var module = {};
        module.to = 1421008322000 //Sun, 11 Jan 2015 20:32:02 GMT;
        module.publish_date = 1420748140000; //Thu, 08 Jan 2015 20:15:40 GMT
        module.from = 1420229740000; // Fri, 02 Jan 2015 20:15:40 GMT
        var res = evo._private.timeDiff(module);
        expect(res).to.be.an('object');
        expect(res).to.have.to.have.deep.property('timeDiff.to','2015-01-11T20:32:02.000Z');
        expect(res).to.have.to.have.deep.property('timeDiff.from','2015-01-02T20:15:40.000Z');
        expect(res).to.have.to.have.deep.property('timeDiff.days', 6);
        expect(res).to.have.to.have.deep.property('timeDiff.after', false);
        
      });
    });
    describe('dynamicSort', function () {
      it('sort a list with correct version format', function () {
        var unsortedList = [
          {ver: '1.0.0'},
          {ver: '2.0.1'},
          {ver: '1.1.1'},
          {ver: '2.0.0'},
          {ver: '1.0.1'}
        ];
        var sortedList = [
          {ver: '1.0.0'},
          {ver: '1.0.1'},
          {ver: '1.1.1'},
          {ver: '2.0.0'},
          {ver: '2.0.1'}
        ];
        unsortedList.sort(evo._private.dynamicSort('ver'))
        expect(unsortedList).to.eql(sortedList);
      });  
    });  
  } 
});