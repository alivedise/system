'use strict';

/**
 * Define a basic mozbrowser iframe class.
 * It creates a mozbrowser iframe,
 * and finally returns the DOM element it just created.
 *
 * The BrowserFrame instance has a 'element' field,
 * which is the mozbrowser iframe it generated or converted to.
 *
 * @param {Object} config
 *        The configuration object generated by BrowserConfig.
 * @param {DOMIFRAMEElement} [frame]
 *        The existing frame to be converted to mozbrowsr iframe.
 * @class  BrowserFrame
 */

var BrowserFrame = (function invocation() {
  var nextId = 0;
  function BrowserFrame() { // This constructor function is a local variable.
    this.element = null;
    this._id = nextId++;
    // All arguments are values to createFrame
    createFrame.apply(this, arguments);
  }

  BrowserFrame.className = 'browser';

  // These are helper functions and variables used by the methods above
  // They're not part of the public API of the module, but they're hidden
  // within this function scope so we don't have to define them as a
  // property of Browser or prefix them with underscores.
  function createFrame(config, frame) {
    var browser = frame || document.createElement('iframe');
    browser.setAttribute('mozallowfullscreen', 'true');

    // Most apps currently need to be hosted in a special 'mozbrowser' iframe.
    // They also need to be marked as 'mozapp' to be recognized as apps by the
    // platform.
    browser.setAttribute('mozbrowser', 'true');

    // Give a name to the frame for differentiating between main frame and
    // inline frame. With the name we can get frames of the same app using the
    // window.open method.
    browser.name = 'main';

    if (config.oop)
      browser.setAttribute('remote', 'true');

    if (config.manifestURL)
      browser.setAttribute('mozapp', config.manifestURL);

    if (config.useAsyncPanZoom) {
      // XXX: Move this dataset assignment into app window object.
      browser.dataset.useAsyncPanZoom = true;
      browser.setAttribute('mozasyncpanzoom', 'true');
    }

    setMozAppType(browser, config);

    if (config.url)
      browser.src = config.url;

    browser.id = BrowserFrame.className + this._id;

    browser.classList.add(BrowserFrame.className);

    // Store the element
    this.element = browser;
  };

  function setMozAppType(iframe, config) {
    // XXX: Those urls needs to be built dynamically.
    if (config.url.startsWith(window.location.protocol +
                              '//communications.gaiamobile.org' +
                              (window.location.port ?
                                (':' + window.location.port) : '') +
                              '/dialer') ||
        config.url.startsWith(window.location.protocol +
                              '//clock.gaiamobile.org')) {
      iframe.setAttribute('mozapptype', 'critical');
    } else if (config.isHomescreen) {
      /* If this frame corresponds to the homescreen, set mozapptype=homescreen
       * so we're less likely to kill this frame's process when we're running
       * low on memory.
       *
       * We must do this before we the appendChild() call below. Once
       * we add this frame to the document, we can't change its app type.
       */
      iframe.setAttribute('mozapptype', 'homescreen');
    }
  };

  // The public API for this module is the Browser() constructor function.
  // We need to export that function from this private namespace so that
  // it can be used on the outside. In this case, we export the constructor
  // by returning it. It becomes the value of the assignment expression
  // on the first line above.
  return BrowserFrame;
}()); // Invoke the function immediately after defining it.

