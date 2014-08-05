var util = require("util");
var $ = require("jquery");
var userMedia = require("./userMedia.js");


function cameraOn () {
  $("#capture").html("<video id='vid'></video>");
  userMedia.doGetUserMedia(
    document.getElementById("vid"),
    function () {
      console.log("success!");
    }
  );
}

// not sure about "change" - it doesn't tell us very quickly
$("#formHolder form").change(function (evt) {
  console.log("something changed");
});
