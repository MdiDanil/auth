const Errors              = use('core/errors');
const Config              = use("config");
const jwt                 = require('jsonwebtoken');

class Tokens {
  static generateOne (type, payload) {
    return new Promise((resolve, reject) => {
      jwt.sign({ ...payload, type }, Config.JWT_SECRET_KEY, { expiresIn: `${Config.tokens[type].ttl}` }, (err, decoded) => {
        err ? reject(err) : resolve(decoded)
      })
    })
  }
  
  static generate (payload) {
    return Promise.all([
      Tokens.generateOne(Config.tokens.accessToken.name, payload),
      Tokens.generateOne(Config.tokens.refreshToken.name, payload)
    ])
    .then(([ accessToken, refreshToken ]) => { 
      return { accessToken, refreshToken }
    })
  }

  static check (token, type) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
        if (err || decoded.type !== type) reject(new Errors.Unauthorized('Invalid token'));
        resolve(decoded);
      })
    })
  }
  
  static addBearer (token) {
    return `Bearer ${token}`;
  }
}

module.exports = Tokens;
