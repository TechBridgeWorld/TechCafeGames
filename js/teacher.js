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
    
    ajaxRequest( 
        '/getScore',
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

}