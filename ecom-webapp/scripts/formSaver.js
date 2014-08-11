var util = require("util");
var $ = require("jquery");

var tainted = {};
var taintWatcher;
var WATCHER_TIMEOUT=1000;

// Send the form using Ajax
function sendForm (form) {
  if (form.checkValidity()) {
    console.log("sendForm has valid");
    if (form.hasOwnProperty("formSaver__ajaxSaverFn")) {
      form["formSaver__ajaxSaverFn"](form);
    }
    else {
      $.ajax(form.action, {
        method: form.method || "POST",
        dataType: "json",
        data: $(form).serialize(),
        success: function () {
          console.log("sendForm - default success");
          console.log("sendForm success!");
        }
      });
    }
  }
}

// Used to scan the tainted forms and send them
//
// setTimeout's itself when it's done.
function taintScanner () {
  var forms = Object.keys(tainted).map(function (key) {
    return { form: tainted[key], formKey: key };
  });
  forms.forEach(function (formObj) {
    sendForm(formObj.form);
    delete tainted[formObj.formKey];
  });
  taintWatcher = window.setTimeout(taintScanner, WATCHER_TIMEOUT);
}

// The main programmer user interface, attach a saver to a form object
//
// 'form' must be a real form object from the DOM, not a jQuery object
//
// 'ajaxSaver' is optional, if present it's a function that will be
// called to submit the form instead of a standard ajax.  'ajaxSaver'
// is always passed the form object. The 'ajaxSaver' is achieved by
// adding an extra property to the form object. This must be supported
// by the DOM for the feature to work.
//
// the standard ajaxSaver is inside function `sendForm`. It expects a
// dataType of JSON and does nothing on success or failure.
function attachSaver(form, ajaxSaver) {
  var target = form.target;
  // Taint the 
  form.addEventListener("keydown", function (evt) {
    var key = form.id || form.name;
    tainted[key] = form;
    if (ajaxSaver) {
      form.formSaver__ajaxSaverFn = ajaxSaver;
    }
    // Check if we have a running taintWatcher process and start if not
    if (taintWatcher == null) {
      taintWatcher = window.setTimeout(taintScanner, WATCHER_TIMEOUT);
    }
  });
}

exports.attach = attachSaver;

// formSaver.js ends here
