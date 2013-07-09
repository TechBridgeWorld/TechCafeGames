/*=====================================================
     express authentication with mongo

    
    must include the following middleware to use:
        app.use(express.bodyParser());
        app.use(express.cookieParser());
        app.use(express.session({ secret: 'this is supposed to be secret, change it' }));

/*=====================================================*/

var expressAuthAccountManager = require('./expressAuthAccountManager.js');
var mongoAccountManager = require('./mongoAccountManager.js');

expressAuthAccountManager.init(mongoAccountManager);

exports.init = function(config, done){
    mongoAccountManager.init(config, done);
}

exports.checkLogin = expressAuthAccountManager.checkLogin;
exports.getAccount = expressAuthAccountManager.getAccount;
exports.login = expressAuthAccountManager.login;
exports.logout = expressAuthAccountManager.logout;
exports.register = expressAuthAccountManager.register;
exports.getUsername = expressAuthAccountManager.getUsername;
