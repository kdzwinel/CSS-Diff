/**
 * Returns JSON with CSS properties that differ between two given HTML elements.
 */
var page_compareElements = function(a, b) {
    if(a === undefined || b === undefined) {
        return null;
    }

    var aComputed = getComputedStyle(a);
    var bComputed = getComputedStyle(b);
    var result = {
        '__ELEMENTS__': {
            'a': a,
            'b': b,
            __proto__: null //get rid of __proto__ in devtools panel
        },
        __proto__: null
    };

    for(var aname in aComputed) {
        var avalue = aComputed[aname];
        var bvalue = bComputed[aname];

        if( aname === 'length' || aname === 'cssText' || typeof avalue === "function" || avalue == bvalue) {
            continue;
        }

        result[aname] = {
            'a': avalue,
            'b': bvalue,
            __proto__: null
        }
    }
    
    return result;
}

chrome.devtools.panels.elements.createSidebarPane(
    "CSS Diff",
    function(sidebar) {
        function updateElementProperties() {
            sidebar.setExpression("(" + page_compareElements.toString() + ")($0, $1)");
        }
        updateElementProperties();
        chrome.devtools.panels.elements.onSelectionChanged.addListener(updateElementProperties);
    }
);
