import isomorphicFetch from 'isomorphic-fetch';

import config from '../config';
import { trimSlashesEnd, trimSlashesStart } from './trimSlashes';

export interface IFetchOptions {
  isServer?: boolean;
}

function fetch(input: Request | string, init?: RequestInit & IFetchOptions) {
  if (typeof input === 'string' && init != null && init.isServer) {
    input = `${trimSlashesEnd(config.url)}/${trimSlashesStart(input)}`;
  }

  return isomorphicFetch(input, init);
}

export default fetch;
