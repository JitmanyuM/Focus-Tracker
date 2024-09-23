let currentTabId;
let currentURL;
let startTime;
let restrictedWebsites = {};  // Stores websites to block
let timeLimits = {};          // Stores time limits for websites

// When a tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.status === "complete") {
      console.log(`Tab updated: ${tab.url}`);
      updateTabData(tab.url); // Call your function to update data
  }
});

// When a tab is activated
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
      console.log(`Tab activated: ${tab.url}`);
      updateTabData(tab.url); // Call your function to update data
  });
});

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(["restrictedWebsites"], (result) => {
      restrictedWebsites = result.restrictedWebsites || {};
      console.log("Loaded restricted websites:", restrictedWebsites);
  });
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["restrictedWebsites"], (result) => {
      restrictedWebsites = result.restrictedWebsites || {};
      if (!result.restrictedWebsites) {
          // If there were no restricted websites, set an empty object
          chrome.storage.local.set({ restrictedWebsites: {} });
      }
      console.log("Installed - loaded restricted websites:", restrictedWebsites);
  });
});

chrome.storage.local.get(["restrictedWebsites"], (result) => {
  restrictedWebsites = result.restrictedWebsites || {};
  console.log("Fetched from storage:", result.restrictedWebsites);
  console.log("Current restricted websites:", restrictedWebsites);
});

chrome.storage.local.get("restrictedWebsites", (result) => {
  console.log("Restricted websites in storage:", result.restrictedWebsites);
});


// Update time spent and check for restrictions
function updateTabData(url) {
  console.log(`Updating tab data for URL: ${url}`);
  if (currentURL) {
      const timeSpent = (Date.now() - startTime) / 1000; // seconds
      saveTimeData(currentURL, timeSpent);
      checkTimeLimit(currentURL);
  }

  currentURL = url;
  startTime = Date.now();

  // Check if the new URL is blocked
  checkForBlockedWebsite(url);
}




// Save time spent on each website in chrome.storage.local
function saveTimeData(url, timeSpent) {
  chrome.storage.local.get([url], (result) => {
    let totalTime = result[url] || 0;
    totalTime += timeSpent;

    chrome.storage.local.set({ [url]: totalTime }, () => {
      console.log(`Total time spent on ${url}: ${totalTime}`);
    });
  });
}

// Check if the website is on the restricted list and block it
function checkForBlockedWebsite(url) {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
      console.log(`Skipping invalid URL: ${url}`);
      return;
  }

  const domain = extractDomain(url);
  if (!domain) {
      console.log(`Skipping extraction for invalid URL: ${url}`);
      return;
  }

  console.log(`Checking if ${domain} is in restricted websites: ${restrictedWebsites[domain]}`);
  if (restrictedWebsites[domain]) {
      chrome.tabs.update({ url: "about:blank" });
      alert(`Access to ${domain} is blocked!`);
  }
}




// Extract domain name from the URL (to handle subdomains as well)
function extractDomain(url) {
  try {
      const urlObj = new URL(url);
      return urlObj.hostname;
  } catch (e) {
      console.error(`Invalid URL: ${url}`, e);
      return null; // or handle the error as appropriate
  }
}


// Check if time limit is exceeded for a website and close the tab if needed
function checkTimeLimit(url) {
  const domain = extractDomain(url);
  chrome.storage.local.get([domain], (result) => {
    const timeSpent = result[domain] || 0;
    if (timeLimits[domain] && timeSpent > timeLimits[domain]) {
      chrome.tabs.query({ url: `*://${domain}/*` }, (tabs) => {
        tabs.forEach((tab) => chrome.tabs.remove(tab.id));
      });
      alert(`Time limit exceeded for ${domain}. Tab has been closed.`);
    }
  });
}

// Example function to add a website to the restricted list
function addRestrictedWebsite(url) {
  const domain = extractDomain(url);
  if (domain) {
      restrictedWebsites[domain] = true;
      chrome.storage.local.set({ restrictedWebsites }, () => {
          console.log(`Added ${domain} to restricted websites. Current list:`, restrictedWebsites);
      });
  }
}


// Example function to set a time limit for a website (in seconds)
function setTimeLimit(url, limitInSeconds) {
  const domain = extractDomain(url);
  timeLimits[domain] = limitInSeconds;
  chrome.storage.local.set({ timeLimits });
}

// Load restricted websites and time limits from storage when the extension starts
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(["restrictedWebsites", "timeLimits"], (result) => {
    restrictedWebsites = result.restrictedWebsites || {};
    timeLimits = result.timeLimits || {};
  });
});
