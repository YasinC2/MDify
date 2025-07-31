const appVersion = '1.2.0';
document.getElementById('version').textContent = appVersion;

// Alert timeout
let alertTimeout;
let popupTimeout;

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
  },
];

// Load user roles from localStorage
let userRoles = [];
const savedUserRoles = localStorage.getItem('aiRoles');
if (savedUserRoles) {
  userRoles = JSON.parse(savedUserRoles);
}

// Merge predefined roles and user roles (predefined come first)
let roles = [...preDefinedRoles, ...userRoles];

// Ensure user roles have IDs starting from 100
let maxUserId = 99;
userRoles.forEach(role => {
  if (role.id > maxUserId) maxUserId = role.id;
});

// Initialize role dropdown
aiRole.innerHTML = '';
roles.forEach(role => {
  const option = document.createElement('option');
  option.value = role.id;
  option.textContent = role.role;
  aiRole.appendChild(option);
});

// aiRole.innerHTML = '';
// roles.forEach(role => {
//   const option = document.createElement('option');
//   option.value = role.id;
//   option.textContent = role.role;
//   aiRole.appendChild(option);
// });

// Save custom role
document.getElementById('saveCustomRole').addEventListener('click', () => {
  // Create new role with ID starting from 100
  maxUserId++;
  const newRole = {
    id: maxUserId,
    role: customRole.value,
    prompt: customPrompt.value,
    temperature: parseFloat(customTemp.value),
    top_p: parseFloat(customTopP.value)
  };
  
  // Add to user roles and save to localStorage
  userRoles.push(newRole);
  localStorage.setItem('aiRoles', JSON.stringify(userRoles));
  
  // Update merged roles and rebuild dropdown
  roles = [...preDefinedRoles, ...userRoles];

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
  if (settings.model) aiModel.value = settings.model;
  if (settings.key) apiKey.value = atob(settings.key); // Decode from base64

}

// Save settings to localStorage
function saveSettings() {
  // console.log("save setting");
  
  const settings = {
    provider: aiProvider.value,
    endpoint: apiEndpoint.value,
    model: aiModel.value,
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

    if (!response.ok) {
      let errorMessage = `API error: ${response.status}`;

      try {
        const data = await response.json(); // try to parse error body
        if (data.error) {
          errorMessage += ` - ${data.error}`;
        }
      } catch (e) {
        // if response is not JSON or parsing failed
        errorMessage += " - Unknown error";
      }
      throw new Error(errorMessage);
    }

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
aiProvider.addEventListener('change', () => {
  
  const settings = JSON.parse(localStorage.getItem('aiSettings') || '{}');
  if (settings.endpoint) {
    if (aiProvider.value == 'openai') {
      apiEndpoint.value = 'https://api.openai.com/v1';
      aiModel.value = 'o4-mini';
    } else {
      apiEndpoint.value = 'https://text.pollinations.ai/openai';
      aiModel.value = 'openai';
    }
  }
  loadModels();
  // loadSettings();
  saveSettings();
});
apiEndpoint.addEventListener('change', saveSettings);
apiKey.addEventListener('change', saveSettings);
aiModel.addEventListener('change', saveSettings);
// aiProvider.addEventListener('change', loadModels);
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
    aiError.textContent = 'Please enter a prompt!';
    return;
  }
  
  try {
    spinner.style.display = 'block';
    aiError.textContent = '';
    
    const [outline, usage] = await generateContent(
      `Based on the following user request, generate a brief summary and a list of headlines or table of contents. Don't write the full article yet.\n\nRequest: ${writePrompt.value}`
    );
    
    outlinePreview.innerHTML = outline.replace(/\n/g, '<br>');
    outlineActions.style.display = 'block';
    currentOutline = outline;
    popupAlert(`Outline generated successfully! Total Token Usage: ${usage}`);
  } catch (err) {
    aiError.textContent = err.message;
  } finally {
    spinner.style.display = 'none';
  }
});

confirmOutlineBtn.addEventListener('click', async () => {
  try {
    const writeMode = document.querySelector('input[name="writeMode"]:checked').value;
    if (!confirm('You are about to replace the current document. Do you want to continue?')) {
      return;
    }
    spinner.style.display = 'block';
    aiError.textContent = '';
    aiStatus.textContent = '';
    
    const additionalNotes = document.getElementById('additionalNotes').value;
    const prompt = additionalNotes ?
        `Please write the full content based on the following structure and topic, and consider these additional notes:\n\nTopic: ${writePrompt.value}\nOutline: ${currentOutline}\nAdditional Notes: ${additionalNotes}` :
        `Please write the full content based on the following structure and topic:\n\nTopic: ${writePrompt.value}\nOutline: ${currentOutline}`;
    
    const [fullContent, usage] = await generateContent(prompt);
    
    if (writeMode === 'replace') {
      // if (confirm('Replace current document?')) {}
      editor.setMarkdown(fullContent);
    } else {
      const currentContent = editor.getMarkdown();
      editor.setMarkdown(currentContent + '\n\n' + fullContent);
    }

    popupAlert(`Full content generated successfully! Total Token Usage: ${usage}`);
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
    aiError.textContent = 'Please select some text!';
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
    
    const [result, usage] = await generateContent(instruction);
    
    if (mode === 'modify') {
      editor.replaceSelection(result);
    } else {
      const currentContent = editor.getMarkdown();
      editor.setMarkdown(currentContent + '\n\n' + result);
    }

    popupAlert(`Content modified successfully! Total Token Usage: ${usage}`);
  } catch (err) {
    aiError.textContent = err.message;
  } finally {
    spinner.style.display = 'none';
  }
});

// Generate content with AI
async function generateContent(prompt) {
  const settings = JSON.parse(localStorage.getItem('aiSettings') || '{}');
  const selectedRole = roles.find(r => r.id == aiRole.value);
  
  const requestBody = {
    model: aiModel.value || 'openai',
    messages: [
      {role: 'system', content: selectedRole?.prompt || 'You are a helpful assistant'},
      {role: 'user', content: prompt}
    ],
    temperature: selectedRole?.temperature || 0.7,
    top_p: selectedRole?.top_p || 0.8,
    referrer: 'MDify'
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
    let errorMessage = `API error: ${response.status}`;

    try {
      const data = await response.json(); // try to parse error body
      if (data.error) {
        errorMessage += ` - ${data.error}`;
      }
    } catch (e) {
      // if response is not JSON or parsing failed
      errorMessage += " - Unknown error";
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return [data.choices[0].message.content, data.usage.total_tokens];
}

const { Editor } = toastui;
const { chart, codeSyntaxHighlight, colorSyntax, tableMergedCell, uml } = Editor.plugin;

const chartOptions = {
  minWidth: 100,
  maxWidth: 600,
  minHeight: 100,
  maxHeight: 300
};

// Initialize Toast UI Editor with RTL support and custom commands
const editor = new Editor({
    el: document.querySelector('#editor'),
    initialEditType: 'markdown',
    previewStyle: localStorage.getItem('editorTabMode') === 'true' ? 'tab' : 'vertical',
    height: '100%',
    usageStatistics: false,
    theme: localStorage.getItem('selectedTheme') === 'dark' ? 'dark' : 'light',
    plugins: [
      [chart, chartOptions],
      [codeSyntaxHighlight, { highlighter: Prism}],
      colorSyntax,
      tableMergedCell,
      uml
    ],
    hooks: {
        async 'addImageBlobHook'(blob, callback) {
            // Handle image uploads
            callback('https://via.placeholder.com/150');
        }
    }
});

editor.addCommand("markdown", "test", function additem() {
  console.log("ButtonClicked");
  editor.replaceSelection(" \n\n ~~-~~ ~~-~~ ~~-~~ \n\n ");
});

editor.insertToolbarItem({ groupIndex: 5, itemIndex: 0 }, {
  name: 'myItem',
  tooltip: 'Page Break',
  command: 'test',
  text: '',
  className: 'toastui-editor-toolbar-icons page-break-command',
  // style: { backgroundImage: 'none' }
});

// Direction handling
let isRTL = false;
const toggleDirectionBtn = document.getElementById('toggleDirection');
const editorTabModeBtn = document.getElementById('editorTabMode');
const toggleAutosave = document.getElementById('autosave-setting');

toggleAutosave.addEventListener('change', (e) => {
  if (e.target.checked) {
    showAlert('Autosave is enabled. Your changes will be saved automatically every 10 seconds.');
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

toggleDirectionBtn.addEventListener('change', () => {
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

editorTabModeBtn.addEventListener('change', (e) => {
  // console.log(e.target.checked);
  localStorage.setItem('editorTabMode', e.target.checked);
  editor.changePreviewStyle(e.target.checked ? 'tab' : 'vertical');
});

const savedEditorMode = localStorage.getItem('editorTabMode') === 'true';
editorTabModeBtn.checked = savedEditorMode;

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

let currentFileHandle = null;

if ('launchQueue' in window) {
  launchQueue.setConsumer(async (launchParams) => {
    if (!launchParams.files.length) return;

    const fileHandle = launchParams.files[0];
    const file = await fileHandle.getFile();
    const contents = await file.text();    

    editor.setMarkdown(contents); // or your editor loading method
    currentFileHandle = fileHandle; // 🔹 Save the handle so you can save it later
  });
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
      excludeAcceptAllOption: true,
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

document.getElementById('openMd').addEventListener('click', async () => {
  if (editor.getMarkdown().trim() && !confirm('Unsaved changes will be lost. Continue?')) return;

  try {
    // Show native file picker
    const [handle] = await window.showOpenFilePicker({
      types: [{
        description: 'Markdown Files',
        accept: { 'text/markdown': ['.md'] }
      }],
      excludeAcceptAllOption: true,
      multiple: false
    });

    const file = await handle.getFile();
    const content = await file.text();

    editor.setMarkdown(content);
    currentFileHandle = handle;
    showAlert(`Opened: ${file.name}`);
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error(err);
      showAlert(`Failed to open file: ${err.message}`);
    }
  }
});

let importAndAppend = false;
// Handle file imports
document.getElementById('importMd').addEventListener('click', () => {
  if (editor.getMarkdown().trim() && !confirm('Unsaved changes will be lost. Continue?')) return;
  importAndAppend = false;
  document.getElementById('fileInput').click();
});

document.getElementById('importAppendMd').addEventListener('click', () => {
  importAndAppend = true;
  document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const content = await file.text();
    if (importAndAppend) {
      editor.setMarkdown(editor.getMarkdown() + '\n' + content);
    } else {
      editor.setMarkdown(content);
    }

    showAlert(`Imported: ${file.name}`);
    document.getElementById('fileInput').value = '';
  } catch (err) {
    showAlert(`Import failed: ${err.message}`);
  }
});

// New file confirmation
document.getElementById('newMd').addEventListener('click', () => {
  if (editor.getMarkdown().trim() && !confirm('Unsaved changes will be lost. Continue?')) return;
  document.getElementById('fileInput').value = '';
  currentFileHandle = null;
  editor.setMarkdown('');
  localStorage.removeItem('autosave');
  sessionStorage.clear();
  // sessionStorage.setItem('newFile', '1');
  // location.href = location.href;
  // location.reload(); // Force full reset
});

document.getElementById('saveAsBtn').addEventListener('click', saveAsNewFile);

// Export handlers
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
      excludeAcceptAllOption: true,
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
      excludeAcceptAllOption: true,
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
      // showAlert('Autosaved to current file.');
    } else {
      localStorage.setItem('autosave', content);
      // showAlert('Autosaved to local storage.');
    }
  } catch (err) {
    showAlert(`Autosave failed: ${err.message}`);
  }
}, 10000);

// Load autosaved content
const autosave = localStorage.getItem('autosave');
// console.log(autosave);

// On Page Load
if (sessionStorage.getItem('newFile')) {
  editor.setMarkdown(''); // Or skip loading from localStorage
  sessionStorage.removeItem('newFile');
} else {
  if (autosave) {
    // console.log('Autosaved content found.');

    editor.setMarkdown(autosave);
    showAlert('Autosaved content loaded.');
    toggleAutosave.checked = true;
  } else {
    // console.log('No autosaved content found.');
    toggleAutosave.checked = false;
    editor.setMarkdown('');
  }
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

// Handle device alert
const deviceAlert = document.getElementById('deviceAlert');
const dismissDeviceAlert = document.getElementById('dismissDeviceAlert');

dismissDeviceAlert.addEventListener('click', () => {
    // deviceAlert.classList.add('hidden');
    deviceAlert.style.display = 'none';
    localStorage.setItem('dismissedDeviceAlert', true);
});

console.log("dismissedDeviceAlert", !localStorage.getItem('dismissedDeviceAlert'));


// Only show alert on small screens and if not previously dismissed
if (window.matchMedia('(max-width: 768px)').matches && !localStorage.getItem('dismissedDeviceAlert')) {
    deviceAlert.style.display = 'flex';
}

// // Add event listener for custom command
// document.addEventListener('keydown', (e) => {
//     if (e.ctrlKey && e.key === 'i') {
//         e.preventDefault();
//         const textToInsert = prompt('Enter text to insert at cursor:');
//         if (textToInsert) {
//             editor.exec('insertText', textToInsert);
//         }
//     }
// });

async function loadFile(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Failed to load ${path}`);
    return await response.text();
}

function showAlert(text) {
  clearTimeout(popupTimeout);
  clearTimeout(alertTimeout);

  popupAlert(text);
  textAlert(text);
}

function textAlert(text) {
  const alert = document.getElementById("alert");

  alert.innerText = text;
  alert.style.opacity = "1";

  // Hide slowly after 3 seconds
  alertTimeout = setTimeout(() => {
    alert.style.opacity = "0";
    // Clear text after fade-out completes (500ms)
    setTimeout(() => {
      alert.innerText = "";
    }, 500);
  }, 3000);
}

function popupAlert(message) {
  const popup = document.getElementById('aiStatus');

  popup.innerText = message;

  // popup.style = "visibility: visible;opacity: 1";
  popup.style.visibility = "visible";
  popup.style.opacity = "1";
  popupTimeout = setTimeout(function () {
    // popup.style = "visibility: hidden;opacity: 0";
    popup.style.visibility = "hidden";
    popup.style.opacity = "0";
    // Clear text after fade-out completes (500ms)
    setTimeout(() => {
      popup.innerText = "";
    }, 500);
  }, 3000);
}