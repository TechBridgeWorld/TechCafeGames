// adds .bind functionality to the Function prototype if it's missing
// (such as on iOS5)
// modified from http://www.cs.cmu.edu/~237/handouts/dynamicInvocation.js
if(!Function.prototype.bind){
    Function.prototype.bind = function(scope){
        var self = this;                  // "this" is the function being called
        return function(){
            self.apply(scope, arguments); // arguments is an array of arguments!
        }
    }
}