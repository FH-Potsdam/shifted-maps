import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

type Config = {
  url: string;
  mapboxAccessToken: string;
  mapboxStyleId: string;
};

const config: Config = publicRuntimeConfig;

export default config;
