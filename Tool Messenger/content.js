let isActive = false;
let config = {};
let lastProcessedId = ""; 
let pollingInterval = null;
let isSwitchingChat = false;

// 1. KHỞI TẠO & LẮNG NGHE STORAGE
chrome.storage.local.get(null, (result) => {
    config = result.config || {
        groupName: result.groupName || "",
        managerName: result.managerName || "",
        keyword: result.keyword || result.triggerKeyword || "",
        replies: result.replies || result.replyKeywords || "",
        minDelay: result.minDelay || 0.5,
        maxDelay: result.maxDelay || 2
    };
    isActive = result.isActive || false;
    if (isActive) startTool();
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
        if (changes.config) {
            config = changes.config.newValue;
        } else {
            if (changes.groupName) config.groupName = changes.groupName.newValue;
            if (changes.managerName) config.managerName = changes.managerName.newValue;
            if (changes.keyword) config.keyword = changes.keyword.newValue;
            if (changes.replies) config.replies = changes.replies.newValue;
        }
        if (changes.isActive !== undefined) {
            isActive = changes.isActive.newValue;
            if (isActive) startTool();
            else stopTool();
        }
    }
});

function startTool() {
    if (!isActive) return;
    console.log("[CampTour] === BẬT TOOL: Bắt đầu Polling 500ms (Chế độ Log Sạch & Khắc Chế Text Ẩn) ===");
    
    const initialMsg = extractLastMessage();
    lastProcessedId = initialMsg ? initialMsg.fingerprint : "";
    
    if (pollingInterval) clearInterval(pollingInterval);
    pollingInterval = setInterval(pollSystem, 500); 
}

function stopTool() {
    isActive = false;
    if (pollingInterval) clearInterval(pollingInterval);
    console.log("[CampTour] === Đã TẮT Tool ===");
}

// 2. VÒNG LẶP POLLING (Hoạt động im lặng, chỉ báo khi có lỗi)
function pollSystem() {
    if (!isActive) return;

    if (!config || !config.groupName || !config.managerName || !config.keyword) {
        console.log("[CampTour] ❌ Lỗi: Thiếu dữ liệu cài đặt từ Popup! Vui lòng điền đủ Tên Nhóm, Tên Sếp, Từ Khóa.");
        stopTool();
        return; 
    }
    
    if (isSwitchingChat) return;

    try {
        if (isCurrentChatTargetGroup()) {
            checkAndReplyLastMessage();
        } else {
            scanSidebarForTargetGroup();
        }
    } catch (e) {
        console.error("[CampTour] Lỗi vòng lặp Polling:", e);
    }
}

function isCurrentChatTargetGroup() {
    try {
        const groupName = (config.groupName || "").toLowerCase();
        if (!groupName) return false;

        if (document.title.toLowerCase().includes(groupName)) return true;
        
        const headers = document.querySelectorAll('div[role="main"] h1, div[role="main"] h2, div[role="main"] span, div[role="banner"] span, div[role="banner"] h1');
        for (const h of headers) {
            const text = (h.textContent || "").trim().toLowerCase();
            if (text.length > 2 && text.includes(groupName)) {
                return true;
            }
        }
        
        return false;
    } catch (e) {
        return false;
    }
}

// 3. BÓC TÁCH DOM (Tương kế tựu kế với Text Ẩn)
function extractLastMessage() {
    const textNodes = document.querySelectorAll('div[role="main"] div[dir="auto"], div[role="main"] span[dir="auto"]');
    if (textNodes.length === 0) return null;

    let targetEl = null;
    let content = "";
    let targetIndex = -1;

    for (let i = textNodes.length - 1; i >= 0; i--) {
        const node = textNodes[i];
        
        if (node.closest('[role="textbox"]')) continue;

        const text = (node.textContent || "").trim();
        if (!text) continue;

        // Bỏ qua timestamp đơn thuần
        if (/^(\d{1,2}:\d{2}|AM|PM)$/i.test(text)) continue;
        if (/^\d+\s*(phút|giờ|giây|ngày)$/i.test(text)) continue;
        if (["đang hoạt động", "chưa đọc", "tin nhắn mới"].some(w => text.toLowerCase() === w)) continue;

        const lowerText = text.toLowerCase();
        if (lowerText.includes("bạn gửi") || lowerText.includes("you sent")) {
            continue; 
        }

        let isMine = false;
        let checkNode = node;
        let climbGuard = 0;
        while (checkNode && checkNode !== document.body && climbGuard < 10) {
            const style = window.getComputedStyle(checkNode);
            if (style.alignSelf === 'flex-end' || style.justifyContent === 'flex-end' || style.alignItems === 'flex-end') {
                isMine = true;
                break;
            }
            checkNode = checkNode.parentElement;
            climbGuard++;
        }

        if (isMine) {
            continue; 
        }

        targetEl = node;
        content = text;
        targetIndex = i;
        break;
    }

    if (!targetEl) return null;

    let sender = findSenderForNode(targetEl);

    if (!sender) {
        for (let i = targetIndex - 1; i >= Math.max(0, targetIndex - 20); i--) {
            const prevNode = textNodes[i];
            if (prevNode.closest('[role="textbox"]')) continue;
            
            const prevText = (prevNode.textContent || "").trim();
            if (!prevText) continue;

            const foundSender = findSenderForNode(prevNode);
            if (foundSender) {
                sender = foundSender;
                break;
            }
        }
    }

    // TƯƠNG KẾ TỰU KẾ: Trích xuất Tên và Nội dung từ Text Ẩn của Facebook
    if (content.includes("Tin nhắn do") || content.includes("gửi lúc")) {
        if (!sender) {
            const senderMatch = content.match(/do\s(.*?)\sgửi/i);
            if (senderMatch && senderMatch[1]) {
                sender = senderMatch[1].trim();
            }
        }

        const timeMatch = content.match(/gửi lúc .*?:\s*(.*)/i);
        if (timeMatch && timeMatch[1]) {
            content = timeMatch[1].trim();
        } else {
            const parts = content.split(':');
            if (parts.length > 1) {
                content = parts[parts.length - 1].trim();
            }
        }
    }

    sender = (sender || "").toLowerCase();
    const noiseWords = ["đang hoạt động", "chưa đọc", "tin nhắn", "trạng thái", "bạn gửi", "you sent"];
    for (const w of noiseWords) {
        sender = sender.replace(w, "");
    }
    sender = sender.replace(/\d{1,2}:\d{2}.*/g, ""); 
    sender = sender.replace(/lúc.*/g, "");
    sender = sender.trim();

    if (!targetEl.dataset.campId) {
        targetEl.dataset.campId = "camp_" + Date.now().toString() + "_" + Math.floor(Math.random()*1000);
    }
    const fingerprint = targetEl.dataset.campId;

    return {
        sender: sender,
        content: content,
        fingerprint: fingerprint
    };
}

function findSenderForNode(node) {
    let currentEl = node;
    let loopGuard = 0;
    
    while (currentEl && currentEl.getAttribute('role') !== 'main' && currentEl !== document.body && loopGuard < 12) {
        const avatar = currentEl.querySelector('img[aria-label], svg[aria-label]');
        if (avatar) {
            const label = avatar.getAttribute('aria-label') || "";
            if (label && !label.toLowerCase().includes("chưa đọc") && !label.toLowerCase().includes("hoạt động")) {
                return label;
            }
        }
        
        const h4 = currentEl.querySelector('h4');
        if (h4) return h4.textContent;

        currentEl = currentEl.parentElement;
        loopGuard++;
    }
    return "";
}

// 4. KIỂM TRA ĐIỀU KIỆN KÉP
function checkAndReplyLastMessage() {
    const msgData = extractLastMessage();
    
    if (!msgData) return; 

    if (msgData.fingerprint === lastProcessedId) {
        return; 
    }
    
    lastProcessedId = msgData.fingerprint;

    console.log(`[CampTour] 📩 Tin mới từ [${msgData.sender || "Vô danh"}]: [${msgData.content}]`);

    const keywordLower = (config.keyword || "").toLowerCase();
    const configNameLower = (config.managerName || "").toLowerCase();
    
    const hasKeyword = msgData.content.toLowerCase().includes(keywordLower);

    let hasManager = false;
    if (msgData.sender) {
        if (configNameLower.includes(msgData.sender)) {
            hasManager = true;
        } 
        else if (msgData.sender.includes(configNameLower)) {
            hasManager = true;
        }
        else {
            const parts = configNameLower.split(' ').filter(p => p.length > 1);
            for (const part of parts) {
                if (msgData.sender.includes(part)) {
                    hasManager = true;
                    break;
                }
            }
        }
    }

    if (hasKeyword && hasManager) {
        console.log("[CampTour] 🎯 BINGO! Đúng người, đúng tội. Kích hoạt Auto-Reply...");
        triggerAutoReply();
    } else {
        let reason = [];
        if (!hasManager) reason.push("Sai Tên");
        if (!hasKeyword) reason.push("Sai Từ Khóa");
        console.log(`[CampTour] ❌ Hủy lệnh: ${reason.join(" và ")}.`);
    }
}

// 5. CHUYỂN CHAT NẾU CÓ TIN MỚI Ở NHÓM ĐÍCH (Soft Navigation Optimization)
function scanSidebarForTargetGroup() {
    try {
        let chatRows = document.querySelectorAll('div[role="navigation"] [role="row"], [role="row"], [role="gridcell"]');
        const targetGroupName = (config.groupName || "").toLowerCase();
        let targetElement = null;
        let isUnread = false;

        for (const row of chatRows) {
            const text = row.textContent || "";
            if (text.toLowerCase().includes(targetGroupName)) {
                targetElement = row;
                break;
            }
        }

        if (targetElement) {
            let checkNode = targetElement;
            let loopCount = 0;
            
            while (checkNode && checkNode !== document.body && loopCount < 5) {
                const aria = (checkNode.getAttribute('aria-label') || "").toLowerCase();
                if (aria.includes('chưa đọc') || aria.includes('unread') || aria.includes('tin mới')) {
                    isUnread = true; break;
                }
                checkNode = checkNode.parentElement;
                loopCount++;
            }

            if (!isUnread) {
                const spans = targetElement.querySelectorAll('span');
                for (const span of spans) {
                    if (span.textContent.toLowerCase().includes(targetGroupName)) {
                        const fw = window.getComputedStyle(span).fontWeight;
                        if (fw === '600' || fw === '700' || fw === 'bold' || parseInt(fw) >= 600) {
                            isUnread = true; break;
                        }
                    }
                }
            }

            if (isUnread) {
                console.log("[CampTour] 🚨 Nhóm đích có tin chưa đọc! Đang thử Soft Navigation...");
                
                const linkElement = targetElement.querySelector('a') || targetElement.closest('a');

                if (linkElement && linkElement.href) {
                    const targetUrl = linkElement.href;
                    isSwitchingChat = true;

                    // ƯU TIÊN 1: Lừa React Router bằng History API
                    try {
                        window.history.pushState({}, '', targetUrl);
                        window.dispatchEvent(new PopStateEvent('popstate'));
                        console.log(`[CampTour] 🚀 Đã đẩy History API tới: ${targetUrl}`);
                    } catch (e) {}

                    // ƯU TIÊN 2: Deep Click (Mô phỏng click vào node con sâu nhất để vượt mặt React Delegation)
                    try {
                        let deepestNode = linkElement;
                        while (deepestNode.firstElementChild) {
                            deepestNode = deepestNode.firstElementChild;
                        }
                        
                        const mousedownEvent = new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window });
                        const mouseupEvent = new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window });
                        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });

                        deepestNode.dispatchEvent(mousedownEvent);
                        deepestNode.dispatchEvent(mouseupEvent);
                        deepestNode.dispatchEvent(clickEvent);
                        console.log(`[CampTour] 🖱️ Đã xả Combo Click vào node cực sâu của thẻ a.`);
                    } catch (e) {}

                    // PHƯƠNG ÁN CUỐI (Fallback): Đợi 1 giây, nếu tiêu đề Box Chat chưa đổi thì xài Hard Navigation
                    setTimeout(() => {
                        if (!isCurrentChatTargetGroup()) {
                            console.log(`[CampTour] ⚠️ Soft Navigation chưa nhận! Ép Hard Navigation (Reload URL)...`);
                            window.location.href = targetUrl;
                            setTimeout(() => {
                                isSwitchingChat = false;
                            }, 4000);
                        } else {
                            console.log(`[CampTour] ✅ Soft Navigation thành công! Chat đã chuyển mượt mà.`);
                            isSwitchingChat = false;
                        }
                    }, 1000); 

                } else {
                    console.log("[CampTour] ❌ Vẫn không tìm thấy href! Thử lại ở vòng lặp sau...");
                }
            }
        }
    } catch (e) {
    }
}

// 6. XẢ TEXT (DataTransfer cho Lexical)
async function triggerAutoReply() {
    try {
        stopTool(); 
        chrome.storage.local.set({ isActive: false });
        
        const replies = (config.replies || "").split(',').map(s => s.trim()).filter(s => s);
        if (replies.length === 0) replies.push("dạ");
        
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        const minD = config.minDelay * 1000 || 500;
        const maxD = config.maxDelay * 1000 || 2000;
        const delay = Math.floor(Math.random() * (maxD - minD + 1) + minD);
        
        console.log(`[CampTour] ⏳ Chờ ${delay}ms để dán chữ: "${randomReply}"`);
        await new Promise(r => setTimeout(r, delay));
        
        const editor = document.querySelector('div[role="textbox"][contenteditable="true"]');
        if (editor) {
            editor.focus();
            const dt = new DataTransfer();
            dt.setData('text/plain', randomReply);
            editor.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
            
            setTimeout(() => {
                editor.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
                playTingSound();
                console.log("[CampTour] ✅ GỬI THÀNH CÔNG! Đã tắt tool.");
            }, 150);
        } else {
            console.error("[CampTour] ❌ Lỗi: Không tìm thấy khung Chat!");
        }
    } catch (e) {}
}

function playTingSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine'; osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5);
    } catch (e) {}
}
