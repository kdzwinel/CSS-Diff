(function () {
  "use strict";

  var body, button, diffRenderer, fallbackElements = [];

  // Returns CSS properties (in alphabetic order) that differ between two given HTML elements.
  function compareStyles(aComputed, bComputed) {
    if (!aComputed || !bComputed) {
      return null;
    }

    var diff = [];

    for (var aname in aComputed) {
      var avalue = aComputed[aname];
      var bvalue = bComputed[aname];

      if (!aComputed.hasOwnProperty(aname) || avalue === bvalue) {
        continue;
      }

      diff.push({
        name: aname,
        value1: avalue,
        value2: bvalue
      });
    }

    //sort array by property name
    diff = diff.sort(function (a, b) {
      return a.name > b.name ? 1 : -1;
    });

    return diff;
  }

  function renderDiff(elements) {
    body.querySelector('#wrapper').classList.add('showMessage');
    body.querySelector('#wrapper').classList.remove('showResult');

    if (elements.length === 0) {
      body.querySelector('#message p').innerHTML = "Nothing to compare. Please inspect two elements first.";
    } else if (elements.length === 1) {
      body.querySelector('#message p').innerHTML = "Nothing to compare. Please inspect one more element.";
    } else {
      var elem1 = elements[0],
        elem2 = elements[1],
        diff = compareStyles(elem1.style, elem2.style);

      diffRenderer.render({
        id: elem1.id,
        tag: elem1.tag,
        'class': elem1.class,
        differentTab: (elem1.tabId !== chrome.devtools.inspectedWindow.tabId)
      }, {
        id: elem2.id,
        tag: elem2.tag,
        'class': elem2.class,
        differentTab: (elem2.tabId !== chrome.devtools.inspectedWindow.tabId)
      }, diff);

      body.querySelector('#wrapper').classList.add('showResult');
      body.querySelector('#wrapper').classList.remove('showMessage');
    }
  }

  function pushNewElement(element) {
    try {
      var elements = [],
        json = localStorage.getItem('elements');

      if (json) {
        elements = JSON.parse(json);
      }

      elements.unshift(element);
      if (elements.length > 2) {
        elements.length = 2; //keep only two elements
      }

      localStorage.setItem('elements', JSON.stringify(elements));

      renderDiff(elements);
    } catch (e) {
      fallbackElements.unshift(element);
      if (fallbackElements.length > 2) {
        fallbackElements.length = 2;
      }

      renderDiff(fallbackElements);
    }
  }

  function updateLastSelected(element) {
    body.querySelector('#selected strong').innerText = diffRenderer.nameElement(element);
  }

  function loadLastSelected(callback) {
    chrome.devtools.inspectedWindow.eval("(" + CSSSnapshooter.toString() + ")($0)", function (result, isException) {
      if (!isException && result !== null) {
        //include tabId so that we are able to differentiate between elements from current and other tab
        result.tabId = chrome.devtools.inspectedWindow.tabId;

        callback(result);
      }
    });
  }

  function recognizeOS() {
    var os = null;
    if (navigator.appVersion.indexOf("Win") !== -1) {
      os = "windows";
    }
    if (navigator.appVersion.indexOf("Mac") !== -1) {
      os = "mac";
    }
    if (navigator.appVersion.indexOf("Linux") !== -1) {
      os = "linux";
    }

    return os;
  }

  window.onload = function () {
    body = document.getElementsByTagName('body')[0];
    button = body.querySelector('#selected button');

    diffRenderer = new DiffRenderer(body);

    chrome.devtools.panels.elements.onSelectionChanged.addListener(loadLastSelected.bind(this, updateLastSelected));

    //load last inspected element right away
    loadLastSelected(updateLastSelected);

    button.addEventListener('click', function () {
      loadLastSelected(pushNewElement);
    });

    //load elements from storage and render them right away
    var elements = [];

    try {
      var json = localStorage.getItem('elements');

      if (json) {
        elements = JSON.parse(json);
      }

    } catch (e) {
      body.querySelector('#thirdPartyCookiesWarning').classList.add('visible');
    }

    renderDiff(elements);

    window.addEventListener('storage', function (storage) {
      if (storage.key === 'elements') {
        try {
          renderDiff(JSON.parse(storage.newValue));
        } catch (e) {
          //
        }
      }
    });

    //different fonts are used for different platforms
    var os = recognizeOS();
    if (os) {
      body.classList.add('platform-' + os);
    }
  };
})();