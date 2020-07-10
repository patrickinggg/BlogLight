window.onload = function(){
  var blogUrl = window.location.origin;
  var webUrl = blogUrl.substring(0, blogUrl.length-1) + "0";

  // const parsedUrl = (window.location.pathname).split('/');
  // const id = parsedUrl[parsedUrl.length-1].split('=')[1]
  // console.log("id is " + id);
  const parsedUrl = new URL(window.location.href);
  var id =  parsedUrl.searchParams.get("id"); //
  sessionStorage.setItem("id", id);
  console.log("id="+id);
  var myBlogs = document.getElementById("myBlogs");
  var myGallery = document.getElementById("myGallery");
  var myFollowings = document.getElementById("myFollowings");
  var myFollowers = document.getElementById("myFollowers");
  var myPoints = document.getElementById("myPoints");
  var myaccountButton = document.getElementById('myAccount');


  var writeBlogButton = document.getElementById('writeBlogButton');
  var selectBlogButton = document.getElementById('selectBlog');
  var selectBlog_selected = false;
  var blogContainer = document.getElementById("blogContainer");
  var multiSelect = blogContainer.querySelector(".multi-select");
  var avatar = document.getElementById('avatar');
  var sid = "";

  console.log(sid);
  // console.log(document.cookie +"1221");
  var pagesize = 5;
  var totalBlog = 0;
  if ( parsedUrl.searchParams.get("tkt")==null){
    loadProfilePic();

  }

  tryLogIn(function(data){
    if (data=="pass"){
      getBlogCount();
      loadProfilePic();
    }
  });

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
              articlelink = blogUrl + "/blog/article/" + articlelink;
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

  myaccountButton.addEventListener('click', function(){
    window.location.replace(webUrl+"/my_account/id="+id);
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


  selectBlogButton.addEventListener('click', function(){
    selectBlog_selected = !selectBlog_selected;
    if (selectBlog_selected == true) {
      multiSelect.style.display = "block";
    } else {
      multiSelect.style.display = "none";
    }
  });
  function loadProfilePic(){
    var xhttp = new XMLHttpRequest();

    xhttp.open("POST", blogUrl +"/blog/getavatar");

    xhttp.addEventListener( "load", function(event) {
      var myObj = JSON.parse(event.target.responseText);
          var imageObj = JSON.parse(event.target.responseText);
          var base64 = arrayBufferToBase64(imageObj.img.img.data);
          imagesrc = "data:image/"+imgType(imageObj.img.imgtype)+";base64,"+base64;
          avatar.setAttribute('src', imagesrc);


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


  function tryLogIn(callback){
    const parsedUrl = new URL(window.location.href);
    var id = parsedUrl.searchParams.get("id");
  	var tkt = parsedUrl.searchParams.get("tkt");
	if (tkt && id){
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", blogUrl +"/verify_tkt");
    xhttp.addEventListener("load", function(){
      var myObj = JSON.parse(this.responseText);

      if (myObj.result == "OK"){
        sid = myObj.sid;
        callback("pass");
      } else {
        needLogin();
      }
    });
    xhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    xhttp.send("usrId="+id+"&tkt="+tkt);

	} else{
		sid = $.cookie('sid');
  		if (sid){

  		}
  		else{
  			needLogin();
		  }
	  }
  }

  function needLogin(){
    $.removeCookie('sid', { path: '/' });
    sessionStorage.removeItem('id');
    window.location.replace(webUrl+"/home");
  }

  var logoutButton = document.getElementById("logout");
  logoutButton.addEventListener('click', function(){
    $.removeCookie('sid', { path: '/' });
    sessionStorage.removeItem('id');
    window.location.replace(webUrl+"/home");
  });
};
