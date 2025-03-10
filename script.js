// Navbar
function toggleMenu() {
    let navLinks = document.querySelector(".nav-links");

    // Toggle visibility of the menu
    if (navLinks.style.display === "flex") {
        navLinks.style.display = "none";
    } else {
        navLinks.style.display = "flex";
        navLinks.style.flexDirection = "column";
        navLinks.style.alignItems = "center";
        navLinks.style.width = "100%";
    }
}


// Notification System
function showError(message, type = 'error') {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    const notificationIcon = document.querySelector('.notification-icon');
    
    // Remove all existing type classes
    notification.classList.remove('error', 'warning', 'info');
    
    // Add the appropriate type class
    notification.classList.add(type);
    
    // Set the message
    notificationMessage.textContent = message;
    
    // Update the icon based on type
    if (notificationIcon) {
        // Clear existing paths
        while (notificationIcon.firstChild) {
            notificationIcon.removeChild(notificationIcon.firstChild);
        }
        
        // Create new path elements based on type
        const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path1.setAttribute("fill", "none");
        path1.setAttribute("d", "M0 0h24v24H0z");
        
        const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path2.setAttribute("fill", "currentColor");
        
        if (type === 'error') {
            path2.setAttribute("d", "M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z");
        } else if (type === 'warning') {
            path2.setAttribute("d", "M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z");
        } else if (type === 'info') {
            path2.setAttribute("d", "M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6h2v-6h-2zm0-4v2h2V7h-2z");
        }
        
        notificationIcon.appendChild(path1);
        notificationIcon.appendChild(path2);
    }
    
    // Show the notification at the top with animation
    notification.classList.add('show');
    
    // Auto-hide after 4 seconds with fade-out animation
    setTimeout(() => {
        notification.classList.add('fade-out');
        
        // Remove classes after animation completes
        setTimeout(() => {
            notification.classList.remove('show');
            notification.classList.remove('fade-out');
        }, 500);
    }, 4000);
}

// Map error messages to their types
function getErrorTypeAndMessage(errorCode) {
    const errorMap = {
        'invalid_format': {
            type: 'error',
            message: 'Invalid file format! Please upload a PDF file only.'
        },
        'file_too_large': {
            type: 'warning',
            message: 'File size exceeds the limit! Please upload a smaller PDF.'
        },
        'upload_failed': {
            type: 'error',
            message: 'Upload failed! Please try again or check your internet connection.'
        },
        'empty_file': {
            type: 'warning',
            message: 'Uploaded file is empty! Please select a valid PDF.'
        },
        'corrupt_file': {
            type: 'error',
            message: 'The PDF appears to be corrupted! Please upload a different file.'
        },
        'multiple_files': {
            type: 'warning',
            message: 'Only one file can be uploaded at a time! Please select a single PDF.'
        },
        'unsupported_version': {
            type: 'warning',
            message: 'Unsupported PDF format! Please upload a standard PDF file.'
        },
        'password_protected': {
            type: 'warning',
            message: 'This PDF is password-protected! Please unlock it before uploading.'
        },
        'invalid_drive_link': {
            type: 'warning',
            message: 'Invalid Google Drive link! Please provide a valid link to a PDF file.'
        },
        'processing_error': {
            type: 'error',
            message: 'Something went wrong while processing the PDF! Please try again later.'
        }
    };
    
    if (errorCode && errorMap[errorCode]) {
        return errorMap[errorCode];
    }
    
    // If it's a direct message or unknown code, default to error type
    return {
        type: 'error',
        message: errorCode || 'An unknown error occurred!'
    };
}

// Close notification when X is clicked
document.addEventListener('DOMContentLoaded', function() {
    const closeButton = document.getElementById('notification-close');
    const notification = document.getElementById('notification');
    
    if (closeButton && notification) {
        closeButton.addEventListener('click', function() {
            notification.classList.add('fade-out');
            
            // Remove classes after animation completes
            setTimeout(() => {
                notification.classList.remove('show');
                notification.classList.remove('fade-out');
            }, 500);
        });
    }
});

// From URL 
document.addEventListener("DOMContentLoaded", function () {
    let fromUrl = document.querySelector(".from-url");
    let urlInputContainer = document.getElementById("urlInputContainer");

    fromUrl.addEventListener("click", function (event) {
        urlInputContainer.style.display = "flex";
        event.stopPropagation();
    });

    document.addEventListener("click", function (event) {
        if (!urlInputContainer.contains(event.target) && event.target !== fromUrl) {
            urlInputContainer.style.display = "none";
        }
    });
});


// Start for free button
document.getElementById("startBtn").addEventListener("click", function () {
    document.getElementById("home-section").scrollIntoView({ behavior: "smooth" });
});


// Try for free
document.getElementById("startForFreeBtn").addEventListener("click", function () {
    document.getElementById("home-section").scrollIntoView({ behavior: "smooth" });
});


// FAQs About QuPDF
function toggleFAQ(element) {
    // Check if this FAQ is already open
    let isOpen = element.classList.contains('open');
    
    // Close all FAQs first
    let allFaqs = document.querySelectorAll('.faq');
    allFaqs.forEach(faq => {
        faq.classList.remove('open');
        const faqIcon = faq.querySelector('.faq-icon');
        if (faqIcon) {
            faqIcon.textContent = '+';
        }
    });
    
    // If the clicked FAQ wasn't open, open it
    if (!isOpen) {
        element.classList.add('open');
        const icon = element.querySelector('.faq-icon');
        if (icon) {
            icon.textContent = '×';
        }
    }
}


// ----- File Upload Working
document.addEventListener("DOMContentLoaded", function () {
    const fileDropZone = document.getElementById("fileDropZone");
    const uploadBox = document.querySelector(".upload-box");
    const uploadButton = document.querySelector(".upload-btn");
    const urlInput = document.getElementById("pdfUrl");
    const sendUrlButton = document.getElementById("sendUrl");
    const loader = document.getElementById("loader");
    const fileNameDisplay = document.getElementById("uploadedFileName");
    const notificationClose = document.getElementById('notification-close');
    const notification = document.getElementById('notification');
    
    // Maximum file size in bytes (10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    // Close notification when X is clicked
    if (notificationClose && notification) {
        notificationClose.addEventListener('click', function() {
            notification.classList.add('fade-out');
            
            // Remove classes after animation completes
            setTimeout(() => {
                notification.classList.remove('show');
                notification.classList.remove('fade-out');
            }, 500);
        });
    }

    function showLoader(show) {
        if (uploadBox && loader) {
            uploadBox.style.opacity = show ? "0.3" : "1";
            loader.style.display = show ? "inline-block" : "none";
        }
    }

    function displayFileName(name) {
        if (!fileNameDisplay) return;
        fileNameDisplay.textContent = "Uploaded File: " + name;
        fileNameDisplay.style.display = "block";
    }

    // Validate PDF file
    async function validatePDF(file) {
        // Check if file exists
        if (!file) {
            const error = getErrorTypeAndMessage('empty_file');
            showError(error.message, error.type);
            return false;
        }

        // Check file type but don't return false immediately
        if (file.type !== "application/pdf") {
            const error = getErrorTypeAndMessage('invalid_format');
            showError(error.message, error.type);
            return false;
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            const error = getErrorTypeAndMessage('file_too_large');
            showError(error.message, error.type);
            return false;
        }

        // Check if file is empty
        if (file.size === 0) {
            const error = getErrorTypeAndMessage('empty_file');
            showError(error.message, error.type);
            return false;
        }

        // Check for corruption by reading the first few bytes
        try {
            const arrayBuffer = await file.arrayBuffer();
            const firstBytes = new Uint8Array(arrayBuffer.slice(0, 5));
            const pdfSignature = [37, 80, 68, 70, 45]; // %PDF-
            
            // Check PDF signature
            for (let i = 0; i < 5; i++) {
                if (firstBytes[i] !== pdfSignature[i]) {
                    const error = getErrorTypeAndMessage('corrupt_file');
                    showError(error.message, error.type);
                    return false;
                }
            }

            // Check for encryption (basic check)
            const fileContent = new Uint8Array(arrayBuffer);
            const contentStr = new TextDecoder().decode(fileContent.slice(0, Math.min(2000, fileContent.length)));
            
            if (contentStr.includes('/Encrypt') && contentStr.includes('/P ')) {
                const error = getErrorTypeAndMessage('password_protected');
                showError(error.message, error.type);
                return false;
            }

        } catch (error) {
            console.error("Error validating PDF:", error);
            const errorInfo = getErrorTypeAndMessage('processing_error');
            showError(errorInfo.message, errorInfo.type);
            return false;
        }

        return true;
    }

    // Validate URL
    function validateURL(url) {
        if (!url) {
            const error = getErrorTypeAndMessage('upload_failed');
            showError(error.message, error.type);
            return false;
        }

        // Check if URL ends with .pdf
        if (!url.toLowerCase().endsWith('.pdf')) {
            // Check if it's a Google Drive link
            if (url.includes('drive.google.com')) {
                if (!url.includes('drive.google.com/file/d/') && !url.includes('drive.google.com/open')) {
                    const error = getErrorTypeAndMessage('invalid_drive_link');
                    showError(error.message, error.type);
                    return false;
                }
            } else {
                const error = getErrorTypeAndMessage('invalid_format');
                showError(error.message, error.type);
                return false;
            }
        }

        return true;
    }

    // Process the PDF file and redirect to viewer
    async function processPdfFile(file) {
        try {
            // Read the file as base64
            const reader = new FileReader();
            
            reader.onload = function(e) {
                // Get base64 data (remove the data URL prefix)
                const base64Data = e.target.result.split(',')[1];
                
                // Store in sessionStorage
                sessionStorage.setItem('pdfData', base64Data);
                sessionStorage.setItem('pdfName', file.name);
                
                // Redirect to PDF viewer page
                window.location.href = 'pdf-viewer.html';
            };
            
            reader.onerror = function() {
                const error = getErrorTypeAndMessage('processing_error');
                showError(error.message, error.type);
            };
            
            // Read as data URL
            reader.readAsDataURL(file);
        } catch (error) {
            console.error("Error processing PDF:", error);
            const errorInfo = getErrorTypeAndMessage('processing_error');
            showError(errorInfo.message, errorInfo.type);
        }
    }

    async function handleFile(file) {
        if (!file) return;

        try {
            // Validate the file
            const isValid = await validatePDF(file);
            
            if (isValid) {
                showLoader(true);
                
                // Process the PDF file after a short delay (for UI feedback)
                setTimeout(() => {
                    processPdfFile(file);
                }, 1000);
            }
        } catch (error) {
            console.error("Error handling file:", error);
            const errorInfo = getErrorTypeAndMessage('upload_failed');
            showError(errorInfo.message, errorInfo.type);
        }
    }

    // Enhanced drag and drop functionality
    if (fileDropZone) {
        // Handle drag enter event
        fileDropZone.addEventListener("dragenter", function (e) {
            e.preventDefault();
            e.stopPropagation();
            fileDropZone.classList.add("drag-over");
        });

        // Handle drag over event
        fileDropZone.addEventListener("dragover", function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (!fileDropZone.classList.contains("drag-over")) {
                fileDropZone.classList.add("drag-over");
            }
        });

        // Handle drag leave event
        fileDropZone.addEventListener("dragleave", function (e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Check if the leave event is from the drop zone itself, not its children
            if (e.target === fileDropZone || !fileDropZone.contains(e.relatedTarget)) {
                fileDropZone.classList.remove("drag-over");
            }
        });

        // Handle drop event
        fileDropZone.addEventListener("drop", function (e) {
            e.preventDefault();
            e.stopPropagation();
            fileDropZone.classList.remove("drag-over");
            
            // Check for multiple files
            if (e.dataTransfer.files.length > 1) {
                const error = getErrorTypeAndMessage('multiple_files');
                showError(error.message, error.type);
                return;
            }
            
            const file = e.dataTransfer.files[0];
            handleFile(file);
        });
    }

    uploadButton?.addEventListener("click", function () {
        let fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "*"; // Accept all file formats
        fileInput.onchange = function (event) {
            // Check for multiple files (shouldn't happen with input[type=file] without multiple attribute)
            if (event.target.files.length > 1) {
                const error = getErrorTypeAndMessage('multiple_files');
                showError(error.message, error.type);
                return;
            }
            
            const file = event.target.files[0];
            handleFile(file);
        };
        fileInput.click();
    });

    sendUrlButton?.addEventListener("click", function () {
        const url = urlInput?.value.trim();
        
        if (validateURL(url)) {
            showLoader(true);
            
            // Simulate URL processing (in a real app, you'd fetch the PDF)
            setTimeout(() => {
                // For demo purposes, we'll just redirect to a sample PDF
                // In a real app, you'd fetch the PDF from the URL
                sessionStorage.setItem('pdfName', 'Document from URL');
                
                // Use a placeholder PDF data or fetch from URL
                fetch('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')
                    .then(response => response.arrayBuffer())
                    .then(arrayBuffer => {
                        // Convert to base64
                        const base64 = btoa(
                            new Uint8Array(arrayBuffer)
                                .reduce((data, byte) => data + String.fromCharCode(byte), '')
                        );
                        
                        // Store in sessionStorage
                        sessionStorage.setItem('pdfData', base64);
                        
                        // Redirect to PDF viewer
                        window.location.href = 'pdf-viewer.html';
                    })
                    .catch(error => {
                        console.error('Error fetching PDF:', error);
                        const errorInfo = getErrorTypeAndMessage('processing_error');
                        showError(errorInfo.message, errorInfo.type);
                        showLoader(false);
                    });
            }, 1000);
        }
    });
    
    // Initialize "Start for free" buttons
    const startBtn = document.getElementById("startBtn");
    if (startBtn) {
        startBtn.addEventListener("click", function () {
            document.getElementById("heroSection")?.scrollIntoView({ behavior: "smooth" });
        });
    }
    
    const startForFreeBtn = document.getElementById("startForFreeBtn");
    if (startForFreeBtn) {
        startForFreeBtn.addEventListener("click", function () {
            document.getElementById("heroSection")?.scrollIntoView({ behavior: "smooth" });
        });
    }
    
    // Initialize "Get Started" button
    const getStartedBtn = document.getElementById("btn-get-started");
    if (getStartedBtn) {
        getStartedBtn.addEventListener("click", function () {
            // Create and trigger file input immediately
            let fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "*"; // Accept all file formats
            fileInput.onchange = function (event) {
                // Check for multiple files
                if (event.target.files.length > 1) {
                    const error = getErrorTypeAndMessage('multiple_files');
                    showError(error.message, error.type);
                    return;
                }
                
                const file = event.target.files[0];
                handleFile(file);
                
                // Scroll to the upload section after file selection
                document.getElementById("heroSection")?.scrollIntoView({ behavior: "smooth" });
            };
            
            // Trigger file picker immediately
            fileInput.click();
        });
    }
    
    // From URL functionality
    const fromUrl = document.querySelector(".from-url");
    const urlInputContainer = document.getElementById("urlInputContainer");

    if (fromUrl && urlInputContainer) {
        fromUrl.addEventListener("click", function (event) {
            urlInputContainer.style.display = "flex";
            event.stopPropagation();
        });

        document.addEventListener("click", function (event) {
            if (!urlInputContainer.contains(event.target) && event.target !== fromUrl) {
                urlInputContainer.style.display = "none";
            }
        });
    }
});