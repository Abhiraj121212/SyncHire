import express from "express";
import { exec } from "child_process";
import { writeFileSync, unlinkSync } from "fs";
import { randomUUID } from "crypto";
import path from "path";
import os from "os";

const router = express.Router();

router.post("/", async (req, res) => {
  const { language, code } = req.body;
  const id = randomUUID();
  const tmpDir = os.tmpdir();

  const ext = { javascript: "js", python: "py", java: "java" }[language];
  const cmd = { javascript: "node", python: "python3", java: null }[language];

  if (!ext) return res.status(400).json({ success: false, error: "Unsupported language" });

  const filePath = path.join(tmpDir, `${id}.${ext}`);

  try {
    writeFileSync(filePath, code);

    const command = language === "java"
      ? `cd ${tmpDir} && javac ${id}.java && java ${id}`
      : `${cmd} ${filePath}`;

    exec(command, { timeout: 10000 }, (err, stdout, stderr) => {
      unlinkSync(filePath);
      if (stderr) return res.json({ success: false, output: stdout, error: stderr });
      res.json({ success: true, output: stdout || "No output" });
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;