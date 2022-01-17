/* Define library's constant literals. */
import analytics from './analytics';
import apistates from './apistates';
import dowjones from './dowjones';
import errors from './errors';
import snapshots from './snapshots';
import streams from './streams';

module.exports = {
  ...analytics,
  ...apistates,
  ...dowjones,
  ...errors,
  ...snapshots,
  ...streams,
};
