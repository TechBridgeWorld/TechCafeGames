/*=====================================================
     express authentication with an account manager

     TODO
        fn to update password

/*=====================================================*/


var C = {
    MaxCookieAge: 900000
}

var g = { 
    accountManager: null   
};

exports.init = function(accountManager){
    g.accountManager = accountManager;
}

exports.getUsername = function(req){
    return req.session.username;
}

exports.getAccount = function(req, done){
    if (!exports.isLoggedIn(req)){
        done('not logged in', null);
    }
    else {
        var username = req.cookies.username;
        var password = req.cookies.password;
        g.accountManager.getAccount(username, password, done);
    }
}

exports.isLoggedIn = function(req){
    return  req.session.username !== undefined &&
            req.cookies.username !== undefined && 
            req.cookies.password !== undefined;
}

exports.checkLogin = function(req, res, done){
    if (exports.isLoggedIn(req))
        done(null);
    else {
        exports.cookieLogin(req, res, function(err){
            if (err)
                done(err);
            else 
                done(null);
        });
    }
}

exports.logout = function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    res.clearCookie('username');
    res.clearCookie('password');
    delete req.session.username;
}

exports.cookieLogin = function(req, res, done){
    var username = req.cookies.username;
    var password = req.cookies.password;
    if (username === undefined || password === undefined){
        done('no login data present');
    }
    else {
        g.accountManager.getAccount(username, password, function(err, account){
            if (err){
                res.clearCookie('username');
                res.clearCookie('password');
                if (typeof err === 'string'){
                    done(err);
                }
                else {
;                   done('unknown error');
                }
            }
            else {
                req.session.username = username;
                done(null);
            }
        });
    }
}

exports.login = function(req, res, done){
    var username = req.body.username;
    var password = req.body.password;
    g.accountManager.getAccount(username, password, function(err, account){
        if (err && typeof err === 'string')
            done(err);
        else if (err)
            done('unknown error');
        else {
            res.cookie('username', username, { maxAge: C.MaxCookieAge });
            res.cookie('password', password, { maxAge: C.MaxCookieAge });
            req.session.username = username;
            done(null);
        }
    });

}

exports.register = function(req, done){
    var username = req.body.username;
    var password = req.body.password;
    g.accountManager.createAccount(username, password, function(err, account){
        if (err && typeof err === 'string')
            done(err);
        else if (err)
            done('unknown error');
        else {
            done(null);
        }
    });

}
