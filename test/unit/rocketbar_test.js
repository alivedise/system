'use strict';

requireApp('system/shared/test/unit/mocks/mock_settings_listener.js');
requireApp('system/test/unit/mock_cards_view.js');
mocha.globals(['Rocketbar']);

var mocksForRocketBar = new MocksHelper([
  'CardsView',
  'SettingsListener'
]).init();

suite('system/Rocketbar', function() {
  var stubById;
  var fakeEvt;
  var fakeElement;

  mocksForRocketBar.attachTestHelpers();
  setup(function(done) {
    fakeElement = document.createElement('div');
    fakeElement.style.cssText = 'height: 100px; display: block;';
    stubById = this.sinon.stub(document, 'getElementById')
                          .returns(fakeElement.cloneNode(true));
    this.sinon.useFakeTimers();
    requireApp('system/js/rocketbar.js', done);
  });

  teardown(function() {
    stubById.restore();
    this.sinon.clock.restore();
  });

  suite('render', function() {
    test('shown should be true', function() {
      Rocketbar.render();
      this.sinon.clock.tick(1);
      assert.equal(Rocketbar.shown, true);
      Rocketbar.hide();
    });

    test('only renders once', function() {
      var eventListenerStub = this.sinon.stub(window.document.body,
        'addEventListener');
      Rocketbar.render();
      this.sinon.clock.tick();
      Rocketbar.render();
      this.sinon.clock.tick();
      assert.isTrue(eventListenerStub.withArgs('keyboardchange').calledOnce);
      Rocketbar.hide();
    });

    test('resets the value', function() {
      Rocketbar.searchInput.value = 'foo';
      Rocketbar.render();
      this.sinon.clock.tick();
      assert.equal(Rocketbar.searchInput.value, '');
      Rocketbar.hide();
    });

    test('fires the rocketbarshown event', function() {
      var called = false;
      window.addEventListener('rocketbarshown', function() {
        called = true;
      });
      Rocketbar.render();
      this.sinon.clock.tick();
      assert.equal(called, true);
      Rocketbar.hide();
    });

    test('posts a message to clear', function() {
      var message;
      Rocketbar._port = {
        postMessage: function(msg) {
          message = msg;
        }
      };
      Rocketbar.render();
      this.sinon.clock.tick();
      assert.equal('clear', message.action);
      Rocketbar.hide();
    });

    test('loads the search app', function() {
      var searchAppStub = this.sinon.stub(Rocketbar, 'loadSearchApp')
                          .returns(true);
      Rocketbar.render();
      Rocketbar.searchBar.dispatchEvent(
        new CustomEvent('transitionend')
      );
      assert.equal(true, searchAppStub.calledWith());
      Rocketbar.hide();
      searchAppStub.restore();
    });

    suite('interactions', function() {
      var searchAppStub, cardsViewStub, focusStub;

      setup(function() {
        searchAppStub = this.sinon.stub(Rocketbar, 'loadSearchApp')
                            .returns(true);
        cardsViewStub = this.sinon.stub(window, 'dispatchEvent');
        focusStub = this.sinon.stub(Rocketbar.searchBar, 'focus');
      });

      teardown(function() {
        cardsViewStub.restore();
        searchAppStub.restore();
        focusStub.restore();
      });

      test('swipe event', function() {

        Rocketbar.pointerY = 100;
        Rocketbar.render(200);
        this.sinon.clock.tick();
        Rocketbar.searchBar.dispatchEvent(
          new CustomEvent('transitionend')
        );
        assert.equal(cardsViewStub.getCall(1).args[0].type, 'taskmanagershow');
        assert.equal(true, focusStub.notCalled);
        Rocketbar.hide();
      });

      test('tap event', function() {
        var called = false;
        window.addEventListener('taskmanagershow', function() {
          called = true;
        });
        Rocketbar.pointerY = 0;
        Rocketbar.render(100);
        this.sinon.clock.tick();
        Rocketbar.searchBar.dispatchEvent(
          new CustomEvent('transitionend')
        );
        assert.equal(false, called);
        assert.equal(true, focusStub.calledOnce);
        Rocketbar.hide();
      });
    });
  });

  suite('hide', function() {
    test('shown should be false', function() {
      Rocketbar.render();
      this.sinon.clock.tick();
      Rocketbar.hide();
      assert.equal(Rocketbar.shown, false);
    });

    test('keyboardchange listener is removed', function() {
      var eventListenerStub = this.sinon.stub(window.document.body,
        'removeEventListener');
      Rocketbar.render();
      this.sinon.clock.tick();
      Rocketbar.hide();
      assert.isTrue(eventListenerStub.withArgs('keyboardchange').calledOnce);
    });

   test('blurs the input', function() {
      var inputBlurStub = this.sinon.stub(Rocketbar.searchInput, 'blur')
                          .returns(true);
      Rocketbar.render();
      this.sinon.clock.tick();
      Rocketbar.hide();
      assert.equal(true, inputBlurStub.calledWith());
      inputBlurStub.restore();
    });

    test('fires the rocketbarhidden event', function() {
      var called = false;
      window.addEventListener('rocketbarhidden', function() {
        called = true;
      });
      Rocketbar.render();
      this.sinon.clock.tick();
      Rocketbar.hide();
      assert.equal(called, true);
    });
  });
});
