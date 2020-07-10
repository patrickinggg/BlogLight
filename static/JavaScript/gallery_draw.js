window.onload = function(){
  var blogUrl = window.location.origin;
  var webUrl = blogUrl.substring(0, blogUrl.length-1) + "0";
  const parsedUrl = (window.location.pathname).split('/');
  var id = sessionStorage.getItem("id");


  var mycanvas = document.getElementById("mycanvas");
  var ctx = mycanvas.getContext("2d");
  var clic = false;
  var xCoord, yCoord = "";
  var undo_list = [];
  var stroke_coords = [];
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 20;
  ctx.lineCap = "round";
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, mycanvas.width, mycanvas.height);

  var red = document.getElementById("red");
  var green = document.getElementById("green");
  var blue = document.getElementById("blue");
  var yellow = document.getElementById("yellow");
  var black = document.getElementById("black");
  var orange = document.getElementById("orange");
  var pink = document.getElementById("pink");
  var purple = document.getElementById("purple");

  var goBackToGallery = document.getElementById('goBackToGallery');
  var submitButton = document.getElementById('submitButton');
  var title = document.getElementById('blogTitle');
  var picContent = document.getElementById('picContent');
  var permit = document.getElementById('permit');

  var initialImage = ctx.getImageData(0, 0, mycanvas.width, mycanvas.height);
  undo_list.push(initialImage);

  submitButton.addEventListener('click', function(event){
    if (undo_list.length == 1){
      alert("Nothing on the canvas");
    } else {
      event.preventDefault();

      const form = document.getElementById( "formSubmitImage" );
      submitAll(form);
    }

  });

  mycanvas.addEventListener('mousedown', function(canvas){
    ctx.globalAlpha = 1.0;
    console.log(xCoord)

    clic = true;
    ctx.save();
    xCoord = canvas.pageX - this.offsetLeft;
    yCoord = canvas.pageY - this.offsetTop;
  });

  mycanvas.addEventListener('mouseup', function(canvas){
    var imgData = ctx.getImageData(0, 0, mycanvas.width, mycanvas.height);
    undo_list.push(imgData);
    stroke_coords = [];
    clic = false;
  });

  mycanvas.addEventListener('click', function(canvas){
    console.log(xCoord);

    clic = false;
  });

  mycanvas.addEventListener('mousemove', function(canvas){
    if(clic == true){
        ctx.beginPath();
        ctx.moveTo(canvas.pageX - this.offsetLeft, canvas.pageY - this.offsetTop);
        ctx.lineTo(xCoord, yCoord);
        ctx.stroke();
        ctx.closePath();
        xCoord = canvas.pageX - this.offsetLeft;
        yCoord = canvas.pageY - this.offsetTop
    }
  });

  red.addEventListener('click', function(canvas){
    ctx.strokeStyle = "#FF0000";
  });

  green.addEventListener('click', function(canvas){
    ctx.strokeStyle = "green";
  });

  blue.addEventListener('click', function(canvas){
    ctx.strokeStyle = "blue";
  });

  pink.addEventListener('click', function(canvas){
    ctx.strokeStyle = "pink";
  });

  orange.addEventListener('click', function(canvas){
    ctx.strokeStyle = "orange";
  });

  black.addEventListener('click', function(canvas){
    ctx.strokeStyle = "black";
  });

  purple.addEventListener('click', function(canvas){
    ctx.strokeStyle = "purple";
  });

  yellow.addEventListener('click', function(canvas){
    ctx.strokeStyle = "yellow";
  });

  goBackToGallery.addEventListener('click', function(canvas){
    window.location.replace(blogUrl+"/blog/gallery/id="+id);
  });

  document.getElementById("undo").onclick = function() {undoFunction()};
  function undoFunction() {

    if(undo_list.length == 1){
      alert("Nothing to undo.")
    } else {
      undo_list.pop();
      var restore_state = undo_list[undo_list.length - 1];
      ctx.putImageData(restore_state, 0, 0);
    }


  }

  document.getElementById("clear").onclick = function() {clearFunction()};
  function clearFunction() {
    if (undo_list.length == 1){
      alert("Nothing to clear");
    } else {
      var restore_state = undo_list[0];
      undo_list = [];
      undo_list.push(restore_state);
      ctx.putImageData(restore_state, 0, 0);
    }
  }

  function submitAll(form){
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", blogUrl + "/blog/user/"+id+"/newpic");

    xhttp.addEventListener( "load", function(event) {

        var myObj = JSON.parse(this.responseText);
        if (myObj.result == "OK"){ //getting picId(artId) and rowId;
          sendImage(myObj.picId, myObj.rowId, form);
        } else {
          alert("error in getting pic id")
        }

    } );

    xhttp.send();
  }

  function sendImage(picId, rowId ,form){

    var xhttp = new XMLHttpRequest();
    var formData = new FormData();
    var imagebase64 = mycanvas.toDataURL('image/jpeg', 0.9);
    var imagebase64 = imagebase64.replace(/\+/g, "-");
    var imagebase64 = imagebase64.replace(/\//g, "_");

    xhttp.open("POST", blogUrl +"/img_uploadbase64");
    xhttp.addEventListener( "load", function(event) {
      var myObj = JSON.parse(event.target.responseText);
      if (myObj.result == "OK") {
        console.log(myObj);
        sendContent(rowId, picId, myObj.imgId, form);
      } else {
        alert("failed");
      }
    });
    xhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    console.log(mycanvas.toDataURL('image/jpeg',1.0));
    xhttp.send("artId="+picId +"&domain=art"+"&base64="+imagebase64);
  }

  function sendContent(rowId, picId, imgId, form){
    var PREVFORM = new FormData(form);
    var xhttp = new XMLHttpRequest();
    var formData = new FormData();
    formData.append("rowId", rowId);
    formData.append("picId", picId);
    formData.append("picTitle", PREVFORM.get("title"));
    formData.append("picContent", PREVFORM.get("picContent"));
    formData.append("imgId", imgId);
    formData.append("permit", PREVFORM.get("permit"));

    xhttp.open("POST", blogUrl +"/blog/user/"+id+"/savepic");
    xhttp.addEventListener( "load", function(event) {
      var myObj = JSON.parse(event.target.responseText);
      if (myObj.result == "OK") {
        console.log(myObj);
        window.location.replace(blogUrl+"/blog/gallery_view/"+myObj.picId);
      } else {
        alert("failed");
      }
    });
    xhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    xhttp.send("rowId="+rowId+"&picId="+picId+"&picTitle="+ PREVFORM.get("title")+"&picContent="+PREVFORM.get("picContent") +"&imgId="+imgId+
         "&permit="+ PREVFORM.get("permit"));
  }

  var logoutButton = document.getElementById("logout");
  logoutButton.addEventListener('click', function(){
    $.removeCookie('sid', { path: '/' });
    sessionStorage.removeItem('id');
    window.location.replace(webUrl+"/home");
  });



};
