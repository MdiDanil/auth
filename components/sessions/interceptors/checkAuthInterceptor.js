const Factories                             = use('core/factories');
const Errors                                = use('core/errors');

const SessionsFactory                       = Factories('Sessions');
const AccountsFactory                       = Factories('Accounts');

const { ACCESS_TOKEN, REFRESH_TOKEN }       = require('../enums/headers');
const Tokens                                = require('../tools/Tokens');

function checkAuthInterceptor(body) {
    const reqHeaders = this.request.headers;
    if (!(reqHeaders[ACCESS_TOKEN] && reqHeaders[REFRESH_TOKEN])) return Promise.resolve(body);

    const accessToken = reqHeaders[ACCESS_TOKEN].split(" ")[1];
    const refreshToken = reqHeaders[REFRESH_TOKEN].split(" ")[1];
    if (!(accessToken && refreshToken)) throw new Errors.Unauthorized();
    
    return SessionsFactory.validateAccessToken(accessToken)
      .then(payload => {
        this.request.session = { 
          id: payload.sessionId,
          account: { 
            id: payload.accountId 
          }
        };
      })
      .catch(() => { 
        return SessionsFactory.validateRefreshToken(refreshToken)
         .then(session => session.revoke())
         .then(session => AccountsFactory.get({ id: session.accounts_id }))
         .then((account) => SessionsFactory.issue({
           account: account,
           signed: true,
           ip: this.request.ip,
           userAgent: this.request.headers["user-agent"],
         }))
         .then(({ session, tokens: { accessToken, refreshToken } }) => {
           this.response.headers[ACCESS_TOKEN] = Tokens.addBearer(accessToken);
           this.response.headers[REFRESH_TOKEN] = Tokens.addBearer(refreshToken);
          
           this.request.session = { 
             id: session.id,
             account: { 
                 id: session.accounts_id 
             }
           };
         })
      })
}

module.exports = checkAuthInterceptor;