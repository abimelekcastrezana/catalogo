const path = require('path');
const dotenv = require('dotenv');

// Force project-root behavior: path is resolved from process.cwd() (where .env lives)
dotenv.config({ path: '.env' });

const env = process.env.NODE_ENV || 'development';
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

// Force uploads from UPLOAD_PATH in .env, no fallback to public/uploads.
const rawUploadPath = process.env.UPLOAD_PATH;
if (!rawUploadPath) {
  throw new Error('UPLOAD_PATH must be set in .env (no default public/uploads)');
}

const basePath = path.isAbsolute(rawUploadPath)
  ? rawUploadPath
  : path.resolve(process.cwd(), rawUploadPath);

const uploadConfig = {
  rawUploadPath,
  basePath,
};

module.exports = {
  appConfig,
  dbConfig,
  uploadConfig,
};
