function DiffRenderer(container) {
    "use strict";

    var suffixes = ["background", "margin", "padding", "border", "outline", "font", "listStyle", "overflow"];

    //Checks if attribute has a (known) suffix and returns it
    var getSuffix = function (attrName) {
        for (var i = 0, l = suffixes.length; i < l; i++) {
            var suffix = suffixes[i];

            if (attrName.length > suffix.length && attrName.substr(0, suffix.length) === suffix) {
                return suffix;
            }
        }

        return null;
    };

    //Checks if given attribute name is used as a suffix for other attributes
    var isSuffix = function (attrName) {
        return ( suffixes.indexOf(attrName) !== -1 );
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

        for (var i = 0, il = diff.length; i < il; i++) {
            var property = diff[i];

            var suffix = getSuffix(property.name);
            var suffixClass = "";
            var suffixParentAttributes = "";
            var row = "";

            if (suffix !== null) {
                suffixClass = " suffix " + suffix;
            }

            if (isSuffix(property.name)) {
                suffixParentAttributes = "class='suffix-parent' data-suffix='" + property.name + "'";
            }

            row += "<tr class='upper" + suffixClass + "'>";
            row += "<th rowspan='2' " + suffixParentAttributes + ">" + property.name + "</th>";
            row += "<td class='element0'>" + property.value1 + "</td>";
            row += "</tr>";
            row += "<tr class='lower" + suffixClass + "'>";
            row += "<td class='element1'>" + property.value2 + "</td>";
            row += "</tr>";

            //webkit attributes will be put to a different table
            if (property.name.substr(0, 8) === "-webkit-") {
                webkitBuffer += row;
            } else {
                buffer += row;
            }
        }
        container.querySelectorAll('#result table')[0].innerHTML = buffer;
        container.querySelectorAll('#result table')[1].innerHTML = webkitBuffer;

        //react to "onclick" events on attributes that have children
        var suffixParents = container.getElementsByClassName('suffix-parent');
        for (i = 0, il = suffixParents.length; i < il; i++) {
            var suffixParent = suffixParents[i];

            suffixParent.onclick = function () {
                this.classList.contains("open") ? this.classList.remove("open") : this.classList.add("open");

                var children = container.getElementsByClassName(this.dataset.suffix);

                for (var j = 0, jl = children.length; j < jl; j++) {
                    children[j].style.display = (children[j].style.display !== "table-row") ? "table-row" : "none";
                }
            };
        }
    };
}