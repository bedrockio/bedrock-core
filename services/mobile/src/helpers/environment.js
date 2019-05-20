import { Constants } from 'expo';

export const isDevelopment = __DEV__;
export const isStaging = Constants.manifest.releaseChannel === 'staging';
export const isProduction = !isDevelopment && !isStaging;
