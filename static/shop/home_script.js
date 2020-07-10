var nowpage = 0;    // 0-home 1-history 2-msgbox
var recordPage = 0;
var pageMax = 1;
var sid = "";
var id = "";  // user id
var loginStatus = 0;  // 0-false 1-true

function initializePage(){

    $(".page_trans").hide();
	$(".leftbar_user_avatar_div1").hide();
    nowpage = 0;
	tryLogIn();
	loadProducts();

}

$(document).ready(function() {
    initializePage();

	$("#leftbar_btn1").click(function(){
		simulateTopUp();
	});
	$("#leftbar_btn2").click(function(){
		showRecords();
	});
	$("#leftbar_btn3").click(function(){
		$.removeCookie('sid', { path: '/' });
		loginStatus = 0;
		window.location.href = "http://127.0.0.1:9702/shop";
	});
	$("#leftbar_btn4").click(function(){
		window.location.href = "http://127.0.0.1:9700/home?from=shop";
	});
	$("#leftbar_btn5").click(function(){
		showShop();
	});
	
	$(".trans_lastpage").click(function(){
		lastPage();
	});
	$(".trans_nextpage").click(function(){
		nextPage();
	});
	
    $(".leftbar_btn").mouseenter(function(){
        $(this).css("background-color","#77aabb").css("color","white");
	});
    $(".leftbar_btn").mouseleave(function(){
        $(this).css("background-color","").css("color","white");
    });
	

	$('.page_home').on('click','.product_box',function(){
        var prodId = $(this).attr('id');
		var msgbox = confirm("Confirm to purchase?");
		if (msgbox == true) {
			tryBuyProduct(prodId);
		}
    });
/*
    $(".btn_submit").click(function(){
        verifyAndSubmit();
    });

*/

});

function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	var r = window.location.search.substr(1).match(reg);
	if (r != null) return unescape(r[2]);
	return null;
}
function tryLogIn(){
	var tkt = getUrlParam('tkt');
	id = getUrlParam('id');
	if (tkt && id){
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
		//id = getUrlParam('id');
		if (sid){
			showUserCredits();
		}
		else{
			showNeedLogIn();
		}
	}
}
function showNeedLogIn(){
	$(".leftbar_user_avatar_div1").hide();
	$(".leftbar_user_avatar_div2").fadeIn("fast");
}
function showUserCredits(){
	$(".leftbar_user_avatar_div1").fadeIn("fast");
	$(".leftbar_user_avatar_div2").hide();
	$.post("http://127.0.0.1:9702/verify_sid", {
            "sid": sid, "usrId": id
        }, function (data) {
			data = eval('(' + data + ')');
            if (data.result == "OK"){
				id = data.id;
				$.get("http://127.0.0.1:9700/user/glance?id=" + id, function(data2){
					$("#leftbar_user_text1").html("Welcome, "+data2.name+"!");
				});
                $.post("http://127.0.0.1:9702/user/get", {"user": id}, function(data2){
					data2 = eval('(' + data2 + ')');
					if (data2.result == "OK"){
						$("#leftbar_user_text2").html("Credits: "+data2.credit);
					}
					else{
						$.post("http://127.0.0.1:9702/activate", {"user": id}, function(data3){
							data3 = eval('(' + data3 + ')');
							if (data3.result == "OK"){
								$("#leftbar_user_text2").html("Credits: 0");
							}
						});
					}
				});
				loginStatus = 1;
            }else{
				$.removeCookie('sid', { path: '/' });
                showNeedLogIn();
            }
        });
}
function tryBuyProduct(prodId){
	$.post("http://127.0.0.1:9702/shop/purchase", {"sid": sid, "prod": prodId}, function(data){
		data = eval('(' + data + ')');
		if (data.result == "OK"){
			alert("Purchase succeed!");
			showUserCredits();
		}
	});
}
function simulateTopUp(){
	alert("This is a simulation of top up credits");
	$.post("http://127.0.0.1:9702/shop/topup", {"sid": sid}, function(data){
		data = eval('(' + data + ')');
		if (data.result == "OK"){
			alert("Top up finished!");
			showUserCredits();
		}
	});
}
function loadProducts(){
	var prodHTML = "";
	prodHTML += "<h1 style=\"position: relative; left: 100px; width: 500px\">Product List</h1>";
	for (i = 0; i < 3; i++){
		var tmpProd = "";
		tmpProd += "<div class=\"product_box\" id=\"product_id" + (i+1) + "\" >";
		tmpProd += "<img class=\"product_img\" src=\"static/product.png\" alt=\"product\" />";
		var friendCount = 0; var price = 0;
		if (i == 0){friendCount = 5; price = 5;}
		else if (i == 1){friendCount = 25; price = 20;}
		else if (i == 2){friendCount = 150; price = 100;}
		tmpProd += "<div class=\"product_title\"><b>Increase friend limit by " + friendCount + "</b></div>";
		tmpProd += "<div class=\"product_price\"><i>Price: " + price + " Credits</i></div></div>";
		prodHTML += tmpProd;
	}
	$(".page_home").html(prodHTML);
}
function loadPageCount(){
	if (loginStatus == 1){
		$.post("http://127.0.0.1:9702/transaction/count", {"sid": sid}, function(data){
			data = eval('(' + data + ')');
			if (data.result == "OK"){
				pageMax = Math.ceil(data.number / 20);
				$(".trans_currpage").html((recordPage+1) + " / " + pageMax);
				refreshPageBtn();
			}
		});
	}
}
function refreshPageBtn(){
	if (recordPage+1 <= 1){
		$(".trans_lastpage").css('visibility','hidden');
	}
	else{
		$(".trans_lastpage").css('visibility','visible');
		$(".trans_lastpage").fadeIn("fast");
	}
	if (recordPage+1 >= pageMax){
		$(".trans_nextpage").css('visibility','hidden');
		$(".trans_nextpage").hide();
	}
	else{
		$(".trans_nextpage").css('visibility','visible');
		$(".trans_nextpage").fadeIn("fast");
	}
}
function loadRecordPage(){
	if (loginStatus == 1){
		$.post("http://127.0.0.1:9702/transaction/get", {"sid": sid, "page": recordPage, "pageSize": 20}, function(data){
			data = eval('(' + data + ')');
			if (data.result == "OK"){
				var listviewHTML = "";
				for (i in data.record){
					var recRow = data.record[i];
					var rowHTML = "<div class=\"trans_box\" >";
					rowHTML += "<div class=\"trans_serialnumber\">" + recRow.rowid + "</div>";
					rowHTML += "<div class=\"trans_from\">" + recRow.fromid + "</div>";
					rowHTML += "<div class=\"trans_to\">" + recRow.toid + "</div>";
					rowHTML += "<div class=\"trans_amount\">" + recRow.amount + "</div>";
					rowHTML += "<div class=\"trans_fee\">" + recRow.fee + "</div>";
					rowHTML += "<div class=\"trans_title\">" + recRow.title + "</div>";
					rowHTML += "<div class=\"trans_time\">" + recRow.time + "</div></div>";
					
					listviewHTML += rowHTML;
				}
				$(".trans_listview").html(listviewHTML);
			}
			else if (data.result == "EMPTY"){
				$(".trans_listview").html("No record found");
			}
		});
	}
	else{
		alert("Login period expired. Please log in again.");
	}
}
function showRecords(){
	$(".page_home").hide();
    $(".page_trans").fadeIn("fast");
	nowpage = 1;
	recordPage = 0;
	loadRecordPage();
	loadPageCount();
}
function showShop(){
	$(".page_home").fadeIn("fast");
    $(".page_trans").hide();
	nowpage = 0;
	recordPage = 0;
}
function nextPage(){
	if (recordPage+1 < pageMax){
		recordPage += 1;
		loadRecordPage();
		loadPageCount();
	}
}
function lastPage(){
	if (recordPage > 0){
		recordPage -= 1;
		loadRecordPage();
		loadPageCount();
	}
}

