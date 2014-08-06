var util = require("util");
var $ = require("jquery"); window.$ = $; //useful
var userMedia = require("./userMedia.js");
var Hammer = require("hammerjs");
var formSaver = require ("./formSaver.js");

function cameraSnap (videoObject) {
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

  var img = $("#capture img");
  img.on("dragstart", function () { return false; });
  var mc = Hammer(img[0]);
  mc.on(
    "swipeleft", 
    function () { 
      alert("swiped!"); 
    }
  );
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

cameraOn();

// not sure about "change" - it doesn't tell us very quickly
formSaver.attach(document.forms["inventory"]);

// app.js ends here
