import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

interface IConfig {
  url: string;
  mapboxAccessToken: string;
  mapboxStyleId: string;
}

const config: IConfig = publicRuntimeConfig;

export default config;
