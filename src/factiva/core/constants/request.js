import { join } from 'path';

const REQUEST_STREAM_TYPE = 'stream';
const REQUEST_DEFAULT_TYPE = 'json';
const DOWNLOAD_DEFAULT_FOLDER = join(process.cwd(), 'downloads');

module.exports = {
  REQUEST_STREAM_TYPE,
  REQUEST_DEFAULT_TYPE,
  DOWNLOAD_DEFAULT_FOLDER,
};
