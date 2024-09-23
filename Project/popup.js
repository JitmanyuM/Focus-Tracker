document.addEventListener('DOMContentLoaded', function () {
    const blockWebsiteBtn = document.getElementById('block-website-btn');
    const setTimeLimitBtn = document.getElementById('set-time-limit-btn');
  
    // Handle the website blocking
    blockWebsiteBtn.addEventListener('click', function () {
      const website = document.getElementById('block-website-input').value;
      if (website) {
        addRestrictedWebsite(website);
      }
    });
  
    // Handle setting the time limit
    setTimeLimitBtn.addEventListener('click', function () {
      const website = document.getElementById('time-limit-website-input').value;
      const timeLimit = parseInt(document.getElementById('time-limit-input').value);
      if (website && timeLimit) {
        setTimeLimit(website, timeLimit * 60); // convert minutes to seconds
      }
    });
  
    // Fetch and display blocked websites
    function displayBlockedWebsites() {
      chrome.storage.local.get('restrictedWebsites', (result) => {
        const blockedWebsites = result.restrictedWebsites || {};
        const blockedWebsitesList = document.getElementById('blocked-websites-list');
        blockedWebsitesList.innerHTML = '';
  
        for (let website in blockedWebsites) {
          const listItem = document.createElement('li');
          listItem.textContent = website;
          blockedWebsitesList.appendChild(listItem);
        }
      });
    }
  
    // Fetch and display time limits
    function displayTimeLimits() {
      chrome.storage.local.get('timeLimits', (result) => {
        const timeLimits = result.timeLimits || {};
        const timeLimitsList = document.getElementById('time-limits-list');
        timeLimitsList.innerHTML = '';
  
        for (let website in timeLimits) {
          const listItem = document.createElement('li');
          const minutes = Math.floor(timeLimits[website] / 60); // convert seconds to minutes
          listItem.textContent = `${website}: ${minutes} minutes`;
          timeLimitsList.appendChild(listItem);
        }
      });
    }
  
    // Add website to the restricted list in storage
    function addRestrictedWebsite(website) {
      chrome.storage.local.get('restrictedWebsites', (result) => {
        const restrictedWebsites = result.restrictedWebsites || {};
        restrictedWebsites[website] = true;
  
        chrome.storage.local.set({ restrictedWebsites }, () => {
          displayBlockedWebsites();  // Refresh the blocked websites list
        });
      });
    }
  
    // Set a time limit for a website
    function setTimeLimit(website, timeLimitInSeconds) {
      chrome.storage.local.get('timeLimits', (result) => {
        const timeLimits = result.timeLimits || {};
        timeLimits[website] = timeLimitInSeconds;
  
        chrome.storage.local.set({ timeLimits }, () => {
          displayTimeLimits();  // Refresh the time limits list
        });
      });
    }
  
    // Initialize by displaying current blocked websites and time limits
    displayBlockedWebsites();
    displayTimeLimits();
  });
  