/** @type {import("next").NextConfig} */
module.exports = {
    webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
        // Important: return the modified config
        // if (nextRuntime === 'edge') {
        //     let fallback = config.resolve.fallback || {};
        //     fallback = {
        //         ...fallback,
        //         crypto: require.resolve("crypto-browserify"),
        //         stream: require.resolve("stream-browserify"),
        //     }
        //     config.resolve.fallback = fallback;
        // }
        return config
    },
}
