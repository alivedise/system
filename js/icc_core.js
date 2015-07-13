/* global BaseModule */
'use strict';

(function() {
  // Responsible to load and init all modules for mozIccManager.
  var IccCore = function(icc, core) {
    this.core = core;
    this.icc = icc;
  };
  IccCore.IMPORTS = [
    'shared/stk_helper/stk_helper.js',
    'js/icc_events.js',
    'js/icc_worker.js',
    'shared/advanced_timer/advanced_timer.js',
    'shared/icc_helper/icc_helper.js'
  ];
  IccCore.SUB_MODULES = [
    'Icc'
  ];
  BaseModule.create(IccCore, {
    name: 'IccCore'
  });
}());
