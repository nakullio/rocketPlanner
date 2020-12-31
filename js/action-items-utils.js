// import all action items to this class to use later on
// we cannot have const fuction in a class, but we using an ES6 way
class ActionItems {
  // Create a addQuickActionItem() function, then pass in text, website and'tab' data
  addQuickActionItem = (id, text, tab, callback) => {
    let website = null;
    // setup the click id button, which quick action 2 = Link site for later
    if (id == "quick-action-2") {
      // if the id true, so we do let website, asf
      // format the quickActionItem tab
      website = {
        url: tab.url,
        fav_icon: tab.favIconUrl,
        title: tab.title,
      };
    }

    // call the add() function within this class with pass the text, website and callback function
    this.add(text, website, callback);
  };

  // Create add() function to save the Action Item data in a database
  // add pass in website to null by deafult
  add = (text, website = null, callback) => {
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
      // structure the website data
      website: website,
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
        () => {
          callback(actionItem);
        }
      );
    });
  };

  // create a saveName()
  saveName = (name, callback) => {
    chrome.storage.sync.set(
      {
        name: name,
      },
      callback
    );
  };

  // Create remove() function to remove the item from Chrome Storage
  remove = (id, callback) => {
    //   remove the actionItems
    // 1. grab the list of items
    chrome.storage.sync.get(["actionItems"], (data) => {
      // 2. find item we clicked on
      let items = data.actionItems;
      // 3. find the index
      let foundItemIndex = items.findIndex((item) => item.id == id);
      if (foundItemIndex >= 0) {
        //   using splice() method to remove an item
        items.splice(foundItemIndex, 1);
        chrome.storage.sync.set(
          {
            actionItems: items,
          },
          callback
        );
      }
    });
  };

  // MarkunMarkCompleted() function
  // Create a markUnmarkCompleted() function to set the item completed in chrome storage
  markUnmarkCompleted = (id, completedStatus) => {
    // 1. grab the list of items
    chrome.storage.sync.get(["actionItems"], (data) => {
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

  // setProgress() function
  // Update items progress in progressbar
  // Cretae a setProgress() function
  setProgress = () => {
    // grab the list of item
    chrome.storage.sync.get(["actionItems"], (data) => {
      let actionItems = data.actionItems;
      // how many completed item do we have?
      let completedItems;
      // total items are represent of the length of actionItems, bcoz actionItems state in Array
      let totalItems = actionItems.length;
      // check amount of completed items using es6 filter method
      // null = false
      // date = true
      completedItems = actionItems.filter((item) => item.completed).length;
      let progress = 0;
      // any number devided by 0 is not a number
      if (totalItems > 0) {
        progress = completedItems / totalItems;
      }

      // calculate the progress

      console.log(progress);
      // call the setbrowserbadge
      this.setBrowserBadge(totalItems - completedItems);
      // animating the progressbar using circle.animate
      if (typeof window.circle !== "undefined") circle.animate(progress);
    });
  };

  // 1.create a setBrowserBadge() function to add a browser badge to show number of action items
  // 2. pass the todoItems to know how many items we had to do
  setBrowserBadge = (todoItems) => {
    // option for notificationo badge if reach >= 9
    let text = `${todoItems}`;
    if (todoItems > 9) {
      text = "9+";
    }
    // use the backtic and make a string `${todoItems}`
    chrome.browserAction.setBadgeText({ text: text });
  };
}
