var util = require("util");
var $ = require("jquery");

var tainted = {};
var taintWatcher;
var WATCHER_TIMEOUT=1000;

// Send the form using Ajax
function sendForm (form) {
  if (form.checkValidity()) {
    console.log(util.format("%j", $(form).serialize()));
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
// form must be a real form object from the DOM, not a jQuery object
function attachSaver(form) {
  var target = form.target;
  // Taint the 
  form.addEventListener("keydown", function (evt) {
    var key = form.id || form.name;
    tainted[key] = form;
    // Check if we have a running taintWatcher process and start if not
    if (taintWatcher == null) {
      taintWatcher = window.setTimeout(taintScanner, WATCHER_TIMEOUT);
    }
  });
}

exports.attach = attachSaver;

// formSaver.js ends here
