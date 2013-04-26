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
