const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Aquí se pueden añadir otras configuraciones de Next.js en el futuro
};

module.exports = withPWA(nextConfig);
