module.exports = {
    version: "0.0.", /* [breaking-change].[compatible-change].[git-revision] */

    server: {
        host: "localhost",
        port: 3003,
        url: "http://localhost:3003"
    },

    router: {
        // e.g. api/v2/
        urlPrefix: "",
        primaryKeyPattern: '\\d+'
    },

    database: "mysql://root:root@localhost/dominion_auth",
    
    tokens: {
        accessToken: { 
            name: 'accessToken',
            ttl: 15 * 60 * 1000 /* milliseconds*/
        },
        refreshToken: {
            name: 'refreshToken',
            ttl: 24 * 3600 * 1000 /* milliseconds*/,
        },
    },

    cors: {
        // e.g. * | ["example.com"] | () => {} (synchronous callback function with Message context returning array of allowed origins)
        origin: "*",
        methods: ["OPTIONS", "GET", "POST", "PUT", "DELETE"],
        headers: ["Content-Type", "Set-Cookies", "Access-Token"],
        credentials: false,
        maxAge: 5 /* seconds */
    },
    
    JWT_SECRET_KEY: 'very-very-secret-key-jwt',
};