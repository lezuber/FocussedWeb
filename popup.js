var toggles = {
  isActive: false,
  isWhitelist: false,
};
var returnedArray;

// Pull Values from Chrome Storage and Refreshes UI
function refreshNodes() {
  $("#listOfURLs").empty();
  chrome.storage.sync.get("urlStore", function (results) {
    console.log("Pulling values using sync.get --> ");
    console.log(results);
    //Creates List
    createList(results.urlStore);
  });

  chrome.storage.sync.get(Object.keys(toggles), function (results) {
    Object.keys(toggles).forEach(function (k) {
      toggles[k] = results[k] === undefined ? false : results[k];

      if (toggles[k]) {
        $("input[id=" + k + "]").prop("checked", true);
      }
    });
  });
}

// Add URL
function addURL() {
  newUrl = document.querySelector("#txtURL").value;

  if (newUrl) {
    chrome.storage.sync.get("urlStore", function (results) {
      var newStore =
        results.urlStore === undefined
          ? [newUrl]
          : [...results.urlStore, newUrl];

      chrome.storage.sync.set({ urlStore: newStore }, function () {
        console.log("Url added.");
      });

      // Refresh UI
      refreshNodes();

      // Update what extension blocks
      chrome.extension.sendRequest({ msg: "updateBlockedList" });

      // Clear value from text box
      document.querySelector("#txtURL").value = "";
    });
  }
}

// Delete URL
function deleteURL(index, url) {
  if (url) {
    console.log("Delete this one -->" + url);

    chrome.storage.sync.get("urlStore", function (results) {
      returnedArray = results.urlStore;
      if (index > -1) {
        returnedArray.splice(index, 1);
      }

      chrome.storage.sync.set({ urlStore: returnedArray }, function () {
        console.log("Value sync'd back");
      });

      // Refresh UI
      refreshNodes();

      // Update what extension blocks
      chrome.extension.sendRequest({ msg: "updateBlockedList" });
    });
  }
}

function changeToggleStatus(toggle, newStatus) {
  var msg = {};
  msg[toggle] = newStatus;
  chrome.runtime.sendMessage(msg);

  chrome.storage.sync.set(msg, function () {
    console.log(toggle + " is now set to ---> " + newStatus);
  });

  if (toggle == "isActive") {
    if (newStatus) {
      chrome.browserAction.setIcon({ path: "48-clicked.png" });
    } else {
      chrome.browserAction.setIcon({ path: "48.png" });
    }
  }
}

// Prepares HTML for UI
function createList(blob) {
  var list = $("#listOfURLs");
  var ul = $("<ul/>");
  var i;

  $.each(blob, function (i) {
    var li = $("<li/>").text(blob[i]).data("index", i).appendTo(ul);

    var txt = $("<a/>")
      .addClass("delete")
      .text("x")
      .click(function () {
        deleteURL(i, blob[i]);
      })
      .appendTo(li);
  });
  list.append(ul);
}

// Closes Pop-Up
function closePopUp() {
  console.log("Close Pop-Up");
  window.close();
}

// Add Event Listeners to Action Buttons
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("txtURL").addEventListener("keydown", function (e) {
    if (e.key === 'Enter') {
      addURL();
    }
  });

  $("input[id=isActive]").change(function () {
    changeToggleStatus("isActive", $(this).is(":checked"));
  });
  $("input[id=isWhitelist]").change(function () {
    changeToggleStatus("isWhitelist", $(this).is(":checked"));
  });
  document.querySelector("#close").addEventListener("click", closePopUp);
  refreshNodes();
});

