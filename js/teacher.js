window.onload = execute();

function StudentData(name, data){
    this.name=name;
    this.data=data;
}

function ClassData(name, students){
    this.name=name;
    this.students=students;
}

function execute() {
    var studentData = [];
    var students = [];
    var classNumber = 0;
    var studentNumber = 0;
    var classArray = [new ClassData("Monday Class",[new StudentData("Anakin Skywalker",[1,4,3,6,1]), new StudentData("Luke Skywalker",[2,2,1,0,3])]), new ClassData("Tuesday Class",[])];
    var tab = "class";
    var chart;

function changeTabs(tabName){
      $("#classReportHeaderButton").toggleClass("backTab frontTab");
      $("#studentReportHeaderButton").toggleClass("backTab frontTab");
      tab=tabName;
      if(tabName=="student") {
        $("#classGraph").fadeOut(100);
        $("#studentGraph").fadeIn(100);
        $("#studentList").fadeIn(100);
        drawStudentChart();
      }
      else {
        $("#studentGraph").fadeOut(100);
        $("#studentList").fadeOut(100);
        $("#classGraph").fadeIn(100);
        drawChart();
      }
}

function changeClass(classId) {
    if(classNumber+"" !== classId) {
        classNumber=classId;
      for(var i = 0; i < classArray.length; i++) {
        if($("#"+i+"class").attr("class")=="selectedClass") $("#"+i+"class").toggleClass("selectedClass unselectedClass");
      }
    $("#"+classId+"class").toggleClass("selectedClass unselectedClass");
    chart.clearChart();
    drawChart();
    }
}

function changeStudent(studentId) {
    if(studentNumber+"" !== studentId) {
        studentNumber=studentId;
      for(var i = 0; i < classArray[classNumber].students.length; i++) {
        if($("#"+i+"student").attr("class")=="selectedStudent") $("#"+i+"student").toggleClass("selectedStudent unselectedStudent");
      }
    $("#"+studentId+"student").toggleClass("selectedStudent unselectedStudent");
    chart.clearChart();
    drawStudentChart();
    }
}

$("#classReportHeaderButton").on("touch",function(){changeTabs("class");});
$("#classReportHeaderButton").on("click",function(){changeTabs("class");});

$("#studentReportHeaderButton").on("touch",function(){changeTabs("student");});
$("#studentReportHeaderButton").on("click",function(){changeTabs("student");});

//Add buttons on left of screen
    for(var i = 0; i < classArray.length; i++) {
        if(i==0) $("#teacherClasses").append("<div id='0class' class='selectedClass'><p id='classText'>&nbsp &nbsp &nbsp"+classArray[i].name+"</p><div id='arrow'></div></div>");
        else $("#teacherClasses").append("<div id='"+i+"class' class='unselectedClass'><p id='classText''>&nbsp &nbsp &nbsp"+classArray[i].name+"</p><div id='arrow'></div></div>");
        $("#"+i+"class").on("click", function(){changeClass(parseInt(this.id.substring(0,this.id.length-5)));});
        $("#"+i+"class").on("touch", function(){changeClass(parseInt(this.id.substring(0,this.id.length-5)));});
    }

//Add buttons on left of screen
    for(var i = 0; i < classArray[classNumber].students.length; i++) {
        if(i==0) $("#studentList").append("<div id='0student' class='selectedStudent'><p id='studentListText'>&nbsp &nbsp &nbsp"+classArray[classNumber].students[i].name+"</p></div>");
        else $("#studentList").append("<div id='"+i+"student' class='unselectedStudent'><p id='studentListText''>&nbsp &nbsp &nbsp"+classArray[classNumber].students[i].name+"</p></div>");
        $("#"+i+"student").on("click", function(){changeStudent(parseInt(this.id.substring(0,this.id.length-7)));});
        $("#"+i+"student").on("touch", function(){changeStudent(parseInt(this.id.substring(0,this.id.length-7)));});
    }

      function drawChart() {
        var googleDataArray = [["Day"],["Monday"],["Tuesday"],["Wednesday"],["Thursday"],["Friday"]];
        for(var i = 0 ; i < googleDataArray.length; i++) {
            for(var j = 0; j < classArray[classNumber].students.length; j++) {
              if(i==0) googleDataArray[0].push(classArray[classNumber].students[j].name);
              else googleDataArray[i].push(classArray[classNumber].students[j].data[i-1]);
          }
        }

        var data = google.visualization.arrayToDataTable(googleDataArray);

        var options = {
          title: 'Student Performance',
          lineWidth: 4,
          hAxis: {title:"Day"},
          vAxis: {title:"Percent"},
          height: $("#classGraph").height(),
          width: $("#classGraph").width(),
          colors: ["#4a7baa", "#af514a", "#8fa655", "#7a6395", "#439cb1", "#d58a42", "#75aee6", "#f68880", "#bded49", "#c288d7"]
        };

        chart = new google.visualization.LineChart(document.getElementById('classGraph'));
        chart.draw(data, options);
        $("#studentGraph").fadeOut(0);
        $("#studentList").fadeOut(0);
      }

function drawGraphs(){
    //Draw line graph for class
    google.load("visualization", "1", {packages:["corechart"]});
      google.setOnLoadCallback(drawChart);
  }

  drawGraphs();

      function drawStudentChart() {
        var googleDataArray = [["Day"],["Monday"],["Tuesday"],["Wednesday"],["Thursday"],["Friday"]];
        for(var i = 0 ; i < googleDataArray.length; i++) {
            if(classArray[classNumber].students.length>0){
              if(i==0) googleDataArray[0].push(classArray[classNumber].students[studentNumber].name);
              else googleDataArray[i].push(classArray[classNumber].students[studentNumber].data[i-1]);
          }
        }

        var data = google.visualization.arrayToDataTable(googleDataArray);

        var options = {
          title: 'Student Overview',
          lineWidth: 4,
          hAxis: {title:"Day"},
          vAxis: {title:"Percent"},
          height: $("#studentGraph").height(),
          width: $("#studentGraph").width(),
          colors: ["#4a7baa", "#af514a", "#8fa655", "#7a6395", "#439cb1", "#d58a42", "#75aee6", "#f68880", "#bded49", "#c288d7"]
        };

        chart = new google.visualization.LineChart(document.getElementById('studentGraph'));
        chart.draw(data, options);

      }

function drawStudentGraphs(){
    //Draw line graph for class
    google.load("visualization", "1", {packages:["corechart"]});
      google.setOnLoadCallback(drawChart);
  }


//Ajax stuff
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

    }

}