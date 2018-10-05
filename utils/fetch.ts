import isomorphicFetch from 'isomorphic-fetch';
import trimCharsEnd from 'lodash/fp/trimCharsEnd';
import trimCharsStart from 'lodash/fp/trimCharsStart';

import config from '../config';

const trimSlashesEnd = trimCharsEnd('/');
const trimSlashesStart = trimCharsStart('/');

export type FetchOptions = {
  isServer?: boolean;
};

function fetch(input?: Request | string, init?: RequestInit & FetchOptions) {
  if (typeof input === 'string' && init != null && init.isServer) {
    input = `${trimSlashesEnd(config.url)}/${trimSlashesStart(input)}`;
  }

  return isomorphicFetch(input, init);
}

export default fetch;
