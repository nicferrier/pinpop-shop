var util = require("util");
var $ = require("jquery"); window.$ = $; //useful
var userMedia = require("./userMedia.js");
var Hammer = require("hammerjs");
var formSaver = require ("./formSaver.js");

function cameraOn () {
  $("#capture").html("<video id='vid'></video>");
  var videoObject = document.getElementById("vid");
  userMedia.doGetUserMedia(
    videoObject,
    function () {
      var mc = Hammer(videoObject);
      mc.on("swipeleft swiperight", function () { console.log("swiped!"); });
      $(videoObject).click(function () {
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
        $("#capture").append(
          util.format(
            "<img src=\"%s\" title=\"click again to take another\"></img>", 
            canvasElement.toDataURL()
          )
        );
        $(videoObject).addClass("hidden");
      });
    }
  );
}

cameraOn();

// not sure about "change" - it doesn't tell us very quickly
formSaver.attach(document.forms["inventory"]);



// app.js ends here
