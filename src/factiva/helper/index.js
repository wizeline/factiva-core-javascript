/* eslint-disable object-curly-newline */
import axios from 'axios';
import config from 'config';
import createError from 'http-errors';

import constants from '../core/constants';

const loadEnvVariable = (configKey) => {
  /* Load env variable. */

  const tmpVal = config[configKey];
  if (!tmpVal) {
    throw ReferenceError(`Environment Variable ${configKey} not found!`);
  }

  return tmpVal;
};

const loadGenericEnvVariable = (variable, envVar) => {
  /* Load generic env variable without return Error. */

  if (!variable) {
    try {
      return loadEnvVariable(envVar);
    } catch (_) {
      return variable;
    }
  }

  return variable;
};

const validateType = (varToValidate, expectedType, errorMessage) => {
  /* Validate a given type. */

  switch (expectedType) {
    case 'array':
      if (!Array.isArray(varToValidate)) throw ReferenceError(errorMessage);
      break;
    case 'object':
      if (!(varToValidate instanceof Object)) {
        throw ReferenceError(errorMessage);
      }
      break;
    default:
      // eslint-disable-next-line
      if (typeof varToValidate !== expectedType) {
        throw ReferenceError(errorMessage);
      }
      break;
  }

  return SyntaxError('Type not identified');
};

const maskWord = (word, rightPadding = 4) => {
  /* Masks a string word */

  if (word.length <= 4) {
    return word;
  }
  const masked = word
    .substring(0, word.length - rightPadding)
    .replace(/[a-z\d]/gi, '#');
  const unmasked = word.substring(word.length - rightPadding, word.length);
  return masked + unmasked;
};

const handleError = (err) => {
  if (err.response.status === 403) {
    throw createError(403, 'Factiva API-Key does not exist or inactive.');
  }

  if (err.response.data.errors) {
    const errors = err.response.data.errors
      .map((error) => `${error.title}: ${error.detail}`)
      .join();
    throw createError(
      err.response.status,
      `Unexpected API Error with message: ${err.response.statusText}: ${errors}`,
    );
  }

  throw createError(
    err.response.status,
    `Unexpected API Error with message: ${err.response.statusText}.`,
  );
};

const getProxyConfiguration = () => {
  let options = null;
  const { use, protocol, host, port, auth } = loadEnvVariable('proxy');
  if (use) {
    options = { protocol, host, port };
    if (auth.username !== '' && auth.password !== '') {
      options = { ...options, auth };
    }
  }
  return options;
};

const sendRequest = async ({ method, url, payload, headers, params }) => {
  if (method === 'GET' && params && typeof params !== 'object') {
    throw ReferenceError('Unexpected qsParams value');
  }

  let data;
  if (method === 'POST' && payload) {
    if (typeof payload === 'object') {
      data = payload;
    } else if (typeof payload === 'string') {
      data = JSON.parse(payload);
    } else {
      throw Error('Unexpected payload value');
    }
  }
  const proxy = getProxyConfiguration();

  const request = {
    method,
    url,
    ...(params ? { params } : null),
    ...(data ? { data } : null),
    ...(headers ? { headers } : {}),
    ...(proxy ? { proxy } : {}),
  };

  try {
    const response = await axios(request);

    return response;
  } catch (err) {
    handleError(err);
    return err;
  }
};

const apiSendRequest = async ({
  method = '',
  endpointUrl = constants.API_HOST,
  headers = null,
  qsParams = null,
  payload = null,
}) => {
  /* Send a generic request to a certain API end point. */

  if (!headers) {
    throw ReferenceError('Headers for Factiva requests cannot be empty');
  }

  if (typeof headers !== 'object') {
    throw ReferenceError('Unexpected headers value');
  }

  const methUpper = method.toUpperCase();
  if (methUpper !== 'POST' && methUpper !== 'GET' && methUpper !== 'DELETE') {
    throw ReferenceError('Unexpected method value');
  }

  const response = await sendRequest({
    method: methUpper,
    url: endpointUrl,
    headers,
    params: qsParams,
    payload,
  });

  return response;
};

module.exports = {
  loadEnvVariable,
  apiSendRequest,
  loadGenericEnvVariable,
  validateType,
  maskWord,
  getProxyConfiguration,
};
