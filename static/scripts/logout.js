/*=============================================
     self loading logout manager

    this is all copied and modified from Evan Shapiro's code at
    https://github.com/es92/mongo-express-auth
    
=============================================*/

window.addEventListener('load', function(){
    (function(){

        var g = {
            handleLogoutResult: function(err, result){
                window.location = '/';
            }
        }

        //==================
        //  API
        //==================

        window.LogoutManager = {
            setHandleLogoutResult: function(callback){
                g.handleLogoutResult = callback;
            },
        }

        //==================
        //  server API
        //==================

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
    })();
});