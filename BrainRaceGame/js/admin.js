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
                    $("#wrongLogin").fadeOut();

                    // temporary fix for wrong login
                    if (data!=="Invalid credentials"){
                        // successful login
                        $("#adminLoginForm").slideUp();
                        $("#trackingData").slideDown();

                        var trackingData = data[1];
                        var dataLength = trackingData.length;

                        // check for empty results
                        if (dataLength<1){
                            $("#average").html("no data yet");
                            $("#individual").hide();
                        }
                        else{
                            // fill in averages 

                            // general data
                            var totalGameLength = 0;
                            var totalScore = 0;
                            var totalObstaclesEaten = 0;
                            var totalObstaclesSpawned = 0;
                            var totalCoinsEaten = 0;
                            var totalCoinsSpawned = 0;

                            // question data
                            var totalTotalQuestions = 0;
                            var totalRightQuestions = 0;
                            var totalTimeoutQuestions = 0;
                            var totalAnswerCount = 0;
                            var totalAnswerTime = 0;

                            // powers data
                            var totalPowersEaten = 0;
                            var totalPowersSpawned = 0;
                            var totalPowersMissedInitially = 0;
                            var totalGasEaten = 0;
                            var totalGasSpawned = 0;
                            var totalBoostEaten = 0;
                            var totalBoostSpawned = 0;
                            var totalCrossoutEaten = 0;
                            var totalCrossoutSpawned = 0;
                            var totalTimeEaten = 0;
                            var totalTimeSpawned = 0;


                            // loop over data and add them up
                            for (var i=0; i<trackingData.length; i++){
                                totalGameLength+=trackingData[i].gameLength;
                                totalScore+=trackingData[i].score;
                                totalObstaclesEaten+=trackingData[i].numObstaclesEaten;
                                totalObstaclesSpawned+=trackingData[i].numObstaclesSpawned;
                                totalCoinsEaten+=trackingData[i].numCoinsEaten;
                                totalCoinsSpawned+=trackingData[i].numCoinsSpawned;

                                totalTotalQuestions+=trackingData[i].numTotalQuestions;
                                totalRightQuestions+=trackingData[i].numRightQuestions;
                                totalTimeoutQuestions+=trackingData[i].numTimeoutQuestions;

                                totalPowersEaten+=trackingData[i].numPowersEaten;
                                totalPowersSpawned+=trackingData[i].numPowersSpawned;
                                totalPowersMissedInitially+=trackingData[i].numPowersMissedInitially;

                                totalGasEaten+=trackingData[i].numGasPowersEaten;
                                totalGasSpawned+=trackingData[i].numGasPowersSpawned;
                                totalBoostEaten+=trackingData[i].numBoostPowersEaten;
                                totalBoostSpawned+=trackingData[i].numBoostPowersSpawned;
                                totalCrossoutEaten+=trackingData[i].numCrossoutPowersEaten;
                                totalCrossoutSpawned+=trackingData[i].numCrossoutPowersSpawned;
                                totalTimeEaten+=trackingData[i].numTimePowersEaten;
                                totalTimeSpawned+=trackingData[i].numTimePowersSpawned;

                                // split questionData (semicolon-delimited)
                                var questionData = trackingData[i].questionData[0];
                                var questionArray = questionData.split(';');

                                // loop over questions; length-1 because last item is always empty
                                for (var j=0; j<questionArray.length-1; j++){
                                    totalAnswerCount++;
                                    totalAnswerTime+=JSON.parse(questionArray[j]).answerTime;
                                }
                            }

                            // calculate averages
                            var avgScore = totalScore/dataLength;
                            var avgGameLength = totalGameLength/dataLength;
                            var avgPercentObstaclesEaten = totalObstaclesEaten/totalObstaclesSpawned*100 || 0;
                            var avgPercentCoinsEaten = totalCoinsEaten/totalCoinsSpawned*100 || 0;
                            var avgAnswerTime = totalAnswerTime/totalAnswerCount;

                            var avgTotalQuestions = totalTotalQuestions/dataLength;
                            var avgRightQuestions = totalRightQuestions/dataLength;
                            var avgTimeoutQuestions = totalTimeoutQuestions/dataLength;
                            var avgPercentCorrect = avgRightQuestions/avgTotalQuestions*100 || 0;

                            var avgPercentPowersEaten = totalPowersEaten/totalPowersSpawned*100 || 0;
                            var avgPowersMissedInitially = totalPowersMissedInitially/dataLength;
                            var avgPercentGasEaten = totalGasEaten/totalGasSpawned*100 || 0;
                            var avgPercentBoostEaten = totalBoostEaten/totalBoostSpawned*100 || 0;
                            var avgPercentCrossoutEaten = totalCrossoutEaten/totalCrossoutSpawned*100 || 0;
                            var avgPercentTimeEaten = totalTimeEaten/totalTimeSpawned*100 || 0;

                            // add data to DOM
                            $("#dataCount").html(dataLength);

                            $("#avgScore").html(roundNum(avgScore));
                            $("#avgGameLength").html(roundNum(avgGameLength)+"s");
                            $("#avgPercentObstaclesEaten").html(roundNum(avgPercentObstaclesEaten)+"%");
                            $("#avgPercentCoinsEaten").html(roundNum(avgPercentCoinsEaten)+"%");
                            $("#avgAnswerTime").html(roundNum(avgAnswerTime)+"s");

                            $("#avgTotalQuestions").html(roundNum(avgTotalQuestions));
                            $("#avgRightQuestions").html(roundNum(avgRightQuestions));
                            $("#avgTimeoutQuestions").html(roundNum(avgTimeoutQuestions));
                            $("#avgPercentCorrect").html(roundNum(avgPercentCorrect)+"%");

                            $("#avgPercentPowersEaten").html(roundNum(avgPercentPowersEaten)+"%");
                            $("#avgPowersMissedInitially").html(roundNum(avgPowersMissedInitially));
                            $("#avgPercentGasEaten").html(roundNum(avgPercentGasEaten)+"%");
                            $("#avgPercentBoostEaten").html(roundNum(avgPercentBoostEaten)+"%");
                            $("#avgPercentCrossoutEaten").html(roundNum(avgPercentCrossoutEaten)+"%");
                            $("#avgPercentTimeEaten").html(roundNum(avgPercentTimeEaten)+"%");


                            // fill in individual data
                            for (var i=0; i<trackingData.length; i++){
                                var thisSession = trackingData[i];
                                var $table = $('\
                                    <table class="table table-hover individualData"> \
                                        <thead><tr class="title"> \
                                            <td colspan=6><h4> \
                                                <span class="name">'+thisSession.name+'</span> \
                                                <span class="date">'+thisSession.timestamp+'</span> \
                                            </h4></td> \
                                        </tr></thead> \
                                        <tr> \
                                            <th>Game Length</th> \
                                            <td class="gameLength">'+thisSession.gameLength+'s</td> \
                                            <th>Coins Eaten</th> \
                                            <td class="coinsEaten">'+thisSession.numCoinsEaten+' / '+thisSession.numCoinsSpawned+'</td> \
                                            <th>Obstacles Eaten</th> \
                                            <td class="obstaclesEaten">'+thisSession.numObstaclesEaten+' / '+thisSession.numObstaclesSpawned+'</td> \
                                        </tr> \
                                        <tr> \
                                            <th>Score</th> \
                                            <td class="score">'+thisSession.score+'</td> \
                                            <th>Right Questions</th> \
                                            <td class="rightQuestions">'+thisSession.numRightQuestions+' / '+thisSession.numTotalQuestions+'</td> \
                                            <th>Timeout Questions</th> \
                                            <td class="timeoutQuestions">'+thisSession.numTimeoutQuestions+' / '+thisSession.numTotalQuestions+'</td> \
                                        </tr> \
                                        <tr> \
                                            <th>Powers Eaten</th> \
                                            <td id="powersEaten">'+thisSession.numPowersEaten+' / '+thisSession.numPowersSpawned+'</td> \
                                            <th>Powers Initially Missed</th> \
                                            <td id="powersMissedInitially">'+thisSession.numPowersMissedInitially+'</td> \
                                            <th>Gas Eaten</th> \
                                            <td id="gasEaten">'+thisSession.numGasPowersEaten+' / '+thisSession.numGasPowersSpawned+'</td> \
                                        </tr> \
                                        <tr> \
                                            <th>Boost Eaten</th> \
                                            <td id="boostEaten">'+thisSession.numBoostPowersEaten+' / '+thisSession.numBoostPowersSpawned+'</td> \
                                            <th>Crossout Eaten</th> \
                                            <td id="avgPercentCrossoutEaten">'+thisSession.numCrossoutPowersEaten+' / '+thisSession.numCrossoutPowersSpawned+'</td> \
                                            <th>Time Eaten</th> \
                                            <td id="avgPercentTimeEaten">'+thisSession.numTimePowersEaten+' / '+thisSession.numTimePowersSpawned+'</td> \
                                        </tr> \
                                    </table>');

                                    // get question data from semicolon-delimited string
                                    var questionData = trackingData[i].questionData[0];
                                    var questionArray = questionData.split(';');

                                    var $questions = $("<div class='specificQuestions'></div>");

                                    // loop over questions; length-1 because last item is always empty
                                    for (var j=0; j<questionArray.length-1; j++){
                                        var question = JSON.parse(questionArray[j]);
                                        var resultClass;
                                        if (question.correctAnswer){
                                            resultClass = "correct";
                                        }
                                        else{
                                            resultClass = "incorrect";
                                        }
                                        var positionClass = "pos"+question.answerPosition;
                                        var answerTime = question.answerTime;
                                        $questions.append('<div class="question '+resultClass+' '+positionClass+'">'+answerTime+'s</div>');
                                    }
                                    $questions.append('<div class="clear"></div>');
                                    var $oneQuestion = $("<div></div>");

                                $oneQuestion.append($table).append($questions);
                                $("#individualContainer").append($oneQuestion);
                            }

                            // enable pagination with jPages
                            $("div.holder").jPages({
                                containerID: "individualContainer",
                                keyBrowse   : true
                            });
                        }


                        // round numbers to 1 decimal
                        function roundNum(num){
                            return Math.round(num * 10) / 10;
                        }
                    }
                    else{
                        // show error on failed login
                        $("#wrongLogin").fadeIn();
                    }
                    

                },
                function error(xhr, status, err){
                    alert(JSON.stringify(err));
                    console.log("error: "+err);
        });
    });

}   
