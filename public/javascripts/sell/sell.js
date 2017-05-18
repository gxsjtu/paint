var swiperDiv;
var imgHeight;
var winWidth;
var localIds = [];
var serverIds = [];
$(function() {
  getSwiperHeight();
  checkImgBtnStatus();
  $("#datetimepicker1,#datetimepicker2").datetimepicker({
    format: 'yyyy-mm-dd hh:00',
    autoclose: true,
    minView: 1,
    todayHighlight: true,
    language: 'zh-CN'
  });
  $("#ulType li").on('click', function() {
    // alert($("#typeTitle").text());
    $("#typeTitle").text($(this).text());
  })

  $("#ulCatalog li").on('click', function() {
    // alert($("#typeTitle").text());
    $("#catalogTitle").text($(this).text());
  })

  $(".select").on("click",function(){
    // debugger;
    var items = $(this).find(".box-items");
    if(items.hasClass("type"))
    {
      if(items.is(":hidden")){
        $(".box-items").hide();
        items.show();
      }
      else{
        items.hide();
      }
    }
    else if(items.hasClass("catalog")){
      if(items.is(":hidden")){
        $(".box-items").hide();
        items.show();
      }
      else{
        items.hide();
      }
    }

    return false;
  });

  $(".box-items li").on("click",function(){
    var v = $(this).text();
    $(this).parent().parent().find(".my-select-name").text(v);
  });

  $("body").on("click",function(){
    $(".box-items").hide();
  });

});
var getSwiperHeight = function() {
  if (window.innerWidth) {
    winWidth = window.innerWidth;
  } else if ((document.body) && (document.body.clientWidth)) {
    winWidth = document.body.clientWidth;
  }
  imgHeight = (winWidth / 2);
  $(".swiper-container").height(imgHeight);
}
wx.ready(function() {

  $("#btnAddImg").click(function() {
    wx.chooseImage({
      count: 9,
      success: function(res) {
        var d = $(".swiper-wrapper");
        var idStr = res.localIds.toString();
        if (idStr.indexOf(',') > 0) {
          var ids = idStr.split(',');
          for (var i = 0; i < ids.length; i++) {
            localIds.push(ids[i]);
            d.append('<div class="swiper-slide"><img src="' + ids[i] + '" style="width:100%;"/></div>');
          }
        } else {
          localIds.push(idStr);
          d.append('<div class="swiper-slide"><img src="' + idStr + '" style="width:100%;"/></div>');
        }

        swiperDiv = new Swiper('.swiper-container', {
          pagination: '.swiper-pagination',
          paginationClickable: true,
          autoplay: 2000,
          autoplayDisableOnInteraction: false,
          loop: true
        });
        getSwiperHeight();
        checkImgBtnStatus();
        swiperDiv.slideTo(localIds.length - 1);
      }
    });
  });
  $("#btnSave").click(function() {
    if (localIds.length < 0) {
      notie.alert({
        type: 3,
        text: "请至少选择一张图片！"
      });
      return;
    }
    if ($("#txtAuthorName").val().trim() == "") {
      notie.alert({
        type: 3,
        text: "请输入作者名称！"
      });
      return;
    }
    if ($("#txtImgName").val().trim() == "") {
      notie.alert({
        type: 3,
        text: "请输入画名！"
      });
      return;
    }

    if ($("#typeTitle").text().trim() == "" || $("#typeTitle").text() == "选择画种") {
      notie.alert({
        type: 3,
        text: "请选择画种！"
      });
      return;
    }

    if ($("#catalogTitle").text().trim() == "" || $("#catalogTitle").text() == "选择题材") {
      notie.alert({
        type: 3,
        text: "请选择题材！"
      });
      return;
    }

    if ($("#txtImgWidth").val().trim() == "") {
      notie.alert({
        type: 3,
        text: "请输入尺寸！"
      });
      return;
    }

    if ($("#txtImgHeight").val().trim() == "") {
      notie.alert({
        type: 3,
        text: "请输入尺寸！"
      });
      return;
    }

    if ($("#txtImgPrice").val().trim() == "") {
      notie.alert({
        type: 3,
        text: "请输入底价！"
      });
      return;
    }

    if ($("#datetimepicker1").val().trim() == "") {
      notie.alert({
        type: 3,
        text: "请输入拍卖开始时间！"
      });
      return;
    }

    if ($("#datetimepicker2").val().trim() == "") {
      notie.alert({
        type: 3,
        text: "请输入拍卖结束时间！"
      });
      return;
    }
    $(this).attr("disabled","disabled");
    syncUpload(localIds);
  });

  $("#btnRemoveImg").click(function() {
    var imgDiv = $(".swiper-slide-active img");
    var removeDiv = $(".swiper-slide-active");
    if (imgDiv != null && imgDiv != undefined && imgDiv.length > 0) {
      removeDiv.remove();
      var src = imgDiv[0].src;
      var index = localIds.indexOf(src);
      var isLastIndex = false;
      if ((index + 1) == localIds.length) {
        //说明删除的是最后一张
        isLastIndex = true;
      }
      localIds.splice(index, 1);
      if (swiperDiv != null && swiperDiv != undefined) {
        swiperDiv.destroy(true, true);
      }
      swiperDiv = new Swiper('.swiper-container', {
        pagination: '.swiper-pagination',
        paginationClickable: true,
        autoplay: 2000,
        autoplayDisableOnInteraction: false,
        loop: true,
      });
      getSwiperHeight();
      checkImgBtnStatus();
      if (isLastIndex) {
        swiperDiv.slideTo(localIds.length - 1, 0);
      } else {
        swiperDiv.slideTo(index, 0);
      }
    }
  })

  var syncUpload = function(localIds) {
    var localId = localIds.pop();
    wx.uploadImage({
      localId: localId.toString(),
      success: function(res) {
        var serverId = res.serverId;
        serverIds.push(serverId.toString());
        if (localIds.length > 0) {
          syncUpload(localIds);
        } else {
          $.ajax({
            url: '/sell/saveItem',
            type: 'POST',
            traditional: true,
            dataType: "json",
            data: {
              name: $("#txtImgName").val(),
              author: $("#txtAuthorName").val(),
              width: $("#txtImgWidth").val(),
              height: $("#txtImgHeight").val(),
              comment: $("#txtDesc").val(),
              type: $("#typeTitle").text(),
              price: $("#txtImgPrice").val(),
              images: serverIds,
              catalog: $("#catalogTitle").text(),
              auctionStartDate: $("#datetimepicker1").val(),
              auctionEndDate: $("#datetimepicker2").val()
            },
            success: function(data) {},
            error: function(req, status, err) {},
            complete: function(res, status) {
              $("#btnSave").removeAttr("disabled");
              console.log(res);
            }
          })
        }
      }
    })
  }
});

var checkImgBtnStatus = function() {
  alert(1);
  if (localIds.length > 0) {
    alert(2);
    $("#btnRemoveImg").show();
    $("#pDiv").show();
    $("#defaultImgDiv").hide();
  } else {
    alert(3);
    $("#btnRemoveImg").hide();
    $("#pDiv").hide();
    $("#defaultImgDiv").show();
  }

  if (localIds.length >= 9) {
    $("#btnAddImg").hide();
  } else {
    $("#btnAddImg").show();
  }
}
