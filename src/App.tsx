import { useEffect, useRef, useState } from "react";

const { invoke } = window.__TAURI__.core;
const { listen } = window.__TAURI__.event;

function App() {
  const [result, setResult] = useState<string>("");
  const streamStartRef = useRef<number>(0);

  useEffect(() => {
    let unlisten: (() => void) | null = null;

    async function attachListener() {
      unlisten = await listen("csharp-stream", (event) => {
        const message = event.payload;

        if (message === "__STREAM_END__") {
          const duration = (Date.now() - streamStartRef.current) / 1000;
          setResult((prev) => `${prev}\n--- Streaming Task Finished in ${duration.toFixed(2)}s ---`);
          return;
        }

        setResult((prev) => prev + message);
      });
    }

    void attachListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  const handleRegularCall = async () => {
    setResult("Sending regular request...");
    try {
      const payload = { requestType: "regular" };
      const responseString = await invoke<string>("call_backend", {
        nativeName: "sample",
        jsonData: JSON.stringify(payload),
      });

      const responseObject = JSON.parse(responseString) as unknown;
      setResult(JSON.stringify(responseObject, null, 2));
    } catch (error) {
      setResult(`Error: ${String(error)}`);
    }
  };

  const handleExternalCall = async () => {
    setResult("Sending external call request...");
    try {
      const responseString = await invoke<string>("call_backend_external", {
        nativeName: "sample",
        jsonData: JSON.stringify({ requestType: "external" }),
      });

      const responseObject = JSON.parse(responseString) as unknown;
      setResult(JSON.stringify(responseObject, null, 2));
    } catch (error) {
      setResult(`Error: ${String(error)}`);
    }
  };

  const handleStreamCall = () => {
    setResult("");
    streamStartRef.current = Date.now();

    const payload = { requestType: "streaming" };
    void invoke("start_streaming_task", {
      nativeName: "sample",
      jsonData: JSON.stringify(payload),
    }).catch((error) => {
      setResult(`Error starting task: ${String(error)}`);
    });
  };

  return (
    <main className="container">
      <h1>Welcome to TauriCS</h1>
      <div className="button-group">
        <button type="button" onClick={handleRegularCall}>
          Call C# (Regular)
        </button>
        <button type="button" onClick={handleExternalCall}>
          Call C# (External)
        </button>
        <button type="button" onClick={handleStreamCall}>
          Call C# (Stream)
        </button>
      </div>
      <pre id="result">{result}</pre>
    </main>
  );
}

export default App;
