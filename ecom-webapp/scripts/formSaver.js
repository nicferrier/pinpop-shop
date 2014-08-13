// formSaver.js -- for sending forms asynchronously

// This is for asynchronous forms. All saves occur in the
// background. You can collect the status of the send and do something
// with it.
//
// This is for building form UIs where the network might go away or
// anything else might prevent the actual sending.

var util = require("util");
var $ = require("jquery");

var tainted = {};
var taintWatcher;
var WATCHER_TIMEOUT=1000;

// Used to scan the tainted forms and send them
//
// setTimeout's itself when it's done.
function taintScanner () {
  var taintedList = Object.keys(tainted).map(function (key) {
    return { thunk: tainted[key], key: key };
  });
  taintedList.forEach(function (taintObj) {
    delete tainted[taintObj.key];
    taintObj.thunk();
  });
  taintWatcher = window.setTimeout(taintScanner, WATCHER_TIMEOUT);
}

// Push key onto the taint queue, to be processed with thunk
function taint (key, thunk) {
  tainted[key] = thunk;
  
  // Check if we have a running taintWatcher process and start if not
  if (taintWatcher == null) {
    taintWatcher = window.setTimeout(taintScanner, WATCHER_TIMEOUT);
  }
};

// Make a thunk to send a form using jquery - this can be used as an
// argument to 'attach'.
//
// A success function can be supplied, it is passed the response data
// and the origin form. A default that logs to the console is used.
function sendFormJquery (form, success) {
  function ajaxSuccess(data, form) {
    console.log(util.format(
      "sendFormJquery success %s [%s]",
      data, form));
  };
  return function () { // the thunk you
    if (form.checkValidity()) {
      $.ajax(form.action, {
        type: form.method || "POST",
        dataType: "json",
        data: $(form).serialize(),
        success: function (data) {
          var originForm = form;
          (success || ajaxSuccess)(data, originForm);
        }
        // FIX-ME - we need an error handler that re-taints
      });
    }
  };
}

// When 'form' changes queue an action for it
//  
// form is an HTML Form object
//
// actionThunk is an optional processor thunk to save the form, by
// default sendFormJquery(form) is used.
function attach(form, actionThunk) {
  var handler = function (evt) { 
    taint(
      form.id || form.name || form.action, 
      actionThunk || sendFormJquery(form)
    ); 
  };
  // Taint the form when an event happens
  form.addEventListener("keydown", handler);
  form.addEventListener("change", handler);
}

exports.taint = taint;
exports.sendFormJquery = sendFormJquery;
exports.attach = attach;

// formSaver.js ends here
