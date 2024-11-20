/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  server: {
    https: {
      key: fs.readFileSync(path.join(process.cwd(), 'localhost-key.pem')),
      cert: fs.readFileSync(path.join(process.cwd(), 'localhost.pem')),
    },
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, module: false };
    return config;
  },
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  env: {
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL_SECURE: process.env.EMAIL_SECURE,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_CLIENT_ID: process.env.EMAIL_CLIENT_ID,
    EMAIL_CLIENT_SECRET: process.env.EMAIL_CLIENT_SECRET,
    EMAIL_REFRESH_TOKEN: process.env.EMAIL_REFRESH_TOKEN,
    EMAIL_FROM: process.env.EMAIL_FROM,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;