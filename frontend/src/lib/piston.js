export async function executeCode(language, code) {
  if (language === "javascript") {
    return runInBrowser(code);
  }

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
    document.body.appendChild(iframe);

    const wrappedCode = `
      const _logs = [];
      const _console = {
        log: (...args) => _logs.push(args.map(a => {
          try { return JSON.stringify(a); } catch { return String(a); }
        }).join(" ")),
        error: (...args) => _logs.push("[error] " + args.map(String).join(" ")),
        warn: (...args) => _logs.push("[warn] " + args.map(String).join(" ")),
      };
      const console = _console;
      try {
        ${code}
        parent.postMessage({ success: true, logs: _logs }, "*");
      } catch(e) {
        parent.postMessage({ success: false, logs: _logs, error: e.message }, "*");
      }
    `;

    const handler = (event) => {
      if (event.source !== iframe.contentWindow) return;
      window.removeEventListener("message", handler);
      document.body.removeChild(iframe);
      const { success, logs, error } = event.data;
      resolve({
        success,
        output: logs.join("\n") || "No output",
        error: error || null,
      });
    };

    window.addEventListener("message", handler);
    iframe.srcdoc = `<script>${wrappedCode}<\/script>`;
  });
}