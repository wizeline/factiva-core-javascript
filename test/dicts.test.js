/* eslint-disable no-undef */
const chai = require('chai');

const { expect } = chai;

const { dicts } = require('../lib/factiva/core');

describe('factiva', () => {
  describe('get dicts industriesHierarchy', () => {
    const industriesHierarchyCodes = dicts.industriesHierarchy();
    it('should return a dataframe object', () => {
      expect(industriesHierarchyCodes).to.be.instanceOf(Object);
    });
  });
});
