const GIST_ID = "22a1a8c85b657b4faf769f4b75d849b1"; // Replace with your Gist ID
const FILENAME = "notes.txt"; // Replace with your filename

let GITHUB_TOKEN = localStorage.getItem("GITHUB_TOKEN");

if (!GITHUB_TOKEN) {
  GITHUB_TOKEN = prompt("Paste your GitHub token:");
  if (GITHUB_TOKEN) {
    localStorage.setItem("GITHUB_TOKEN", GITHUB_TOKEN);
  }
}

const statusEl = document.getElementById("status");
const textarea = document.getElementById("noteContent");
const charCountEl = document.getElementById("charCount");

// Show status message with animation
function showStatus(message, type = "info") {
  statusEl.innerHTML = `<span class="status-icon">${type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}</span> ${message}`;
  statusEl.className = type;
  
  // After 3 seconds, fade out
  setTimeout(() => {
    statusEl.style.opacity = "0.6";
  }, 3000);
}

function saveNote() {
  const content = textarea.value;
  const saveButton = document.getElementById("saveButton");
  
  // Disable button during save
  saveButton.disabled = true;
  saveButton.textContent = "Saving...";
  
  showStatus("Saving note...", "info");
  
  const payload = {
    files: {
      [FILENAME]: {
        content: content
      }
    }
  };
  
  fetch(`https://api.github.com/gists/${GIST_ID}`, {
    method: "PATCH",
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      if (data.files) {
        showStatus("Note saved successfully!", "success");
      } else {
        showStatus("Save failed. Check console for details.", "error");
      }
    })
    .catch((err) => {
      console.error(err);
      showStatus(`Error: ${err.message}`, "error");
    })
    .finally(() => {
      // Re-enable button after save attempt
      saveButton.disabled = false;
      saveButton.innerHTML = "<span>💾</span> Save";
    });
}

// Load content on page load
function loadNote() {
  showStatus("Loading note...", "info");
  
  fetch(`https://api.github.com/gists/${GIST_ID}`, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`
    }
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then(gist => {
      const file = gist.files[FILENAME];
      if (file) {
        textarea.value = file.content;
        showStatus("Note loaded successfully", "success");
        updateCharCount();
      } else {
        showStatus("File not found in Gist", "error");
      }
    })
    .catch(err => {
      console.error(err);
      showStatus(`Failed to load note: ${err.message}`, "error");
    });
}

// Update character count
function updateCharCount() {
  charCountEl.textContent = textarea.value.length;
}

// Event listeners
textarea.addEventListener('input', updateCharCount);

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
  // Ctrl+S or Cmd+S to save
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    saveNote();
  }
});

// Load note on page load
window.onload = loadNote;
