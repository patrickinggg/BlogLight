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
  submit_button.disabled = true;

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
        document.getElementById("confirmPwdHint").style.display = "block";
        document.getElementById("confirmPwdHint").innerHTML = "Confirm password must match with the previous password.";
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
  var username_parsed = parsedUrl.searchParams.get("a"); // "username"
  var email_parsed =  parsedUrl.searchParams.get("b"); // "email"
  var message_parsed =  parsedUrl.searchParams.get("message"); // "email"

  if (username && email_parsed && message_parsed){
    usernameLengthCheck = true;
    usernameFormatCheck = true;

    username.value = username_parsed;
    emailadd.value = email_parsed;
    var str = message_parsed;
    var result = str.fontcolor("red");
    document.getElementById('emailHint').innerHTML = result;
    document.getElementById('emailHint').style.display = "block";


  }

  function sendform() {

    const thisform = document.getElementById( "formSignup" );

    const FD = new FormData( thisform );

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var myObj = JSON.parse(this.responseText);
          alert(this.responseText);
        }
    };

    xhttp.open("POST", webUrl + "signup", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(FD);
    console.log(FD)

  }
  const form = document.getElementById( "formSignup" );

  form.addEventListener( "submit", function ( event ) {
    event.preventDefault();
    event.stopPropagation();

    sendform();

  } );


  // function sendData() {
  //   const form = document.getElementById( "myForm" );
  //
  //   const XHR = new XMLHttpRequest();
  //
  //   const FD = new FormData( form );
  //
  //   // Define what happens on successful data submission
  //   XHR.addEventListener( "load", function(event) {
  //     alert( event.target.responseText );
  //   } );
  //
  //   // Define what happens in case of error
  //   XHR.addEventListener( "error", function( event ) {
  //     alert( 'Oops! Something went wrong.' );
  //   } );
  //
  //   // Set up our request
  //   XHR.open( "POST", "https://example.com/cors.php" );
  //
  //   // The data sent is what the user provided in the form
  //   XHR.send( FD );
  // }
  //


};
