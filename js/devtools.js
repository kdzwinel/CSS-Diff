//defines a "CSS Diff" sidebar pane and sets its height
chrome.devtools.panels.elements.createSidebarPane(
  "CSS Diff",
  function (sidebar) {
    "use strict";

    sidebar.setPage("sidebar.html");
    sidebar.setHeight("350px");
  }
);