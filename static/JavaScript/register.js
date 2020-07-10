window.onload = function(){
  var webUrl = "http://localhost:9700/"
  var pwdCheck = false;
  var confirmPwdCheck = false;
  var usernameLengthCheck = false;
  var usernameFormatCheck = false;

  var pwd = document.getElementById("inputPassword");
  var confirmPwd = document.getElementById("confirmPassword");
  var submit_button = document.getElementById("registerSubmit")
  var emailadd = document.getElementById("inputEmail");
  submit_button.disabled = false;

  pwd.addEventListener('keyup', function(){
    if (pwd.value.length > 15 || pwd.value.length < 8){
      pwdCheck = false;
      var str = "Password should be between 8 and 15 characters";
      var result = str.fontcolor("red");
      document.getElementById("passwordHint").innerHTML = result ;
      document.getElementById("passwordHint").style.display = "block";
    } else {
      pwdCheck = true;
      document.getElementById("passwordHint").style.display = "none";
    }

    if (pwd.value != confirmPwd.value && confirmPwd.value.length > 0){
      confirmPwdCheck = false;
    } else {
      confirmPwdCheck = true;
    }

    if (pwdCheck && confirmPwdCheck && usernameLengthCheck && usernameFormatCheck){
      submit_button.disabled = false;
    } else {
      submit_button.disabled = true;
    }

  });

  confirmPwd.addEventListener('keyup', function(){

      if (pwd.value != confirmPwd.value){
        confirmPwdCheck = false;
        var str = "Confirm password must match with the previous password.";
        var result = str.fontcolor("red");
        document.getElementById("confirmPwdHint").innerHTML = result ;
        document.getElementById("confirmPwdHint").style.display = "block";
        // document.getElementById("confirmPwdHint").style.display = "block";
        // document.getElementById("confirmPwdHint").innerHTML = ;
      } else {
        confirmPwdCheck = true;
        document.getElementById("confirmPwdHint").style.display = "none";
      }

      if (pwdCheck && confirmPwdCheck && usernameLengthCheck && usernameFormatCheck){
        submit_button.disabled = false;
      } else {
        submit_button.disabled = true;
      }
  });

  var username = document.getElementById("inputUsername");
  username.addEventListener('keyup', function(){
      console.log(username.value.length );

      if (username.value.length < 6 || username.value.length > 15){
        usernameLengthCheck = false;
        var str = "Username must be between 6 and 15 characters.";
        var result = str.fontcolor("red");
        document.getElementById("usernameHint").innerHTML = result ;
        document.getElementById("usernameHint").style.display = "block";
      } else {
        usernameLengthCheck = true;
      }

      if (!checkUsername(username.value)){
        usernameFormatCheck = false;
        console.log("wrong format");
        var str = "Only digits, letters and underscore allowed.";
        var result = str.fontcolor("red");
        document.getElementById("usernameHint").innerHTML = result ;
        document.getElementById("usernameHint").style.display = "block";
      } else {
        usernameFormatCheck = true;
      }

      if (usernameLengthCheck && usernameFormatCheck) {
        document.getElementById("usernameHint").style.display = "none";
      }

      if (pwdCheck && confirmPwdCheck && usernameLengthCheck && usernameFormatCheck){
        submit_button.disabled = false;
      } else {
        submit_button.disabled = true;
      }
  });



  function checkUsername(str){
      // numbers, letters or underscore
      var re = /^[a-zA-Z0-9_]+$/;
      return str.match(re);
  }

  const parsedUrl = new URL(window.location.href);
  var email_parsed =  parsedUrl.searchParams.get("email"); // "email"
  var message_parsed =  parsedUrl.searchParams.get("message"); // "message"

  if (email_parsed && message_parsed){
    usernameFormatCheck = true;

    emailadd.value = email_parsed;
    var str = message_parsed;
    var result = str.fontcolor("red");
    document.getElementById('emailHint').innerHTML = result;
    document.getElementById('emailHint').style.display = "block";


  }

  function sendform(form) {
    var xhttp = new XMLHttpRequest();


    var FD = new FormData( form );
    console.log(FD.get("pwd"));
    console.log(FD.get("usr"));
    console.log(FD.get("email"));

    console.log(FD.values())

    xhttp.open("POST", "/signup");

    xhttp.addEventListener( "load", function(event) {
      // alert( event.target.responseText );
      var myObj = JSON.parse(event.target.responseText);
      if (myObj.result == "OK") {
        window.location.replace(webUrl+"register_complete");
      } else if (myObj.result == "OCCUPIED"){
        window.location.replace(webUrl+"register?email="+myObj.email+"&message=The email address has already been used. Please use another one.");
      } else if (myObj.result == "INVALID"){
        window.location.replace(webUrl+"register");
      }

    } );
    xhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');

    xhttp.send("usr="+FD.get("usr")+"&email=" +FD.get("email") + "&pwd="+ FD.get("pwd"));
  }
  const thisform = document.getElementById( "formSignup" );

  thisform.addEventListener( "submit", function ( event ) {
    event.preventDefault();
    // event.stopPropagation();
    const form = document.getElementById( "formSignup" );

    sendform(form);

  } );




};
