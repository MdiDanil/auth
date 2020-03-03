const Factories                 = use('core/factories');
const Errors                    = use('core/errors');


const AccountsFactory           = Factories('Accounts');

const AccountsController = {

    path: AccountsFactory.__model__.name,

    permissions: {
        PUT: 'Accounts.Update',
        DELETE: 'Accounts.Delete'
    },

    GET : [
        // accounts/23
        function (accountsId) {
            return AccountsFactory.get({id: accountsId})
                .then(account => account.confirmOwner(this.request.session));
        }
    ],

    POST : [
        // accounts
        function () {
            const accountData = Object.assign({}, this.request.body);
            delete accountData.password;

            return AccountsFactory.new(accountData)
                .then(account => {
                    if (this.request.body.password) {
                        account.setPassword(this.request.body.password);
                    }
                    return account;
                })
                .then(account => account.save())
        },
    ],

    PUT : [
        // accounts/23
        function (accountsId) {
            
            const accountKey = this.request.body.phone_number 
              ? { phone_number: this.request.body.phone_number }
              : { email: this.request.body.email };

            if(accountKey){
                return AccountsFactory.get({id: accountsId, ...accountKey})
                    .then(account => account.populate(this.request.body))
                    .then(account => {
                        if(this.request.body.password_hash) {
                            account.setPassword(this.request.body.password_hash);
                        }
                        return account;
                    })
                    .then(account => account.save());

            } else {
                throw new Errors.BadRequest("Error: phone number or email is a required parameter");
            }
        }
    ],
};


module.exports = AccountsController;