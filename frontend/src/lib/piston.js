export async function executeCode(language, code) {
  if (language === "javascript") {
    return runInBrowser(code);
  }

  // fallback for python/java — calls backend (which can use glot.io later)
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language, code }),
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: `Failed to execute code: ${error.message}` };
  }
}

function runInBrowser(code) {
  return new Promise((resolve) => {
    const logs = [];
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.sandbox = "allow-scripts";
    document.body.appendChild(iframe);

    iframe.contentWindow.console = {
      log: (...args) => logs.push(args.map((a) => JSON.stringify(a)).join(" ")),
      error: (...args) => logs.push("[error] " + args.map(String).join(" ")),
      warn: (...args) => logs.push("[warn] " + args.map(String).join(" ")),
    };

    try {
      iframe.contentWindow.eval(code);
      resolve({ success: true, output: logs.join("\n") || "No output" });
    } catch (err) {
      resolve({ success: false, output: logs.join("\n"), error: err.message });
    } finally {
      document.body.removeChild(iframe);
    }
  });
}