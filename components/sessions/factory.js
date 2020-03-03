const Config                    = use("config");
const Property                  = use("core/property");
const crypto                    = require("crypto");
const uuid                      = require('uuid/v4');

const SessionsRepository        = require("./repository");

const STATES                    = require("./enums/states");

const Tokens                    = require("./tools/Tokens");
const Tools                     = require("../accounts/tools");

const SessionsDefinition = {

    name: "Sessions",

    repository: SessionsRepository,

    properties: {
        id                      : Property.string().private(),
        refresh_token_hash      : Property.string().private(),
        refresh_token_salt      : Property.string().private(),
        state                   : Property.enum(Object.keys(STATES)).private(),
        accounts_id             : Property.model("Accounts"),
        issueTime               : Property.date().private(),
        ttl                     : Property.number().min(1000).private(),
        tokenExpirationTime     : Property.date(),
        revokeTime              : Property.date().private(),
        footprint               : Property.string().private(),
        userAgent               : Property.string().private(),
        ip                      : Property.string().max(15).private()
    },

    factory: {
        STATES,

        issue(sessionData) {
            const NOW = new Date();
            const ttl = sessionData.ttl || Config.tokens.refreshToken.ttl;
            const sessionId = uuid();

            return Tokens.generate({ sessionId, accountId: sessionData.account.id })
              .then(tokens => {
                 const [hash, salt] = Tools.encode(tokens.refreshToken);
                 
                 return this.new({
                    id: sessionId,
                    refresh_token_hash: hash,
                    refresh_token_salt: salt,
                    state: this.STATES.ACTIVE,
                    accounts_id: sessionData.account.id,
                    issueTime: NOW,
                    ttl: ttl,
                    tokenExpirationTime: new Date(+NOW + ttl),
                    footprint: this._footprint(sessionData),
                    userAgent: sessionData.userAgent,
                    ip: sessionData.ip
                 })
                .then(session => session.save())
                .then(session => { 
                    return { session, tokens }; 
                })
              });
        },

        _footprint(sessionData) {
          return crypto.createHash("md5").update(sessionData.userAgent).digest("hex").toString("hex");
        },
        
        validateAccessToken(accessToken) {
          return Tokens.check(accessToken, Config.tokens.accessToken.name)
        },
        
        validateRefreshToken(refreshToken) {
          return Tokens.check(refreshToken, Config.tokens.refreshToken.name)
            .then(payload => this.get({
               id: payload.sessionId,
               accounts_id: payload.accountId,
               state: 'ACTIVE',
            }))
            .then(session => {
              if (!session) throw new Errors.Unauthorized(); 
              
              const newHash = Tools.createHash(refreshToken, session.refresh_token_salt);
              if (!session.refresh_token_hash === newHash) throw new Errors.Unauthorized();
              
              return session;
            })
        },
        
        
    },

    instance: {

        revoke() {
          this.revokeTime = new Date();
          this.state = STATES.REVOKED;
          return this.save();
        }
    }
};


module.exports = SessionsDefinition;