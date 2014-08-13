var util = require("util");
var $ = require("jquery"); window.$ = $; //useful
var userMedia = require("./userMedia.js");
var Hammer = require("hammerjs");
var formSaver = require ("./formSaver.js");

function UUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

function saveImage(imgData) {
  var uuid = UUID(); // this is for the item
  var imgUuid = UUID(); // this is for this individual image

  var form = $("#inventoryForm form")[0];
  form.setAttribute("action", "/item/" + uuid); // this should be template

  // Start saving the form with a success which will add the image(s)
  formSaver.attach(
    form,
    formSaver.sendFormJquery(form, function (data, originForm) {
      console.log("success for form save - not try images");
      // We *might* want to use the originForm id as the taint key
      // this might let us tie the image uploads to the item uploads
      formSaver.taint(imgUuid, function () {
        $.ajax("/item/" + uuid + "/image/" + imgUuid, {
          type: "POST",
          dataType: "json",
          data: { "image-data": imgData }, // could have meta data too!
          success: function (data) {
            console.log("image uploaded!");
          }
        });
      });
    }));

  var img = $("#capture img");
  img.on("dragstart", function () { return false; });
  var mc = Hammer(img[0]);
  mc.on("swipeleft", 
        function () {
          // This should be a history.pushState thing so the user can
          // use the back button or keys
          $("#capture img").addClass("hidden");
          $("#inventoryForm").removeClass("hidden");
        });
}

// Snap the 'videoObject' and call 'next' with the imgData
function cameraSnap (videoObject, next) {
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
  $(videoObject).addClass("hidden");
  next(imgData)
}
// Turn the camera on and call cameraSnap with saveImage on click
function cameraOn () {
  $("#capture").html("<video id='vid' autoplay=\"yes\"></video>");
  var videoObject = document.getElementById("vid");
  userMedia.doGetUserMedia(
    videoObject,
    function () {
      $(videoObject).click(function () {
        cameraSnap(videoObject, saveImage);
      });
    }
  );
}

// Start the camera
cameraOn();

// app.js ends here
