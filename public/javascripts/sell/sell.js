var swiperDiv;
var imgHeight;
var winWidth;
var localIds = [];
var serverIds = [];


function checkImgBtnStatus() {
  if (localIds.length > 0) {
    $("#btnRemoveImg").show();
    $("#pDiv").show();
    $("#defaultImgDiv").hide();
  } else {
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

$(function() {
  getSwiperHeight();
  checkImgBtnStatus();

  $("#ulType li").on('click', function() {
    // alert($("#typeTitle").text());
    $("#typeTitle").text($(this).text());
  })

  $("#ulCatalog li").on('click', function() {
    // alert($("#typeTitle").text());
    $("#catalogTitle").text($(this).text());
  })

});
var getSwiperHeight = function() {
  // if (window.innerWidth) {
  //   winWidth = window.innerWidth;
  // } else if ((document.body) && (document.body.clientWidth)) {
  //   winWidth = document.body.clientWidth;
  // }
  // imgHeight = (winWidth / 2);
  // $(".swiper-container").height(imgHeight);
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
          autoplayDisableOnInteraction: false
        });
        getSwiperHeight();
        checkImgBtnStatus();
        swiperDiv.slideTo(localIds.length - 1);
      }
    });
  });
  $("#btnSave").click(function() {
    if (localIds.length <= 0) {
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
        text: "请输入作品名称！"
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
    if ($("#datetimepicker2").val().trim() <= $("#datetimepicker1").val().trim()) {
      notie.alert({
        type: 3,
        text: "拍卖结束事件必须晚于开始时间！"
      });
      return;
    }
    var l = Ladda.create(document.querySelector('#btnSave'));
    l.start();
    // $(this).attr("disabled", "disabled");
    syncUpload(localIds, l);
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
        autoplayDisableOnInteraction: false
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

  var syncUpload = function(localIds, l) {
    var localId = localIds.pop();
    wx.uploadImage({
      localId: localId.toString(),
      success: function(res) {
        var serverId = res.serverId;
        serverIds.push(serverId.toString());
        if (localIds.length > 0) {
          syncUpload(localIds, l);
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
              auctionEndDate: $("#datetimepicker2").val(),
              openId:$("#hideOpenId").val()
            },
            success: function(data) {
              //window.location = '/item/'+data.data._id;
              location.replace('/item/'+data.data._id);
            },
            error: function(req, status, err) {
                // $("#btnSave").removeAttr("disabled");
                l.stop();
            },
            complete: function(res, status) {

            }
          })
        }
      }
    })
  }
});
