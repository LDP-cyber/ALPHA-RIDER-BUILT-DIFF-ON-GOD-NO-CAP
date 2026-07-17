document.addEventListener('DOMContentLoaded', () => {
    const groupNameInput = document.getElementById('groupName');
    const managerNameInput = document.getElementById('managerName');
    const keywordInput = document.getElementById('keyword');
    const repliesInput = document.getElementById('replies');
    const minDelayInput = document.getElementById('minDelay');
    const maxDelayInput = document.getElementById('maxDelay');
    const statusText = document.getElementById('statusText');
    const toggleBtn = document.getElementById('toggleBtn');

    // Load saved settings from chrome.storage
    chrome.storage.local.get(['config', 'isActive'], (result) => {
        const config = result.config || {};
        groupNameInput.value = config.groupName || '';
        managerNameInput.value = config.managerName || '';
        keywordInput.value = config.keyword || '';
        repliesInput.value = config.replies || '';
        minDelayInput.value = config.minDelay || '0.5';
        maxDelayInput.value = config.maxDelay || '2';
        
        updateUI(result.isActive || false);
    });

    // Toggle button click logic
    toggleBtn.addEventListener('click', () => {
        chrome.storage.local.get(['isActive'], (result) => {
            const newState = !result.isActive;
            
            // Save current config
            const newConfig = {
                groupName: groupNameInput.value.trim(),
                managerName: managerNameInput.value.trim(),
                keyword: keywordInput.value.trim(),
                replies: repliesInput.value.trim(),
                minDelay: parseFloat(minDelayInput.value) || 0.5,
                maxDelay: parseFloat(maxDelayInput.value) || 2
            };
            
            chrome.storage.local.set({
                config: newConfig,
                isActive: newState
            }, () => {
                updateUI(newState);
            });
        });
    });

    // Listen for state changes (e.g., auto-kill triggered from content.js)
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes.isActive !== undefined) {
            updateUI(changes.isActive.newValue);
        }
    });

    // UI updater function
    function updateUI(isActive) {
        if (isActive) {
            statusText.textContent = 'Đang chờ (Polling Sidebar...)';
            statusText.className = 'status-on';
            toggleBtn.textContent = 'Tắt Tool';
            toggleBtn.className = 'btn btn-stop';
            
            // Disable inputs while actively waiting
            groupNameInput.disabled = true;
            managerNameInput.disabled = true;
            keywordInput.disabled = true;
            repliesInput.disabled = true;
            minDelayInput.disabled = true;
            maxDelayInput.disabled = true;
        } else {
            statusText.textContent = 'Đang tắt';
            statusText.className = 'status-off';
            toggleBtn.textContent = 'Bật Tool';
            toggleBtn.className = 'btn btn-start';
            
            // Enable inputs when stopped
            groupNameInput.disabled = false;
            managerNameInput.disabled = false;
            keywordInput.disabled = false;
            repliesInput.disabled = false;
            minDelayInput.disabled = false;
            maxDelayInput.disabled = false;
        }
    }
});
