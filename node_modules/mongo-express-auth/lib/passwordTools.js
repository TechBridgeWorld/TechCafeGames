var crypto = require('crypto');

//===========================
//  API
//===========================

exports.saltAndHash = function(pass, callback){
    var salt = generateSalt();
    return salt + md5(pass + salt)
}

exports.validatePassword = function(plainPass, hashedPass){
    var salt = hashedPass.substr(0, 10);
    var validHash = salt + md5(plainPass + salt);
    return hashedPass === validHash;
}

//===========================
//  cryptography
//===========================

var generateSalt = function(){
    var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
    var salt = '';
    for (var i = 0; i < 10; i++){
        var p = Math.floor(Math.random() * set.length);
        salt += set[p];
    }
    return salt;
}

var md5 = function(str){
    return crypto.createHash('md5').update(str).digest('hex');
}
