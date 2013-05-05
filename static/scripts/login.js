/*=============================================
    self loading login manager

    this is all copied and modified from Evan Shapiro's code at
    https://github.com/es92/mongo-express-auth

=============================================*/

/*
    Login is prompted when you SAVE a game from the editor screen
*/

var g = {
    onLoginSuccess: function(){
        // replaced in init.js by loggedInChanges
    },
    onRegisterSuccess: function(){
        var username = $("#username-input").val();
        var password = $("#password-input").val();

        $.ajax({
            type: "put",
            url: "/initUser/" + username,
            data: {},
            success: function(data) {
                if (data.err || (data.msg !== "ok")) 
                    console.log("initializing user error");
                else
                    login(username, password, loggedInChanges);
            }
        });
    },
    onRegisterFail: function(msg){
        if (msg === "username already exists")
            msg = "BAD PASSWORD";
        promptLogin(msg);
    },
    onLoginFail: function(msg){
        var username = $("#username-input").val();
        var password = $("#password-input").val();
        // if login fails, register them
        register(username, password);
    }
}

//==================
//  API
//==================

window.LoginManager = {
    setLoginSuccess: function(callback){
        g.onLoginSuccess = callback;
    },
    setRegisterSuccess: function(callback){
        g.onRegisterSuccess = callback;
    },
    setRegisterFail: function(callback){
        g.onRegisterFail = callback;
    },
    setLoginFail: function(callback){
        g.onLoginFail = callback;
    }
}

//==================
//  DOM
//==================

/*var loginButton = document.getElementById('loginButton');
var registerButton = document.getElementById('registerButton');

var usernameInput = document.getElementById('usernameInput');
var passwordInput = document.getElementById('passwordInput');

loginButton.onclick = function(){
    var username = usernameInput.value;
    var password = passwordInput.value;

    login(username, password);
}
registerButton.onclick = function(){
    var username = usernameInput.value;
    var password = passwordInput.value;

    register(username, password);
}*/

//==================
//  server API
//==================

function login(username, password, done){
    post(
        '/login', 
        {   
            username: username, 
            password: password 
        }, 
        done
    );
}

function register(username, password, done){
    post(
        '/register', 
        {   
            username: username, 
            password: password 
        }, 
        handleRegisterResult
    );
}

function handleRegisterResult(err, result){
    if (err)
        throw err;
    if (result === 'ok'){
        g.onRegisterSuccess();
    }
    else
        g.onRegisterFail(result);
}

function handleLoginResult(err, result){
    if (err)
        throw err;
    if (result === 'ok')
        g.onLoginSuccess();
    else
        g.onLoginFail(result);
}

function post(url, data, done){
    var request = new XMLHttpRequest();
    var async = true;
    request.open('post', url, async);
    request.onload = function(){
        if (done !== undefined){
            var res = request.responseText
            done(null, res);
        }
    }
    request.onerror = function(err){
        done(err, null);
    }
    if (data !== undefined){
        var body = new FormData();
        for (var key in data){
            body.append(key, data[key]);
        }
        request.send(body);
    }
    else {
        request.send();
    }
}