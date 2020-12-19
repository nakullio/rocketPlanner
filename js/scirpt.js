// create form actionItem
let addItemForm = document.querySelector("#addItemForm");
// grab inputed action item into the actionItem container and to show them on the list by append or prepend
let itemList = document.querySelector(".actionItems");
// Get All actionItems from Chrome Storage
let storage = chrome.storage.sync;

storage.get(["actionItems"], (data) => {
  let actionItems = data.actionItems;
  // call the renderActionItems with pass the actionItems
  renderActionItems(actionItems);
  console.log(actionItems);
});

// Create renderActionItems() function, with pass the actionItems
const renderActionItems = (actionItems) => {
  // loop through (using forEach) the actionItems
  actionItems.forEach((item) => {
    renderActionItem(item.text, item.id, item.completed);
  });
};

addItemForm.addEventListener("submit", (e) => {
  // to prevent auto loading progressbar, we set preventdefault on 'e'
  e.preventDefault();

  // Grab the text that we've input value on the action plan form
  let itemText = addItemForm.elements.namedItem("itemText").value;
  // we want to check if the itemText inside form was inputed empty, we want to prevent that
  if (itemText) {
    // call the add() function
    add(itemText);
    // call the renderActionItem once we've got the text, asthis
    renderActionItem(itemText);
    // after we enter the vlaue on actionItem form. we'd like to clear the value in it to reset the form
    addItemForm.elements.namedItem("itemText").value = "";
  }
});

// Create add() function to save the Action Item data in a database
const add = (text) => {
  // create an object for the value on a {key: value} chrome sync
  let actionItem = {
    // apply the uudv4 to get uniqe identifier on every data
    id: uuidv4(),
    // using new current date as per action items added on tat day, and using .toString() to convert the date appear on object data
    added: new Date().toString(),
    //  create text object which will be pass into add() function
    text: text,
    // add completed, which null for now
    completed: null,
  };

  // get the data on chrome storage
  chrome.storage.sync.get(["actionItems"], (data) => {
    // after we get the data by this chrome storage sync, we need to push them to the action items list
    let items = data.actionItems;
    // ensure the 'items' is in array, so we need to initialize this through this statement
    if (!items) {
      items = [actionItem];
    } else {
      // push the action items
      items.push(actionItem);
    }
    // create chrome storage sync
    chrome.storage.sync.set(
      {
        // the [actionItem] is an array for one action item
        actionItems: items,
      },
      // in order to fully wait the operations above, we need create below function statement
      () => {
        // show what we've been added
        chrome.storage.sync.get(["actionItems"], (data) => {
          console.log(data);
        });
      }
    );
  });
};

// Create a markUnmarkCompleted() function to set the item completed in chrome storage
const markUnmarkCompleted = (id, completedStatus) => {
  // 1. grab the list of items
  storage.get(["actionItems"], (data) => {
    // 2. find item we clicked on
    let items = data.actionItems;
    // 3. find the index
    let foundItemIndex = items.findIndex((item) => item.id == id);
    if (foundItemIndex >= 0) {
      items[foundItemIndex].completed = completedStatus;
      chrome.storage.sync.set({
        actionItems: items,
      });
    }
  });
};

// handle completed element function
const handleCompletedEventListener = (e) => {
  // grab the id
  const id = e.target.parentElement.parentElement.getAttribute("data-id");
  const parent = e.target.parentElement.parentElement;

  // remove completed class on classList that containt 'completed' Class
  if (parent.classList.contains("completed")) {
    // null means it's not completed
    markUnmarkCompleted(id, null);
    parent.classList.remove("completed");
  } else {
    // call the markUnmarkCompleted function
    markUnmarkCompleted(id, new Date().toString());
    // adding completed class on the target parent, after being through click event listener
    parent.classList.add("completed");
  }
};

// create a renderActionItem() function
const renderActionItem = (text, id, completed) => {
  // the goal is to create HTML structure using javascrip, by mirroring the created HTML structure that we've did
  // create the individual element function to easily reacting on every changes on action item lists, instead of using inerHTML , which quite bit difficult to arrange

  let element = document.createElement("div");
  element.classList.add("actionItem__item");
  let mainElement = document.createElement("div");
  mainElement.classList.add("actionItem__main");
  let checkEl = document.createElement("div");
  checkEl.classList.add("actionItem__check");
  let textEl = document.createElement("div");
  textEl.classList.add("actionItem__text");
  let deleteEl = document.createElement("div");
  deleteEl.classList.add("actionItem__delete");

  checkEl.innerHTML = `
  <div class="actionItem__checkBox">
                <i class="fas fa-check" aria-hidden="true"></i>
              </div>
  `;

  if (completed) {
    element.classList.add("completed");
  }
  //  x
  element.setAttribute("data-id", id);

  // Create an event listenener on the checkmark element
  checkEl.addEventListener("click", handleCompletedEventListener);

  // setup text element, using textContent, which equal to innerText as well
  textEl.textContent = text;
  deleteEl.innerHTML = `<i class="fas fa-times"></i>`;
  // append the main element to add more action item list on the main element container
  mainElement.appendChild(checkEl);
  mainElement.appendChild(textEl);
  mainElement.appendChild(deleteEl);
  // this is the main element structure
  element.appendChild(mainElement);
  // all of those structure above create from bottom to top
  // using prepend to ensure actionItem list was inserted above first child
  itemList.prepend(element);
};

var circle = new ProgressBar.Circle("#container", {
  color: "#010101",
  // This has to be the same size as the maximum width to
  // prevent clipping
  strokeWidth: 6,
  trailWidth: 2,
  easing: "easeInOut",
  duration: 1400,
  text: {
    autoStyleContainer: false,
  },
  from: { color: "#7fdf67", width: 2 },
  to: { color: "#7fdf67", width: 6 },
  // Set default step function for all animate calls
  step: function (state, circle) {
    circle.path.setAttribute("stroke", state.color);
    circle.path.setAttribute("stroke-width", state.width);

    var value = Math.round(circle.value() * 100);
    if (value === 0) {
      circle.setText("");
    } else {
      circle.setText(value);
    }
  },
});
circle.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
circle.text.style.fontSize = "2rem";

circle.animate(1.0); // Number from 0.0 to 1.0
