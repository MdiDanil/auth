const Errors                                = use("core/errors");
const Factories                             = use("core/factories");

const AccountsFactory                       = Factories("Accounts");
const SessionsFactory                       = Factories("Sessions");

const { ACCESS_TOKEN, REFRESH_TOKEN }       = require('./enums/headers');
const Tokens                                = require('./tools/Tokens');

const AuthController = {

    path: SessionsFactory.__model__.name,

    permissions: {},

    POST: [
        function () {
            // @path: auth/tokens
            // @summary: Authenticate account by credentials
            
            const accountKey = this.request.body.phone_number 
                ? { phone_number: this.request.body.phone_number }
                : { email: this.request.body.email };

            return AccountsFactory.get(accountKey)
                .then(account => account.checkPassword(this.request.body.password))
                .then(account => SessionsFactory.issue({
                    account: account,
                    signed: true,
                    ip: this.request.ip,
                    userAgent: this.request.headers["user-agent"],
                }))
                .then(({ tokens: { accessToken, refreshToken } }) => {
                    this.response.headers[ACCESS_TOKEN] = Tokens.addBearer(accessToken);
                    this.response.headers[REFRESH_TOKEN] = Tokens.addBearer(refreshToken);    
                })
        },

        function () {
            // @path: auth/tokens/revoke
            // @summary: Revoke authentication token
            
            if (!this.request.session) {
                throw new Errors.Unauthorized("Session is invalid");
            }
            return SessionsFactory.get({ id: this.request.session.id, accounts_id: this.request.session.account.id })
                .then(session => session.revoke())
                .then(() => Promise.resolve());
        },

        function () {
            // @path: auth/tokens/revoke/all
            // @summary: Revoke all accounts authentication token

            if (!this.request.session) {
                throw new Errors.Unauthorized("Session is invalid");
            }
            return SessionsFactory.find({ accounts_id: this.request.session.account.id })
                .then(sessions => Promise.all(sessions.map(session => session.revoke())))
                .then(() => Promise.resolve());
        },
    ]
};


module.exports = AuthController;