/* eslint-disable operator-linebreak */
import helper from '../../helper';
import constants from '../constants';

class UserKey {
  constructor(key = '') {
    if (key instanceof UserKey) {
      return key;
    }

    this.setApiKey(key);
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
    this.key = loadedKey;
  }

  /**
   * Set default information in the class
   * @example
   * this.setInfoDefault();
   */
  setInfoToDefault() {
    this.cloudToken = {};
    this.accountName = '';
    this.accountType = '';
    this.activeProducts = '';
    this.maxAllowedConcurrentExtractions = 0;
    this.maxAllowedExtractedDocuments = 0;
    this.maxAllowedExtractions = 0;
    this.currentlyRunningExtractions = 0;
    this.totalDownloadedBytes = 0;
    this.totalExtractedDocuments = 0;
    this.totalStreamSubscriptions = 0;
    this.totalExtractions = 0;
    this.totalStreamTopics = 0;
    this.enabledCompanyIdentifiers = [];
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
      const accountEndpoint = `${constants.API_HOST}${constants.API_ACCOUNT_BASEPATH}/${this.key}`;
      const headers = this.getAuthenticationHeaders();
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
      this.currentlyRunningExtractions = attributes.cnt_curr_ext;
      this.totalDownloadedBytes = attributes.current_downloaded_amount;
      this.totalExtractedDocuments = attributes.tot_document_extracts;
      this.totalExtractions = attributes.tot_extracts;
      this.totalStreamSubscriptions = attributes.tot_subscriptions;
      this.totalStreamTopics = attributes.tot_topics;
      this.enabledCompanyIdentifiers = attributes.enabled_company_identifiers;
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
   * @param {boolean} [detailed=true] - Specify if get all content
   * @param {string} [prefix=  |-] - Graphical separator for each element
   * @param {string} [rootPrefix=] - Graphical separator for root element
   * @example
   * UserKey.toString()
   * @returns {string} which represents total extractions available
   */
  toString(detailed = true, prefix = '  |-', rootPrefix = '') {
    const maskedKey = helper.maskWord(this.key);
    const maskedToken = !Object.keys(this.cloudToken).length
      ? '**Not Fetched**'
      : helper.maskWord(this.cloudToken.private_key.substr(40, 20), 12);

    let classRepresentation = `${rootPrefix}${this.constructor.name}\n`;
    classRepresentation += `${prefix}key = ${maskedKey}\n`;
    classRepresentation += `${prefix}cloudToken = ${maskedToken}\n`;
    if (detailed) {
      Object.entries(this).forEach(([key, value]) => {
        if (value !== this.key && value !== this.cloudToken) {
          const currentValue =
            typeof value === 'object' ? JSON.stringify(value) : value;
          classRepresentation += `${prefix}${key} = ${currentValue}\n`;
        }
      });
      classRepresentation += `\n${prefix}remainingDocuments = ${this.remainingDocuments}\n`;
      classRepresentation += `\n${prefix}remainingExtractions = ${this.remainingExtractions}\n`;
    } else {
      classRepresentation += `${prefix}...`;
    }
    return classRepresentation;
  }

  /**
   * Request a cloud token to the API and saves its value in the cloud_token property
   * @example
   * UserKey.getCloudToken();
   * @return {Boolean} True if the operation was completed successfully. Calculate value
        is assigned to the cloud_token property.
   */
  async getCloudToken() {
    const accountEndpoint = `${constants.API_HOST}${constants.API_ACCOUNT_STREAM_CREDENTIALS_BASEPATH}`;
    const headers = this.getAuthenticationHeaders();
    const response = await helper.apiSendRequest({
      method: 'GET',
      endpointUrl: accountEndpoint,
      headers,
    });

    const accountResponse = response.data.data;
    const { attributes } = accountResponse;
    this.cloudToken = JSON.parse(attributes.streaming_credentials);
    return true;
  }

  /**
   * Request a list of the extractions of the account
   * @example
   * UserKey.getExtractions();
   * @return {Object} Object containing the list of historical extractions for the account
   */
  async getExtractions() {
    const extractionsEndpoint = `${constants.API_HOST}${constants.API_EXTRACTIONS_BASEPATH}`;
    const headers = this.getAuthenticationHeaders();
    const response = await helper.apiSendRequest({
      method: 'GET',
      endpointUrl: extractionsEndpoint,
      headers,
    });

    const extractions = response.data.data;
    const data = [];
    extractions.forEach(({ id, attributes }) => {
      const {
        current_state: currentState,
        format,
        extraction_type: extractionType,
      } = attributes;
      const parseID = id.split('-');
      const snapshootSid = parseID.length >= 4 ? parseID[4] : '';
      const updateId = parseID.length >= 6 ? parseID[6] : '';

      data.push({
        objectID: id,
        currentState,
        format,
        extractionType,
        snapshootSid,
        updateId,
      });
    });

    return data;
  }

  /**
   * Show a list of the extractions of the account
   *@param {boolean} [updates=false] - Flag that indicates whether the displayed list should include (True)
   or not (False) Snapshot Update calls.
   * @example
   * UserKey.showExtractions();
   * @return {Object} Object with the list of historical extractions
   */
  async showExtractions(updates = false) {
    const extractions = await this.getExtractions();
    let mappedExtractions = extractions.map(
      // eslint-disable-next-line object-curly-newline
      ({ currentState, format, extractionType, snapshootSid, updateId }) => ({
        currentState,
        format,
        extractionType,
        snapshootSid,
        updateId,
      }),
    );
    if (!updates) {
      mappedExtractions = mappedExtractions.filter(
        ({ updateId }) => updateId === '',
      );
    }
    console.log(mappedExtractions);
  }

  /**
   * Obtain streams from a given user
   * @example
   * UserKey.getStreams();
   * @return {Object} Object containing the list of historical extractions for the account
   */
  async getStreams() {
    const extractionsEndpoint = `${constants.API_HOST}${constants.API_STREAMS_BASEPATH}`;
    const headers = this.getAuthenticationHeaders();
    const response = await helper.apiSendRequest({
      method: 'GET',
      endpointUrl: extractionsEndpoint,
      headers,
    });

    const streamsData = response.data.data;
    const data = [];

    streamsData.forEach(
      ({
        id: objectId,
        attributes: { job_status: jobStatus },
        relationships: {
          subscriptions: { data: subscriptionsData },
        },
      }) => {
        const idParsed = objectId.split('-');
        const streamId = idParsed[4];
        const streamType = idParsed[2];
        const relatedSubscriptions = [];

        subscriptionsData.forEach(({ id }) => {
          const subIdParsed = id.split('-');
          relatedSubscriptions.push(
            `${subIdParsed[subIdParsed.length - 3]}-${
              subIdParsed[subIdParsed.length - 2]
            }-${subIdParsed[subIdParsed.length - 1]}`,
          );
        });

        data.push({
          objectId,
          jobStatus,
          streamId,
          streamType,
          subscriptions: relatedSubscriptions,
          nSubscriptions: subscriptionsData.length,
        });
      },
    );

    return data;
  }

  /**
   * Shows the list of streams for a given user.
   * @param {boolean} [running=false] - Flag that indicates whether the displayed list should be restricted
   * to only running streams (True) or also include cancelled and failed
   * ones (False).
   * @example
   * UserKey.showStreams();
   * @return {Object} Object with the list of historical extractions
   */
  async showStreams(running = true) {
    const extractions = await this.getStreams();
    let mappedStreams = extractions.map(
      // eslint-disable-next-line object-curly-newline
      ({ jobStatus, streamId, streamType, subscriptions, nSubscriptions }) => ({
        jobStatus,
        streamId,
        streamType,
        subscriptions,
        nSubscriptions,
      }),
    );
    if (running) {
      mappedStreams = mappedStreams.filter(
        ({ jobStatus }) => jobStatus === constants.API_JOB_RUNNING_STATE,
      );
    }
    console.log(mappedStreams);
  }

  /**
   * Return a new object UserKey
   * @param {string} key
   * @param {boolean} requestInfo
   * @example
   * UserKey.create(key, requestInfo);
   * @returns {Object} which is an instance of UserKey
   */
  static async create(key = '', requestInfo = true) {
    if (key instanceof UserKey) {
      return key;
    }

    const userKey = new UserKey(key, requestInfo);
    await userKey.setInfo(requestInfo);

    return userKey;
  }

  /**
   * Return the current auhtentication headers.
   * @example
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

module.exports = UserKey;
