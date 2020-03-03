const Property                  = use('core/property');
const Errors                    = use('core/errors');

const AccountsRepository        = require('./repository');
const Tools                     = require('./tools');


const AccountsDefinition = {

    name: 'Accounts',

    repository: AccountsRepository,

    properties: {
        id: Property.id(),
        phone_number: Property.number().min(10000000000).max(999999999999),
        email: Property.string().max(50),
        password_hash: Property.string().max(255).private(),
        password_salt: Property.string().max(255).private(),
    },

    factory: {},

    instance: {

        checkPassword(password) {
            if (this.password_hash === Tools.createHash(password, this.password_salt)) {
                return this;
            } else {
                throw new Errors.Unauthorized("Incorrect credentials");
            }
        },

        setPassword(password) {
            let [password_hash, password_salt] = Tools.encode(password);
            this.populate({password_hash, password_salt});
            return this;
        }
    }
};


module.exports = AccountsDefinition;