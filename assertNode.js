exports.assert = function(expr, errorMsg){
    if (!expr){
        if(errorMsg === undefined){
            errorMsg = "<default error message>";
        }
        
        throw("Assertion Error: " + errorMsg);
    }
}