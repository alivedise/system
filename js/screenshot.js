// screenshot.js: system screenshot module
//
// This system module takes a screenshot of the currently running app
// or homescreen and stores it with DeviceStorage when the user
// presses the home and sleep buttons at the same time.
//
// XXX somehow also need to prevent the home and sleep buttons from
// doing anything. Home works on key up not key down, so I may need to
// have the user press home first then sleep.
//
// This script must be used with the defer attribute.
// And it probably needs to run before the window_manager.js script
// which tries to prevent propagation of the HOME key to other modules.
(function() {
  // Register capturing handlers for both keydown and keyup
  window.addEventListener('keydown', keyDownHandler, true);
  window.addEventListener('keyup', keyUpHandler, true);

  // The current state of the two keys we care about
  var homeKeyDown = false, sleepKeyDown = false;

  var preventDefaultOnHomeKeyUp = false;
  var preventDefaultOnSleepKeyUp = false;

  function keyDownHandler(e) {
    if (e.keyCode === e.DOM_VK_HOME) 
      homeKeyDown = true;
    if (e.keyCode === e.DOM_VK_SLEEP) 
      sleepKeyDown = true;

    if (homeKeyDown && sleepKeyDown) {
      takeScreenshot();
      preventDefaultOnHomeKeyUp = true;
      preventDefaultOnSleepKeyUp = true;
    }
  }

  function keyUpHandler(e) {
    if (e.keyCode === e.DOM_VK_HOME) {
      homeKeyDown = false;
      if (preventDefaultOnHomeKeyUp) {
        e.preventDefault();
        preventDefaultOnHomeKeyUp = false;
      }
    }
    if (e.keyCode === e.DOM_VK_SLEEP) {
      sleepKeyDown = false;
      if (preventDefaultOnSleepKeyUp) {
        e.preventDefault();
        preventDefaultOnSleepKeyUp = false;
      }
    }
  }

  function takeScreenshot() {
    try {
      console.log('takeScreenshot');

      var app = WindowManager.getDisplayedApp();
      var frame;
      if (app) {
        frame = WindowManager.getAppFrame(app);
      }
      else {
        frame = document.getElementById('homescreen');
      }

      console.log("app, frame", app, frame);

      var screenshotRequest = frame.getScreenshot();

      screenshotRequest.onerror = function() {
        console.log("screenshot error", screenshotRequest.error);
      };

      screenshotRequest.onsuccess = function(e) {
        try {
          console.log("getScreenshot() success");
          console.log("url prefix", screenshotRequest.result.substring(0,50));
          
          
          // Feedback that the screenshot was taken
          // TODO: play a sound instead?
          navigator.mozVibrate([0, 100, 150, 100]);  // buzz pause buzz
          
          // Here is the result of the screenshot
          var dataurl = e.target.result;
          
          // Annoyingly, the screenshot API gives us a data url 
          // instead of the blob that we really want. So we have to 
          // render it to an image, and then copy that image into a canvas
          // to convert it to a file that we can save
          var img = document.createElement('img');
          img.src = dataurl;
          img.onload = function() {
            try {
              console.log("img.onload");
              
              var canvas = document.createElement('canvas');
              var context = canvas.getContext('2d');
              canvas.width = window.innerWidth;
              canvas.height = window.innerHeight;
              context.drawImage(img, 0, 0, window.innerWidth, window.innerHeight);
              var blob = canvas.mozGetAsFile('', 'image/png');
              console.log("got blob", blob.size, blob.type);
              var storages = navigator.getDeviceStorage('pictures');
              var storage = storages[storages.length-1];

              var origin = app ? app : 'homescreen';
              origin = origin.replace('http://', '');
              origin = origin.replace('.gaiamobile.org', '');

              // Start with an ISO date/time string
              var timestamp = (new Date().toISOString());
              // Get rid of milliseconds and timezone
              timestamp = timestamp.substring(0, timestamp.lastIndexOf('.'));
              // Convert colons; they're no good in filenames
              timestamp = timestamp.replace(/:/g, '-');
              // Get rid of the strange capital T, too
              timestamp = timestamp.replace('T', '-');

              var filename = 'screenshots/' + origin + '-' + timestamp + '.png';
              
              console.log("Saving", filename, storage);

              var storageRequest = storage.addNamed(blob, filename);
              storageRequest.onerror = function() {
                console.log("addNamed() error",
                            storageRequest.error,
                            storageRequest.error.name);
              }
              storageRequest.onsuccess = function() {
                try {
                  console.log("Saved", filename);
                  
                  // Vibrate again when the screenshot is saved
                  navigator.mozVibrate([100, 100]);  // pause buzz
                  
                  // Display filename in a notification
                  navigator.mozNotification
                    .createNotification('Screenshot saved', filename)
                    .show();
                }
                catch(e) {
                  console.log(e);
                }
              };
            }
            catch(e) {
              console.log("exception in onload", e);
            }
          }
        }
        catch(e) {
          console.log("exception in onsuccess", e);
        }
      }
    }
    catch(e) {
      console.log("exception in takeScreenshot", e);
    }
  }
}());