import express from "express";

const router = express.Router();

const LANGUAGE_VERSIONS = {
  javascript: { language: "javascript", version: "*" },
  python: { language: "python", version: "*" },
  java: { language: "java", version: "*" },
};

const getFileExtension = (language) => {
  const extensions = { javascript: "js", python: "py", java: "java" };
  return extensions[language] || "txt";
};

router.post("/", async (req, res) => {
  try {
    const { language, code } = req.body;
    const languageConfig = LANGUAGE_VERSIONS[language];

    if (!languageConfig) {
      return res.status(400).json({ success: false, error: `Unsupported language: ${language}` });
    }

    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: languageConfig.language,
        version: languageConfig.version,
        files: [{ name: `main.${getFileExtension(language)}`, content: code }],
      }),
    });

    const data = await response.json();
    console.log("Piston raw response:", JSON.stringify(data));
    const output = data.run?.stdout || data.run?.output || "";
    const stderr = data.run?.stderr || "";

    if (stderr) return res.json({ success: false, output, error: stderr });

    res.json({ success: true, output: output || "No output" });

  } catch (error) {
    res.status(500).json({ success: false, error: `Failed to execute code: ${error.message}` });
  }
});

export default router;