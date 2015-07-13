'use strict';
/* exported LoadElementHelper */

require('/shared/html_imports/html_imports.js');

var LoadElementHelper = {
  load: function(element) {
    var importHook = document.createElement('link');
    importHook.setAttribute('rel', 'import');
    importHook.setAttribute('href', '/fxa/elements/' + element);
    document.head.appendChild(importHook);
  }
};

