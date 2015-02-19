function DiffRenderer(container) {
  "use strict";

  var shorthands = {
    "animation": ["animation-name", "animation-duration", "animation-timing-function", "animation-delay", "animation-iteration-count", "animation-direction", "animation-fill-mode", "animation-play-state"],
    "background": ["background-image", "background-position", "background-position-x", "background-position-y", "background-size", "background-repeat", "background-repeat-x", "background-repeat-y", "background-attachment", "background-origin", "background-clip", "background-color"],
    //"background-position": ["background-position-x", "background-position-y"],
    //"background-repeat": ["background-repeat-x", "background-repeat-y"],
    "border": ["border-color", "border-style", "border-width"],
    "border-bottom": ["border-bottom-width", "border-bottom-style", "border-bottom-color"],
    //"border-color": ["border-top-color", "border-right-color", "border-bottom-color", "border-left-color"],
    //"border-image": ["border-image-source", "border-image-slice", "border-image-width", "border-image-outset", "border-image-repeat"],
    "border-left": ["border-left-width", "border-left-style", "border-left-color"],
    "border-radius": ["border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius"],
    "border-right": ["border-right-width", "border-right-style", "border-right-color"],
    //"border-spacing": ["-webkit-border-horizontal-spacing", "-webkit-border-vertical-spacing"],
    //"border-style": ["border-top-style", "border-right-style", "border-bottom-style", "border-left-style"],
    "border-top": ["border-top-width", "border-top-style", "border-top-color"],
    //"border-width": ["border-top-width", "border-right-width", "border-bottom-width", "border-left-width"],
    "flex": ["flex-grow", "flex-shrink", "flex-basis"],
    "flex-flow": ["flex-direction", "flex-wrap"],
    "font": ["font-family", "font-size", "font-style", "font-variant", "font-weight", "line-height"],
    "grid-area": ["grid-row-start", "grid-column-start", "grid-row-end", "grid-column-end"],
    "grid-column": ["grid-column-start", "grid-column-end"],
    "grid-row": ["grid-row-start", "grid-row-end"],
    //"height": ["min-height", "max-height"],
    "list-style": ["list-style-type", "list-style-position", "list-style-image"],
    "margin": ["margin-top", "margin-right", "margin-bottom", "margin-left"],
    "marker": ["marker-start", "marker-mid", "marker-end"],
    "outline": ["outline-color", "outline-style", "outline-width"],
    "overflow": ["overflow-x", "overflow-y"],
    "padding": ["padding-top", "padding-right", "padding-bottom", "padding-left"],
    "text-decoration": ["text-decoration-line", "text-decoration-style", "text-decoration-color"],
    "transition": ["transition-property", "transition-duration", "transition-timing-function", "transition-delay"],
    //"-webkit-animation": ["-webkit-animation-name", "-webkit-animation-duration", "-webkit-animation-timing-function", "-webkit-animation-delay", "-webkit-animation-iteration-count", "-webkit-animation-direction", "-webkit-animation-fill-mode", "-webkit-animation-play-state"],
    "-webkit-border-after": ["-webkit-border-after-width", "-webkit-border-after-style", "-webkit-border-after-color"],
    "-webkit-border-before": ["-webkit-border-before-width", "-webkit-border-before-style", "-webkit-border-before-color"],
    "-webkit-border-end": ["-webkit-border-end-width", "-webkit-border-end-style", "-webkit-border-end-color"],
    "-webkit-border-start": ["-webkit-border-start-width", "-webkit-border-start-style", "-webkit-border-start-color"],
    //"-webkit-border-radius": ["border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius"],
    "-webkit-columns": ["-webkit-column-width", "-webkit-column-count"],
    "-webkit-column-rule": ["-webkit-column-rule-width", "-webkit-column-rule-style", "-webkit-column-rule-color"],
    "-webkit-margin-collapse": ["-webkit-margin-before-collapse", "-webkit-margin-after-collapse"],
    "-webkit-mask": ["-webkit-mask-image", "-webkit-mask-position-x", "-webkit-mask-position-y", "-webkit-mask-size", "-webkit-mask-repeat-x", "-webkit-mask-repeat-y", "-webkit-mask-origin", "-webkit-mask-clip"],
    "-webkit-mask-position": ["-webkit-mask-position-x", "-webkit-mask-position-y"],
    "-webkit-mask-repeat": ["-webkit-mask-repeat-x", "-webkit-mask-repeat-y"],
    "-webkit-text-emphasis": ["-webkit-text-emphasis-style", "-webkit-text-emphasis-color"],
    "-webkit-text-stroke": ["-webkit-text-stroke-width", "-webkit-text-stroke-color"],
    "-webkit-transition": ["-webkit-transition-property", "-webkit-transition-duration", "-webkit-transition-timing-function", "-webkit-transition-delay"],
    "-webkit-transform-origin": ["-webkit-transform-origin-x", "-webkit-transform-origin-y", "-webkit-transform-origin-z"]
  };

  //Checks if attribute has a (known) suffix and returns it
  var getShorthand = function (propertyName) {
    if (!isShorthand(propertyName)) {
      for (var shorthand in shorthands) {
        if (shorthands.hasOwnProperty(shorthand)) {
          var properties = shorthands[shorthand];

          for (var i = 0, l = properties.length; i < l; i++) {
            if (properties[i] === propertyName) {
              return shorthand;
            }
          }
        }
      }
    }

    return null;
  };

  //Checks if given attribute name is used as a suffix for other attributes
  var isShorthand = function (propertyName) {
    return ( shorthands[propertyName] !== undefined );
  };

  var isWebkitPrefixed = function (propertyName) {
    return propertyName.substr(0, 8) === "-webkit-";
  };

  var drawProperty = function (property, settings) {
    var cssClass = "";
    var attributes = "";
    var row = "";

    if (settings.parent) {
      cssClass = " child-property " + settings.parent.name;
    } else if (isShorthand(property.name) && settings.hasChildren) {
      attributes = "class='parent-property' data-name='" + property.name + "'";
    }

    row += "<tr class='upper" + cssClass + "'>";
    row += "<th rowspan='2' " + attributes + ">" + property.name + "</th>";
    row += "<td class='element0'>" + property.value1 + "</td>";
    row += "</tr>";
    row += "<tr class='lower" + cssClass + "'>";
    row += "<td class='element1'>" + property.value2 + "</td>";
    row += "</tr>";

    return row;
  };

  //Generates reasonable name for element from its tag name, classes and id
  this.nameElement = function (element) {
    var name = element.tag;

    if (element.id !== null) {
      name += '#' + element.id;
    } else if (element.class !== null) {
      name += '.' + element.class.replace(/ /g, '.');
    }

    return name;
  };

  //Renders a table with attribute differences
  this.render = function (element0, element1, diff) {
    var buffer = "";
    var webkitBuffer = "";

    buffer += '<p class="description">Comparing <strong class="element0">' + this.nameElement(element0) + '</strong> ';
    buffer += (element0.differentTab) ? '(from different tab) ' : '';
    buffer += 'with <strong class="element1">' + this.nameElement(element1) + '</strong>';
    buffer += (element1.differentTab) ? '(from different tab)' : '';
    buffer += '.</p>';

    container.querySelector('#comparing').innerHTML = buffer;
    buffer = '';

    var propertyTree = {};
    var property, parentPropertyName;

    for (var i = 0, il = diff.length; i < il; i++) {
      property = diff[i];
      parentPropertyName = getShorthand(property.name);

      if (isShorthand(property.name) || !parentPropertyName) {
        if (propertyTree[property.name]) {
          propertyTree[property.name].property = property;
        } else {
          propertyTree[property.name] = {
            property: property,
            children: []
          };
        }
      } else {
        if (propertyTree[parentPropertyName]) {
          propertyTree[parentPropertyName].children.push(property);
        } else {
          propertyTree[parentPropertyName] = {
            property: null,
            children: [property]
          };
        }
      }
    }

    for (var key in propertyTree) {
      if (propertyTree.hasOwnProperty(key)) {
        var node = propertyTree[key];
        var parentProperty = node.property;
        var html = "";

        if (parentProperty) {
          html = drawProperty(parentProperty, {
            parent: null,
            hasChildren: (node.children.length > 0)
          });

          //webkit attributes will be displayed in a different table
          if (isWebkitPrefixed(parentProperty.name)) {
            webkitBuffer += html;
          } else {
            buffer += html;
          }
        }

        for (i = 0, il = node.children.length; i < il; i++) {
          var child = node.children[i];
          html = drawProperty(child, {
            parent: parentProperty,
            children: false
          });

          if (!parentProperty && isWebkitPrefixed(child.name)) {
            webkitBuffer += html;
          } else {
            buffer += html;
          }
        }
      }
    }
    container.querySelectorAll('#result table')[0].innerHTML = buffer;
    container.querySelectorAll('#result table')[1].innerHTML = webkitBuffer;

    //react to "onclick" events on attributes that have children
    var suffixParents = container.getElementsByClassName('parent-property');
    for (i = 0, il = suffixParents.length; i < il; i++) {
      var suffixParent = suffixParents[i];

      suffixParent.onclick = function () {
        this.classList.toggle("open");

        var children = container.getElementsByClassName(this.dataset.name);

        for (var j = 0, jl = children.length; j < jl; j++) {
          children[j].style.display = (children[j].style.display !== "table-row") ? "table-row" : "none";
        }
      };
    }
  };
}