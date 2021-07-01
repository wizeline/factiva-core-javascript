/* Define common errors in the library. */
const UNEXPECTED_HTTP_ERROR = URIError(
  // eslint-disable-next-line
  'API Request returned an unexpected HTTP status'
);
const UNDEFINED_STREAM_ID_ERROR = TypeError('Undefined stream id');
const INVALID_SUBSCRIPTION_ID_ERROR = TypeError('Invalid subscription id');
const UNDEFINED_SUBSCRIPTION_ERROR = TypeError(
  // eslint-disable-next-line
  'No subscription specified. You must specify the subscription ID'
);

module.exports = {
  UNEXPECTED_HTTP_ERROR,
  UNDEFINED_STREAM_ID_ERROR,
  INVALID_SUBSCRIPTION_ID_ERROR,
  UNDEFINED_SUBSCRIPTION_ERROR,
};
