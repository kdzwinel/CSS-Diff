(function () {
    "use strict";

    var body, diffRenderer;

    // Returns JSON with CSS properties that differ between two given HTML elements.
    function compareStyles(aComputed, bComputed) {
        if (!aComputed || !bComputed) {
            return null;
        }

        var diff = {};

        for (var aname in aComputed) {
            var avalue = aComputed[aname];
            var bvalue = bComputed[aname];

            if (!aComputed.hasOwnProperty(aname) || avalue === bvalue) {
                continue;
            }

            diff[aname] = [avalue, bvalue];
        }

        return diff;
    }

    function renderDiff(elements) {
        if(elements.length === 0) {
            body.innerHTML = "<div class='info'>Nothing to compare. Please inspect two elements first.</div>";
        } else if(elements.length === 1) {
            body.innerHTML = "<div class='info'>Nothing to compare. Please inspect one more element.</div>";
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
        }
    }

    function pushNewElement(element) {
        chrome.storage.local.get('elements', function(wrapper) {
            var elements = wrapper.elements ? wrapper.elements : [];

            elements.unshift(element);
            if(elements.length > 2) {
                elements.length = 2; //keep only two elements
            }

            chrome.storage.local.set({
                elements: elements
            });
        });
    }

    function elementSelected() {
        chrome.devtools.inspectedWindow.eval("(" + CSSSnapshooter.toString() + ")($0)", function (result, isException) {
            if (!isException && result !== null) {
                //include tabId so that we are able to differentiate between elements from current and other tab
                result.tabId = chrome.devtools.inspectedWindow.tabId;
                pushNewElement(result);
            }
        });
    }

    window.onload = function () {
        body = document.getElementsByTagName('body')[0];
        diffRenderer = new DiffRenderer(body);

        chrome.devtools.panels.elements.onSelectionChanged.addListener(elementSelected);

        //load elements from storage and render them right away
        chrome.storage.local.get('elements', function(wrapper) {
            var elements = wrapper.elements ? wrapper.elements : [];

            renderDiff(elements);
        });

        chrome.storage.onChanged.addListener(function(changes, areaName){
            if(areaName === 'local' && changes.elements) {
                renderDiff(changes.elements.newValue);
            }
        });
    };
})();