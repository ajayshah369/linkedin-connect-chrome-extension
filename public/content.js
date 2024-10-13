let connect = true;
let requested = 0;
let buttons = [];
let i = 0;

const getAllConnections = () => {
  const allButtons = document.querySelectorAll(
    "button.artdeco-button.artdeco-button--2.artdeco-button--secondary.ember-view"
  );

  buttons = [];
  requested = 0;
  i = 0;

  allButtons.forEach((e) => {
    const text = e.textContent.trim();
    if (text === "Connect" || text === "Pending") {
      buttons.push(e);

      if (text === "Pending") {
        requested += 1;
      }
    }
  });

  chrome.runtime.sendMessage({
    type: "ENABLE BUTTON",
    enable: requested != buttons.length,
    requested,
    total: buttons.length,
  });
};

const promise = (time = 500) => {
  const myPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("Operation successful!");
    }, time);
  });

  return myPromise;
};

const makeRequest = async (e) => {
  if (e?.textContent?.trim() !== "Connect") {
    return;
  }

  await promise(1000);

  e?.click();

  await promise();

  const sendWithoutANoteButton = document.querySelector(
    "button.artdeco-button.artdeco-button--2.artdeco-button--primary.ember-view.ml1"
  );

  if (
    sendWithoutANoteButton &&
    sendWithoutANoteButton.textContent.trim() === "Send without a note"
  ) {
    sendWithoutANoteButton?.click();
    requested += 1;
    chrome.runtime.sendMessage({
      type: "CONNECTION REQUESTED",
      requested,
    });
  }

  await promise();

  const cancelWithdrawButton = document.querySelector(
    "button.artdeco-button.artdeco-button--2.artdeco-button--secondary.ember-view.artdeco-modal__confirm-dialog-btn"
  );

  if (
    cancelWithdrawButton &&
    cancelWithdrawButton.textContent.trim() === "Cancel"
  ) {
    cancelWithdrawButton?.click();
  }
};

async function autoConnect() {
  for (; i <= buttons.length; i++) {
    if (!connect) {
      return;
    }

    await makeRequest(buttons[i]);
  }

  chrome.runtime.sendMessage({
    type: "CONNECTION REQUEST COMPLETE",
  });
}

window.onload = () => {
  // Listen for messages from the React app or background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "START") {
      connect = true;
      autoConnect();
      sendResponse(true);
    } else if (message.type === "STOP") {
      connect = false;
      sendResponse(true);
    } else if (message.type === "STATUS") {
      getAllConnections();
      sendResponse(true);
    }
  });
};
