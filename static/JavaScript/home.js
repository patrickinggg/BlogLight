window.onload = function(){

  var email = document.getElementById("inputEmail");
  var pwd = document.getElementById("inputPassword");
  var passhint = document.getElementById("passwordHint");
  var webUrl = window.location.origin;
  var blogUrl = webUrl.substring(0, webUrl.length-1) + "1";

  const parsedUrl = new URL(window.location.href);
  var from =  parsedUrl.searchParams.get("from"); // "from"
  if (from == null) {
    from = "blog";
  }
  console.log(from);

  console.log(from == null);

  function sendform(form) {
    var xhttp = new XMLHttpRequest();


    var FD = new FormData( form );
    console.log(FD.get("pwd"));
    console.log(FD.get("email"));


    xhttp.open("POST", "/signin");

    xhttp.addEventListener( "load", function(event) {
        var myObj = JSON.parse(this.responseText);
        console.log(myObj);
        if (myObj.result == "OK") {
          if (myObj.to == "blog"){
            sessionStorage.setItem("id", myObj.id);
            window.location.replace(blogUrl+"/blog/user?id="+myObj.id+"&tkt="+myObj.ticket);
          } else if (myObj.to == "shop"){
            sessionStorage.setItem("id", myObj.id);
            window.location.replace("http://127.0.0.1:9702/shop?tkt="+myObj.ticket+"&id="+myObj.id);
          }
        } else if (myObj.result == "FAILED"){
          passhint.style.display = "block";
          var str = "Email and password don't match.";
          var result = str.fontcolor("red");
          passhint.innerHTML = result;
        } else if (myObj.result == "INVALID"){
          alert("invalid")
        }


    } );
    xhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');

    xhttp.send("email=" +FD.get("email") + "&pwd="+ FD.get("pwd")+"&from="+from);
  }
  const thisform = document.getElementById( "formSignin" );

  thisform.addEventListener( "submit", function ( event ) {
    event.preventDefault();
    event.stopPropagation();
    const form = document.getElementById( "formSignin" );

    sendform(form);

  } );

  pwd.addEventListener('keyup', function(){
    passhint.style.display = "none";
  })
  email.addEventListener('keyup', function(){
    passhint.style.display = "none";
  })

};
