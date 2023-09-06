/* eslint-disable no-undef */
module.exports = {
  apps: [
    {
      name: 'twitter-clone',
      script: 'dist/index.js',
      env: {
        NODE_ENV: 'development',
        TEN_BIEN: 'gia tri'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      env_staging: {
        NODE_ENV: 'staging'
      }
    }
  ]
}
