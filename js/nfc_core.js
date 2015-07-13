/* exported NfcCore */
/* global BaseModule */
'use strict';

(function() {
  var NfcCore = function(nfc) {
    this.nfc = nfc;
  };

  NfcCore.IMPORTS = [
    'shared/utilities/utilities.js',
    'shared/nfc_utils/nfc_utils.js'
  ];

  NfcCore.SUB_MODULES = [
    'NfcManager',
    'NfcHandler',
    'NdefUtils'
  ];
  /**
   * @class NfcCore
   */
  BaseModule.create(NfcCore, {
    name: 'NfcCore'
  });
}());
