/** assert: (expression, String)

 general assertion handler to automatically stop execution on assertion failure
 
 params:
 expr           any expression (will be tested based on its truthiness)
 errorMsg       the error message to display if the assertion fails 
                (optional)
**/
function assert(expr, errorMsg){
    if (!expr){
        if(errorMsg === undefined){
            errorMsg = "assertion error message not given";
        }
        
        throw("Assertion Error: " + errorMsg);
    }
}
