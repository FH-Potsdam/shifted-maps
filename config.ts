import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

type Config = {
  url: string;
};

const config: Config = publicRuntimeConfig;

export default config;
