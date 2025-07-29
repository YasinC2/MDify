# AI Assistant Feature Specification for Markdown RTL Editor

## 🔧 Core Functionality
- Add a button to the existing toolbar labeled “🧠 AI Assistant”
- When clicked, it should open a modal dialog that contains multiple `<details>` sections for different assistant features.
- The modal should remain lightweight (no external libraries for UI) and use plain HTML, CSS, and JavaScript.

---

## 🎭 Role Selection
- Add a `select` dropdown at the top of the modal for choosing the AI's persona/role.
- Roles should be defined in a JavaScript object like:

```js
const roles = [
    {
        id: 1,
        role: "writer",
        prompt: 'You are a professional book writer.',
        temperature: 0.5,
        top_p: 0.5
    }
    {
        id: 2,
        role: "blogger",
        prompt: 'You are an expert WordPress blogger.',
        temperature: 0.4,
        top_p: 0.3
    }
    {
        id: 3,
        role: "health",
        prompt: 'You are a human health and nutrition assistant.',
        temperature: 0.7,
        top_p: 0.8
    }
    {
        id: 3,
        role: "coach",
        prompt: 'You are a personal training and fitness coach.',
        temperature: 0.6,
        top_p: 0.7
    }
]
````

- Add a checkbox for custom instruction by user, with all 4 option (role, prompt, temperature, top_p), and save the data to localstorage. fill this inputs with the saved content on next visits, but keep the custom instruction option off by default.


* When making a request to the API, the selected role should always be sent as the `system` prompt. use temperature and top_p in related setting in main api request.

---

## ⚙️ Panel 1 – AI Settings

### Inside `<details>`:

* Inputs:

  * AI Provider: `OpenAI` or `Pollinations.ai`
  * API Endpoint URL (with "https://text.pollinations.ai/openai" endpoint as default)
  * API Key (encrypted before storing) for OpenAI & Referrer URL/Identifier for pollinations.ai
  * AI Model (`select` dropdown) (fetched from API provider)
* Store values in `localStorage` on change.
* Use a simple JS-based encryption (e.g., `btoa()` and `atob()`) for saving the API key.

---

## ✍️ Panel 2 – Write with AI
### Inside `<details>`:
- A `textarea` for the user to describe what they want to write (e.g., “Write a blog post about plant-based diets”).
- A checkbox:
  - ✅ Append to existing markdown (default)
  - ⛔ Replace document
    - If replacing, confirm with the user before clearing the editor.
  - Upon submission, the system performs this **2-step flow**:
- Sends the user input with role and selected model to the API.
- On success, appends (or replaces) markdown content in TUI Editor.
  
---

### ✨ Step 1 – Outline/Plan Phase (Pre-generation)
1. Send a prompt to the AI like:
   ```text
   Based on the following user request, generate a brief summary and a list of headlines or table of contents. Don’t write the full article yet.

   Request: ${user_input}
    ```

2. Display the AI-generated outline/summary in a preview section within the modal.
3. Ask the user:

   * ✅ “Does this match what you want?”
   * ⛔ Buttons: `Confirm and Continue Writing` | `Cancel` | `Regenerate Outline`

---

### ✍️ Step 2 – Full Content Generation

* Only if the user confirms the plan:

  * Send a second prompt to AI using the original user input, but you may also include the confirmed outline for better context:

    ```text
    Please write the full content based on the following structure and topic:

    Topic: ${user_input}
    Outline: ${confirmed_outline}
    ```

* Then:

  * If “append” is selected: Add the new content to the end of the current markdown document.
  * If “replace” is selected: Clear the current editor content after user confirmation, then insert the result.

---

### ✅ Summary

This two-phase flow allows:

* User expectation alignment
* Better control over long-form generation
* Preventing irrelevant or unexpected results

Also, make sure to:

* Display a spinner/loading indicator during both steps.
* Show errors if the API fails and allow retry.


## ✏️ Panel 3 – Modify or Extend Selection

### Inside `<details>`:

* Radio buttons:

  * 🔄 Modify selected text
  * ➕ Write new content based on selection
* Use `editor.getSelectedText()` to retrieve the selected block.
* A `textarea` for instructions to AI (e.g., “Translate this to English”, “Summarize”, “Make it longer”).
* On submit:

  * If Modify: replace selected text.
  * If Extend: append AI result at the end of the document.

---

## 🧠 AI Request Notes

* Use the `fetch()` API to POST data to either:

  * `https://api.openai.com/v1/chat/completions`
  * `https://text.pollinations.ai/openai`
* Request format:

```json
{
  "model": "<model-id>",
  "messages": [
    {"role": "system", "content": "<selected-role-text>"},
    {"role": "user", "content": "<user-input-or-selection>"}
  ],
  "temperature": 0.7,
  "top_p": 0.8
}
```

* API key from settings should be decrypted before sending.
* Use `stream: false` for simplicity.

---

## 🔐 Security

* API keys are saved encrypted in localStorage using `btoa()`.
* Never log or expose API key in console.

---

## 🧪 Enhancements

* Show loading spinner while waiting for response.
* Add a reset button to clear modal data.

---

## 📦 Integration Notes

* Do not use frameworks like React/Vue.
* Integrate with existing Toast UI Editor instance already present on the page (`editor`).
* Minimal use of third-party libraries; rely on built-in APIs.

