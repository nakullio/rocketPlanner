// create form actionItem
let addItemForm = document.querySelector("#addItemForm");
// grab inputed action item into the actionItem container and to show them on the list by append or prepend
let itemList = document.querySelector(".actionItems");
// Get All actionItems from Chrome Storage
let storage = chrome.storage.sync;

// initialize the Class function
let actionItemsUtils = new ActionItems();

storage.get(["actionItems"], (data) => {
  let actionItems = data.actionItems;
  console.log(actionItems);
  createQuickActionListener();
  // call the renderActionItems with pass the actionItems
  renderActionItems(actionItems);
  actionItemsUtils.setProgress();
  chrome.storage.onChanged.addListener(() => {
    console.log("changed");
    // call the setProgress
    actionItemsUtils.setProgress();
  });
});

// Create renderActionItems() function, with pass the actionItems
const renderActionItems = (actionItems) => {
  // loop through (using forEach) the actionItems
  actionItems.forEach((item) => {
    renderActionItem(item.text, item.id, item.completed);
  });
};

const handleQuickActionListener = (e) => {
  // get the text from listener that we've clicked
  const text = e.target.getAttribute("data-text");
  // add the click button text into input action items
  actionItemsUtils.add(text, (actionItem) => {
    // catch the callback function and render it like this
    renderActionItem(actionItem.text, actionItem.id, actionItem.completed);
  });
};

// Create an event listener for quick action buttons
const createQuickActionListener = () => {
  // select the target HTML button
  let buttons = document.querySelectorAll(".quick-action");
  // loop through the for every single button
  buttons.forEach((button) => {
    button.addEventListener("click", handleQuickActionListener);
  });
};

addItemForm.addEventListener("submit", (e) => {
  // to prevent auto loading progressbar, we set preventdefault on 'e'
  e.preventDefault();

  // Grab the text that we've input value on the action plan form
  let itemText = addItemForm.elements.namedItem("itemText").value;
  // we want to check if the itemText inside form was inputed empty, we want to prevent that
  if (itemText) {
    // add the empty function ()=>{} to make callback as a function
    actionItemsUtils.add(itemText, (actionItem) => {
      // call the renderActionItem once we've got the text, asthis
      renderActionItem(actionItem.text, actionItem.id, actionItem.completed);
      // after we enter the vlaue on actionItem form. we'd like to clear the value in it to reset the form
      addItemForm.elements.namedItem("itemText").value = "";
    });
  }
});

// handle completed element function
const handleCompletedEventListener = (e) => {
  // grab the id
  const id = e.target.parentElement.parentElement.getAttribute("data-id");
  const parent = e.target.parentElement.parentElement;

  // remove completed class on classList that containt 'completed' Class
  if (parent.classList.contains("completed")) {
    // null means it's not completed
    actionItemsUtils.markUnmarkCompleted(id, null);
    parent.classList.remove("completed");
  } else {
    // call the markUnmarkCompleted function
    actionItemsUtils.markUnmarkCompleted(id, new Date().toString());
    // adding completed class on the target parent, after being through click event listener
    parent.classList.add("completed");
  }
};

// handle deleted element function
const handleDeleteEventListener = (e) => {
  // grab the id
  const id = e.target.parentElement.parentElement.getAttribute("data-id");
  const parent = e.target.parentElement.parentElement;

  //  call the remove() function, and dont forget to pass in the sepcifict targeted 'td'
  //  this remove() will be remove items from chrome storage
  console.log("this is id", id);
  // debug and callback
  actionItemsUtils.remove(id, () => {
    // remove from the DOM element using ChildNode.remove() method
    parent.remove();
  });
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

  // Create an event listenener on the deleted element
  deleteEl.addEventListener("click", handleDeleteEventListener);

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
