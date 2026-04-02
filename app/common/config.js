const dotenv = require('dotenv');

// Load the main .env file
dotenv.config({ path: '.env' });

const env = process.env.NODE_ENV || 'development';

// Load environment-specific .env file if it exists
const envFile = `.env.${env}`;

dotenv.config({ path: envFile, override: true });

const appConfig = {
  env,
  isProd: env === 'production',
  host: process.env.HOST || 'localhost',
  port: process.env.PORT || 3000,
};

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  name: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

const googleAuthConfig = {
  clientId: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SECRET,
};

module.exports = {
  appConfig,
  dbConfig,
  googleAuthConfig,
};
