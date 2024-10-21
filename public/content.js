let connect = true;
let requested = 0; // Number of requests made
let buttons = []; // List of connect buttons
let i = 0; // Index of loop

const getAllConnections = () => {
  // Get All buttons on page
  const allButtons = document.querySelectorAll(
    "button.artdeco-button.artdeco-button--2.artdeco-button--secondary.ember-view"
  );

  // Resetting the values
  buttons = [];
  requested = 0;
  i = 0;

  // Filter out buttons with text `Content` and `Pending`
  allButtons.forEach((e) => {
    const text = e.textContent.trim();
    if (text === "Connect" || text === "Pending") {
      buttons.push(e);

      if (text === "Pending") {
        requested += 1;
      }
    }
  });

  // Send message on popup whether button should be enabled or not
  chrome.runtime.sendMessage({
    type: "ENABLE BUTTON",
    enable: requested != buttons.length,
    requested,
    total: buttons.length,
  });
};

const promise = (time = 500) => {
  // Create a promise that takes some time to resolve
  const myPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("Operation successful!");
    }, time);
  });

  return myPromise;
};

// Click on connect button to make new request
const makeRequest = async (e) => {
  if (e?.textContent?.trim() !== "Connect") {
    return;
  }

  await promise(1000);

  // Click connect button
  e?.click();

  await promise();

  // Get the `Send without a note` button
  const sendWithoutANoteButton = document.querySelector(
    "button.artdeco-button.artdeco-button--2.artdeco-button--primary.ember-view.ml1"
  );

  // Check if the `Send without a note` button exists or not
  if (
    sendWithoutANoteButton &&
    sendWithoutANoteButton.textContent.trim() === "Send without a note"
  ) {
    // If `Send without a note` exists click it
    sendWithoutANoteButton?.click();
  }

  // Increase the number of requested connection by 1
  requested += 1;

  // Send message to popup to update the circular progress bar
  chrome.runtime.sendMessage({
    type: "CONNECTION REQUESTED",
    requested,
  });

  await promise();

  // Get the `Cancel` button on withdraw modal
  const cancelWithdrawButton = document.querySelector(
    "button.artdeco-button.artdeco-button--2.artdeco-button--secondary.ember-view.artdeco-modal__confirm-dialog-btn"
  );

  // Check if the `Cancel` button exists or not
  if (
    cancelWithdrawButton &&
    cancelWithdrawButton.textContent.trim() === "Cancel"
  ) {
    // If `Cancel` button exists click it
    cancelWithdrawButton?.click();
  }
};

// This functions is called when `Start Connecting` button is clicked and it loop over the button's list
async function autoConnect() {
  for (; i <= buttons.length; i++) {
    if (!connect) {
      // If `Stop Connecting` button is clicked then stop looping and terminate the function
      return;
    }

    // Click `Connect` button
    await makeRequest(buttons[i]);
  }

  // Send message to popup after loop ends
  chrome.runtime.sendMessage({
    type: "CONNECTION REQUEST COMPLETE",
  });
}

window.onload = () => {
  // Listen for messages from the popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "START") {
      // start looping the buttons
      connect = true;
      autoConnect();
      sendResponse(true);
    } else if (message.type === "STOP") {
      // stop looping the buttons
      connect = false;
      sendResponse(true);
    } else if (message.type === "STATUS") {
      // get the data
      getAllConnections();
      sendResponse(true);
    }
  });
};
