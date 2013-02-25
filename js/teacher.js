window.onload = execute();

function execute() {
    var studentData = [];
    var students = [];

    var ajaxRequest = function(url, fnSuccess, fnError){
        $.ajax({
            url: url,
            data: 'GET',
            success: fnSuccess,
            error: fnError
        });
    };

   var ajaxPost = function(json, url, onSuccess, onError){
        var data = new FormData();

        for (var key in json){
            data.append(key, json[key]);
        }
        
            $.ajax({
                url: url,
                data: data,
                cache: false,
                contentType: false,
                processData: false,
                type: 'POST',
                success: onSuccess,
                error: onError});
    }   

    var hideAll = function(){
        $('#loginForm').hide(); 
        $('#registerForm').hide();
        $('#scores').hide();
        $('#submitRegister').hide();
        $('#submitLogin').hide();
    }
    
    hideAll();

    var hideRegister = function(){
        $('#registerForm').hide(); 
        $('#submitRegister').hide();
    }


    var hideLogin = function(){
        $('#loginForm').hide(); 
        $('#submitLogin').hide();
    }

    var hideButtons = function(){
        $('#registerButton').hide();
        $('#loginButton').hide();
    }

    $('#registerButton').click(function(){ 
        hideLogin();
        $('#registerForm').show(); 
        $('#submitRegister').show(); 
    })

    $('#loginButton').click(function(){
        hideRegister();
        $('#loginForm').show(); 
        $('#submitLogin').show(); 
    })

    $('#submitRegister').click(function(){
        var username = $('#usernameReg').val();
        var password = $('#passwordReg').val();

        if (username == '') {$("#usernameReg").css("background-color","#FFC0C0");return;}

        if (password == '') {$("#password").css("background-color","#FFC0C0");return;}

        ajaxPost(  
                {
                    username: username,
                    password: password,
                },
                '/registerUser',
                function success(data){
                    if(data == 'user exists')
                    {
                        alert("User exists.");
                    }
                    else
                    {  
                       alert(data); 
                       // showHome();
                    }

                },
                function error(xhr, status, err){
                    alert(JSON.stringify(err));
                });
    });

    $('#submitLogin').click(function(){
        var username = $('#usernameLog').val();
        var password = $('#passwordLog').val();

        console.log(password);
        if (username == '') {$("#usernameLog").css("background-color","#FFC0C0");return;}

        if (password == '') {$("#passwordLog").css("background-color","#FFC0C0");return;}

        ajaxPost(  
                {   
                    username: username,
                    password: password,
                },
                '/loginUser',
                function success(data){
                    alert(data);
                    showMainPage();
                },
                function error(xhr, status, err){
                    alert(JSON.stringify(err));
                    console.log("error: "+err);
                });
    });




    var showMainPage = function(){ 
        hideLogin();
        hideButtons();
        $('#scores').show();

        ajaxRequest( 
            '/getQuestionStats',
            function onSuccess(data){
                if(data)
                    {   
                        studentData = data; 
                        for(var i = 0; i < studentData.length; i++) {
                            $("#scores").append("<div id='"+studentData[i].name+"' class='studentScore'><h2>"+studentData[i].name+"</h2><h3>"+studentData[i].numRight+"/"+studentData[i].numTotal+"</h3></br></div>");
                        }
                    }
                },
            function onError(data){ 
                }
        );   

    //     ajaxRequest( 
    //         '/getScores',
    //         function onSuccess(data){
    //             if(data)
    //                 {   
    //                     studentData = data; 
    //                     for(var i = 0; i < studentData.length; i++) {
    //                         $("#scores").append("<div id='"+studentData[i].name+"' class='studentScore'><h2>"+studentData[i].name+"</h2><h3>"+studentData[i].score+"</h3></br></div>");
    //                     }
    //                 }
    //             },
    //         function onError(data){ 
    //             }
    //     );   
    // }

}