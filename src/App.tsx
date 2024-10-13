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

    if (tab.url?.startsWith("https://www.linkedin.com")) {
      setCorrectPage(true);
    }
  };

  const checkStatus = async () => {
    const [tab] = await chrome.tabs.query({ active: true });

    const tabId = tab.id;

    if (tabId) {
      chrome.tabs.sendMessage(tabId, { type: "STATUS" }, () => {});
    }
  };

  const startAutoConnect = async () => {
    const [tab] = await chrome.tabs.query({ active: true });

    const tabId = tab.id;

    if (tabId) {
      chrome.tabs.sendMessage(tabId, { type: "START" }, (response) => {
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
        if (response) {
          setConnecting(false);
        }
      });
    }
  };

  const startStopConnecting = async () => {
    if (connecting) {
      stopAutoConnect();
    } else {
      startAutoConnect();
    }
  };

  useEffect(() => {
    checkIfCorrectPage();

    checkStatus();

    // Listen for messages from the background script

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
        <CircularProgress
          count={requestedConnectionCount}
          total={totalConnections}
        />

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
