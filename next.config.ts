import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'store.zenix.lk',
            }
        ],
    },
};

export default nextConfig;
