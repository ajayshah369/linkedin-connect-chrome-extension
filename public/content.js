let connect = true;
let i = 1;

const returnNewPromise = () => {
  const myPromise = new Promise((resolve, reject) => {
    // Simulating an asynchronous operation, e.g., a network request
    setTimeout(() => {
      const success = true; // Change to false to simulate failure
      if (success) {
        resolve("Operation successful!");
      } else {
        reject("Operation failed.");
      }
    }, 500); // Simulates a delay of 2 seconds
  });

  return myPromise;
};

async function autoConnect() {
  chrome.runtime.sendMessage({
    type: "TOTAL CONNECTIONS",
    count: 100,
  });

  for (i = 1; i <= 100; i++) {
    if (!connect) {
      return;
    }

    try {
      await returnNewPromise();
      chrome.runtime.sendMessage({
        type: "CONNECTION REQUESTED",
        count: 1,
        index: i,
      });
    } catch (err) {}
  }

  chrome.runtime.sendMessage({
    type: "CONNECTION REQUEST COMPLETE",
  });
}

// Listen for messages from the React app or background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "START") {
    connect = true;
    autoConnect();
    sendResponse(true);
  } else if (message.type === "STOP") {
    connect = false;
    sendResponse(true);
  }
});
