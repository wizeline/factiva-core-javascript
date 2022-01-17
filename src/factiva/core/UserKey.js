import constants from './constants';
import helper from '../helper';

class UserKey {
  constructor(apiKey = '') {
    if (apiKey instanceof UserKey) {
      return apiKey;
    }

    this.setApiKey(apiKey);
    this.setInfoToDefault();
  }

  /**
   * Validate key used for factiva auth
   * @example
   * this.validateKey(key);
   * @throws {TypeError} when the key len isn't valid
   */
  // eslint-disable-next-line class-methods-use-this
  validateKey(key) {
    if (typeof key !== 'string' && key.length !== 32) {
      throw TypeError('Invalid length for API Key');
    }
  }

  /**
   * Set api key in the class
   * @example
   * this.setApiKey(key);
   * @return {TypeError} when the key len isn't valid
   */
  setApiKey(key) {
    const loadedKey = key || helper.loadEnvVariable('UserKey');
    this.validateKey(loadedKey);
    this.apiKey = loadedKey;
  }

  /**
   * Set default information in the class
   * @example
   * this.setInfoDefault();
   */
  setInfoToDefault() {
    this.accountName = '';
    this.accountType = '';
    this.activeProducts = '';
    this.maxAllowedConcurrentExtractions = 0;
    this.maxAllowedExtractedDocuments = 0;
    this.maxAllowedExtractions = 0;
    this.totalDownloadedBytes = 0;
    this.totalExtractedDocuments = 0;
    this.totalStreamSubscriptions = 0;
    this.totalExtractions = 0;
    this.totalStreamTopics = 0;
  }

  /**
   * Set information in the class
   * @example
   * this.setInfo(Promise);
   */
  async setInfo(requestInfo) {
    if (!requestInfo) {
      console.log('Info not set up');
    } else {
      const accountEndpoint = `${constants.API_HOST}${constants.API_ACCOUNT_BASEPATH}/${this.apiKey}`;
      const headers = { 'user-key': this.apiKey };
      const response = await helper.apiSendRequest({
        method: 'GET',
        endpointUrl: accountEndpoint,
        headers,
      });

      const accountResponse = response.data.data;
      const { attributes } = accountResponse;
      this.accountName = attributes.name;
      this.accountType = accountResponse.type;
      this.activeProducts = attributes.products;
      // eslint-disable-next-line
      this.maxAllowedConcurrentExtractions = attributes.max_allowed_concurrent_extracts;
      // eslint-disable-next-line
      this.maxAllowedExtractedDocuments = attributes.max_allowed_document_extracts;
      this.maxAllowedExtractions = attributes.max_allowed_extracts;
      this.totalDownloadedBytes = attributes.current_downloaded_amount;
      this.totalExtractedDocuments = attributes.tot_document_extracts;
      this.totalExtractions = attributes.tot_extracts;
      this.totalStreamSubscriptions = attributes.tot_subscriptions;
      this.totalStreamTopics = attributes.tot_topics;
      console.log('Info set up');
    }
  }

  /**
   * Return a number of remaining extractions
   * @example
   * 10
   * this.remainingExtractions;
   * @returns {number} which represents total documents extractions
   */
  get remainingExtractions() {
    return this.maxAllowedExtractions - this.totalExtractions;
  }

  /**
   * Return a number of remaining documents
   * @example
   * 10
   * this.remainingDocuments;
   * @returns {number} which represents total documents available
   */
  get remainingDocuments() {
    return this.maxAllowedExtractedDocuments - this.totalExtractedDocuments;
  }

  /**
   * Representation of the class instance
   * @example
   * UserKey { apiKey: '', accountName: '', accountType: '', ...}
   * console.log(UserKery('adasd', false))
   * @returns {number} which represents total extractions available
   */
  toString() {
    const maskedKey = helper.maskWord(this.apiKey);
    let classRepresentation = `${this.constructor.name}\n`;
    classRepresentation += `apiKey = ${maskedKey}\n`;
    Object.entries(this).forEach(([key, value]) => {
      if (value !== this.apiKey) {
        classRepresentation += `   ${key} = ${value}\n`;
      }
    });
    classRepresentation += `\n  remainingDocuments = ${this.remainingDocuments}\n`;
    classRepresentation += `\n  remainingExtractions = ${this.remainingExtractions}\n`;

    return classRepresentation;
  }

  /**
   * Return a new object UserKey
   * @param {string} apiKey
   * @param {boolean} requestInfo
   * @example
   * UserKey{}
   * UserKey.create(apiKey, requestInfo);
   * @returns {Object} which is an instance of UserKey
   */
  static async create(apiKey = '', requestInfo = true) {
    if (apiKey instanceof UserKey) {
      return apiKey;
    }

    const userKey = new UserKey(apiKey, requestInfo);
    await userKey.setInfo(requestInfo);

    return userKey;
  }
}

module.exports = UserKey;
