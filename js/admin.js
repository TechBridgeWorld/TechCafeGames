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

    $('#adminLogin').on('click', function(){
        var username = $('#usernameLog').val();
        var password = $('#passwordLog').val();

        if (username == '') {$("#usernameLog").css("background-color","#FFC0C0");return;}

        if (password == '') {$("#passwordLog").css("background-color","#FFC0C0");return;}

        ajaxPost(  
                {   
                    username: username,
                    password: password,
                },
                '/loginAdmin',
                function success(data){
                    console.log(data);
                },
                function error(xhr, status, err){
                    alert(JSON.stringify(err));
                    console.log("error: "+err);
        });
    });

}   
