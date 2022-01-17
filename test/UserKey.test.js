/* eslint-disable no-undef */
const chai = require('chai');

const { expect } = chai;

const { UserKey } = require('../lib/factiva/core');

describe('factiva', () => {
  describe('create UserKey with no info', () => {
    const apiKeyUser = new UserKey();
    it('should return an object type UserKey', async () => {
      expect(apiKeyUser).to.be.instanceOf(Object);
    });
    it('should return an object with none extractions', async () => {
      expect(apiKeyUser.maxAllowedConcurrentExtractions).to.equal(0);
    });
  });
});
