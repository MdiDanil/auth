const Server                    = require('dominion');
const Config                    = use('config');

Server.addComponent(use('components/cors'));
Server.addComponent(require('./components/sessions'));
Server.addComponent(require('./components/accounts'));

Server.start(Config);
