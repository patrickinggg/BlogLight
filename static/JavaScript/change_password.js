window.onload = function(){
  var id = sessionStorage.getItem("id")
  var webUrl = window.location.origin;
  var blogUrl = webUrl.substring(0, webUrl.length-1) + "1";

  var myBlogs = document.getElementById("myBlogs");
  var myGallery = document.getElementById("myGallery");
  var myFollowings = document.getElementById("myFollowings");
  var myFollowers = document.getElementById("myFollowers");
  var myPoints = document.getElementById("myPoints");
  var myAccount = document.getElementById("myAccount");

  var accountSettings = document.getElementById("accountSettings");
  var avatarSetting = document.getElementById("avatarSetting");

  var inputCurrentPassword = document.getElementById("inputCurrentPassword");
  var inputNewPassword = document.getElementById("inputNewPassword");
  var confirmPassword = document.getElementById("confirmPassword");
  var changePasswordButton = document.getElementById("changePasswordButton");
  var avatar = document.getElementById('avatar');
  var thisform = document.getElementById('formUpdatePassword');
  changePasswordButton.disabled = true;
  var currentPassCheck = false;
  var newPassCheck = false;
  var confirmPassCheck = false;
  loadProfilePic();



  var DisplayUsername = new Vue({
    el: '#displayUsername',
    data: {
        username: ""
    },
    mounted: function () {
      var self = this;
      var xhttp = new XMLHttpRequest();
      xhttp.open("GET", webUrl + "/user/glance/?id="+id);

      xhttp.addEventListener( "load", function(event) {
          var myObj = JSON.parse(this.responseText);
          console.log(myObj);
          self.username = myObj.name;
      } );
      xhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');

      xhttp.send();


    }
  });

  var DisplayFollowInfo = new Vue({
    el: '#followerInfo',
    data: {
        fanCount: 0,
        followCount: 100
    },
    mounted: function () {
        var self = this;
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", blogUrl + "/blog/user/"+id+"/info");

        xhttp.addEventListener( "load", function(event) {
            var myObj = JSON.parse(this.responseText);
            console.log("followinfo "+myObj.fanCount);
            if (myObj.usrId == id) {
              self.fanCount = myObj.fanCount;
              self.followCount = myObj.followingCount;
            }
        } );
        xhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
        xhttp.send("mode=0");

    }
  });

  inputCurrentPassword.addEventListener('keyup', function(){
    if (inputCurrentPassword.value.length > 0){
      currentPassCheck = true;
    } else {
      currentPassCheck = false;
    }

    if (currentPassCheck & newPassCheck & confirmPassCheck){
      changePasswordButton.disabled = false;
    } else {
      changePasswordButton.disabled = true;
    }
  });

  inputNewPassword.addEventListener('keyup', function(){
    if (inputNewPassword.value.length > 15 || inputNewPassword.value.length < 8){
      newPassCheck = false;
      var str = "Password should be between 8 and 15 characters";
      var result = str.fontcolor("red");
      document.getElementById("passwordHint").innerHTML = result ;
      document.getElementById("passwordHint").style.display = "block";
    } else {
      newPassCheck = true;
      document.getElementById("passwordHint").style.display = "none";
    }

    if (confirmPassword.value.length != 0) {
      if (inputNewPassword.value != confirmPassword.value){
        confirmPassCheck = false;
        var str = "Confirm password must match with the previous password";
        var result = str.fontcolor("red");
        document.getElementById("confirmPasswordHint").innerHTML = result;
        document.getElementById("confirmPasswordHint").style.display = "block";
      } else {
        confirmPassCheck = true;
        document.getElementById("confirmPasswordHint").style.display = "none";
      }
    }


    if (currentPassCheck & newPassCheck & confirmPassCheck){
      changePasswordButton.disabled = false;
    } else {
      changePasswordButton.disabled = true;
    }
  });

  confirmPassword.addEventListener('keyup',function(){
    if (inputNewPassword.value != confirmPassword.value){
      confirmPassCheck = false;
      var str = "Confirm password must match with the previous password";
      var result = str.fontcolor("red");
      document.getElementById("confirmPasswordHint").innerHTML = result;
      document.getElementById("confirmPasswordHint").style.display = "block";
    } else {
      confirmPassCheck = true;
      document.getElementById("confirmPasswordHint").style.display = "none";
    }

    if (currentPassCheck & newPassCheck & confirmPassCheck){
      changePasswordButton.disabled = false;
    } else {
      changePasswordButton.disabled = true;
    }
  });


  accountSettings.addEventListener('click', function(){
    window.location.replace(webUrl+"/my_account/id=" + id);
  });

  avatarSetting.addEventListener('click', function(){
    window.location.replace(blogUrl+"/blog/change_avatar/id=" + id);
  });

  thisform.addEventListener( "submit", function ( event ) {
    event.preventDefault();
    // event.stopPropagation();
    const form = document.getElementById( "formUpdatePassword" );

    sendform(form);

  } );


  myBlogs.addEventListener('click',function(){
    window.location.replace(blogUrl+"/blog/user?id=" + id);
  });

  myGallery.addEventListener('click', function(){
    window.location.replace(blogUrl+"/blog/gallery/id="+id);
  });
  myFollowers.addEventListener('click', function(){
    window.location.replace(blogUrl+"/blog/followers/id="+id);
  });
  myFollowings.addEventListener('click', function(){
    window.location.replace(blogUrl+"/blog/followings/id="+id);
  });
  // var myGallery = document.getElementById("myGallery");
  // var myFollowing = document.getElementById("myFollowings");
  // var myFollowers = document.getElementById("myFollowers");
  // var myPoints = document.getElementById("myPoints");
  // var myAccount = document.getElementById("myAccount");


  function sendform(form) {
    var xhttp = new XMLHttpRequest();

    var FD = new FormData( form );

    xhttp.open("POST", webUrl +"/user/update");

    xhttp.addEventListener( "load", function(event) {
      // alert( event.target.responseText );
      var myObj = JSON.parse(event.target.responseText);
      if (myObj.result == "OK") {
        alert("Success");
        window.location.reload();
      } else if (myObj.result == "NOT_MATCH"){
        alert("Current password and your input don't match.");
      } else {
        alert("Failed");
      }

    } );
    xhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');

    xhttp.send("oldPwd="+FD.get("oldPwd")+"&newPwd=" +FD.get("newPwd")+"&id=" +id + "&mode=1");
  }
  function loadProfilePic(){
    var xhttp = new XMLHttpRequest();

    xhttp.open("POST", blogUrl +"/blog/getavatar");

    xhttp.addEventListener( "load", function(event) {
      var myObj = JSON.parse(event.target.responseText);
      if (myObj.result == "OK"){
        var imageObj = JSON.parse(event.target.responseText);
        var base64 = arrayBufferToBase64(imageObj.img.img.data);
        imagesrc = "data:image/"+imgType(imageObj.img.imgtype)+";base64,"+base64;
        avatar.setAttribute('src', imagesrc);
      } else if (myObj.result == "NOAVATAR"){
        avatar.setAttribute('src', "http://localhost:9700/static/image/avatar.png");
      } else {
        alert("failed");
      }

    } );
    xhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');

    xhttp.send("usrId=" +id);
  }
  // function loadProfilePic(){
  //   var xhttp = new XMLHttpRequest();
  //
  //   xhttp.open("POST", blogUrl +"/blog/getAvatar");
  //
  //   xhttp.addEventListener( "load", function(event) {
  //
  //     var myObj = JSON.parse(event.target.responseText);
  //     if (myObj.collection.length == 0){
  //       avatar.setAttribute('src', "http://localhost:9700/static/image/avatar.png");
  //       noProfilePic = true;
  //     } else {
  //       profilePicId = myObj.collection[0].imgid;
  //       var avatarhttp = new XMLHttpRequest();
  //       avatarhttp.open("POST", blogUrl +"/img_get");
  //       avatarhttp.addEventListener( "load", function(event) {
  //         var imageObj = JSON.parse(event.target.responseText);
  //         console.log(imageObj);
  //         var base64 = arrayBufferToBase64(imageObj.image.img.data);
  //         imagesrc = "data:image/"+imgType(imageObj.image.imgtype)+";base64,"+base64;
  //         avatar.setAttribute('src', imagesrc);
  //
  //       });
  //       avatarhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
  //       avatarhttp.send("imgId=" +myObj.collection[0].imgid);
  //
  //     }
  //
  //   } );
  //   xhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
  //
  //   xhttp.send("usrId=" +id);
  // }

  function imgType(type){
    if (type == 0){
      return "jpg";
    } else if (type == 1){
      return "png";
    } else {
      return "gif"
    }
  }

  function arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
  }
  var logoutButton = document.getElementById("logout");
  logoutButton.addEventListener('click', function(){
    $.removeCookie('sid', { path: '/' });
    sessionStorage.removeItem('id');
    window.location.replace(webUrl+"/home");
  });
};
