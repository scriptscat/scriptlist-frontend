const DotEnv = require('dotenv')
const parsedEnv = DotEnv.config({ path: `.env.${process.env.NODE_ENV}` }).parsed

module.exports = function () {
  parsedEnv.VUE_APP_HTTP_HOST = process.env.VUE_APP_HTTP_HOST || parsedEnv.VUE_APP_HTTP_HOST
  return parsedEnv
}