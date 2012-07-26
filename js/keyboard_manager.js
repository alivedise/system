'use strict';

var KeyboardManager = (function() {
  // XXX TODO: Retrieve it from Settings, allowing 3rd party keyboards
  var host = document.location.host;
  var domain = host.replace(/(^[\w\d]+\.)?([\w\d]+\.[a-z]+)/, '$2');

  var keyboardURL = document.location.protocol + '//keyboard.' + domain;
  if (keyboardURL.substring(0, 6) == 'app://') { // B2G bug 773884
    keyboardURL += '/index.html';
  }

  var keyboardFrame = document.getElementById('keyboard-frame');
  keyboardFrame.src = keyboardURL;

  var keyboardOverlay = document.getElementById('keyboard-overlay');

  // TODO Think on a way of doing this
  // without postMessages between Keyboard and System
  window.addEventListener('message', function receiver(evt) {
    var message = JSON.parse(evt.data);
    if (message.action === 'hideKeyboard') {
      keyboardFrame.classList.add('hide');
      keyboardFrame.classList.remove('visible');
      return;
    }

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

    var dialogOverlay = document.getElementById('dialog-overlay');

    var height = currentApp.getBoundingClientRect().height -
                  message.keyboardHeight;
    keyboardOverlay.hidden = true;

    if (message.hidden) {
      keyboardFrame.classList.add('hide');
      keyboardFrame.classList.remove('visible');
      dialogOverlay.style.height = (height + 20) + 'px';
      return;
    }

    if (!keyboardFrame.classList.contains('hide')) {
      currentApp.style.height = height + 'px';
      dialogOverlay.style.height = (height + 20) + 'px';
      keyboardOverlay.style.height = (height + 20) + 'px';
      keyboardOverlay.hidden = false;
    } else {
      keyboardFrame.classList.remove('hide');
      keyboardFrame.addEventListener('transitionend', function keyboardShown() {
        keyboardFrame.removeEventListener('transitionend', keyboardShown);
        dialogOverlay.style.height = (height + 20) + 'px';
        currentApp.style.height = height + 'px';
        keyboardOverlay.style.height = (height + 20) + 'px';
        keyboardOverlay.hidden = false;
        keyboardFrame.classList.add('visible');
      });
    }
  });
  var previousKeyboardType = null;

  var kKeyboardDelay = 100;
  var updateKeyboardTimeout = 0;

  window.navigator.mozKeyboard.onfocuschange = function onfocuschange(evt) {
    var currentType = evt.detail.type;
    if (previousKeyboardType === currentType &&
        currentType.indexOf('select') == -1)
      return;
    previousKeyboardType = currentType;
    clearTimeout(updateKeyboardTimeout);

    var message = {};

    switch (previousKeyboardType) {
      case 'blur':
        message.type = 'hideime';
        break;
      case 'select-one':
      case 'select-multiple':
        console.log('onfocus change for select');
        var event = document.createEvent('CustomEvent');
        event.initCustomEvent('select', true, true, evt.detail);
        window.dispatchEvent(event);
        break;
      default:
        var event = document.createEvent('CustomEvent');
        event.initCustomEvent('select', true, true, evt.detail);
        window.dispatchEvent(event);

	/*
	 *  Comment out temporarily to do the same overlay UI test for "input" element
        console.log('showime event');
        message.type = 'showime';
        message.detail = evt.detail;
	*/
        break;
    }

    var keyboardWindow = keyboardFrame.contentWindow;
    updateKeyboardTimeout = setTimeout(function updateKeyboard() {
      if (message.type === 'hideime') {
        keyboardFrame.classList.add('hide');
        keyboardFrame.classList.remove('visible');
      }
      keyboardWindow.postMessage(JSON.stringify(message), KEYBOARD_URL);
    }, kKeyboardDelay);
  };
})();

