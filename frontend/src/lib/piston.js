export async function executeCode(language, code) {
  try {
    const url = `${import.meta.env.VITE_API_URL}/execute`;
    console.log("Calling:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language, code }),
    });

    const data = await response.json();
    console.log("Response:", data);
    return data;
  } catch (error) {
    console.log("Error:", error.message);
    return { success: false, error: `Failed to execute code: ${error.message}` };
  }
}