import data from './data/site.json';
export const siteConfig = {
  ...data,
  site: import.meta.env.PUBLIC_SITE_URL || data.site,
  waline: { serverURL: import.meta.env.PUBLIC_WALINE_SERVER_URL || data.waline.serverURL },
};
