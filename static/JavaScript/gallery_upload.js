window.onload = function(){
  var blogUrl = window.location.origin;
  var webUrl = blogUrl.substring(0, blogUrl.length-1) + "0";
  const parsedUrl = (window.location.pathname).split('/');
  var id = sessionStorage.getItem("id");
  var upload_img = document.getElementById("FormControlFile1");
  var preview_container = document.getElementById("imagePreview")
  var preview_image = preview_container.querySelector(".img-holder")
  var default_text = preview_container.querySelector(".image-preview__default-text")
  var goBackToGallery = document.getElementById('goBackToGallery');
  var submitButton = document.getElementById('submitButton');
  var originalimgId = "";
  var picArtId = sessionStorage.getItem("picArtId");
  var title = document.getElementById('title');
  var picContent = document.getElementById('picContent');
  var permit = document.getElementById('permit');
  var image_holder = document.getElementById('uploaded_image');
  var rowId = "";
  var currentImageId = "";

  upload_img.addEventListener('change', function () {

       if (this.files[0]) {
         console.log(this.files[0]);
           var reader = new FileReader();
           default_text.style.display = "none";
           preview_image.style.display = "block";

           reader.addEventListener('load', function(){
             preview_image.setAttribute('src', this.result);
           });

           reader.readAsDataURL(this.files[0]);
       }
   });

   goBackToGallery.addEventListener('click', function(){
     window.location.replace(blogUrl+"/blog/gallery/id="+id);

   });

   submitButton.addEventListener('click', function(event){
     event.preventDefault();

     const form = document.getElementById( "formSubmitImage" );
     if (picArtId){
       var imgURL = preview_image.src;
       if(upload_img.files[0] == undefined){
         alert("You must re-upload the image")
       } else {
         deleteImage(currentImageId);
         sendImage(picArtId, rowId, form);
       }
     } else {
       submitAll(form);
     }
   });

   if (picArtId) {
     var xhttp = new XMLHttpRequest();
     xhttp.open("GET", blogUrl + "/blog/getpic/?id="+picArtId);

     xhttp.addEventListener( "load", function(event) {
         var myObj = JSON.parse(this.responseText);
         var imgId = myObj.imgId
         currentImageId =  myObj.imgId;
         picContent.value = myObj.content;
         title.value = myObj.title;
         rowId = myObj.rowId;
         sessionStorage.removeItem("picArtId");

         var pichttp = new XMLHttpRequest();
         pichttp.open("POST", blogUrl +"/img_get");
         pichttp.addEventListener( "load", function(event) {
           var imageObj = JSON.parse(event.target.responseText);
           console.log(imageObj);
           var base64 = arrayBufferToBase64(imageObj.image.img.data);
           imagesrc = "data:image/" + imgType(imageObj.image.imgtype) + ";base64,"+base64;
           preview_image.setAttribute('src', imagesrc);
           if (preview_image.src.length>0){
              preview_image.style.display = "block";
              default_text.style.display = "none";
           }

         });
         pichttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
         pichttp.send("imgId=" +imgId);

      });

     xhttp.send();
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
     formData.append("files",upload_img.files[0]);
     formData.append("domain", "art");
     formData.append("artId", picId);
     xhttp.open("POST", blogUrl +"/img_upload");
     xhttp.addEventListener( "load", function(event) {
       var myObj = JSON.parse(event.target.responseText);
       if (myObj.result == "OK") {
         console.log(myObj);
         sendContent(rowId, picId, myObj.imgId, form);
       } else {
         alert("failed");
       }
     });
     xhttp.send(formData);
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
         window.location.replace(blogUrl+"/blog/gallery_view/"+myObj.picId);
       } else {
         alert("failed");
       }
     });
     xhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
     xhttp.send("rowId="+rowId+"&picId="+picId+"&picTitle="+ PREVFORM.get("title")+"&picContent="+PREVFORM.get("picContent") +"&imgId="+imgId+
          "&permit="+ PREVFORM.get("permit"));
   }

   function deleteImage(currentImageId){
     var xhttp = new XMLHttpRequest();

     xhttp.open("POST", blogUrl +"/img_delete");
     xhttp.addEventListener( "load", function(event) {
       var myObj = JSON.parse(event.target.responseText);
       if (myObj.result == "OK") {
         console.log("deleted");
         console.log(myObj);
       } else {
         alert("deletion failed");
       }
     });
     xhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
     xhttp.send("imgId="+currentImageId);
   }

   function dataURLtoFile(dataurl, filename) {
      var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
          while(n--){
              u8arr[n] = bstr.charCodeAt(n);
          }
    return new File([u8arr], filename, {type:mime});
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
   var logoutButton = document.getElementById("logout");
   logoutButton.addEventListener('click', function(){
     $.removeCookie('sid', { path: '/' });
     sessionStorage.removeItem('id');
     window.location.replace(webUrl+"/home");
   });
};
