function verifyLogin(){
  const parsedUrl = new URL(window.location.href);
  var id = parsedUrl.searchParams.get("id"); 
	var tkt = parsedUrl.searchParams.get("tkt");
	if (tkt && id){
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", webUrl + "/verify_tkt");

    xhttp.addEventListener( "load", function(event) {
        var myObj = JSON.parse(this.responseText);
        if (myObj.result == "OK"){
        } else {

        }

    } );
    xhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    xhttp.send("mode=count");

		$.post("http://127.0.0.1:9702/verify_tkt", {
            "tkt": tkt,
			"usrId": id
        }, function (data) {
			data = eval('(' + data + ')');
			if (data.result == "OK"){
				sid = data.sid;
				showUserCredits();
			}
			else{
				showNeedLogIn();
			}
		});
	}
	else{
		sid = $.cookie('sid');
		id = getUrlParam('id');
		if (sid){
			showUserCredits();
		}
		else{
			showNeedLogIn();
		}
	}
}
