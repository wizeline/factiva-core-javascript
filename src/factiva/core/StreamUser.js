import { PubSub } from '@google-cloud/pubsub';
import helper from '../helper';
import { UserKey } from './auth';
import constants from './constants';
import StreamResponse from './StreamReponse';

const DEFAULT_HOST_DNA = `${constants.API_HOST}${constants.DEFAULT_HOST_DNA}`;
const DEFAULT_HOST_ALPHA = `${constants.API_HOST}${constants.DNA_BASEPATH}`;

class StreamUser extends UserKey {
  // eslint-disable-next-line no-useless-constructor
  constructor(key, requestInfo) {
    super(key, requestInfo);
  }

  /**
   * Return a list of streams from a given user
   * @example
   * // [{...}, {...}]
   * this.getStreams();
   * @returns {Array} objects which contains stream information
   */
  async getStreams() {
    const headers = this.getAuthenticationHeaders();
    const response = await helper.apiSendRequest({
      method: 'GET',
      endpointUrl: `${constants.API_HOST}${constants.API_STREAMS_BASEPATH}/`,
      headers,
    });

    return response.data.data.map((stream) => new StreamResponse(stream));
  }

  /**
   * Return the pubsub client for pubsub
   * @example
   * // Pubsub({...})
   * this.getClientSubscription();
   * @returns {Object} Pubsub client
   * @returns {URIError} if something unexpected happens while creating the client
   */
  async getClientSubscription() {
    const credentials = await this.fetchCredentials();
    try {
      const pubsubClient = new PubSub({
        projectId: credentials.project_id,
        credentials,
      });

      return pubsubClient;
    } catch (_) {
      throw URIError(
        // eslint-disable-next-line
        'Something unexpected happened while creating Pubsub client'
      );
    }
  }

  /**
   * Return the google auhtentication credentials for pubsub.
   * @example
   * // {'project-id': 'abcdefghijklmnopqrstuv', ...}
   * this.fetchCredentials();
   * @returns {string} credentials for pubsub in string format
   * @returns {URIError} if the credentials cannot be parsed
   */
  async fetchCredentials() {
    const headers = this.getAuthenticationHeaders();
    const uri = StreamUser.getUriContext(headers);
    const response = await helper.apiSendRequest({
      method: 'GET',
      endpointUrl: `${uri}${constants.API_ACCOUNT_STREAM_CREDENTIALS_BASEPATH}`,
      headers,
    });

    try {
      // eslint-disable-next-line prettier/prettier
      const streamingCredentials = response.data.data.attributes.streaming_credentials;

      return JSON.parse(streamingCredentials);
    } catch (e) {
      throw URIError('Unable to find streaming credentials for given account');
    }
  }

  /**
   * Return the uri based on the headers used.
   * @example
   * // returns www.dowjonesapi.com
   * this.getUriContext();
   * @returns {string} Returns the uri in string format which can be used for
   */
  static getUriContext(headers) {
    if ('Authorization' in headers) {
      return DEFAULT_HOST_DNA;
    }

    if ('user-key' in headers) {
      return DEFAULT_HOST_ALPHA;
    }

    const msg = `Could not determine user credentials:
    Must specify account credentials as key
    through env vars`;

    throw ReferenceError(msg);
  }

  /**
   * Return the current auhtentication headers.
   * @example
   * // {'user-key': 'abcdefghijklmnopqrstuv'}
   * this.getAuthenticationHeaders();
   * @returns {Object} json with User Key
   * @returns {ReferenceError} if the credentials are not found
   */
  getAuthenticationHeaders() {
    if (this.key) {
      return { 'user-key': this.key };
    }

    const msg = `Could not find credentials:
      Must specify account credenstials as user_key
      (see README.rst)`;

    throw ReferenceError(msg);
  }
}

module.exports = StreamUser;
