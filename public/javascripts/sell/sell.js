var swiperDiv;
var imgHeight;
var winWidth;
$(function() {
  swiperDiv = new Swiper('.swiper-container', {
    pagination: '.swiper-pagination',
    paginationClickable: true,
    spaceBetween: 30,
  });
  getSwiperHeight();

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
  if (window.innerWidth) {
    winWidth = window.innerWidth;
  } else if ((document.body) && (document.body.clientWidth)) {
    winWidth = document.body.clientWidth;
  }
  imgHeight = (winWidth / 2);
  $(".swiper-container").height(imgHeight);
}
wx.ready(function() {
  var localIds = [];
  var serverIds = [];
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
          spaceBetween: 30,
        });
        getSwiperHeight();
        swiperDiv.slideTo(localIds.length - 1);
      }
    });
  });
  $("#btnSave").click(function() {
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

      if (swiperDiv != null && swiperDiv != undefined) {
        swiperDiv.destroy(true, true);
      }
      swiperDiv = new Swiper('.swiper-container', {
        pagination: '.swiper-pagination',
        paginationClickable: true,
        spaceBetween: 30,
      });
      getSwiperHeight();
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
              height: $("#txtImgWidth").val(),
              comment: $("#txtDesc").val(),
              type: $("#typeTitle").text(),
              price: $("#txtImgPrice").val(),
              images: serverIds,
              catalog: $("#catalogTitle").text()
            },
            success: function(data) {},
            error: function(req, status, err) {},
            complete: function(res, status) {
              console.log(res);
            }
          })
        }
      }
    })
  }
});
