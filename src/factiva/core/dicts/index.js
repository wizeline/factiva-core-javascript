import DataFrame from 'dataframe-js';
import path from 'path';

const countriesPath = path.resolve('files/factiva-countries.csv');
const indHrchyPath = path.resolve('files/industries-hrchy.csv');
const regHrchyPath = path.resolve('files/regions-hrchy.csv');

/*
 * Return a object as a df
 * this.countriesHierarchy();
 * @returns {Object} which contains industries hierarchy codes
 */
const industriesHierarchy = async () =>
  // eslint-disable-next-line
  DataFrame
    .fromCSV(indHrchyPath)
    .then((df) => df)
    .catch((e) => e);

/*
 * Return a object as a df
 * this.countriesHierarchy();
 * @returns {Object} which contains regions hierarchy codes
 */
const regionsHierarchy = async () =>
  // eslint-disable-next-line
  DataFrame
    .fromCSV(regHrchyPath)
    .then((df) => df)
    .catch((e) => e);

/*
 * Return a object as a df
 * this.countriesHierarchy();
 * @returns {Object} which contains countries hierarchy codes
 */
const countriesHierarchy = async () =>
  // eslint-disable-next-line
  DataFrame.fromCSV(countriesPath)
    .then((df) => df)
    .catch((e) => e);

module.exports = {
  industriesHierarchy,
  regionsHierarchy,
  countriesHierarchy,
};
