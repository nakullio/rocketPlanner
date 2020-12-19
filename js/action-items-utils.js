// import all action items to this class to use later on
// we cannot have const fuction in a class, but we using an ES6 way
class ActionItems {
  // Create add() function to save the Action Item data in a database
  add = (text) => {
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
      chrome.storage.sync.set({
        // the [actionItem] is an array for one action item
        actionItems: items,
      });
    });
  };

  // MarkunMarkCompleted() function
  // Create a markUnmarkCompleted() function to set the item completed in chrome storage
  markUnmarkCompleted = (id, completedStatus) => {
    // 1. grab the list of items
    storage.get(["actionItems"], (data) => {
      // 2. find item we clicked on
      let items = data.actionItems;
      // 3. find the index
      let foundItemIndex = items.findIndex((item) => item.id == id);
      if (foundItemIndex >= 0) {
        items[foundItemIndex].completed = completedStatus;
        chrome.storage.sync.set(
          {
            actionItems: items,
          },
          () => {
            //   to call setProgress within the class, we must add this.function() to make them work
            this.setProgress();
          }
        );
      }
    });
  };

  // setProgress() function
  // Update items progress in progressbar
  // Cretae a setProgress() function
  setProgress = () => {
    // grab the list of item
    storage.get(["actionItems"], (data) => {
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
      // calculate the progress
      progress = completedItems / totalItems;
      // animating the progressbar using circle.animate
      circle.animate(progress);
    });
  };
}
