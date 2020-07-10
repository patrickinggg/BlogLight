window.onload = function(){
  var blogUrl = window.location.origin;
  var webUrl = blogUrl.substring(0, blogUrl.length-1) + "0";
  const parsedUrl = (window.location.pathname).split('/');
  const endStr = parsedUrl[parsedUrl.length-1].split("&");
  const id = endStr[0].split('=')[1];
  const homeId = endStr[1].split('=')[1];
  sessionStorage.setItem("view_id", id);
  sessionStorage.setItem("homeId", homeId);
  console.log("homeid="+homeId);
  var friendsGallery = document.getElementById("friendsGallery");


  var blogContainer = document.getElementById("blogContainer");
  var multiSelect = blogContainer.querySelector(".multi-select");
  var goBackToMain = document.getElementById('goBackToMain');
  var followButton = document.getElementById('follow');
  var avatar = document.getElementById('avatar');
  var sid = $.cookie('sid');
  var ifFollowing = false;
  console.log(sid);
  // console.log(document.cookie +"1221");
  var pagesize = 5;
  var totalBlog = 0;
  getBlogCount();
  loadProfilePic();
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
  var ItemsVue = new Vue({
    el: '#blogList',
    data: {
        blogs: [],
        pagenumber:0,
    },
    mounted: function () {
      this.getBlogs();
    },
    methods:{
      pagePrevious: function(){
        if (this.pagenumber == 0){
          alert("This is the first page.");
        } else {
          this.pagenumber -= 1;
        }
        this.getBlogs();
      },
      pageNext: function(){
        if (this.pagenumber < Math.ceil(totalBlog / 5) - 1) {
          this.pagenumber +=1;
        } else {
          console.log("ceil = " +totalBlog );

          alert("This is the last page.");
        }
        this.getBlogs();
      },
      getBlogs: function(){
        var self = this;
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", blogUrl + "/blog/user/"+id+"/list");

        xhttp.addEventListener( "load", function(event) {
            var displayList = JSON.parse(this.responseText).articles;
            for (var item in displayList){
              var time = displayList[item].createtime.split(" ");
              time = "Date Added: " + makedouble(time[0])+"/" + makedouble(time[1]) + "/" + makedouble(time[2]) + " " + makedouble(time[3]) + ":" + makedouble(time[4]);
              displayList[item].createtime = time;

              var articlelink =  displayList[item].artid;
              articlelink = blogUrl + "/blog/view_friends_blog/" + articlelink;
              displayList[item].artid = articlelink;
              console.log(articlelink);
            }
            self.blogs = displayList;
            console.log(this.responseText);

        } );
        xhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
        xhttp.send("mode=page&page="+this.pagenumber+"&size=5");
      },
      uploadBlogs: function(){
        window.location.replace(blogUrl+"/blog/article_write/id="+id);
      }
    }
  });


  // writeBlogButton.addEventListener('click', function(){
  //   window.location.replace(blogUrl+"/blog/article_write/id="+id);
  // });


  friendsGallery.addEventListener('click', function(){
    window.location.replace(blogUrl+"/blog/friends_gallery_page/id="+id+"&homeId="+homeId);
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

  function getBlogCount(){
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", blogUrl + "/blog/user/"+id+"/list");

    xhttp.addEventListener( "load", function(event) {
        var myObj = JSON.parse(this.responseText);
        totalBlog = myObj.count;
        console.log("the count is=" + myObj.count);

    } );
    xhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    xhttp.send("mode=count");
  }

  function makedouble(digit){
    if (digit.length == 1){
      digit = "0" + digit;
    }
    return digit;
  }

  function checkFollow(){
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", blogUrl +"/blog/checkfollow");
    xhttp.addEventListener( "load", function(event) {
        var myObj = JSON.parse(this.responseText);
        console.log(this.responseText);
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

//   function verifyLogin(){
//   const parsedUrl = new URL(window.location.href);
//   var id = parsedUrl.searchParams.get("id"); // "from"
// 	var tkt = parsedUrl.searchParams.get("tkt");
// 	if (tkt && id){
//     var xhttp = new XMLHttpRequest();
//     xhttp.open("POST", webUrl + "/verify_tkt");
//
//     xhttp.addEventListener( "load", function(event) {
//         var myObj = JSON.parse(this.responseText);
//         if (myObj.result == "OK"){
//         } else {
//
//         }
//
//     } );
//     xhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
//     xhttp.send("mode=count");
//
// 		$.post("http://127.0.0.1:9702/verify_tkt", {
//             "tkt": tkt,
// 			"usrId": id
//         }, function (data) {
// 			data = eval('(' + data + ')');
// 			if (data.result == "OK"){
// 				sid = data.sid;
// 				showUserCredits();
// 			}
// 			else{
// 				showNeedLogIn();
// 			}
// 		});
// 	}
// 	else{
// 		sid = $.cookie('sid');
// 		id = getUrlParam('id');
// 		if (sid){
// 			showUserCredits();
// 		}
// 		else{
// 			showNeedLogIn();
// 		}
// 	}
// }
var logoutButton = document.getElementById("logout");
logoutButton.addEventListener('click', function(){
  $.removeCookie('sid', { path: '/' });
  sessionStorage.removeItem('id');
  window.location.replace(webUrl+"/home");
});
};
