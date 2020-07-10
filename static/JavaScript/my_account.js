window.onload = function(){
  var webUrl = window.location.origin;
  var blogUrl = webUrl.substring(0, webUrl.length-1) + "1";
  const parsedUrl = (window.location.pathname).split('/');
  const id = parsedUrl[parsedUrl.length-1].split('=')[1]
  console.log("id is " + id);
  sessionStorage.setItem("id", id);


  var myBlogs = document.getElementById("myBlogs");
  var myGallery = document.getElementById("myGallery");
  var myFollowings = document.getElementById("myFollowings");
  var myFollowers = document.getElementById("myFollowers");
  var myPoints = document.getElementById("myPoints");
  var myAccount = document.getElementById("myAccount");

  var usernamebox = document.getElementById('inputUsername');
  var emailbox = document.getElementById('inputEmail');
  const thisform = document.getElementById( "formUpdate" );
  var user_avatar = document.getElementById('avatar');
  var passwordSetting = document.getElementById('passwordSetting');
  var avatarSetting = document.getElementById('avatarSetting');

  var avatar = document.getElementById('avatar');
  var noProfilePic = false;
  var profilePicId = "";
  loadInfo();
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
        xhttp.credentials = true;

        xhttp.send("mode=0");

    }
  });



    thisform.addEventListener( "submit", function ( event ) {
      event.preventDefault();
      // event.stopPropagation();
      const form = document.getElementById( "formUpdate" );

      sendform(form);

    } );


    avatarSetting.addEventListener('click', function(){
      window.location.replace(blogUrl+"/blog/change_avatar/id="+id);
    });

    passwordSetting.addEventListener('click', function(){
      window.location.replace(webUrl+"/change_password/id="+id);
    });

    function loadInfo(){
      var xhttp = new XMLHttpRequest();
      xhttp.open("POST", webUrl + "/user/info");

      xhttp.addEventListener( "load", function(event) {
          var myObj = JSON.parse(this.responseText);
          usernamebox.value = myObj.name;
          emailbox.value = myObj.email;
      } );
      xhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
      xhttp.send("id="+id);
    }

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
    function sendform(form) {
      var xhttp = new XMLHttpRequest();

      var FD = new FormData( form );

      xhttp.open("POST", webUrl +"/user/update");

      xhttp.addEventListener( "load", function(event) {
        // alert( event.target.responseText );
        var myObj = JSON.parse(event.target.responseText);
        if (myObj.result == "OK") {
          alert("success");
          window.location.reload();
        } else {
          alert("failed");
        }

      } );
      xhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');

      xhttp.send("name="+FD.get("usr")+"&id=" +id + "&mode=0");
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
          profile_pic.setAttribute('src', imagesrc);

        } else if (myObj.result == "NOAVATAR"){
          avatar.setAttribute('src', "http://localhost:9700/static/image/avatar.png");
          profile_pic.setAttribute('src', "http://localhost:9700/static/image/avatar.png");

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
    //         profile_pic.setAttribute('src', imagesrc);
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
