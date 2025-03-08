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
    let allFaqs = document.querySelectorAll('.faq');
    let icon = element.querySelector('.faq-icon');
    let answer = element.querySelector('.faq-answer');

    let isVisible = answer.style.display === 'block';

    allFaqs.forEach(faq => {
        faq.classList.remove('open');
        faq.querySelector('.faq-answer').style.display = 'none';
        faq.querySelector('.faq-icon').textContent = '+';
    });

    icon.textContent = isVisible ? '+' : '×';
    answer.style.display = isVisible ? 'none' : 'block';
    element.classList.toggle('open', !isVisible);
}


// ----- File Upload Working
document.addEventListener("DOMContentLoaded", function () {
    const fileDropZone = document.getElementById("fileDropZone");
    const uploadButton = document.querySelector(".upload-btn");
    const driveLink = document.querySelector(".drive-link");

    function validatePDF(file) {
        if (file.type !== "application/pdf") {
            alert("Only PDF files are allowed. Please upload a valid PDF file.");
            return false;
        }
        return true;
    }

    // Drag and Drop Functionality
    fileDropZone.addEventListener("dragover", function (e) {
        e.preventDefault();
        fileDropZone.style.borderColor = "green";
    });

    fileDropZone.addEventListener("dragleave", function () {
        fileDropZone.style.borderColor = "#ccc";
    });

    fileDropZone.addEventListener("drop", function (e) {
        e.preventDefault();
        fileDropZone.style.borderColor = "#ccc";
        const file = e.dataTransfer.files[0];
        if (validatePDF(file)) {
            console.log("PDF file accepted:", file.name);
        }
    });

    // Upload Button Functionality
    uploadButton.addEventListener("click", function () {
        let fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = ".pdf";
        fileInput.onchange = function (event) {
            const file = event.target.files[0];
            if (validatePDF(file)) {
                console.log("PDF file uploaded:", file.name);
            }
        };
        fileInput.click();
    });

    // Google Drive Integration
    driveLink.addEventListener("click", function () {
        window.open("https://drive.google.com/drive/u/0/my-drive", "_blank");
    });
});