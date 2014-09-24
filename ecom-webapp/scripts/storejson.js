// storejson.js - a simple persistence layer for localStorage

// Make a "fake" form that htmlFrom2Object will think is a form
// very useful for testing
exports.htmlFormFake = function (obj) {
  var elements = Object.keys(obj).map(function (k) {
    var v = obj[k];
    return { name:k, value: v};
  });
  return {
    tagname: "FORM",
    elements: elements
  };
};

exports.htmlForm2Object = function (form) {
  var o = {};
  var arr = Object.keys(form.elements).filter(
    function (v) { return /[0-9]/.test(v); }
  ).map(
    function (v) { 
      var index = parseInt(v);
      var value = form.elements[index];
      return value; 
    }
  ).every(function (v) {
    o[v.name] = v.value;
    return true;
  });
  return o;
};

exports.simpleStorage = function () {
  var a = new Array();
  a.setItem = function (n, v) {
    a[n] = v;
  };
  a.getItem = function (n) {
    return a[n];
  };
  a.removeItem = function (n) {
    var d = delete a[n];
    return d;
  };
  return a;
};

var getLS = function () {
  try {
    return localStorage;
  } catch (e) {
    return exports.simpleStorage();
  }
}

exports.PArray = function (id, transformers) {
  var tx = function (val, transformers) {
    if (transformers) {
      if (!(transformers instanceof Array)) {
        // it's probably arguments... so make it an array, remember to knock off "val"
        transformers = (Array.prototype.slice.call(arguments)).slice(1);
      }
    }
    var Found = function (value) {
      this.value = value;
    };
    var escape = function (value) {
      throw new Found(value);
    };
    try {
      transformers.forEach(
        function (transformer) { 
          transformer(val, escape); 
        }
      );
    }
    catch (e) {
      if (e instanceof Found) {
        return e.value;
      }
      throw e;
    }
    return val;
  };

  var a = new Array();
  var ls = getLS();
  return {
    set: function (n, v) {
      a[n] = tx(v, transformers);
      return ls[id] = JSON.stringify(a);
    },
    get: function (n) {
      a = JSON.parse(ls[id]);
      return tx(a[n]);
    },
    keys: function () {
      return a.keys();
    }
  };
}; 

try {
  if (window != undefined) {
    window.PArray = exports.PArray;
  }
}
catch (e) {}

// storejson.js ends here
