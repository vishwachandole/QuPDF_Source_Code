// PDF Viewer and Chat Interface JavaScript

// Global variables
let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.0;
let canvas = document.getElementById('pdf-canvas');
let ctx = canvas.getContext('2d');
let currentPDF = null;
let pdfData = null;
let textLayerDiv = null;
let highlights = [];
let isHighlightMode = false;
let selectedText = '';
let chatHistory = [];

// DOM Elements
const prevButton = document.getElementById('prev-page');
const nextButton = document.getElementById('next-page');
const currentPageSpan = document.getElementById('current-page');
const totalPagesSpan = document.getElementById('total-pages');
const zoomInButton = document.getElementById('zoom-in');
const zoomOutButton = document.getElementById('zoom-out');
const resetZoomButton = document.getElementById('reset-zoom');
const zoomLevelSpan = document.getElementById('zoom-level');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-btn');
const highlightButton = document.getElementById('highlight-btn');
const downloadButton = document.getElementById('download-btn');
const backButton = document.getElementById('back-to-home');
const pdfTitle = document.getElementById('pdf-title');
const chatInput = document.getElementById('chat-input');
const sendMessageButton = document.getElementById('send-message');
const chatMessages = document.getElementById('chat-messages');
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notification-message');
const notificationClose = document.getElementById('notification-close');
const pdfContainer = document.querySelector('.pdf-container');
const shareChatButton = document.getElementById('share-chat');
const exportChatButton = document.getElementById('export-chat');
const deleteChatButton = document.getElementById('delete-chat');
const resizer = document.getElementById('resizer');
const pdfViewerSection = document.querySelector('.pdf-viewer-section');
const chatSection = document.querySelector('.chat-section');

// Initialize the viewer
document.addEventListener('DOMContentLoaded', function() {
    // Initialize canvas and context
    canvas = document.getElementById('pdf-canvas');
    if (canvas) {
        ctx = canvas.getContext('2d');
    } else {
        console.error("PDF canvas element not found");
        showNotification("Error: PDF canvas element not found", "error");
        return;
    }
    
    // Check if PDF data is in sessionStorage
    const storedPdfData = sessionStorage.getItem('pdfData');
    const storedPdfName = sessionStorage.getItem('pdfName');
    
    if (storedPdfData) {
        // Load the PDF from stored data
        pdfData = storedPdfData;
        if (storedPdfName) {
            pdfTitle.textContent = storedPdfName;
        }
        loadPdfFromData(storedPdfData);
    } else {
        // For testing purposes, load a sample PDF if no data in session storage
        const samplePdfUrl = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf';
        
        fetch(samplePdfUrl)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => {
                const bytes = new Uint8Array(arrayBuffer);
                let binary = '';
                for (let i = 0; i < bytes.byteLength; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                pdfData = btoa(binary);
                pdfTitle.textContent = "Sample PDF Document";
                loadPdfFromData(pdfData);
            })
            .catch(error => {
                console.error("Error loading sample PDF:", error);
                showNotification("Error loading PDF. Please return to home page and try again.", "error");
                // No PDF data found, redirect to home page after a delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 3000);
            });
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Set up resizer
    setupResizer();
});

// Set up all event listeners
function setupEventListeners() {
    // PDF navigation
    prevButton.addEventListener('click', onPrevPage);
    nextButton.addEventListener('click', onNextPage);
    
    // Zoom controls
    zoomInButton.addEventListener('click', zoomIn);
    zoomOutButton.addEventListener('click', zoomOut);
    resetZoomButton.addEventListener('click', resetZoom);
    
    // Search functionality
    searchButton.addEventListener('click', search);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            search();
        }
    });
    
    // Highlight functionality
    highlightButton.addEventListener('click', toggleHighlightMode);
    
    // Download PDF
    downloadButton.addEventListener('click', downloadPdf);
    
    // Back to home
    backButton.addEventListener('click', function() {
        // Add fade-out animation before redirecting
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 300);
    });
    
    // Chat functionality
    if (sendMessageButton) {
        sendMessageButton.addEventListener('click', sendMessage);
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // Auto-resize textarea
        chatInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
    }
    
    // Chat action buttons
    if (shareChatButton) {
        shareChatButton.addEventListener('click', shareChat);
    }
    
    if (exportChatButton) {
        exportChatButton.addEventListener('click', exportChat);
    }
    
    if (deleteChatButton) {
        deleteChatButton.addEventListener('click', clearChat);
    }
    
    // Notification close button
    if (notificationClose) {
        notificationClose.addEventListener('click', function() {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.classList.remove('show');
                notification.classList.remove('fade-out');
            }, 500);
        });
    }
    
    // Text selection for highlighting
    if (pdfContainer) {
        pdfContainer.addEventListener('mouseup', function() {
            if (isHighlightMode) {
                const selection = window.getSelection();
                selectedText = selection.toString().trim();
                
                if (selectedText) {
                    // In a real implementation, you would create highlight elements
                    // For this demo, we'll just show a notification
                    showNotification(`Text "${selectedText}" has been highlighted`, 'info');
                    
                    // Add to highlights array (in a real app, you'd store position data too)
                    highlights.push({
                        text: selectedText,
                        page: pageNum
                    });
                    
                    // Clear selection
                    selection.removeAllRanges();
                }
            }
        });
    }
    
    // Handle keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Left arrow: previous page
        if (e.key === 'ArrowLeft') {
            onPrevPage();
            // Add button press effect
            addButtonPressEffect(prevButton);
        }
        // Right arrow: next page
        else if (e.key === 'ArrowRight') {
            onNextPage();
            // Add button press effect
            addButtonPressEffect(nextButton);
        }
        // Ctrl + '+': zoom in
        else if (e.key === '+' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            zoomIn();
            // Add button press effect
            addButtonPressEffect(zoomInButton);
        }
        // Ctrl + '-': zoom out
        else if (e.key === '-' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            zoomOut();
            // Add button press effect
            addButtonPressEffect(zoomOutButton);
        }
        // Ctrl + '0': reset zoom
        else if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            resetZoom();
            // Add button press effect
            addButtonPressEffect(resetZoomButton);
        }
        // Ctrl + 'f': focus search
        else if (e.key === 'f' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            searchInput.focus();
            // Add visual feedback
            searchInput.classList.add('focus-effect');
            setTimeout(() => {
                searchInput.classList.remove('focus-effect');
            }, 300);
        }
        // Ctrl + 'h': toggle highlight mode
        else if (e.key === 'h' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            toggleHighlightMode();
            // Add button press effect
            addButtonPressEffect(highlightButton);
        }
        // Ctrl + 'd': download PDF
        else if (e.key === 'd' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            downloadPdf();
            // Add button press effect
            addButtonPressEffect(downloadButton);
        }
    });
}

// Set up resizer functionality
function setupResizer() {
    let isResizing = false;
    let initialX;
    let initialPdfWidth;
    let initialChatWidth;
    
    resizer.addEventListener('mousedown', function(e) {
        isResizing = true;
        initialX = e.clientX;
        initialPdfWidth = pdfViewerSection.offsetWidth;
        initialChatWidth = chatSection.offsetWidth;
        
        resizer.classList.add('active');
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        // Prevent text selection during resize
        document.body.style.userSelect = 'none';
    });
    
    function handleMouseMove(e) {
        if (!isResizing) return;
        
        const containerWidth = document.querySelector('.pdf-chat-container').offsetWidth;
        const dx = e.clientX - initialX;
        
        // Calculate new widths
        let newPdfWidth = initialPdfWidth + dx;
        let newChatWidth = initialChatWidth - dx;
        
        // Ensure minimum widths (20% of container)
        const minWidth = containerWidth * 0.2;
        if (newPdfWidth < minWidth) {
            newPdfWidth = minWidth;
            newChatWidth = containerWidth - minWidth;
        } else if (newChatWidth < minWidth) {
            newChatWidth = minWidth;
            newPdfWidth = containerWidth - minWidth;
        }
        
        // Update widths
        const pdfPercent = (newPdfWidth / containerWidth) * 100;
        const chatPercent = (newChatWidth / containerWidth) * 100;
        
        pdfViewerSection.style.width = `${pdfPercent}%`;
        chatSection.style.width = `${chatPercent}%`;
        resizer.style.left = `${pdfPercent}%`;
    }
    
    function handleMouseUp() {
        isResizing = false;
        resizer.classList.remove('active');
        
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        // Re-enable text selection
        document.body.style.userSelect = '';
    }
}

// Add button press effect
function addButtonPressEffect(button) {
    if (!button) return;
    
    button.classList.add('button-press');
    setTimeout(() => {
        button.classList.remove('button-press');
    }, 200);
}

// Load PDF from data URL or binary data
function loadPdfFromData(data) {
    try {
        // Show loading notification
        showNotification('Loading PDF document...', 'info');
        
        // Using PDF.js to load the PDF
        const loadingTask = pdfjsLib.getDocument({ data: atob(data) });
        
        loadingTask.promise.then(function(pdf) {
            pdfDoc = pdf;
            totalPagesSpan.textContent = pdf.numPages;
            
            // Initial page rendering
            renderPage(pageNum);
            
            // Success notification
            showNotification('PDF loaded successfully!', 'info');
        }).catch(function(error) {
            console.error('Error loading PDF:', error);
            showNotification('Error loading PDF: ' + error.message, 'error');
        });
    } catch (error) {
        console.error('Exception while loading PDF:', error);
        showNotification('Error loading PDF: ' + error.message, 'error');
    }
}

// Render a specific page
function renderPage(num) {
    pageRendering = true;
    
    // Show loading indicator for page
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'page-loading-indicator';
    loadingIndicator.innerHTML = `
        <div class="loading-spinner">
            <div></div><div></div><div></div><div></div>
        </div>
        <div>Loading page ${num}...</div>
    `;
    pdfContainer.appendChild(loadingIndicator);
    
    // Get page
    pdfDoc.getPage(num).then(function(page) {
        // Adjust scale based on viewport
        const viewport = page.getViewport({ scale: scale });
        
        // Set canvas dimensions
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Render PDF page
        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        
        const renderTask = page.render(renderContext);
        
        // Wait for rendering to finish
        renderTask.promise.then(function() {
            pageRendering = false;
            
            // Remove loading indicator
            if (loadingIndicator.parentNode) {
                loadingIndicator.parentNode.removeChild(loadingIndicator);
            }
            
            // Apply any highlights
            applyHighlights();
            
            // Check if there's a pending page
            if (pageNumPending !== null) {
                renderPage(pageNumPending);
                pageNumPending = null;
            }
            
            // Enable text selection
            enableTextSelection();
            
            // Create text layer for selection and search
            createTextLayer(page, viewport);
        });
        
        // Update page counters
        currentPageSpan.textContent = num;
    });
}

// Create text layer for selection and search
function createTextLayer(page, viewport) {
    // Remove existing text layer if any
    if (textLayerDiv) {
        if (textLayerDiv.parentNode) {
            textLayerDiv.parentNode.removeChild(textLayerDiv);
        }
    }
    
    // Create new text layer div
    textLayerDiv = document.createElement('div');
    textLayerDiv.className = 'textLayer';
    textLayerDiv.style.width = `${viewport.width}px`;
    textLayerDiv.style.height = `${viewport.height}px`;
    
    // Create a wrapper div to position the text layer correctly
    const textLayerWrapper = document.createElement('div');
    textLayerWrapper.style.position = 'absolute';
    textLayerWrapper.style.top = `${canvas.offsetTop}px`;
    textLayerWrapper.style.left = `${canvas.offsetLeft}px`;
    textLayerWrapper.style.width = `${viewport.width}px`;
    textLayerWrapper.style.height = `${viewport.height}px`;
    textLayerWrapper.style.zIndex = '2';
    
    // Add text layer to wrapper
    textLayerWrapper.appendChild(textLayerDiv);
    
    // Add wrapper to container
    pdfContainer.appendChild(textLayerWrapper);
    
    // Get the text content
    page.getTextContent().then(function(textContent) {
        // Create text layer with PDF.js
        pdfjsLib.renderTextLayer({
            textContent: textContent,
            container: textLayerDiv,
            viewport: viewport,
            textDivs: []
        }).promise.then(() => {
            // Make text layer visible after rendering
            textLayerDiv.style.opacity = '0.2';
        });
    });
}

// Enable text selection on the canvas
function enableTextSelection() {
    // This is a simplified approach - in a real app, you'd use PDF.js text layer
    canvas.style.userSelect = 'text';
    canvas.style.webkitUserSelect = 'text';
    canvas.style.mozUserSelect = 'text';
    canvas.style.msUserSelect = 'text';
}

// Go to previous page
function onPrevPage() {
    if (pageNum <= 1) {
        // Visual feedback for being on first page
        prevButton.classList.add('disabled-btn');
        setTimeout(() => {
            prevButton.classList.remove('disabled-btn');
        }, 300);
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
}

// Go to next page
function onNextPage() {
    if (pageNum >= pdfDoc.numPages) {
        // Visual feedback for being on last page
        nextButton.classList.add('disabled-btn');
        setTimeout(() => {
            nextButton.classList.remove('disabled-btn');
        }, 300);
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
}

// Queue rendering of a page
function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

// Zoom in
function zoomIn() {
    scale += 0.25;
    if (scale > 3) {
        scale = 3; // Max zoom
        // Visual feedback for max zoom
        zoomInButton.classList.add('disabled-btn');
        setTimeout(() => {
            zoomInButton.classList.remove('disabled-btn');
        }, 300);
    }
    updateZoomLevel();
    
    // Force re-render of the current page with new scale
    pageRendering = false;
    pageNumPending = null;
    renderPage(pageNum);
    
    // Add visual feedback for zoom change
    canvas.classList.add('zoom-change');
    setTimeout(() => {
        canvas.classList.remove('zoom-change');
    }, 300);
}

// Zoom out
function zoomOut() {
    scale -= 0.25;
    if (scale < 0.5) {
        scale = 0.5; // Min zoom
        // Visual feedback for min zoom
        zoomOutButton.classList.add('disabled-btn');
        setTimeout(() => {
            zoomOutButton.classList.remove('disabled-btn');
        }, 300);
    }
    updateZoomLevel();
    
    // Force re-render of the current page with new scale
    pageRendering = false;
    pageNumPending = null;
    renderPage(pageNum);
    
    // Add visual feedback for zoom change
    canvas.classList.add('zoom-change');
    setTimeout(() => {
        canvas.classList.remove('zoom-change');
    }, 300);
}

// Reset zoom
function resetZoom() {
    scale = 1.0;
    updateZoomLevel();
    
    // Force re-render of the current page with new scale
    pageRendering = false;
    pageNumPending = null;
    renderPage(pageNum);
    
    // Visual feedback for reset
    resetZoomButton.classList.add('active');
    setTimeout(() => {
        resetZoomButton.classList.remove('active');
    }, 300);
}

// Update zoom level display
function updateZoomLevel() {
    const percentage = Math.round(scale * 100);
    zoomLevelSpan.textContent = percentage + '%';
}

// Search functionality
function search() {
    const searchTerm = searchInput.value.trim();
    if (!searchTerm) {
        // Visual feedback for empty search
        searchInput.classList.add('error-shake');
        setTimeout(() => {
            searchInput.classList.remove('error-shake');
        }, 500);
        return;
    }
    
    // Add search animation
    searchButton.classList.add('searching');
    
    // Clear previous highlights
    clearSearchHighlights();
    
    // Keep track of search results
    let totalMatches = 0;
    let currentPage = pageNum;
    let foundOnCurrentPage = false;
    
    // Function to search a single page
    function searchPage(pageIndex) {
        return pdfDoc.getPage(pageIndex).then(page => {
            return page.getTextContent().then(textContent => {
                const text = textContent.items.map(item => item.str).join(' ');
                const regex = new RegExp(searchTerm, 'gi');
                const matches = text.match(regex);
                
                if (matches && matches.length > 0) {
                    totalMatches += matches.length;
                    
                    // If we're not on the page with matches, go to it
                    if (pageIndex !== pageNum && !foundOnCurrentPage) {
                        pageNum = pageIndex;
                        queueRenderPage(pageNum);
                        foundOnCurrentPage = true;
                    }
                    
                    // Highlight matches on current page
                    if (pageIndex === pageNum) {
                        foundOnCurrentPage = true;
                        highlightSearchResults(textContent, searchTerm);
                    }
                    
                    return true;
                }
                return false;
            });
        });
    }
    
    // Start with current page
    searchPage(currentPage).then(found => {
        if (!found) {
            // If not found on current page, search through all pages
            const searchPromises = [];
            for (let i = 1; i <= pdfDoc.numPages; i++) {
                if (i !== currentPage) {
                    searchPromises.push(searchPage(i));
                }
            }
            
            Promise.all(searchPromises).then(() => {
                finishSearch(totalMatches);
            });
        } else {
            finishSearch(totalMatches);
        }
    });
}

// Highlight search results
function highlightSearchResults(textContent, searchTerm) {
    if (!textLayerDiv) return;
    
    // Wait for text layer to be fully rendered
    setTimeout(() => {
        const textDivs = textLayerDiv.querySelectorAll('span');
        const regex = new RegExp(searchTerm, 'gi');
        let foundAny = false;
        
        textDivs.forEach(div => {
            const text = div.textContent;
            if (regex.test(text)) {
                div.classList.add('highlight');
                foundAny = true;
                
                // Scroll to the first match
                if (!foundAny) {
                    div.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }
        });
    }, 500); // Give time for text layer to render
}

// Clear search highlights
function clearSearchHighlights() {
    if (!textLayerDiv) return;
    
    const highlights = textLayerDiv.querySelectorAll('.highlight');
    highlights.forEach(highlight => {
        highlight.classList.remove('highlight');
    });
}

// Finish search process
function finishSearch(totalMatches) {
    // Remove search animation
    searchButton.classList.remove('searching');
    
    if (totalMatches > 0) {
        // Highlight the search box to indicate success
        searchInput.classList.add('search-success');
        setTimeout(() => {
            searchInput.classList.remove('search-success');
        }, 1000);
        
        showNotification(`Found ${totalMatches} matches for "${searchInput.value}"`, 'info');
    } else {
        showNotification(`No matches found for "${searchInput.value}"`, 'warning');
    }
}

// Toggle highlight mode
function toggleHighlightMode() {
    isHighlightMode = !isHighlightMode;
    highlightButton.classList.toggle('active');
    
    if (isHighlightMode) {
        // Change cursor to indicate highlight mode
        pdfContainer.style.cursor = 'text';
        showNotification('Highlight mode activated. Select text to highlight.', 'info');
    } else {
        // Reset cursor
        pdfContainer.style.cursor = 'default';
        showNotification('Highlight mode deactivated.', 'info');
    }
}

// Apply highlights to the current page
function applyHighlights() {
    // In a real app, you'd apply stored highlights to the current page
    // For this demo, we'll just log the highlights for the current page
    const pageHighlights = highlights.filter(h => h.page === pageNum);
    if (pageHighlights.length > 0) {
        console.log(`Highlights on page ${pageNum}:`, pageHighlights);
    }
}

// Download PDF
function downloadPdf() {
    if (!pdfData) {
        showNotification('PDF data not available for download.', 'error');
        return;
    }
    
    // Add download animation
    downloadButton.classList.add('downloading');
    
    setTimeout(() => {
        const fileName = pdfTitle.textContent || 'document.pdf';
        const blob = new Blob([Uint8Array.from(atob(pdfData), c => c.charCodeAt(0))], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        
        URL.revokeObjectURL(url);
        
        // Remove download animation
        downloadButton.classList.remove('downloading');
        
        // Show success notification
        showNotification(`PDF "${fileName}" downloaded successfully!`, 'info');
    }, 500);
}

// Share chat functionality
function shareChat() {
    if (chatHistory.length === 0) {
        showNotification('No chat messages to share.', 'warning');
        return;
    }
    
    // Add button press effect
    addButtonPressEffect(shareChatButton);
    
    // In a real app, you'd implement sharing functionality
    // For this demo, we'll just show a notification
    showNotification('Chat sharing functionality would be implemented here.', 'info');
    
    // You could implement:
    // 1. Copy to clipboard
    // 2. Generate a shareable link
    // 3. Email the chat
    // 4. Export to social media
}

// Export chat functionality
function exportChat() {
    if (chatHistory.length === 0) {
        showNotification('No chat messages to export.', 'warning');
        return;
    }
    
    // Add button press effect
    addButtonPressEffect(exportChatButton);
    
    // Create a text representation of the chat
    let chatText = `Chat with PDF: ${pdfTitle.textContent}\n`;
    chatText += `Date: ${new Date().toLocaleString()}\n\n`;
    
    chatHistory.forEach(msg => {
        const sender = msg.sender === 'user' ? 'You' : 'AI';
        chatText += `${sender}: ${msg.message}\n\n`;
    });
    
    // Create a blob and download
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat-export.txt';
    a.click();
    
    URL.revokeObjectURL(url);
    
    showNotification('Chat exported successfully!', 'info');
}

// Clear chat functionality
function clearChat() {
    // Add button press effect
    addButtonPressEffect(deleteChatButton);
    
    // Clear chat messages
    chatMessages.innerHTML = '';
    
    // Add system message
    const systemMessage = document.createElement('div');
    systemMessage.className = 'message system-message';
    systemMessage.innerHTML = `
        <div class="message-content">
            <p>Chat has been cleared. Ask me anything about your PDF document.</p>
        </div>
    `;
    chatMessages.appendChild(systemMessage);
    
    // Clear chat history
    chatHistory = [];
    
    showNotification('Chat cleared successfully!', 'info');
}

// Send a chat message
function sendMessage() {
    if (!chatInput) {
        console.error("Chat input element not found");
        return;
    }
    
    const message = chatInput.value.trim();
    if (!message) {
        // Visual feedback for empty message
        chatInput.classList.add('error-shake');
        setTimeout(() => {
            chatInput.classList.remove('error-shake');
        }, 500);
        return;
    }
    
    // Add user message to chat
    addMessageToChat(message, 'user');
    
    // Add to chat history
    chatHistory.push({
        sender: 'user',
        message: message,
        timestamp: new Date().toISOString()
    });
    
    // Clear input and reset height
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    // Simulate AI response (in a real app, you'd call an API)
    simulateAiResponse(message);
}

// Add a message to the chat
function addMessageToChat(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Handle multi-line messages
    const paragraphs = message.split('\n');
    paragraphs.forEach(paragraph => {
        if (paragraph.trim()) {
            const p = document.createElement('p');
            p.textContent = paragraph;
            contentDiv.appendChild(p);
        }
    });
    
    messageDiv.appendChild(contentDiv);
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Simulate AI response
function simulateAiResponse(userMessage) {
    // Show typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai-message typing';
    typingDiv.innerHTML = `
        <div class="message-content">
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Simulate delay
    setTimeout(() => {
        // Remove typing indicator
        chatMessages.removeChild(typingDiv);
        
        // Generate response based on user message
        let response;
        
        if (userMessage.toLowerCase().includes('summary') || userMessage.toLowerCase().includes('summarize')) {
            response = "Here's a summary of the document:\n\nThis document discusses key concepts related to the topic. It covers several important points including background information, methodology, results, and conclusions. The main findings suggest that there is a significant relationship between the variables studied.";
        } else if (userMessage.toLowerCase().includes('page')) {
            response = `I can see you're currently on page ${pageNum} of ${pdfDoc.numPages}. This page contains information about the topic discussed in the document.`;
        } else if (userMessage.toLowerCase().includes('author') || userMessage.toLowerCase().includes('who wrote')) {
            response = "The author information is not explicitly mentioned in the document. However, based on the content, it appears to be written by an expert in the field.";
        } else if (userMessage.toLowerCase().includes('date') || userMessage.toLowerCase().includes('when')) {
            response = "The document doesn't explicitly mention a publication date, but based on the references cited, it appears to be relatively recent.";
        } else if (userMessage.toLowerCase().includes('highlight') || userMessage.toLowerCase().includes('select')) {
            response = "To highlight text in the document, click the highlight button in the toolbar (or press Ctrl+H), then select the text you want to highlight. Click the highlight button again to exit highlight mode.";
        } else if (userMessage.toLowerCase().includes('download') || userMessage.toLowerCase().includes('save')) {
            response = "You can download the PDF by clicking the download button in the toolbar (or press Ctrl+D). The file will be saved with its original name.";
        } else if (userMessage.toLowerCase().includes('zoom')) {
            response = "You can zoom in and out using the zoom controls in the toolbar. You can also use keyboard shortcuts: Ctrl+ to zoom in, Ctrl- to zoom out, and Ctrl+0 to reset zoom.";
        } else if (userMessage.toLowerCase().includes('search')) {
            response = "To search for text in the document, use the search box in the toolbar. Type your search term and press Enter or click the search button.";
        } else if (userMessage.toLowerCase().includes('share') || userMessage.toLowerCase().includes('export')) {
            response = "You can share or export this chat using the buttons at the top of the chat panel. The share button allows you to share the conversation, while the export button lets you download the chat as a text file.";
        } else if (userMessage.toLowerCase().includes('clear') || userMessage.toLowerCase().includes('delete')) {
            response = "You can clear the chat history by clicking the trash icon at the top of the chat panel. This will remove all messages and start a new conversation.";
        } else {
            response = "I've analyzed the document and found relevant information related to your question. The document discusses this topic in detail, particularly on pages 2-3 where key concepts are explained. Would you like me to elaborate on any specific aspect?";
        }
        
        // Add AI response to chat
        addMessageToChat(response, 'ai');
        
        // Add to chat history
        chatHistory.push({
            sender: 'ai',
            message: response,
            timestamp: new Date().toISOString()
        });
    }, 1500);
}

// Show notification
function showNotification(message, type = 'info') {
    if (!notification || !notificationMessage) return;
    
    // Remove existing classes
    notification.classList.remove('error', 'warning', 'info');
    
    // Add appropriate class
    notification.classList.add(type);
    
    // Set message
    notificationMessage.textContent = message;
    
    // Show notification
    notification.classList.add('show');
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.classList.remove('show');
            notification.classList.remove('fade-out');
        }, 500);
    }, 4000);
} 