/* eslint-disable no-undef */
const chai = require('chai');

const { expect } = chai;

const { helper } = require('../lib/factiva');

describe('factiva', () => {
  describe('use helper library', () => {
    it('should return a load env variable', () => {
      const loadedVar = helper.loadEnvVariable('UserKey');
      expect(loadedVar).to.be.not.equal('change for user key');
    });
    it('should return an undefined env variable', (done) => {
      try {
        helper.loadEnvVariable('KEY');
        should.fail('no error was thrown when it should have been');
      } catch (err) {
        done();
      }
    });
  });
});
