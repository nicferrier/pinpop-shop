var util = require("util");
var $ = require("jquery"); window.$ = $; //useful
var userMedia = require("./userMedia.js");
var Hammer = require("hammerjs");
var formSaver = require ("./formSaver.js");

function uuid () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

function cameraSnap (videoObject) {
  // FIXME - should probably play a camera shutter sound
  var canvasElement = document.createElement("canvas");
  canvasElement.setAttribute("class", "hidden");
  document.body.appendChild(canvasElement);;
  var width = $(videoObject).width(), height = $(videoObject).height();
  canvasElement.style.width = width + "px";
  canvasElement.style.height = height + "px";
  canvasElement.width = width;
  canvasElement.height = height;

  var graphicContext = canvasElement.getContext("2d");
  graphicContext.clearRect(0, 0, width, height);
  graphicContext.drawImage(videoObject, 0, 0, width, height);
  userMedia.stopCapture(document.getElementById("vid"));

  var imgData = canvasElement.toDataURL();
  $("#capture").append(
    util.format(
      "<img src=\"%s\" title=\"click again to take another\"></img>", 
      imgData
    )
  );

  var myUuid = uuid();
  $.ajax("/item/" + myUuid, {
    type: "POST",
    data: { image: imgData },
    error: function (jqXHR, textStatus, errorThrown) {
      // FIXME: handle errors sensibly
      console.log(util.format(
        "item POST error: uuid: %s textStatus: %s", myUuid, textStatus
      ));
    }
  });
  $(videoObject).addClass("hidden");

  var img = $("#capture img");
  img.on("dragstart", function () { return false; });
  var mc = Hammer(img[0]);
  mc.on("swipeleft", 
        function () {
          // This should be a history.pushState thing so the user can
          // use the back button or keys
          $("#capture img").addClass("hidden");
          $("#inventoryForm form").attr("action", "/item/" + myUuid); // template?
          $("#inventoryForm").removeClass("hidden");
        });
}

function cameraOn () {
  $("#capture").html("<video id='vid' autoplay=\"yes\"></video>");
  var videoObject = document.getElementById("vid");
  userMedia.doGetUserMedia(
    videoObject,
    function () {
      $(videoObject).click(function () {
        cameraSnap(videoObject);
      });
    }
  );
}

// Start saving the form
formSaver.attach(document.forms["inventory"]);

// Start the camera
cameraOn();


// app.js ends here
