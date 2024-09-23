// content.js

// Global variable to track time spent on the current page
let startTime;
let currentUrl = window.location.href;

// Function to track time spent on the page
function trackTimeSpent() {
  const currentTime = new Date().getTime();
  const timeSpent = (currentTime - startTime) / 1000; // Time in seconds

  // Send data to the background script for storage or API call
  chrome.runtime.sendMessage({
    type: 'trackTime',
    url: currentUrl,
    timeSpent: timeSpent
  });

  // Reset start time after sending data
  startTime = currentTime;
}

// Function to check for restricted websites and block access
function checkRestrictedSites() {
  chrome.runtime.sendMessage({ type: 'checkRestrictions', url: currentUrl }, (response) => {
    if (response.restricted) {
      // If the website is restricted, display a block message
      document.body.innerHTML = `
        <div style="text-align: center; margin-top: 100px;">
          <h1>Access to this website is restricted.</h1>
          <p>You have reached the time limit or this website is blocked.</p>
        </div>
      `;

      // Optionally close the tab after showing the message for a short while
      setTimeout(() => {
        window.close();
      }, 3000);
    }
  });
}

// Initialize tracking when the page is loaded or when URL changes
window.onload = () => {
  startTime = new Date().getTime();
  currentUrl = window.location.href;

  // Check for restricted sites
  checkRestrictedSites();
  
  // Start tracking time every few seconds (adjust the interval as needed)
  setInterval(trackTimeSpent, 5000); // 5 seconds
};

// Listener for page changes (e.g., SPA applications)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'urlChange') {
    // Reset start time when the user navigates to a new page
    startTime = new Date().getTime();
    currentUrl = window.location.href;

    // Check restrictions for the new page
    checkRestrictedSites();
  }
});

