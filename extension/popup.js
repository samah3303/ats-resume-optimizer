/**
 * paniund 1-Click Job Clipper — Popup Controller (v1.0.1)
 */

const DEFAULT_API_BASE = "http://localhost:3000";

let currentJobData = null;
let currentApiBase = DEFAULT_API_BASE;
let currentToken = "";

// DOM Elements
const loadingView = document.getElementById("loadingView");
const notConnectedView = document.getElementById("notConnectedView");
const jobView = document.getElementById("jobView");
const successView = document.getElementById("successView");

const connectionStatus = document.getElementById("connectionStatus");
const statusLabel = document.getElementById("statusLabel");

const sourceTag = document.getElementById("sourceTag");
const fitScorePreview = document.getElementById("fitScorePreview");
const jobTitleInput = document.getElementById("jobTitle");
const jobCompanyInput = document.getElementById("jobCompany");
const jobLocationInput = document.getElementById("jobLocation");
const jobSalaryInput = document.getElementById("jobSalary");

const descStatusIcon = document.getElementById("descStatusIcon");
const descStatusText = document.getElementById("descStatusText");
const btnToggleDesc = document.getElementById("btnToggleDesc");
const descDrawer = document.getElementById("descDrawer");
const jobDescriptionTextarea = document.getElementById("jobDescriptionTextarea");

const clipForm = document.getElementById("clipForm");
const btnClip = document.getElementById("btnClip");
const btnRescan = document.getElementById("btnRescan");

const tokenInput = document.getElementById("tokenInput");
const btnSaveToken = document.getElementById("btnSaveToken");

const successSummary = document.getElementById("successSummary");
const successScoreVal = document.getElementById("successScoreVal");
const scoreTagSubtitle = document.getElementById("scoreTagSubtitle");
const matchedSkillsPills = document.getElementById("matchedSkillsPills");
const btnViewJob = document.getElementById("btnViewJob");
const btnClipAnother = document.getElementById("btnClipAnother");

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
  // Load saved preferences
  const stored = await chrome.storage.local.get(["apiBaseUrl", "apiToken"]);
  currentApiBase = stored.apiBaseUrl || DEFAULT_API_BASE;
  currentToken = stored.apiToken || "";

  if (currentToken) {
    tokenInput.value = currentToken;
  }

  // Toggle Description Drawer
  if (btnToggleDesc && descDrawer) {
    btnToggleDesc.addEventListener("click", () => {
      const isHidden = descDrawer.classList.contains("hidden");
      if (isHidden) {
        descDrawer.classList.remove("hidden");
        btnToggleDesc.innerText = "Hide ▴";
      } else {
        descDrawer.classList.add("hidden");
        btnToggleDesc.innerText = "View / Edit ▾";
      }
    });
  }

  // 1. Verify Authentication
  const isAuth = await verifyAuth();
  if (!isAuth) {
    showView("notConnectedView");
    return;
  }

  // 2. Extract Job from Active Tab
  await scanActiveTab();
});

// Verify connection with paniund server
async function verifyAuth() {
  try {
    const headers = { "Content-Type": "application/json" };
    if (currentToken) {
      headers["Authorization"] = `Bearer ${currentToken}`;
    }

    const res = await fetch(`${currentApiBase}/api/extension/status`, {
      method: "GET",
      headers,
      credentials: "include",
    });

    if (res.ok) {
      const data = await res.json();
      if (data.authenticated) {
        setConnectionBadge(true, data.user?.email || "Connected");
        return true;
      }
    }
  } catch (err) {
    console.warn("Connection verification error:", err);
  }

  setConnectionBadge(false, "Not Connected");
  return false;
}

function setConnectionBadge(connected, text) {
  connectionStatus.className = `status-pill ${
    connected ? "status-connected" : "status-disconnected"
  }`;
  statusLabel.innerText = text;
  statusLabel.title = text;
}

// Scan Active Tab
async function scanActiveTab() {
  showView("loadingView");

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      showFallbackForm({ title: "Custom Job Listing", sourceUrl: "" });
      return;
    }

    chrome.tabs.sendMessage(tab.id, { action: "GET_PAGE_JOB" }, (response) => {
      if (chrome.runtime.lastError || !response || !response.success) {
        // Content script might need dynamic injection
        chrome.scripting.executeScript(
          {
            target: { tabId: tab.id },
            files: ["content.js"],
          },
          () => {
            if (chrome.runtime.lastError) {
              showFallbackForm({ title: tab.title || "Job Listing", sourceUrl: tab.url || "" });
              return;
            }
            // Retry message
            chrome.tabs.sendMessage(tab.id, { action: "GET_PAGE_JOB" }, (retryRes) => {
              if (retryRes && retryRes.success) {
                populateJobForm(retryRes.data);
              } else {
                showFallbackForm({ title: tab.title || "Job Listing", sourceUrl: tab.url || "" });
              }
            });
          }
        );
      } else {
        populateJobForm(response.data);
      }
    });
  } catch (err) {
    console.warn("Scan active tab failed:", err);
    showFallbackForm({ title: "Job Listing", sourceUrl: "" });
  }
}

function populateJobForm(data) {
  currentJobData = data;
  jobTitleInput.value = data.title || "";
  jobCompanyInput.value = data.company || "";
  jobLocationInput.value = data.location || "";
  jobSalaryInput.value = data.salary || "";

  // Description handling
  const rawDesc = data.description || "";
  jobDescriptionTextarea.value = rawDesc;

  const descLen = rawDesc.length;
  if (descLen > 80 && !rawDesc.startsWith("Listing from:")) {
    descStatusIcon.className = "desc-icon ok";
    descStatusIcon.innerText = "✓";
    descStatusText.innerText = `Description captured (${descLen.toLocaleString()} chars)`;
  } else {
    descStatusIcon.className = "desc-icon warn";
    descStatusIcon.innerText = "⚠";
    descStatusText.innerText = "Description not detected — paste or click Rescan";
  }

  // Set platform badge
  const src = (data.source || "web").toUpperCase();
  sourceTag.innerText = src;
  if (src === "LINKEDIN") {
    sourceTag.className = "tag tag-blue";
  } else if (src === "BAYT") {
    sourceTag.className = "tag tag-cyan";
  } else {
    sourceTag.className = "tag tag-yellow";
  }

  if (fitScorePreview) {
    fitScorePreview.innerText = "ATS Fit Ready";
  }

  showView("jobView");
}

function showFallbackForm(defaults) {
  populateJobForm({
    title: defaults.title || "Job Opening",
    company: "Employer",
    location: "Remote",
    salary: null,
    description: `Manually clipped from: ${defaults.sourceUrl || window.location.href}`,
    sourceUrl: defaults.sourceUrl || "",
    source: "web",
  });
}

// Form Submission (Clip Action)
clipForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  btnClip.disabled = true;
  btnClip.innerHTML = `<span>Saving to pipeline...</span>`;

  const selectedStage =
    document.querySelector('input[name="pipelineStage"]:checked')?.value || "wishlist";

  const customDescription = jobDescriptionTextarea.value.trim();

  const payload = {
    title: jobTitleInput.value.trim(),
    company: jobCompanyInput.value.trim(),
    location: jobLocationInput.value.trim() || null,
    salary: jobSalaryInput.value.trim() || null,
    description: customDescription || currentJobData?.description || `Job: ${jobTitleInput.value}`,
    sourceUrl: currentJobData?.sourceUrl || window.location.href,
    source: currentJobData?.source || "extension",
    status: selectedStage,
  };

  try {
    const headers = { "Content-Type": "application/json" };
    if (currentToken) {
      headers["Authorization"] = `Bearer ${currentToken}`;
    }

    const res = await fetch(`${currentApiBase}/api/extension/clip`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to save job");
    }

    const result = await res.json();

    // Notify background script to show badge on extension icon
    chrome.runtime.sendMessage({
      action: "SET_BADGE",
      text: "✓",
      color: "#0A8A00",
      clearAfterMs: 3500,
    });

    // Populate success screen
    successSummary.innerText = `"${payload.title}" saved to ${
      selectedStage === "applied" ? "Applied" : "Wishlist"
    }.`;
    successScoreVal.innerText = `${result.matchScore || 85}%`;

    if (scoreTagSubtitle) {
      const sc = result.matchScore || 85;
      scoreTagSubtitle.innerText =
        sc >= 85
          ? "Strong Requirement & Skill Alignment"
          : sc >= 75
          ? "Good Skill Alignment"
          : "Moderate Skill Alignment";
    }

    // Display matched skill pills
    if (matchedSkillsPills) {
      matchedSkillsPills.innerHTML = "";
      const matched = Array.isArray(result.matchedSkills) ? result.matchedSkills : [];
      matched.slice(0, 5).forEach((sk) => {
        const pill = document.createElement("span");
        pill.className = "skill-pill";
        pill.innerText = `✓ ${sk}`;
        matchedSkillsPills.appendChild(pill);
      });

      const missing = Array.isArray(result.missingSkills) ? result.missingSkills : [];
      missing.slice(0, 3).forEach((sk) => {
        const pill = document.createElement("span");
        pill.className = "skill-pill missing";
        pill.innerText = `+ ${sk}`;
        matchedSkillsPills.appendChild(pill);
      });
    }

    btnViewJob.href = `${currentApiBase}${result.dashboardUrl || "/dashboard/jobs"}`;

    showView("successView");
  } catch (err) {
    alert(err instanceof Error ? err.message : "Failed to clip job");
  } finally {
    btnClip.disabled = false;
    btnClip.innerHTML = `<span>Save to paniund Pipeline</span><span class="btn-arrow">&rarr;</span>`;
  }
});

// Save API Token manually
btnSaveToken.addEventListener("click", async () => {
  const token = tokenInput.value.trim();
  if (!token) {
    alert("Please enter a valid API token from your paniund Profile Settings.");
    return;
  }

  currentToken = token;
  await chrome.storage.local.set({ apiToken: token });

  btnSaveToken.innerText = "Connecting...";
  const isAuth = await verifyAuth();

  if (isAuth) {
    btnSaveToken.innerText = "Connected!";
    setTimeout(() => {
      scanActiveTab();
    }, 600);
  } else {
    alert("Invalid API token or server unreachable. Please verify your token on your Profile page.");
    btnSaveToken.innerText = "Connect Extension";
  }
});

// Clip another button
btnClipAnother.addEventListener("click", () => {
  scanActiveTab();
});

// Rescan button
if (btnRescan) {
  btnRescan.addEventListener("click", () => {
    btnRescan.innerText = "Scanning...";
    scanActiveTab().finally(() => {
      btnRescan.innerText = "↻ Rescan";
    });
  });
}

// View Helper
function showView(viewId) {
  [loadingView, notConnectedView, jobView, successView].forEach((el) => {
    if (el) el.classList.add("hidden");
  });
  const active = document.getElementById(viewId);
  if (active) active.classList.remove("hidden");
}
