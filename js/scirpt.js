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
  setGreeting();
  setGreetingImage();
  // call the createQuickActionListener
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
  // filter out completed items from yesterday
  const filteredItems = filterActionItems(actionItems);

  // loop through (using forEach), then render the filteredItems
  filteredItems.forEach((item) => {
    renderActionItem(item.text, item.id, item.completed, item.website);
  });
  storage.set({
    actionItems: filteredItems,
  });
};

//  create a filterActionItems() function
const filterActionItems = (actionItems) => {
  var currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  //  use es6 .filter()
  const filteredItems = actionItems.filter((item) => {
    if (item.completed) {
      // check if completed date is less than today date
      const completedDate = new Date(item.completed);
      if (completedDate < currentDate) {
        // we didn't want to show them, so return it false
        return false;
      }
    }
    return true;
  });
  return filteredItems;
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
        actionItem.website,
        250
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
        actionItem.website,
        250
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
  let jElement = $(`div[data-id="${id}"]`);

  //  call the remove() function, and dont forget to pass in the sepcifict targeted 'td'
  //  this remove() will be remove items from chrome storage
  // debug and callback
  actionItemsUtils.remove(id, () => {
    // call the animateUp
    animateUp(jElement);
    // remove from the DOM element using ChildNode.remove() method
  });
};

// create a renderActionItem() function
const renderActionItem = (
  text,
  id,
  completed,
  website = null,
  animationDuration = 450
) => {
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
  // apply to all element for animateDown
  // in jQuery format, and css selector
  let jElement = $(`div[data-id="${id}"]`);
  // call the animateDown after renderActionItem, and passing the element
  animateDown(jElement, animationDuration);
};

const animateUp = (element) => {
  let height = element.innerHeight();
  element.animate(
    {
      opacity: 0,
      marginTop: `-${height}px`,
    },
    250,
    () => {
      // remove the element when the animation completed
      element.remove();
    }
  );
};

const animateDown = (element, duration) => {
  // set an flexible height based on the height element tahta available
  let height = element.innerHeight();
  // animating the jElement
  element.css({ marginTop: `-${height}px`, opacity: 0 }).animate(
    {
      opacity: 1,
      marginTop: "12px",
    },
    duration
  );
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

// Create a setGreeting) function
const setGreeting = () => {
  let greeting = "Good  ";
  // set date function
  const date = new Date();
  // get hours
  const hours = date.getHours();
  if (hours >= 5 && hours <= 11) {
    greeting += "Morning, ";
  } else if (hours >= 12 && hours <= 16) {
    greeting += "Afternoon, ";
  } else if (hours >= 17 && hours <= 20) {
    greeting += "Evening, ";
  } else {
    greeting += "Night,";
  }

  //  return on html
  document.querySelector(".greeting__type").innerText = greeting;
};

// Create setGreetingImage() function
const setGreetingImage = () => {
  // get the image
  let image = document.getElementById("greeting__image");
  // set date function
  const date = new Date();

  const hours = date.getHours();
  if (hours >= 5 && hours <= 11) {
    image.src = "./images/good-morning.png";
  } else if (hours >= 12 && hours <= 16) {
    image.src = "./images/good-afternoon.png";
  } else if (hours >= 17 && hours <= 20) {
    image.src = "./images/good-evening.png";
  } else {
    image.src = "./images/good-night.png";
  }
};
