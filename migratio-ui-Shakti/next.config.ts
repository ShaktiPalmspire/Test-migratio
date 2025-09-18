import type { NextConfig } from "next";
import type { RemotePattern } from 'next/dist/shared/lib/image-config';

// Derive Supabase hostname from environment so we don't hardcode project-specific hosts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseHostname: string | undefined;
try {
	if (supabaseUrl) {
		// new URL throws if invalid; we guard with try/catch
		supabaseHostname = new URL(supabaseUrl).hostname;
	}
} catch {
	// leave undefined if the env var is not a valid URL
}

const googlePattern: RemotePattern = {
	protocol: 'https',
	hostname: 'lh3.googleusercontent.com',
	port: '',
	pathname: '/**',
};

const supabasePatterns: RemotePattern[] = supabaseHostname
	? [
		{ protocol: 'https', hostname: supabaseHostname, port: '', pathname: '/storage/v1/object/sign/**' },
		{ protocol: 'https', hostname: supabaseHostname, port: '', pathname: '/storage/v1/object/public/**' },
	]
	: [];

const remotePatterns: RemotePattern[] = [googlePattern, ...supabasePatterns];

const nextConfig: NextConfig = {
	images: {
		remotePatterns,
	},
	eslint: {
		// Warning: This allows production builds to successfully complete even if
		// your project has ESLint errors.
		ignoreDuringBuilds: false,
	},
	typescript: {
		// Warning: This allows production builds to successfully complete even if
		// your project has type errors.
		ignoreBuildErrors: true,
	},
	// Turbopack configuration (stable in Next.js 15)
	turbopack: {
		// Enable Turbopack features
		resolveAlias: {
			// Add any custom module resolution if needed
		},
	},
	// Server external packages (moved from experimental)
	serverExternalPackages: [],
	// Optimize package imports
	optimizePackageImports: ['@tabler/icons-react', 'react', 'react-dom'],
};

export default nextConfig;
