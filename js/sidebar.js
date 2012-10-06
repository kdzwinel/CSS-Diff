// Returns JSON with CSS properties that differ between two given HTML elements.
var page_compareElements = function(a, b) {
    if(a === undefined || b === undefined) {
        return null;
    }

    var aComputed = getComputedStyle(a);
    var bComputed = getComputedStyle(b);
    var diff = {};

    for(var aname in aComputed) {
        var avalue = aComputed[aname];
        var bvalue = bComputed[aname];

        if( aname === 'length' || aname === 'cssText' || typeof avalue === "function" || avalue == bvalue) {
            continue;
        }

        diff[aname] = [avalue, bvalue]
    }
    
    return {
        element0: {
            'tag': a.tagName,
            'id': (a.attributes.id) ? a.attributes.id.value : undefined,
            'class': (a.attributes.class) ? a.attributes.class.value : undefined
        },
        element1: {
            'tag': b.tagName,
            'id': (b.attributes.id) ? b.attributes.id.value : undefined,
            'class': (b.attributes.class) ? b.attributes.class.value : undefined
        },
        'diff': diff
    };
}

window.onload = function() {

    var body = document.getElementsByTagName('body')[0];
    var diffRenderer = new DiffRenderer(body);

    function updateElementProperties() {

        //evals page_compareElements($0, $1) in current page context
        chrome.devtools.inspectedWindow.eval("(" + page_compareElements.toString() + ")($0, $1)", function (result) {
            if(result !== null) {
                //renders the attributes differences table
                diffRenderer.render( result.element0, result.element1, result.diff );
            } else {
                body.innerHTML = "<div class='info'>Nothing to compare. Inspect two elements first.</div>";
            }
        });
    }
    updateElementProperties();

    chrome.devtools.panels.elements.onSelectionChanged.addListener(updateElementProperties);
}