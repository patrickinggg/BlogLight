window.onload = function(){
  var blogUrl = window.location.origin;
  var webUrl = blogUrl.substring(0, blogUrl.length-1) + "0";
  const parsedUrl = (window.location.pathname).split('/');
  const endStr = parsedUrl[parsedUrl.length-1].split("&");
  const id = endStr[0].split('=')[1];
  const homeId = endStr[1].split('=')[1];
  console.log("id is " + id);
  sessionStorage.setItem("view_id", id);
  sessionStorage.setItem("homeId", homeId);

  var friendsBlog = document.getElementById("friendsBlog");
  var followButton = document.getElementById('follow');

  var avatar = document.getElementById('avatar');
  var goBackToMain = document.getElementById('goBackToMain');
  var ifFollowing = false;
  var totalImage = "";
  loadProfilePic();
  getImageCount();
  checkFollow();

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
        fanCount: "",
        followCount: ""
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

  var Gallery = new Vue({
    el: '#theContainer',
    data: {
      images:[],
      pagenumber:0
    },
    mounted: function() {
      this.getImages();
    },
    methods: {
      uploadImage: function(){
        window.location.replace(blogUrl+"/blog/gallery_upload/id="+id);
      },
      drawImage: function(){
        window.location.replace(blogUrl+"/blog/gallery_draw/id="+id);
      },
      pagePrevious: function(){
        if (this.pagenumber == 0){
          alert("This is the first page.");
        } else {
          this.pagenumber -= 1;
        }
        this.getImages();
      },
      pageNext: function(){
        if (this.pagenumber < Math.ceil(totalImage / 6) - 1) {
          this.pagenumber +=1;
        } else {
          console.log("ceil = " +totalImage );

          alert("This is the last page.");
        }
        this.getImages();
      },
      getImages: function(){
        var self = this;
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", blogUrl + "/blog/user/"+id+"/piclist");

        xhttp.addEventListener( "load", function(event) {
            var displayList = JSON.parse(this.responseText).articles;
            console.log(this.responseText);
            for (var item in displayList){
              (function (_item) {
                var imagelink =  displayList[item].artid;
                imagelink = blogUrl + "/blog/view_friends_gallery/" + imagelink;
                displayList[item].artid = imagelink;

                var imghttp = new XMLHttpRequest();
                imghttp.open("POST", blogUrl + "/img_get");
                imghttp.addEventListener( "load", function(event) {
                  var imageObj = JSON.parse(event.target.responseText);
                  var imagesrc = "";
                  if (imageObj.image.imgtype == 3){
                    var imagebase64 = imageObj.image.img;
                    var imagebase64 = imagebase64.replace(/\-/g, "+");
                    var imagebase64 = imagebase64.replace(/\_/g, "/");
                    imagesrc = imagebase64;

                  } else {
                    var base64 = arrayBufferToBase64(imageObj.image.img.data);
                    imagesrc = "data:image/"+imgType(imageObj.image.imgtype) + ";base64,"+base64;
                  }
                  displayList[_item].content = imagesrc;
                });
                imghttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
                imghttp.send("imgId=" + displayList[item].content);
              }(item));

            }
            self.images = displayList;
            console.log(this.responseText);
            console.log(displayList);

        } );
        xhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
        xhttp.send("mode=page&page="+this.pagenumber+"&size=6");
      }
    }
  });

  friendsBlog.addEventListener('click',function(){
    window.location.replace(blogUrl+"/blog/friends_blog_page/id="+id+"&homeId="+homeId);
  });

  goBackToMain.addEventListener('click', function(){
    window.location.replace(blogUrl+"/blog/user?id=" + homeId);
  });

  followButton.addEventListener('click', function(){
    if (!ifFollowing) {
      follow();
    } else {
      unfollow();
    }

  });

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
  //   xhttp.open("POST", blogUrl +"/img_collection");
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
  //   xhttp.send("domain=avatar&usrId=" +id);
  // }

  function getImageCount(){
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", blogUrl + "/blog/user/"+id+"/piclist");

    xhttp.addEventListener( "load", function(event) {
        var myObj = JSON.parse(this.responseText);
        totalImage = myObj.count;
        console.log("the count is=" + myObj.count);

    } );
    xhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    xhttp.send("mode=count");
  }

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

  function checkFollow(){
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", blogUrl +"/blog/checkfollow");
    xhttp.addEventListener( "load", function(event) {
        var myObj = JSON.parse(this.responseText);
        if (myObj.result == "EXIST"){
          ifFollowing = true;
          followButton.style.color = "#e34d17";
          followButton.innerHTML = "Unfollow";
        } else if (myObj.result == "NOTEXIST"){
          ifFollowing = false;
          followButton.style.color = "#2d72eb";
          followButton.innerHTML = "Follow";
        }

    } );
    xhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    xhttp.send("fromId="+homeId+"&toId="+id);
  }

  function follow(){
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", blogUrl +"/blog/follow");
    xhttp.addEventListener( "load", function(event) {
        var myObj = JSON.parse(this.responseText);
        if (myObj.result == "EXIST"){
          ifFollowing = !ifFollowing;
          followButton.style.color = "#e34d17";
          followButton.innerHTML = "Unfollow";
        } else if (myObj.result == "OK"){
          ifFollowing = !ifFollowing;
          followButton.style.color = "#e34d17";
          followButton.innerHTML = "Unfollow";
        } else {
          alert("failed")
        }

    } );
    xhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    xhttp.send("fromId="+homeId+"&toId="+id);
  }

  function unfollow(){
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", blogUrl +"/blog/unfollow");
    xhttp.addEventListener( "load", function(event) {
        var myObj = JSON.parse(this.responseText);
        if (myObj.result == "OK"){

          ifFollowing = false;
          followButton.style.color = "#2d72eb";
          followButton.innerHTML = "Follow";
        } else {
          alert("failed")
        }
    } );
    xhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    xhttp.send("fromId="+homeId+"&toId="+id);
  }
  var logoutButton = document.getElementById("logout");
  logoutButton.addEventListener('click', function(){
    $.removeCookie('sid', { path: '/' });
    sessionStorage.removeItem('id');
    window.location.replace(webUrl+"/home");
  });


};
