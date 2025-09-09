export const environment = {
  production: true,
  pubgApiKey: process.env['PUBG_API_KEY'] || '',
  apiBaseUrl: 'https://api.pubg.com',
  cacheTtl: 3600000,
  shard: 'pc-na'
};