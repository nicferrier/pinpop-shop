var util = require("util");
var $ = require("jquery"); window.$ = $; //useful
var userMedia = require("./userMedia.js");
var Hammer = require("hammerjs");
var formSaver = require ("./formSaver.js");
var Platform = require("polyfill-webcomponents");

function UUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

// List of items we've created.
var itemsList = new Array();
var currentItemIndex = -1;

function right () {
  if (currentItemIndex < 1) {
    alert("vdu7");
  }
  else {
    console.log("itemsList:", itemsList);
    itemsList[currentItemIndex].addClass("hidden");
    itemsList[--currentItemIndex].removeClass("hidden");
  }
}

function left () {
  if (currentItemIndex == itemsList.length - 1) {
    // FIXME - this should load another video frame
    // FIXME - the video shouldn't autostart - empty frame that you click in to turn it on
    alert("vdu7");
  }
  else {
    console.log("itemsList:", itemsList);
    itemsList[currentItemIndex].addClass("hidden");
    itemsList[++currentItemIndex].removeClass("hidden");
  }
}

var mc = Hammer(document.body);
mc.on("swipeleft", left);
mc.on("swiperight", right);

function newForm(uuid) {
  var formTemplate = $("#inventoryForm")[0];
  var templFragment = document.importNode(formTemplate.content, true);
  var form = templFragment.querySelector("form");
  form.setAttribute("class", (form.getAttribute("class") || "") + " hidden");
  form.setAttribute("action", "/item/" + uuid);
  form.setAttribute("name", uuid);
  return form;
}

function saveImage(imgData) {
  var uuid = UUID(); // this is for the item
  var imgUuid = UUID(); // this is for this individual image

  var form = newForm(uuid);
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
  $("#panel").append(form);

  // Shitty handling of the swipe management - adding an element
  itemsList.push(img);
  currentItemIndex++;
  itemsList.push($(form));
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

// For when you want to arse about with the form without the camera
// var form = newForm(10);
// $("#panel").append(form);
// $(form).removeClass("hidden");


// app.js ends here
