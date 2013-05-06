/*=============================================
    self loading login manager

    this is all copied and modified from Evan Shapiro's code at
    https://github.com/es92/mongo-express-auth

=============================================*/

// /*
//     Login is prompted when you SAVE a game from the editor screen
// */

// var g = {
//     onLoginSuccess: function(){
//         // replaced in init.js by loggedInChanges
//     },
//     onRegisterSuccess: function(){
//         var username = $("#username-input").val();
//         var password = $("#password-input").val();

//         $.ajax({
//             type: "put",
//             url: "/initUser/" + username,
//             data: {},
//             success: function(data) {
//                 if (data.err || (data.msg !== "ok")) 
//                     console.log("initializing user error");
//                 else
//                     login(username, password, loggedInChanges);
//             }
//         });
//     },
//     onRegisterFail: function(msg){
//         if (msg === "username already exists")
//             msg = "BAD PASSWORD";
//         promptLogin(msg);
//     },
//     onLoginFail: function(msg){
//         var username = $("#username-input").val();
//         var password = $("#password-input").val();
//         // if login fails, register them
//         register(username, password);
//     }
// }

// //==================
// //  API
// //==================

// window.LoginManager = {
//     setLoginSuccess: function(callback){
//         g.onLoginSuccess = callback;
//     },
//     setRegisterSuccess: function(callback){
//         g.onRegisterSuccess = callback;
//     },
//     setRegisterFail: function(callback){
//         g.onRegisterFail = callback;
//     },
//     setLoginFail: function(callback){
//         g.onLoginFail = callback;
//     }
// }

// if the user is logged in, returns username
// otherwise, calls promptLogin
function checkLogin(callback) {
    $.ajax({
        type: 'get',
        url: '/me',
        data: {},
        success: function(data){
            if (data === "no login data present") {
                callback(false);
            }
            else {
                callback(data.username);
            }
        }
    });
}

// display login screen
function promptLogin(message, callback) {
    if (message === undefined)
        message = "PLEASE LOG IN";
    $("#loginMessage").html(message);
    // empty fields if not empty
    $("#username-input").val("");
    $("#password-input").val("");

    $("#loginoverlay").show();

    // fit text pieces
    $("#loginMessage").fitText(1);
    $(".login-message").fitText(1);
    $(".login-button-text").fitText(.5);
    $(".login-input").fitText(1);

    $("#submitloginButton").click(function(e) {
        console.log("loginn");
        var username = $("#username-input").val();
        var password = $("#password-input").val();
        // update username
        curUsername = username;
        // call login function
        login(username, password, function(err, result) {
            if (err) {
                console.log(err);
                return;
            }
            // REGISTER if login fails
            else if (result !== "ok") {
                console.log("login fail: register");
                var username = $("#username-input").val();
                var password = $("#password-input").val();
                register(username, password, function(error, res){
                    console.log("msg: ", res);
                    if (error) throw error;
                    // register FAIL
                    else if (res !== "ok") {
                        if (res === "username already exists")
                            res = "BAD PASSWORD";
                        curUsername = "default";
                        promptLogin(res);
                    }
                    // register SUCCESS
                    else {
                        console.log("register good");
                        var username = $("#username-input").val();
                        var password = $("#password-input").val();
                        // here's where the new user is put in the database
                        $.ajax({
                            type: "put",
                            url: "/initUser/" + username,
                            data: {},
                            success: function(data) {
                                if (data.err || (data.msg !== "ok")) 
                                    console.log("initializing user error");
                                else {
                                    console.log("now let's log in"); 
                                    login(username, password,function(err,res){
                                        loggedInChanges(err, res, 
                                            function(error, result) {
                                                if (error) throw error;
                                                else andThen();
                                        });
                                    });
                                }
                            }
                        });
                    }
                });
            }
            // LOG IN SUCCESS
            loggedInChanges(err, result, function(error, res) {
                if (error) throw error;
                else andThen();
            });
        });
        function andThen() {
            // // destroy event handlers
            // $("#cancelloginButton").off();
            // $("#submitloginButton").off();
            // // leave popup
            // console.log("hiding");
            // $("#loginoverlay").hide();
            if (callback instanceof Function) {
                callback();
            }
        }
        e.preventDefault();
        e.stopPropagation();
    });

    $("#cancelloginButton").click(function(e) {
        // destroy event handlers
        $("#submitloginButton").off();
        $(this).off();
        // leave popup
        $("#loginoverlay").hide();
        e.preventDefault();
        e.stopPropagation();
    });
}


function loggedInChanges(err, result, callback) {
    if (err)
        throw err;
    if (result === 'ok') {
        $('#minigamelibloginoverlay').hide();
        $('#logoutButton').show();
        // set up minigame library accordingly 
        // (curUsername was set on the login form submit)
        initMinigameLibrary(curUsername, function(){
            // destroy event handlers
            $("#cancelloginButton").off();
            $("#submitloginButton").off();
            // leave popup
            console.log("hiding2");
            $("#loginoverlay").hide();
            if (callback instanceof Function) {
                callback();
            }
        });
    }
    else {
        var username = $("#username-input").val();
        var password = $("#password-input").val();
        // if login fails, register them
        register(username, password);
    }
}

function loggedOutChanges(callback) {
    // hide logout button on homepage
    $('#logoutButton').hide();
    initMinigameLibrary("default", function(){
        if (callback instanceof Function) {
            callback();
        }
    });
    //promptLogin("PLEASE LOG IN");
}


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
        done
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