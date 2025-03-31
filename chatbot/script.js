// DOM Elements
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const voiceInput = document.getElementById("voice-input");
const imageUpload = document.getElementById("image-upload");
const imageInput = document.getElementById("image-input");
const imagePreview = document.getElementById("image-preview");
const previewImage = document.getElementById("preview-image");
const removeImage = document.getElementById("remove-image");
const chatHistory = document.getElementById("chat-history");
const newChatButton = document.getElementById("new-chat");
const toggleAudio = document.getElementById("toggle-audio");
const audioStatus = document.getElementById("audio-status");
const toggleTheme = document.getElementById("toggle-theme");
const lightIcon = document.getElementById("light-icon");
const darkIcon = document.getElementById("dark-icon");
const body = document.body;
const header = document.querySelector("header");
const ecoSpan = document.querySelector("h1 span:first-child");
const gardenSpan = document.querySelector("h1 span:last-child");

// API Configuration
const Api_Url =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBorUgiWRYL3DaaAdLt2oRmTRXLIRD6_p8";

// State
let isAudioEnabled = true;
let isDarkMode = false;
let currentImage = null;

// Speech Recognition
const recognition = new (window.SpeechRecognition ||
  window.webkitSpeechRecognition)();
recognition.lang = "en-US";
recognition.interimResults = false;
recognition.maxAlternatives = 1;

// Speech Synthesis
const synth = window.speechSynthesis;

// Event Listeners
userInput.addEventListener("input", handleInput);
userInput.addEventListener("keydown", handleKeyDown);
sendButton.addEventListener("click", sendMessage);
voiceInput.addEventListener("click", toggleVoiceInput);
imageUpload.addEventListener("click", () => imageInput.click());
imageInput.addEventListener("change", handleImageUpload);
removeImage.addEventListener("click", removeUploadedImage);
newChatButton.addEventListener("click", startNewChat);
toggleAudio.addEventListener("click", toggleAudioOutput);
toggleTheme.addEventListener("click", toggleDarkMode);

// Check for saved theme preference
if (localStorage.getItem("darkMode") === "true") {
  enableDarkMode();
}

// Initialize
checkInput();

// Functions
function handleInput() {
  checkInput();
  autoResizeTextarea();
}

function handleKeyDown(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function autoResizeTextarea() {
  userInput.style.height = "auto";
  userInput.style.height = userInput.scrollHeight + "px";
}

function checkInput() {
  sendButton.disabled = userInput.value.trim() === "" && !currentImage;
}

function sendMessage() {
  const message = userInput.value.trim();
  if (message === "" && !currentImage) return;

  // Add user message to chat
  addMessageToChat("user", message, currentImage);

  // Clear input
  userInput.value = "";
  userInput.style.height = "auto";
  checkInput();

  // Remove image preview
  if (currentImage) {
    removeUploadedImage();
  }

  // Show typing indicator
  const typingId = "typing-" + Date.now();
  addTypingIndicator(typingId);

  // Generate response
  setTimeout(() => {
    generateResponse(message, typingId);
  }, 500);
}

function addMessageToChat(role, content, imageData = null) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `flex items-start space-x-4 ${
    role === "user" ? "justify-end" : ""
  }`;

  if (role === "assistant") {
    messageDiv.innerHTML = `
                    <div class="flex-shrink-0">
                        <img src="https://cdn-icons-png.flaticon.com/512/10793/10793327.png" alt="AI Avatar" class="h-10 w-10 object-cover">
                    </div>
                    <div class="message-ai bg-green-50 p-4 rounded-lg max-w-3xl dark:bg-gray-700">
                        <h3 class="font-semibold text-[#4d9d7f] mb-2 dark:text-green-400">Sustainable Gardening Advisor</h3>
                        <div class="markdown-content text-gray-700 dark:text-gray-300">${formatMarkdown(
                          content
                        )}</div>
                    </div>
                `;
  } else {
    messageDiv.innerHTML = `
                    <div class="flex-shrink-0">
                        <img src="https://cdn-icons-png.flaticon.com/512/1326/1326390.png" alt="User Avatar" class="h-10 w-10 rounded-full">
                    </div>
                    <div class="message-user bg-blue-50 p-4 rounded-lg max-w-3xl dark:bg-gray-600">
                        <div class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">${content}</div>
                        ${
                          imageData
                            ? `<img src="${imageData.url}" class="mt-2 rounded-lg max-w-full h-auto max-h-60">`
                            : ""
                        }
                    </div>
                `;
  }

  chatHistory.appendChild(messageDiv);
  scrollToBottom();
}

function formatMarkdown(text) {
  // Convert **bold** to <strong>bold</strong>
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Convert *italic* to <em>italic</em>
  text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Convert `code` to <code>code</code>
  text = text.replace(/`(.*?)`/g, "<code>$1</code>");

  // Convert lists (both * and -)
  text = text.replace(
    /^\s*([*\-]|\d+\.)\s+(.*)/gm,
    function (match, bullet, content) {
      return bullet.match(/\d+\./)
        ? `<li class="list-decimal">${content}</li>`
        : `<li class="list-disc">${content}</li>`;
    }
  );

  // Group list items
  text = text.replace(/(<li class="list-disc">.*?<\/li>)+/gs, function (match) {
    return `<ul class="pl-5 my-2">${match}</ul>`;
  });

  text = text.replace(
    /(<li class="list-decimal">.*?<\/li>)+/gs,
    function (match) {
      return `<ol class="pl-5 my-2">${match}</ol>`;
    }
  );

  // Convert headings (## and ###)
  text = text.replace(
    /^##\s+(.*$)/gm,
    '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>'
  );
  text = text.replace(
    /^###\s+(.*$)/gm,
    '<h4 class="font-bold mt-3 mb-1">$1</h4>'
  );

  // Convert links [text](url)
  text = text.replace(
    /\[(.*?)\]\((.*?)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-green-600 dark:text-green-400 hover:underline">$1</a>'
  );

  // Convert blockquotes
  text = text.replace(
    /^>\s+(.*$)/gm,
    '<blockquote class="border-l-4 border-green-500 pl-4 my-2 text-gray-600 dark:text-gray-400">$1</blockquote>'
  );

  // Preserve line breaks
  text = text.replace(/\n/g, "<br>");

  return text;
}

function addTypingIndicator(id) {
  const typingDiv = document.createElement("div");
  typingDiv.id = id;
  typingDiv.className = "flex items-start space-x-4";
  typingDiv.innerHTML = `
                <div class="flex-shrink-0 ">
                    <img src="https://cdn-icons-png.flaticon.com/512/10793/10793327.png" alt="AI Avatar" class="h-10 w-10 object-cover">
                </div>
                <div class="message-ai bg-green-50 p-4 rounded-lg max-w-3xl dark:bg-gray-700">
                    <div class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            `;

  chatHistory.appendChild(typingDiv);
  scrollToBottom();
}

async function generateResponse(userMessage, typingId) {
  const agriculturePrompt = `You are Sustainable Gardening Advisor, an AI assistant specialized in organic and sustainable gardening. Provide detailed and practical advice on organic farming, crops, soil management, pest control, composting, water conservation, and sustainable practices. Keep responses clear, actionable, and environmentally focused. Format your response using Markdown for better readability. If the question is unrelated to gardening, politely redirect to gardening topics. User's question: ${userMessage}`;

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: agriculturePrompt },
            ...(currentImage
              ? [
                  {
                    inline_data: {
                      mime_type: currentImage.type,
                      data: currentImage.data,
                    },
                  },
                ]
              : []),
          ],
        },
      ],
    }),
  };

  try {
    let response = await fetch(Api_Url, requestOptions);
    let data = await response.json();

    // Remove typing indicator
    document.getElementById(typingId)?.remove();

    if (data.candidates && data.candidates[0].content.parts[0].text) {
      const apiResponse = data.candidates[0].content.parts[0].text;
      addMessageToChat("assistant", apiResponse);

      // Speak the response if audio is enabled
      if (isAudioEnabled) {
        speakResponse(apiResponse);
      }
    } else {
      addMessageToChat(
        "assistant",
        "Sorry, I couldn't process your request. Please try again."
      );
    }
  } catch (error) {
    console.error(error);
    document.getElementById(typingId)?.remove();
    addMessageToChat(
      "assistant",
      "Sorry, I'm having trouble connecting. Please check your internet connection and try again."
    );
  }
}

function speakResponse(text) {
  if (synth.speaking) {
    synth.cancel();
  }

  // Remove markdown formatting before speaking
  const cleanText = text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/^#+\s+(.*$)/gm, "$1");

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = "en-US";
  utterance.rate = 1;
  utterance.pitch = 1;
  synth.speak(utterance);
}

function toggleVoiceInput() {
  if (recognition.recording) {
    recognition.stop();
    voiceInput.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                `;
  } else {
    recognition.start();
    voiceInput.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                `;
  }
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    currentImage = {
      type: file.type,
      data: e.target.result.split(",")[1],
      url: e.target.result,
    };

    previewImage.src = currentImage.url;
    imagePreview.classList.remove("hidden");
    checkInput();
  };
  reader.readAsDataURL(file);
}

function removeUploadedImage() {
  currentImage = null;
  imageInput.value = "";
  imagePreview.classList.add("hidden");
  checkInput();
}

function toggleAudioOutput() {
  isAudioEnabled = !isAudioEnabled;
  audioStatus.textContent = isAudioEnabled ? "Audio On" : "Audio Off";

  if (!isAudioEnabled && synth.speaking) {
    synth.cancel();
  }
}

function enableDarkMode() {
  isDarkMode = true;
  body.classList.add("dark");
  lightIcon.classList.add("hidden");
  darkIcon.classList.remove("hidden");
  header.classList.add("dark:bg-gray-800", "dark:border-gray-700");
  ecoSpan.classList.add("dark:text-green-400");
  gardenSpan.classList.add("dark:text-gray-300");
}

function disableDarkMode() {
  isDarkMode = false;
  body.classList.remove("dark");
  lightIcon.classList.remove("hidden");
  darkIcon.classList.add("hidden");
  header.classList.remove("dark:bg-gray-800", "dark:border-gray-700");
  ecoSpan.classList.remove("dark:text-green-400");
  gardenSpan.classList.remove("dark:text-gray-300");
}

function toggleDarkMode() {
  if (isDarkMode) {
    disableDarkMode();
    localStorage.setItem("darkMode", "false");
  } else {
    enableDarkMode();
    localStorage.setItem("darkMode", "true");
  }
}

function startNewChat() {
  if (confirm("Start a new chat? Your current conversation will be cleared.")) {
    chatHistory.innerHTML = `
                    <div class="flex items-start space-x-4">
                        <div class="flex-shrink-0">
                            <img src="https://cdn-icons-png.flaticon.com/512/1019/1019231.png" alt="AI Avatar" class="h-10 w-10 rounded-full">
                        </div>
                        <div class="message-ai bg-green-50 p-4 rounded-lg max-w-3xl dark:bg-gray-700">
                            <h3 class="font-semibold text-[#4d9d7f] mb-2 dark:text-green-400">Sustainable Gardening Advisor</h3>
                            <div class="markdown-content text-gray-700 dark:text-gray-300">
                                <p>Hello! I'm your Sustainable Gardening Advisor. What would you like to learn about today?</p>
                            </div>
                        </div>
                    </div>
                `;
  }
}

function scrollToBottom() {
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Speech Recognition Events
recognition.onresult = (event) => {
  const speechResult = event.results[0][0].transcript;
  userInput.value = speechResult;
  checkInput();
  autoResizeTextarea();
  voiceInput.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
            `;
};

recognition.onerror = (event) => {
  console.error("Speech recognition error:", event.error);
  voiceInput.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
            `;
};

recognition.onend = () => {
  if (recognition.recording !== true) {
    voiceInput.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                `;
  }
};
