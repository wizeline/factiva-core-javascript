/* eslint-disable no-undef */
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const { expect } = chai;
chai.use(chaiAsPromised);

const { StreamUser } = require('../lib/factiva/core');

describe('factiva', () => {
  describe('create a StreamUser', () => {
    const streamUser = new StreamUser();
    it('should return a object type StreamUser', async () => {
      expect(streamUser).to.be.instanceOf(Object);
    });
    it('should return an array of stream responses', async () => {
      expect(streamUser.getStreams()).to.eventually.have.property('data');
    });
    it('should return a pubsub client', async () => {
      // eslint-disable-next-line prettier/prettier
      expect(streamUser.getClientSubscription()).to.eventually.have.property('data');
    });
  });
});
