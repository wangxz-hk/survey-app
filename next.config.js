/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'survey-admin-2024',
    JWT_SECRET: process.env.JWT_SECRET || 'survey-app-secret',
  }
}

module.exports = nextConfig