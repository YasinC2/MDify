// AI Assistant Modal
const aiModal = document.getElementById('aiAssistantModal');
const aiBtn = document.getElementById('aiAssistantBtn');
const closeModal = document.querySelector('.close');
const aiStatus = document.getElementById('aiStatus');
const aiError = document.getElementById('aiError');
const spinner = document.querySelector('.spinner');

// Show/hide modal
aiBtn.addEventListener('click', () => {
  aiModal.style.display = 'flex';
});

closeModal.addEventListener('click', () => {
  aiModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === aiModal) {
    aiModal.style.display = 'none';
  }
});

// Role selection and custom instructions
const customInstructionsToggle = document.getElementById('customInstructionsToggle');
const customInstructionsSection = document.getElementById('customInstructionsSection');
const aiRole = document.getElementById('aiRole');
const customRole = document.getElementById('customRole');
const customPrompt = document.getElementById('customPrompt');
const customTemp = document.getElementById('customTemp');
const customTopP = document.getElementById('customTopP');

customInstructionsToggle.addEventListener('change', () => {
  customInstructionsSection.style.display = customInstructionsToggle.checked ? 'block' : 'none';
});

// Load saved roles
// Predefined roles for first-time users
const preDefinedRoles = [
  {
    id: 1,
    role: "writer",
    prompt: 'You are a professional book writer.',
    temperature: 0.5,
    top_p: 0.5
  },
  {
    id: 2,
    role: "blogger",
    prompt: 'You are an expert WordPress blogger.',
    temperature: 0.4,
    top_p: 0.3
  },
  {
    id: 3,
    role: "health",
    prompt: 'You are a human health and nutrition assistant.',
    temperature: 0.7,
    top_p: 0.8
  },
  {
    id: 4,
    role: "coach",
    prompt: 'You are a personal training and fitness coach.',
    temperature: 0.6,
    top_p: 0.7
  }
];

const savedRoles = localStorage.getItem('aiRoles');
console.log(savedRoles);

let roles = [];
if (savedRoles) {
  roles = JSON.parse(savedRoles);
} else {
  roles = preDefinedRoles;
  localStorage.setItem('aiRoles', JSON.stringify(roles));
}

aiRole.innerHTML = '';
roles.forEach(role => {
  const option = document.createElement('option');
  option.value = role.id;
  option.textContent = role.role;
  aiRole.appendChild(option);
});

// Save custom role
document.getElementById('saveCustomRole').addEventListener('click', () => {
  const roles = JSON.parse(localStorage.getItem('aiRoles') || '[]');
  const newRole = {
    id: roles.length + 1,
    role: customRole.value,
    prompt: customPrompt.value,
    temperature: parseFloat(customTemp.value),
    top_p: parseFloat(customTopP.value)
  };
  roles.push(newRole);
  localStorage.setItem('aiRoles', JSON.stringify(roles));
  
  const option = document.createElement('option');
  option.value = newRole.id;
  option.textContent = newRole.role;
  aiRole.appendChild(option);
  
  aiRole.value = newRole.id;
  customInstructionsToggle.checked = false;
  customInstructionsSection.style.display = 'none';
});

// Settings panel
const aiProvider = document.getElementById('aiProvider');
const apiEndpoint = document.getElementById('apiEndpoint');
const apiKey = document.getElementById('apiKey');
const aiModel = document.getElementById('aiModel');

// Load settings from localStorage
function loadSettings() {
  const settings = JSON.parse(localStorage.getItem('aiSettings') || '{}');
  if (settings.provider) aiProvider.value = settings.provider;
  if (settings.endpoint) apiEndpoint.value = settings.endpoint;
  if (settings.key) apiKey.value = atob(settings.key); // Decode from base64
}

// Save settings to localStorage
function saveSettings() {
  const settings = {
    provider: aiProvider.value,
    endpoint: apiEndpoint.value,
    key: btoa(apiKey.value) // Encode to base64
  };
  localStorage.setItem('aiSettings', JSON.stringify(settings));
}

// Load models from API
async function loadModels() {
  if (aiProvider.value === 'openai' && !apiKey.value) {
    aiError.textContent = 'API key required for OpenAI';
    return;
  }
  
  try {
    spinner.style.display = 'block';
    aiError.textContent = '';
    
    const response = await fetch(apiEndpoint.value + '/models', {
      headers: {
        'Authorization': `Bearer ${apiKey.value}`
      }
    });
    
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    
    const data = await response.json();
    aiModel.innerHTML = '';
    data.data.forEach(model => {
      const option = document.createElement('option');
      option.value = model.id;
      option.textContent = model.id;
      aiModel.appendChild(option);
    });
  } catch (err) {
    aiError.textContent = err.message;
  } finally {
    spinner.style.display = 'none';
  }
}

// Event listeners for settings
aiProvider.addEventListener('change', loadSettings);
apiEndpoint.addEventListener('change', saveSettings);
apiKey.addEventListener('change', saveSettings);
aiProvider.addEventListener('change', loadModels);
document.getElementById('loadModelsBtn').addEventListener('click', loadModels);

// Initialize settings
loadSettings();

// Write with AI panel
const writePrompt = document.getElementById('writePrompt');
const generateOutlineBtn = document.getElementById('generateOutlineBtn');
const outlinePreview = document.getElementById('outlinePreview');
const outlineActions = document.getElementById('outlineActions');
const confirmOutlineBtn = document.getElementById('confirmOutlineBtn');
const regenerateOutlineBtn = document.getElementById('regenerateOutlineBtn');
const cancelOutlineBtn = document.getElementById('cancelOutlineBtn');

let currentOutline = '';

generateOutlineBtn.addEventListener('click', async () => {
  if (!writePrompt.value) {
    aiError.textContent = 'Please enter a prompt';
    return;
  }
  
  try {
    spinner.style.display = 'block';
    aiError.textContent = '';
    
    const outline = await generateContent(
      `Based on the following user request, generate a brief summary and a list of headlines or table of contents. Don't write the full article yet.\n\nRequest: ${writePrompt.value}`
    );
    
    outlinePreview.innerHTML = outline.replace(/\n/g, '<br>');
    outlineActions.style.display = 'block';
    currentOutline = outline;
  } catch (err) {
    aiError.textContent = err.message;
  } finally {
    spinner.style.display = 'none';
  }
});

confirmOutlineBtn.addEventListener('click', async () => {
  try {
    spinner.style.display = 'block';
    aiError.textContent = '';
    
    const fullContent = await generateContent(
      `Please write the full content based on the following structure and topic:\n\nTopic: ${writePrompt.value}\nOutline: ${currentOutline}`
    );
    
    const writeMode = document.querySelector('input[name="writeMode"]:checked').value;
    if (writeMode === 'replace') {
      if (confirm('Replace current document?')) {
        editor.setMarkdown(fullContent);
      }
    } else {
      const currentContent = editor.getMarkdown();
      editor.setMarkdown(currentContent + '\n\n' + fullContent);
    }
    
    aiModal.style.display = 'none';
  } catch (err) {
    aiError.textContent = err.message;
  } finally {
    spinner.style.display = 'none';
  }
});

regenerateOutlineBtn.addEventListener('click', () => {
  generateOutlineBtn.click();
});

cancelOutlineBtn.addEventListener('click', () => {
  outlinePreview.innerHTML = '';
  outlineActions.style.display = 'none';
});

// Modify/Extend panel
const modifyPrompt = document.getElementById('modifyPrompt');
const modifyBtn = document.getElementById('modifyBtn');

modifyBtn.addEventListener('click', async () => {
  const selectedText = editor.getSelectedText();
  if (!selectedText) {
    aiError.textContent = 'Please select some text';
    return;
  }
  
  if (!modifyPrompt.value) {
    aiError.textContent = 'Please enter instructions';
    return;
  }
  
  try {
    spinner.style.display = 'block';
    aiError.textContent = '';
    
    const mode = document.querySelector('input[name="modifyMode"]:checked').value;
    const instruction = mode === 'modify' ?
      `Modify the following text: ${selectedText}\n\nInstructions: ${modifyPrompt.value}` :
      `Write new content based on: ${selectedText}\n\nInstructions: ${modifyPrompt.value}`;
    
    const result = await generateContent(instruction);
    
    if (mode === 'modify') {
      editor.replaceSelection(result);
    } else {
      const currentContent = editor.getMarkdown();
      editor.setMarkdown(currentContent + '\n\n' + result);
    }
  } catch (err) {
    aiError.textContent = err.message;
  } finally {
    spinner.style.display = 'none';
  }
});

// Generate content with AI
async function generateContent(prompt) {
  const settings = JSON.parse(localStorage.getItem('aiSettings') || '{}');
  const roles = JSON.parse(localStorage.getItem('aiRoles') || '[]');
  const selectedRole = roles.find(r => r.id == aiRole.value);
  
  const requestBody = {
    model: aiModel.value || 'gpt-3.5-turbo',
    messages: [
      {role: 'system', content: selectedRole?.prompt || 'You are a helpful assistant'},
      {role: 'user', content: prompt}
    ],
    temperature: selectedRole?.temperature || 0.7,
    top_p: selectedRole?.top_p || 0.8
  };
  
  const response = await fetch(settings.endpoint || 'https://text.pollinations.ai/openai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(settings.provider === 'openai' && {'Authorization': `Bearer ${atob(settings.key)}`})
    },
    body: JSON.stringify(requestBody)
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}

// Initialize Toast UI Editor with RTL support
const editor = new toastui.Editor({
  el: document.querySelector('#editor'),
  initialEditType: 'markdown',
  previewStyle: 'vertical',
  height: '100%',
  usageStatistics: false,
  theme: localStorage.getItem('selectedTheme') === 'dark' ? 'dark' : 'light',
  plugins: [
    toastui.Editor.plugin.chart,
    toastui.Editor.plugin.codeSyntaxHighlight,
    toastui.Editor.plugin.colorSyntax,
    toastui.Editor.plugin.tableMergedCell
  ],
  hooks: {
    async 'addImageBlobHook'(blob, callback) {
      // Handle image uploads
      callback('https://via.placeholder.com/150');
    }
  }
});
let currentFileHandle = null;
// Direction handling
let isRTL = false;
const toggleDirectionBtn = document.getElementById('toggleDirection');
const toggleAutosave = document.getElementById('autosave-setting');

toggleAutosave.addEventListener('change', (e) => {
  if (e.target.checked) {
    showAlert('Autosave is enabled.');
  } else {
    showAlert('Autosave is disabled.');
  }
});

function updateDirection() {
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  // editor.setOptions({ rtl: isRTL });
  editor.setHeight('100%'); // Force refresh layout
  localStorage.setItem('editorDirection', isRTL ? 'rtl' : 'ltr');
}

toggleDirectionBtn.addEventListener('click', () => {
  isRTL = !isRTL;
  updateDirection();
});

// Initialize Direction from localStorage
const savedDirection = localStorage.getItem('editorDirection');
if (savedDirection) {
  isRTL = savedDirection === 'rtl';
  updateDirection();
  toggleDirectionBtn.checked = isRTL;
}

// Save keyboard shortcut
document.addEventListener('keydown', async (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    e.stopPropagation();
    await saveFile();
  }
}, true);
// Theme management
const themeToggle = document.getElementById('themeToggle');

function applyTheme(isDark) {
  const theme = isDark ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('selectedTheme', theme);
  let el = document.getElementsByClassName("toastui-editor-defaultUI")[0];

  if (isDark) {
    el.classList.add("toastui-editor-dark");
  } else {
    el.classList.remove("toastui-editor-dark");
  }
}

themeToggle.addEventListener('change', (e) => {
  applyTheme(e.target.checked);
});

// Initialize from localStorage
const savedTheme = localStorage.getItem('selectedTheme') === 'dark';
themeToggle.checked = savedTheme;
applyTheme(savedTheme);

function saveAs(blob, filename) {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function saveFile() {
  try {
    if (currentFileHandle) {
      const writable = await currentFileHandle.createWritable();
      await writable.write(editor.getMarkdown());
      await writable.close();
      showAlert('File saved successfully');
    } else {
      await saveAsNewFile();
    }
  } catch (err) {
    showAlert(`Save failed: ${err.message}`);
  }
}

async function saveAsNewFile() {
  try {
    const handle = await window.showSaveFilePicker({
      types: [{
        description: 'Markdown Files',
        accept: {
          'text/markdown': ['.md']
        },
      }],
    });
    const writable = await handle.createWritable();
    await writable.write(editor.getMarkdown());
    await writable.close();
    currentFileHandle = handle;
    showAlert('File saved successfully');
  } catch (err) {
    if (err.name !== 'AbortError') {
      showAlert(`Save failed: ${err.message}`);
    }
  }
}
// Export handlers
// New file confirmation
// Handle file imports
document.getElementById('importMd').addEventListener('click', () => {
  document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const content = await file.text();
    editor.setMarkdown(content);
    showAlert(`Imported: ${file.name}`);
  } catch (err) {
    showAlert(`Import failed: ${err.message}`);
  }
});

document.getElementById('newMd').addEventListener('click', () => {
  if (editor.getMarkdown().trim() && !confirm('Unsaved changes will be lost. Continue?')) return;
  currentFileHandle = null;
  editor.setMarkdown('');
  localStorage.removeItem('autosave');
  sessionStorage.clear();
  location.reload(); // Force full reset
});

document.getElementById('saveAsBtn').addEventListener('click', saveAsNewFile);
document.getElementById('exportMd').addEventListener('click', () => {
  const content = editor.getMarkdown();
  const blob = new Blob([content], {
    type: 'text/markdown'
  });
  saveAs(blob, `document-${Date.now()}.md`);
});

document.getElementById('exportHtml').addEventListener('click', async () => {
  try {
    const content = editor.getHTML();
    const now = Date.now();

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>document-${now}</title>
    <style>
    @import url("https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@latest/dist/font-face.css");
    body {
        font-family: "Vazirmatn", Tahoma, Open Sans, Helvetica Neue, Helvetica, Arial, sans-serif;
        ${isRTL ? 'direction: rtl;' : ''}
    }
    pre{direction: ltr;}
    </style>
</head>
<body>
    ${content}
</body>
</html>`;

    const handle = await window.showSaveFilePicker({
      types: [{
        description: 'HTML Files',
        accept: {'text/html': ['.html']},
      }],
      suggestedName: `document-${now}.html`
    });

    const writable = await handle.createWritable();
    await writable.write(html);
    await writable.close();
    showAlert('HTML exported successfully');
  } catch (err) {
    if (err.name !== 'AbortError') {
      showAlert(`HTML export failed: ${err.message}`);
    }
  }
});

document.getElementById('exportStyledHtml').addEventListener('click', async () => {
  try {
    const content = editor.getHTML();
    const now = Date.now();
    const prismCSS = await loadFile("./libs/prism.min.css");
    const tuiEditorViewer = await loadFile("./libs/toastui-editor-viewer-export.min.css");

    console.log(prismCSS);
    console.log(tuiEditorViewer);

    const rtlStyles = 
    `
.task-list-item {
    margin-right: 0;
    padding-right: 0;
    margin-right: -24px;
    padding-right: 24px;
}
.task-list-item:before {
left: auto;
right: 0;
}
    `;
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>document-${now}</title>
    <style>
    @import url("https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@latest/dist/font-face.css");
    body {
        font-family: "Vazirmatn", Tahoma, Open Sans, Helvetica Neue, Helvetica, Arial, sans-serif;
        ${isRTL ? 'direction: rtl;' : ''}
    }
    /* 
      Rule for the FIRST <del> in a sequence of three.
      This is the one we will apply the special styles to.
    */
    del:has(+ del + del) {
      /* This makes the element a block, which is required for page-break-after to work reliably. */
      display: block;
      /* The important rule for printing */
      page-break-after: always;
      /* These rules hide it visually without removing it from the layout, so the page break still works. */
      height: 0;
      visibility: hidden;
      margin: 0;
      padding: 0;
      border: none;
    }
    /* 
      Rule for the SECOND and THIRD <del> tags in the sequence.
      We simply hide them completely.
    */
    del:has(+ del + del) + del,
    del:has(+ del + del) + del + del {
      display: none;
    }

    ${prismCSS}

    ${tuiEditorViewer}

    ${isRTL ? rtlStyles : ''}
    pre{direction: ltr;}
    </style>
</head>
<body>
    ${content}
</body>
</html>`;

    const handle = await window.showSaveFilePicker({
      types: [{
        description: 'HTML Files',
        accept: {'text/html': ['.html']},
      }],
      suggestedName: `document-${now}.html`
    });

    const writable = await handle.createWritable();
    await writable.write(html);
    await writable.close();
    showAlert('HTML exported successfully');
  } catch (err) {
    if (err.name !== 'AbortError') {
      showAlert(`HTML export failed: ${err.message}`);
    }
  }
});

document.getElementById('saveBtn').addEventListener('click', saveFile);
// Autosave functionality
setInterval(async () => {
  if (!toggleAutosave.checked) return;
  try {
    const content = editor.getMarkdown();
    if (currentFileHandle) {
      const writable = await currentFileHandle.createWritable();
      await writable.write(content);
      await writable.close();
    } else {
      localStorage.setItem('autosave', content);
    }
  } catch (err) {
    showAlert(`Autosave failed: ${err.message}`);
  }
}, 10000);

// Load autosaved content
const autosave = localStorage.getItem('autosave');
if (autosave) {
  editor.setMarkdown(autosave);
  showAlert('Autosaved content loaded.');
}

// Handle PWA file launches
window.addEventListener('DOMContentLoaded', () => {
  if ('launchQueue' in window) {
    launchQueue.setConsumer(async (launchParams) => {
      if (!launchParams.files.length) return;

      try {
        const fileHandle = launchParams.files[0];
        const file = await fileHandle.getFile();
        const content = await file.text();
        editor.setMarkdown(content);
        showAlert(`Opened file: ${file.name}`);
      } catch (error) {
        showAlert(`Error opening file: ${error.message}`);
      }
    });
  }
});

function showAlert(text) {
  const alert = document.getElementById("alert");

  alert.innerText = text;
  alert.style.opacity = "1";

  // Hide slowly after 3 seconds
  setTimeout(() => {
    alert.style.opacity = "0";
    // Clear text after fade-out completes (500ms)
    setTimeout(() => {
      alert.innerText = "";
    }, 500);
  }, 3000);
}

async function loadFile(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path}`);
  return await response.text();
}
