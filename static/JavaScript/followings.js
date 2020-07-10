window.onload = function(){
  var blogUrl = window.location.origin;
  var webUrl = blogUrl.substring(0, blogUrl.length-1) + "0";
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

  var avatar = document.getElementById('avatar');
  var inputEmail= document.getElementById('inputEmail');

  var totolFollowers = "";
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
        fanCount: "",
        followCount: ""
    },
    mounted: function () {
        var self = this;
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", blogUrl + "/blog/user/"+id+"/info");

        xhttp.addEventListener( "load", function(event) {
            var myObj = JSON.parse(this.responseText);
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
      users:[],
      title: "Your followings",
      pagenumber:0,
      email: ""
    },
    mounted: function() {
      this.loadfollowers();
    },
    methods: {
      finduser: function(event){
        event.preventDefault();
        this.getUser();
      },

      pagePrevious: function(){
        if (this.pagenumber == 0){
          alert("This is the first page.");
        } else {
          this.pagenumber -= 1;
        }
        this.loadfollowers();
      },
      pageNext: function(){
        if (this.pagenumber < Math.ceil(totalFolllowers / 6) - 1) {
          this.pagenumber +=1;
        } else {
          console.log("ceil = " +totalFolllowers );

          alert("This is the last page.");
        }
        this.loadfollowers();
      },
      getUser: function(){
        var self = this;
        if (this.email.length == 0){
          alert("Please input user email");
        } else {
          var xhttp = new XMLHttpRequest();
          xhttp.open("GET", webUrl +"/user/glance_email/?email="+this.email);
          xhttp.addEventListener( "load", function(event) {
            var mySearchObj = JSON.parse(event.target.responseText);
            if (mySearchObj.result == "FAILED"){
              alert("User doesn't exist.");
            } else {
              var imgxhttp = new XMLHttpRequest();
              imgxhttp.open("POST", blogUrl +"/img_collection");

              imgxhttp.addEventListener( "load", function(event) {

                var myObj = JSON.parse(event.target.responseText);
                console.log(myObj);
                if (myObj.collection.length == 0){
                  var resultObj = {
                    image: "http://127.0.0.1:9700/static/image/avatar.png",
                    followername : mySearchObj.name,
                    link: "http://127.0.0.1:9701/blog/friends_blog_page/id="+ mySearchObj.id +"&homeId="+id
                  }
                  var result= [];
                  result.push(resultObj);
                  self.users = result;
                } else {
                  var avatarhttp = new XMLHttpRequest();
                  avatarhttp.open("POST", blogUrl +"/img_get");
                  avatarhttp.addEventListener( "load", function(event) {
                    var imageObj = JSON.parse(event.target.responseText);
                    console.log(imageObj);
                    var base64 = arrayBufferToBase64(imageObj.image.img.data);
                    imagesrc = "data:image/"+imgType(imageObj.image.imgtype)+";base64,"+base64;
                    var resultObj = {
                      image: imagesrc,
                      followername : mySearchObj.name,
                      link: "http://127.0.0.1:9701/blog/friends_blog_page/id="+ mySearchObj.id+"&homeId="+id

                    }
                    var result= [];
                    result.push(resultObj);
                    self.users = result;
                  });
                  avatarhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
                  avatarhttp.send("imgId=" +myObj.collection[0].imgid);
                }
              } );
            }

            imgxhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');

            imgxhttp.send("domain=avatar&usrId=" +mySearchObj.id);
          });
          // xhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');

          xhttp.send();
        }



      },
      TheEmail: function(){
        email = this.email
      },
      loadfollowers: function(){
        var self = this;
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", blogUrl + "/blog/user/"+id+"/info");
        xhttp.addEventListener( "load", function(event) {
            var listObj = JSON.parse(this.responseText).list;
            totalFolllowers = listObj.length;
            var result = []
            for (var obj in listObj){
              (function (_obj) {
                var getimghttp = new XMLHttpRequest();
                getimghttp.open("POST", blogUrl +"/img_collection");
                getimghttp.addEventListener("load", function(event){
                  var imgObj = JSON.parse(event.target.responseText);
                  console.log("imgobj");
                  console.log(imgObj);
                  var getnamehttp = new XMLHttpRequest();
                  getnamehttp.open("GET", webUrl +"/user/glance/?id="+listObj[_obj].upid);
                  getnamehttp.addEventListener("load", function(event){
                    var nameObj = JSON.parse(event.target.responseText);
                    if (imgObj.collection.length == 0){
                      var resultObj = {
                        image: webUrl+"/static/image/avatar.png",
                        followername : nameObj.name,
                        link: blogUrl+"/blog/friends_blog_page/id="+ listObj[_obj].upid +"&homeId="+id
                      }
                      result.push(resultObj);
                    } else {
                      var avatarhttp = new XMLHttpRequest();
                      avatarhttp.open("POST", blogUrl +"/img_get");
                      avatarhttp.addEventListener( "load", function(event) {
                        var avatarObj = JSON.parse(event.target.responseText);
                        var base64 = arrayBufferToBase64(avatarObj.image.img.data);
                        imagesrc = "data:image/"+imgType(avatarObj.image.imgtype)+";base64,"+base64;
                        var resultObj = {
                          image: imagesrc,
                          followername : nameObj.name,
                          link: blogUrl+"/blog/friends_blog_page/id="+  listObj[_obj].upid +"&homeId="+id
                        }
                        result.push(resultObj);
                      });
                      avatarhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
                      avatarhttp.send("imgId=" +imgObj.collection[0].imgid);
                    }
                  });
                  getnamehttp.send();
                });
                getimghttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
                getimghttp.send("domain=avatar&usrId=" +listObj[_obj].upid);
              }(obj));
            }
            self.users = result;
            console.log("result");
            console.log(result);
        } );
        xhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
        xhttp.send("mode=1&pageSize=8&pageIndex="+self.pagenumber);

      }
    }
  });




  myAccount.addEventListener('click', function(){
    window.location.replace(webUrl+"/my_account/id="+id);
  });

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


  function loadProfilePic(){
    var xhttp = new XMLHttpRequest();

    xhttp.open("POST", blogUrl +"/img_collection");

    xhttp.addEventListener( "load", function(event) {

      var myObj = JSON.parse(event.target.responseText);
      if (myObj.collection.length == 0){
        avatar.setAttribute('src', "http://localhost:9700/static/image/avatar.png");
        noProfilePic = true;
      } else {
        profilePicId = myObj.collection[0].imgid;
        var avatarhttp = new XMLHttpRequest();
        avatarhttp.open("POST", blogUrl +"/img_get");
        avatarhttp.addEventListener( "load", function(event) {
          var imageObj = JSON.parse(event.target.responseText);
          console.log(imageObj);
          var base64 = arrayBufferToBase64(imageObj.image.img.data);
          imagesrc = "data:image/"+imgType(imageObj.image.imgtype)+";base64,"+base64;
          avatar.setAttribute('src', imagesrc);

        });
        avatarhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
        avatarhttp.send("imgId=" +myObj.collection[0].imgid);

      }

    } );
    xhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');

    xhttp.send("domain=avatar&usrId=" +id);
  }

  // function getImageCount(){
  //   var xhttp = new XMLHttpRequest();
  //   xhttp.open("POST", blogUrl + "/blog/user/"+id+"/piclist");
  //
  //   xhttp.addEventListener( "load", function(event) {
  //       var myObj = JSON.parse(this.responseText);
  //       totalImage = myObj.count;
  //
  //   } );
  //   xhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
  //   xhttp.send("mode=count");
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
