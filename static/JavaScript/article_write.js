window.onload = function(){
  var blogUrl = window.location.origin;
  var webUrl = blogUrl.substring(0, blogUrl.length-1) + "0";
  const parsedUrl = (window.location.pathname).split('/');
  const id = parsedUrl[parsedUrl.length-1].split('=')[1]
  sessionStorage.setItem("id", id);
  var artid = sessionStorage.getItem("artid");
  var returnToMain = document.getElementById('returnToMain');
  var publishBlogButton = document.getElementById('publishBlog');
  var viewerControl = document.getElementById('viewerControl');
  const thisform = document.getElementById( "blogForm" );
  var inputTitle = document.getElementById("blogTitle");
  var inputContent = document.getElementById("blogContent");
  var selectViewer =document.getElementById("viewerControl");
  var articleExist = false;
  var rowId = ""

  returnToMain.addEventListener('click', function(){
    window.location.replace(blogUrl+"/blog/user?id="+id);
  });

  publishBlogButton.addEventListener('click', function(){
    const form = document.getElementById( "blogForm" );
    var FD = new FormData( form );
    if (artid){
      sendArticleWhenExisted(form)
    } else {
      sendArticle(form);
    }
  });


  if (artid) {
    articleExist = true;
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", blogUrl + "/blog/getart/?id="+artid);

    xhttp.addEventListener( "load", function(event) {
        var myObj = JSON.parse(this.responseText);
        selectViewer.value = myObj.articleType;
        inputTitle.value = myObj.title;
        inputContent.value = myObj.content;
        rowId = myObj.rowId;
        sessionStorage.removeItem("artid");
    } );

    xhttp.send();
  }


  function sendArticleWhenExisted(form){

      var artxhttp = new XMLHttpRequest();
      var FD = new FormData(form);
      artxhttp.open("POST", blogUrl + "/blog/user/" +id +"/save");

      artxhttp.addEventListener( "load", function(event) {

        var returnObj = JSON.parse(event.target.responseText);
        if (returnObj.result == "OK") {
          window.location.replace(blogUrl+"/blog/article/"+artid);
        } else {
          alert("error in submission")
        }
      } );
      console.log("row=" + rowId);
      artxhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
      artxhttp.send("userid="+id+"&rowId=" + rowId + "&artId="+ artid + "&artTitle=" + FD.get("title")+
            "&artContent="+ FD.get("blogContent") + "&permit="+FD.get("viewer"));


  }

  function sendArticle(form){
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", blogUrl + "/blog/user/"+id+"/newart");

    xhttp.addEventListener( "load", function(event) {

        var myObj = JSON.parse(this.responseText);
        if (myObj.result == "OK"){

          var artxhttp = new XMLHttpRequest();
          var FD = new FormData(form);
          artxhttp.open("POST", blogUrl + "/blog/user/" +id +"/save");

          artxhttp.addEventListener( "load", function(event) {

            var returnObj = JSON.parse(event.target.responseText);
            if (returnObj.result == "OK") {
              window.location.replace(blogUrl+"/blog/article/"+returnObj.artId);
            } else {
              alert("error in submission")
            }
          } );

          artxhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
          console.log("content="+FD.get("blogContent"));
          artxhttp.send("userid="+id+"&rowId=" +myObj.rowId + "&artId="+ myObj.artId + "&artTitle=" + FD.get("title")+
                "&artContent="+ FD.get("blogContent") + "&permit="+FD.get("viewer"));

        } else {
          alert("error in getting article id")
        }

    } );

    xhttp.send();
  }
  var logoutButton = document.getElementById("logout");
  logoutButton.addEventListener('click', function(){
    $.removeCookie('sid', { path: '/' });
    sessionStorage.removeItem('id');
    window.location.replace(webUrl+"/home");
  });

};
