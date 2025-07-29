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
