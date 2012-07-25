'use strict';

var KeyboardManager = (function() {
  function debug(str) {
    dump('  +++ KeyboardManager.js +++ : ' + str + '\n');
  }

  // XXX TODO: Retrieve it from Settings, allowing 3rd party keyboards
  var host = document.location.host;
  var domain = host.replace(/(^[\w\d]+\.)?([\w\d]+\.[a-z]+)/, '$2');
  var KEYBOARD_URL = document.location.protocol + '//keyboard.' + domain;

  if (KEYBOARD_URL.substring(0, 6) == 'app://') { // B2G bug 773884
    KEYBOARD_URL += '/index.html';
  }

  var keyboardFrame = document.getElementById('keyboard-frame');
  keyboardFrame.src = KEYBOARD_URL;

  var keyboardOverlay = document.getElementById('keyboard-overlay');

  // TODO Think on a way of doing this
  // without postMessages between Keyboard and System
  window.addEventListener('message', function receiver(evt) {
    var message = JSON.parse(evt.data);
    if (message.action !== 'updateHeight')
      return;

    var app = WindowManager.getDisplayedApp();
    if (!app && !TrustedDialog.trustedDialogIsShown())
      return;

    var currentApp;
    if (TrustedDialog.trustedDialogIsShown()) {
      currentApp = TrustedDialog.getFrame();
    } else {
      WindowManager.setAppSize(app);
      currentApp = WindowManager.getAppFrame(app);
    }

    var height = (parseInt(currentApp.style.height) -
                  message.keyboardHeight);

    if (!message.hidden && !keyboardFrame.classList.contains('hide')) {
      currentApp.style.height = height + 'px';
      keyboardOverlay.style.height = (height + 20) + 'px';
    } else if (!message.hidden) {
      keyboardFrame.classList.remove('hide');
      keyboardFrame.addEventListener('transitionend', function keyboardShown() {
        keyboardFrame.removeEventListener('transitionend', keyboardShown);
        currentApp.style.height = height + 'px';
        keyboardOverlay.style.height = (height + 20) + 'px';
        keyboardFrame.classList.add('visible');
      });
    } else {
      keyboardFrame.classList.add('hide');
      keyboardFrame.classList.remove('visible');
    }
  });

  var previousKeyboardType = null;

  var kKeyboardDelay = 100;
  var updateKeyboardTimeout = 0;

  window.navigator.mozKeyboard.onfocuschange = function onfocuschange(evt) {
    var currentType = evt.detail.type;
    if (previousKeyboardType === currentType)
      return;
    previousKeyboardType = currentType;
    clearTimeout(updateKeyboardTimeout);

    var message = {};

    switch (previousKeyboardType) {
      case 'blur':
        message.type = 'hideime';
        break;

      default:
        message.type = 'showime';
        message.detail = evt.detail;
        break;
    }

    var keyboardWindow = keyboardFrame.contentWindow;
    updateKeyboardTimeout = setTimeout(function updateKeyboard() {
      keyboardWindow.postMessage(JSON.stringify(message), KEYBOARD_URL);
    }, kKeyboardDelay);
  };
})();

