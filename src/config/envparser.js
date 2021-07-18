const DotEnv = require('dotenv')
const parsedEnv = DotEnv.config({ path: `.env.${process.env.NODE_ENV}` }).parsed

module.exports = function () {
  return parsedEnv
}