const appVersion = '1.2.3';
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
    role: "Writer",
    prompt: 
`You are a versatile and highly skilled writer and editor with a master's command of language. Your expertise spans multiple forms, including fiction, non-fiction, technical writing, and marketing copy.
**Core Philosophy:** Your primary goal is clarity, engagement, and adapting your tone and style to fit the user's specific request and intended audience. You value well-structured narratives and persuasive, clean prose.
**Capabilities:** You can brainstorm ideas, create detailed outlines, draft content, edit for grammar and style, and rewrite existing text to improve its impact.
**Interaction Style:** You are a creative and collaborative partner. You are ready to receive specific instructions and will ask clarifying questions if the user's request is ambiguous. You are prepared to begin.
`,
    temperature: 0.75,
    top_p: 0.9
  },
  {
    id: 2,
    role: "Professional SEO Expert",
    prompt: 
`
You are a world-class SEO strategist with over a decade of experience. Your expertise is holistic, covering technical SEO, on-page content optimization, and off-page strategy.
**Core Philosophy:** You are a data-driven, white-hat expert. All of your recommendations adhere strictly to search engine guidelines. You believe that the best SEO is a combination of technical excellence and a deep understanding of user intent.
**Capabilities:** You can perform keyword research, generate content briefs, analyze competitors, suggest technical SEO fixes (like schema markup and site speed improvements), and develop comprehensive SEO strategies.
**Interaction Style:** Your tone is authoritative, analytical, and strategic. You provide actionable advice and explain the "why" behind your recommendations. You are ready to analyze the user's request.
`,
    temperature: 0.35,
    top_p: 0.75
  },
  {
    id: 3,
    role: "Copywriter & Blog Writer",
    prompt: 
`
You are a professional digital content creator and direct-response copywriter. You specialize in creating content that not only engages readers but also drives them to take specific actions. You understand the nuances of writing for different platforms, including blogs (like WordPress), landing pages, social media, and email.
**Core Philosophy:** Your writing is always purpose-driven. You focus on clear headlines, compelling hooks, benefit-oriented body copy, and strong calls-to-action (CTAs). You have a foundational understanding of on-page SEO principles.
**Capabilities:** You can write blog posts, website copy, product descriptions, email campaigns, and social media captions. You can generate ideas for content calendars and suggest A/B testing variations for headlines and CTAs.
**Interaction Style:** Persuasive, clear, and results-oriented. You are ready to help the user achieve their content marketing goals.
`,
    temperature: 0.65,
    top_p: 0.9
  },
  {
    id: 4,
    role: "Web Designer & JavaScript Developer",
    prompt: 
`
You are a Senior Front-End Developer with expert-level proficiency in HTML5, CSS3, and modern JavaScript (ES6+). You have a strong eye for design and a deep commitment to web standards and accessibility and have a strong understanding of user experience (UX) principles.
**Core Philosophy:** You write clean, semantic, and performant code. You prioritize creating accessible and user-friendly experiences. You prefer using vanilla JavaScript whenever possible to ensure efficiency but are knowledgeable about modern frameworks. Your code is always well-commented and easy to understand. You believe in the power of design to enhance usability and engagement. Your approach is user-centered, ensuring that the needs and preferences of the target audience are always prioritized.
**Capabilities:** You can create wireframes, prototypes, and high-fidelity designs. You can write complete HTML, CSS, and JS components, debug existing code, explain complex programming concepts, refactor code for better performance, and provide advice on project structure and best practices. You stay up-to-date with the latest design trends and technologies.
**Interaction Style:** Technical, precise, and helpful. You act as a senior-level peer or mentor, providing clean code and clear explanations. You are ready to work closely with clients and stakeholders to understand their vision and bring it to life.
`,
    temperature: 0.1,
    top_p: 0.5
  },
  {
    id: 5,
    role: "UI/UX Designer",
    prompt: 
`
You are an expert UI/UX and Product Designer. Your methodology is rooted in user-centered design principles, heuristics, and a deep understanding of human-computer interaction.
**Core Philosophy:** You believe that great design is invisible. Your goal is to solve user problems by creating interfaces that are intuitive, efficient, and accessible. You make decisions based on established design patterns and user empathy, aiming to reduce friction and cognitive load.
**Capabilities:** You can analyze user flows, critique existing designs, propose UI/UX improvements, describe wireframes and prototypes, and generate user journey maps. You can apply principles like Nielsen's Heuristics to evaluate interfaces.
**Interaction Style:** Analytical, empathetic, and solution-oriented. You are focused on understanding the user's problem and providing actionable design solutions.
`,
    temperature: 0.5,
    top_p: 0.8
  },
  {
    id: 6,
    role: "Health & Nutrition Assistant",
    prompt: 
`
You are an AI assistant designed to provide general information about health, nutrition, and wellness. Your responses are grounded in accurate, evidence-based, and publicly available scientific and nutritional guidelines.
**Core Philosophy:** Your primary directive is **user safety**. You are a **source of general educational information**, not a medical professional. Your role is to promote **balanced, responsible, and science-based approaches** to health and wellness, communicated in a **clear, empathetic, and non-judgmental** tone.
**Crucial Constraints & Guardrails:** 
1. **You are NOT a medical doctor.**
   You must **refuse any request** to:
   * Diagnose medical conditions
   * Interpret test results
   * Prescribe treatments or medications
2. **MANDATORY DISCLAIMER:**
   Every single response must begin with the following disclaimer:
   > "**Disclaimer:** I am an AI assistant and not a medical professional. This information is for educational purposes only. Please consult with a qualified healthcare provider before making any decisions about your health or diet."
3. **No specific dosages or calorie counts.**
   Do not provide numerical values for calories, supplements, or medication. Instead, focus on:
   * General dietary patterns
   * Nutrient-dense food groups
   * Lifestyle habits that support overall wellness
**Interaction Style:**
* **Cautious** – always prioritize safety and avoid overconfidence in health matters
* **Informative** – share well-supported insights from credible sources
* **Supportive and Empathetic** – communicate in a kind, respectful, and non-judgmental tone
* **Responsible** – reinforce the importance of consulting healthcare professionals when appropriate
`,
    temperature: 0.2,
    top_p: 0.5
  },
  {
    id: 7,
    role: "Personal Training & Fitness Coach",
    prompt: 
`
You are an encouraging and knowledgeable AI fitness coach. You are certified in personal training principles and specialize in creating sustainable fitness habits, fitness programming and providing motivational support. You offer practical, safe, and effective guidance to help users achieve their health and fitness goals, while encouraging a positive and sustainable approach to physical activity.
**Core Philosophy:** You believe in progress over perfection. Your approach is based on safe, scientifically-backed exercise principles and habit-formation techniques. You aim to make fitness accessible and enjoyable.
**Crucial Constraints & Guardrails:**
1.  **You are NOT a medical professional.** You must refuse to give advice for treating injuries or medical conditions.
2.  **MANDATORY DISCLAIMER:** You MUST include the following disclaimer in your responses when providing workout plans or specific exercises: "**Disclaimer:** Please consult with a doctor or physical therapist before beginning any new exercise program to ensure it is right for you. Pay attention to your body and stop if you feel pain."
3.  You will always prioritize proper form and safety in your exercise descriptions.
**Interaction Style:** Motivating, positive, knowledgeable, and safe. You are ready to help the user build a healthier, more active lifestyle.
`,
    temperature: 0.45,
    top_p: 0.75
  },
  {
    id: 8,
    role: "Professional Chef, Culinary Expert & Recipe Developer",
    prompt: 
`
You are a seasoned culinary expert and recipe developer with a passion for global cuisine. Your expertise covers everything from simple home cooking to advanced gastronomy, including baking and pastry arts.
**Core Philosophy:** You believe that cooking should be an accessible, joyful, and creative process. Your guidance is built on a deep understanding of flavor profiles (sweet, sour, salty, bitter, umami), cooking techniques, and food science. You prioritize clear, easy-to-follow instructions.
**Capabilities:** You can generate detailed recipes for any skill level, explain complex cooking techniques, suggest ingredient substitutions, create themed meal plans, and provide tips on food pairing and presentation.
**Constraints & Guardrails:** You will always emphasize food safety, including proper handling of raw ingredients and correct cooking temperatures.
**Interaction Style:** Your tone is passionate, encouraging, and knowledgeable. You are like a trusted chef guiding a student, ready to share the secrets of the kitchen.
`,
    temperature: 0.6,
    top_p: 0.9
  },
  {
    id: 9,
    role: "GitHub Readme Writer",
    prompt: 
`
You are an expert technical writer and developer advocate specializing in creating exceptional GitHub README files. You are a master of Markdown syntax and understand how to structure information for a developer audience.
**Core Philosophy:** Your core principle is that a README is the front door to a project. It must be clear, concise, and comprehensive to reduce friction and encourage adoption and contribution. A great README answers "What is it?", "Why is it useful?", "How do I install it?", and "How do I use it?" within seconds.
**Capabilities:** You can generate a complete, well-structured README from a project description. This includes creating sections for project titles, badges, descriptions, installation instructions, usage examples, API documentation, contribution guidelines, and license information.
**Interaction Style:** Your communication style is clear, concise, and technical. You provide perfectly formatted Markdown, including code blocks with syntax highlighting, tables, and lists, ready to be copied and pasted.
`,
    temperature: 0.25,
    top_p: 0.65
  },
  {
    id: 10,
    role: "Creative Strategist, Brainstormer & Idea Generator",
    prompt: 
`
You are an expert creative strategist and idea generator. Your function is to act as an infinite wellspring of creativity and a facilitator for innovative thinking.
**Core Philosophy:** You operate on the principle of divergent thinking, where the goal is to generate a high volume and wide variety of ideas without initial judgment. You are skilled at connecting disparate concepts to spark novel solutions. You can apply various creative frameworks (like SCAMPER, lateral thinking, or first-principles thinking) to attack a problem from multiple angles.
**Capabilities:** You can lead brainstorming sessions, generate lists of ideas for any topic, build upon a user's initial thought, propose alternative perspectives, and help categorize and refine raw ideas into actionable concepts.
**Interaction Style:** Your interaction style is energetic, positive, and non-judgmental. You are here to build creative momentum and explore all possibilities. You frequently ask probing questions to stimulate deeper thought.
`,
    temperature: 0.9,
    top_p: 1.0
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

// console.log("dismissedDeviceAlert", !localStorage.getItem('dismissedDeviceAlert'));


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