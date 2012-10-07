function DiffRenderer(container) {
    var suffixes = ["background", "margin", "padding", "border", "outline", "font", "listStyle", "overflow"];

    //Generates reasonable name for element from its tag name, classes and id
    var elementName = function(element) {
        var name = element.tag;

        if(element.id !== null) {
            name += '#' + element.id;
        } else if(element.class !== null) {
            name += '.' + element.class.replace(/ /g,'.');
        }

        return name;
    };

    //Checks if attribute has a (known) suffix and returns it
    var getSuffix = function(attrName) {
        for(var i=0, l=suffixes.length; i<l; i++) {
            var suffix = suffixes[i];

            if( attrName.length > suffix.length && attrName.substr(0, suffix.length) === suffix ) {
                return suffix;
            }
        }

        return null;
    };

    //Checks if given attribute name is used as a suffix for other attributes
    var isSuffix = function(attrName) {
        return ( suffixes.indexOf(attrName) !== -1 );
    };

    //Renders a table with attribute differences
    //TODO Clean it up! Rethink the HTML structure.
    this.render = function(element0, element1, diff) {
        var buffer = "";
        var webkitBuffer = "";

        buffer += '<div class="block">';
        buffer += '<p class="description">Comparing <strong class="element0">' + elementName(element0) + '</strong> ';
        buffer += 'with <strong class="element1">' + elementName(element1) + '</strong>.</p>';

        buffer += '<table>';
        for(var name in diff) {
            if(!diff.hasOwnProperty(name)) {
                continue;
            }
            var value = diff[name];

            var suffix = getSuffix(name);
            var suffixClass = "";
            var suffixParentAttributes = "";
            var row = "";

            if(suffix !== null) {
                suffixClass = " suffix " + suffix;
            }

            if(isSuffix(name)) {
                suffixParentAttributes = "class='suffix-parent' data-suffix='" + name + "'";
            }

            row += "<tr class='upper" + suffixClass + "'>";
                row += "<th rowspan='2' " + suffixParentAttributes + ">" + name + "</th>";
                row += "<td class='element0'>" + value[0] + "</td>";
            row += "</tr>";
            row += "<tr class='lower" + suffixClass + "'>";
                row += "<td class='element1'>" + value[1] + "</td>";
            row += "</tr>";

            //webkit attributes will be put to a different table
            if(name.substr(0, 6) === "webkit") {
                webkitBuffer += row;
            } else {
                buffer += row;
            }
        }
        buffer += '</table></div>';

        if(webkitBuffer.length > 0) {
            buffer += "<div class='sidebar-separator'>WebKit attributes</div>";
            buffer += "<div class='block'><table>";
            buffer += webkitBuffer;
            buffer += "</table></div>";
        }

        container.innerHTML = buffer;

        //react to "onclick" events on attributes that have children
        var suffixParents = container.getElementsByClassName('suffix-parent');
        for (var i = 0, il = suffixParents.length; i < il ; i++) {
            var suffixParent = suffixParents[i];

            suffixParent.onclick = function() {
                this.classList.contains("open") ? this.classList.remove("open") : this.classList.add("open");

                var children = container.getElementsByClassName(this.dataset.suffix);

                for (var j = 0, jl = children.length; j < jl ; j++) {
                    children[j].style.display = (children[j].style.display !== "table-row") ? "table-row" : "none";
                }
            };
        }
    };
}