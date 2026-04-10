/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['sequelize', 'pg', 'pg-hstore'],
};

module.exports = nextConfig;
