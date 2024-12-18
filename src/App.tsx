import { useState, useEffect } from "react";
import CircularProgress from "./components/circularProgress";

function App() {
  const [connecting, setConnecting] = useState<boolean>(false);
  const [correctPage, setCorrectPage] = useState(false);
  const [disabled, setDisabled] = useState<boolean>(true);

  const [requestedConnectionCount, setRequestedConnectionCount] = useState(0);
  const [totalConnections, setTotalConnections] = useState(1);

  const checkIfCorrectPage = async () => {
    const [tab] = await chrome.tabs.query({ active: true });

    // Checking if the active tab is linkediN or not
    if (tab.url?.startsWith("https://www.linkedin.com")) {
      setCorrectPage(true);
    }
  };

  const checkStatus = async () => {
    const [tab] = await chrome.tabs.query({ active: true });

    const tabId = tab.id;

    if (tabId) {
      // Sending message to content script to check status and get data
      chrome.tabs.sendMessage(tabId, { type: "STATUS" }, () => {});
    }
  };

  const startAutoConnect = async () => {
    const [tab] = await chrome.tabs.query({ active: true });

    const tabId = tab.id;

    if (tabId) {
      chrome.tabs.sendMessage(tabId, { type: "START" }, (response) => {
        // Send message to content script to start connecting
        if (response) {
          setConnecting(true);
        }
      });
    }
  };

  const stopAutoConnect = async () => {
    const [tab] = await chrome.tabs.query({ active: true });

    const tabId = tab.id;

    if (tabId) {
      chrome.tabs.sendMessage(tabId, { type: "STOP" }, (response) => {
        // Send message to content script to stop connecting
        if (response) {
          setConnecting(false);
        }
      });
    }
  };

  const startStopConnecting = async () => {
    if (connecting) {
      // When `Stop Connecting` button clicked
      stopAutoConnect();
    } else {
      // When `Start Connecting` button clicked
      startAutoConnect();
    }
  };

  useEffect(() => {
    checkIfCorrectPage();

    checkStatus();

    // Listen for messages from the content script
    const handleMessage = (message: {
      type: string;
      requested?: number;
      total?: number;
      enable?: boolean;
    }) => {
      console.log(message);
      if (message.type === "CONNECTION REQUESTED") {
        setRequestedConnectionCount(message.requested ?? 0);
      } else if (message.type === "CONNECTION REQUEST COMPLETE") {
        setConnecting(false);
        setDisabled(true);
      } else if (message.type === "ENABLE BUTTON") {
        setDisabled(!message.enable);
        setTotalConnections(message.total ?? 0);
        setRequestedConnectionCount(message.requested ?? 0);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    // Cleanup listener on component unmount
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  // UI
  return (
    <div
      style={{
        minWidth: "300px",
      }}
    >
      <div className='bg-gray-800 p-2'>
        <p className='text-sm'>LinkedIn AutoConnect</p>
      </div>

      <div className='p-4 flex flex-col items-center justify-center gap-4'>
        <p className='text-lg'>Invitation Sent</p>
        <CircularProgress
          count={requestedConnectionCount}
          total={totalConnections}
        />

        <p className='font-medium text-white uppercase'>
          Total Connections: {totalConnections}
        </p>

        <button
          className={`border-none outline-none rounded px-6 py-2 ${
            connecting ? "bg-red-800" : "bg-green-800"
          } disabled:bg-gray-600 uppercase w-52`}
          onClick={() => {
            startStopConnecting();
          }}
          disabled={!correctPage || disabled}
        >
          {connecting ? "Stop" : "Start"} Connecting
        </button>
      </div>
    </div>
  );
}

export default App;
