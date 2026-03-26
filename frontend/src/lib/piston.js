export async function executeCode(language, code) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language, code }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false, error: `Failed to execute code: ${error.message}` };
  }
}


