'use strict';
/* exported MockApplications */

var MockApplications = (function() {
  var mockApps = {};
  var mReady = false;

  function getByManifestURL(url) {
    return mockApps[url];
  }

  function mRegisterMockApp(mockApp) {
    mockApps[mockApp.manifestURL] = mockApp;
  }

  function mUnregisterMockApp(mockApp) {
    mockApps[mockApp.manifestURL] = null;
  }

  function mTeardown() {
    mockApps = {};
    mReady = false;
  }

  function waitForReady() {
    return new Promise(function() {});
  }

  return {
    getByManifestURL: getByManifestURL,
    mRegisterMockApp: mRegisterMockApp,
    mUnregisterMockApp: mUnregisterMockApp,
    mTeardown: mTeardown,
    ready: mReady,
    waitForReady: waitForReady
  };
})();
