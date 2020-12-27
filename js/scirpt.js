// create form actionItem
let addItemForm = document.querySelector("#addItemForm");
// grab inputed action item into the actionItem container and to show them on the list by append or prepend
let itemList = document.querySelector(".actionItems");
// Get All actionItems from Chrome Storage
let storage = chrome.storage.sync;

// initialize the Class function
let actionItemsUtils = new ActionItems();

storage.get(["actionItems", "name"], (data) => {
  let actionItems = data.actionItems;
  // save the changed name to storage
  let name = data.name;
  setUsersName(name);
  // call the createQuickActionListener
  console.log(actionItems);
  createQuickActionListener();
  // call the renderActionItems with pass the actionItems
  renderActionItems(actionItems);
  // call the createUpdateModal listener
  createUpdateNameDialogListener();
  createUpdateNameListener();
  actionItemsUtils.setProgress();
  chrome.storage.onChanged.addListener(() => {
    console.log("changed");
    // call the setProgress
    actionItemsUtils.setProgress();
  });
});

//  create set the user's name on the front end
const setUsersName = (name) => {
  //  what if the name still nothing, not exist at first
  let newName = name ? name : "Add Name";
  document.querySelector(".name__value").innerText = newName;
};

// Create renderActionItems() function, with pass the actionItems
const renderActionItems = (actionItems) => {
  // loop through (using forEach) the actionItems
  actionItems.forEach((item) => {
    renderActionItem(item.text, item.id, item.completed, item.website);
  });
};

const createUpdateNameDialogListener = () => {
  let greetingName = document.querySelector(".greeting__name");
  // add eventListener on click
  greetingName.addEventListener("click", () => {
    //  open the modal from bootstrap, and change the ID as per our HTML updateNameModal id
    storage.get(["name"], () => {
      let name = data.name ? data.name : "";
      document.getElementById("inputName").value = name;
    });

    $("#updateNameModal").modal("show");
  });
};

//  create a handleUpdateName function
const handleUpdateName = (e) => {
  // what we going to do, here it is
  // 1. get the input text
  const name = document.getElementById("inputName").value;
  // check if there is a value, the we save the name
  if (name) {
    // 2. save the name
    actionItemsUtils.saveName(name, () => {
      //  set the user's name on front end, and call the setUserName()
      setUsersName(name);
      $("#updateNameModal").modal("hide");
    });
  }
};

//  create a createUpdateNameListener() function for when Save CHanges is clicked
const createUpdateNameListener = () => {
  let element = document.querySelector("#updateName");
  // addEventlistener on the click
  element.addEventListener("click", handleUpdateName);
};

const handleQuickActionListener = (e) => {
  // get the text from listener that we've clicked
  const text = e.target.getAttribute("data-text");
  // set up the specific click button to get the tab data
  const id = e.target.getAttribute("data-id");
  // call getCurrentTab
  getCurrentTab().then((tab) => {
    // call the addQuickActionItem from utils.js, with pass in text, website and tab
    actionItemsUtils.addQuickActionItem(id, text, tab, (actionItem) => {
      renderActionItem(
        actionItem.text,
        actionItem.id,
        actionItem.completed,
        actionItem.website
      );
    });
  });
  // add the click button text into input action items
  // actionItemsUtils.add(text, (actionItem) => {
  //   // catch the callback function and render it like this
  //   renderActionItem(actionItem.text, actionItem.id, actionItem.completed);
  // });
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

// actually we want to wait the chrome.tabs.query to run and then we do getCurrentTab
// Create a getCurrentTab() to get active tab
// use async to return a new Promise we create
async function getCurrentTab() {
  // create a promise
  return await new Promise((resolve, reject) => {
    chrome.tabs.query(
      { active: true, windowId: chrome.windows.WINDOW_ID_CURRENT },
      (tabs) => {
        console.log("Tabs", tabs);
        // resolve or passback to current tab
        resolve(tabs[0]);
      }
    );
  });
}

addItemForm.addEventListener("submit", (e) => {
  // to prevent auto loading progressbar, we set preventdefault on 'e'
  e.preventDefault();

  // Grab the text that we've input value on the action plan form
  let itemText = addItemForm.elements.namedItem("itemText").value;
  // we want to check if the itemText inside form was inputed empty, we want to prevent that
  if (itemText) {
    // add the empty function ()=>{} to make callback as a function
    actionItemsUtils.add(itemText, null, (actionItem) => {
      // call the renderActionItem once we've got the text, asthis
      renderActionItem(
        actionItem.text,
        actionItem.id,
        actionItem.completed,
        actionItem.website
      );
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
const renderActionItem = (text, id, completed, website = null) => {
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
  // if website =null, then
  if (website) {
    let linkContainer = createLinkContainer(
      website.url,
      website.fav_icon,
      website.title
    );
    // append the element linkContainer
    element.appendChild(linkContainer);
  }

  // all of those structure above create from bottom to top
  // using prepend to ensure actionItem list was inserted above first child
  itemList.prepend(element);
};

const createLinkContainer = (url, favIcon, title) => {
  //  the goal is to create HTML structure using javascrip, by mirroring the created HTML structure
  let element = document.createElement("div");
  element.classList.add("actionItem__linkContainer");
  element.innerHTML = `
  <a href="${url}" target="_blank">
  <div class="actionItem__link">
    <div class="actionItem__favIcon">
      <img src="${favIcon}" alt="">
    </div>
    <div class="actionItem__title">
    <span>${title}</span>
    </div>
  </div>
</a>
  `;
  return element;
};
