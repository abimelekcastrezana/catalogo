/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...config.externals, 'sequelize', 'pg', 'pg-hstore'];
    }
    return config;
  },
};

module.exports = nextConfig;
