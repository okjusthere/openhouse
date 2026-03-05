/** @type {import('next').NextConfig} */
const nextConfig = {
    // Deployment configuration
    output: 'standalone',

    // Performance
    poweredByHeader: false,
    reactStrictMode: true,

    // Headers for security
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
                ],
            },
            {
                // Allow /oh/* pages to be embedded (for kiosk)
                source: '/oh/:path*',
                headers: [
                    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
