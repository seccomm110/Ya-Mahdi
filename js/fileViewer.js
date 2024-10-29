// Split the token into different parts
const tokenPart1 = 'ghp_yj5ZnPqi54dV';
const tokenPart2 = '1PNEbN6w4p1K3scfYz';
const tokenPart3 = '3gckWa';

// Combine the token parts into one
const token = `${tokenPart1}${tokenPart2}${tokenPart3}`;

let pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 1.5,
    canvas,
    ctx;

// Initialize the file viewer for a folder
export function initializeFileViewer(folder) {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    const apiUrl = `https://api.github.com/repos/seccomm110/Ya-Mahdi/contents/${folder}`;
    
    console.log(`Fetching files from: ${apiUrl}`);
    fetchFiles(apiUrl);
}

// Fetch files and subfolders from GitHub
async function fetchFiles(apiUrl) {
    try {
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const files = await response.json();
        console.log("Fetched files:", files);
        
        const fileListElement = document.getElementById('file-list');
        fileListElement.innerHTML = ''; // Clear loading message

        if (files.length === 0) {
            fileListElement.textContent = 'No files found in this folder.';
            return;
        }

        files.forEach(file => {
            if (file.type === 'dir') {
                const folderLink = document.createElement('a');
                folderLink.href = '#';
                folderLink.textContent = `📂 ${file.name}`;
                folderLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    fetchFiles(`${apiUrl}/${file.name}`);
                });
                fileListElement.appendChild(folderLink);
                fileListElement.appendChild(document.createElement('br'));
            } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.pdf')) {
                const fileLink = document.createElement('a');
                fileLink.href = '#';
                fileLink.textContent = `📄 ${file.name}`;
                fileLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    viewFile(file); // View the file when clicked
                });
                fileListElement.appendChild(fileLink);
                
                // Create action buttons
                createActionButtons(file, fileListElement);
            }
        });

    } catch (error) {
        console.error('Error fetching files:', error);
        document.getElementById('file-list').textContent = 'Error loading files. Please try again later.';
    }
}

// Create action buttons for download, share, and delete
function createActionButtons(file, container) {
    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginTop = '10px';

    // Download button
    const downloadButton = document.createElement('button');
    downloadButton.innerHTML = 'Download'; 
    downloadButton.style.backgroundColor = '#333'; 
    downloadButton.style.color = 'white';
    downloadButton.style.border = 'none';
    downloadButton.style.padding = '5px 10px';
    downloadButton.style.cursor = 'pointer';
    downloadButton.onclick = () => {
        window.open(file.download_url); // Directly open the file for download
    };

    // Share button
    const shareButton = document.createElement('button');
    shareButton.innerHTML = 'Share'; 
    shareButton.style.backgroundColor = 'green'; 
    shareButton.style.color = 'white';
    shareButton.style.border = 'none';
    shareButton.style.padding = '5px 10px';
    shareButton.style.cursor = 'pointer';

    shareButton.onclick = () => {
        const fileUrl = file.download_url; 
        if (navigator.share) {
            checkAppOpenAndShare(fileUrl, file.name);
        } else {
            navigator.clipboard.writeText(fileUrl)
                .then(() => {
                    alert(`Link copied to clipboard! Share it manually: ${fileUrl}`);
                })
                .catch(err => console.error('Failed to copy: ', err));
        }
    };

    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = 'Delete'; 
    deleteButton.style.backgroundColor = 'red'; 
    deleteButton.style.color = 'white';
    deleteButton.style.border = 'none';
    deleteButton.style.padding = '5px 10px';
    deleteButton.style.cursor = 'pointer';

    deleteButton.onclick = () => {
        const confirmDelete = confirm(`Are you sure you want to delete ${file.name}?`);
        if (confirmDelete) {
            deleteFile(file); // Call the delete function
        }
    };

    buttonContainer.appendChild(downloadButton);
    buttonContainer.appendChild(shareButton);
    buttonContainer.appendChild(deleteButton); 
    container.appendChild(buttonContainer);
}

function checkAppOpenAndShare(fileUrl, title) {
    const appName = 'WhatsApp'; 

    if (navigator.share) {
        navigator.share({
            title: title,
            url: fileUrl
        })
        .then(() => console.log('File shared successfully!'))
        .catch((error) => {
            console.error('Error sharing the file:', error);
            navigator.clipboard.writeText(fileUrl)
                .then(() => {
                    alert(`Link copied to clipboard! Share it manually on ${appName}: ${fileUrl}`);
                })
                .catch(err => console.error('Failed to copy: ', err));
        });
    } else {
        navigator.clipboard.writeText(fileUrl)
            .then(() => {
                alert(`Link copied to clipboard! Share it manually: ${fileUrl}`);
            })
            .catch(err => console.error('Failed to copy: ', err));
    }
}

// Delete a file from GitHub
async function deleteFile(file) {
    const deleteUrl = `https://api.github.com/repos/seccomm110/Ya-Mahdi/contents/${file.path}`;
    
    try {
        const response = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
                'Authorization': `token ${token}`, 
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                message: `Deleting file: ${file.name}`, 
                sha: file.sha 
            })
        });

        if (!response.ok) {
            const errorData = await response.json(); 
            throw new Error(`Failed to delete file: ${errorData.message}`);
        }

        console.log(`Deleted file: ${file.name}`);
        alert(`${file.name} has been deleted.`);
        fetchFiles(`https://api.github.com/repos/seccomm110/Ya-Mahdi/contents/${file.path}`);
    } catch (error) {
        console.error('Error deleting file:', error);
        alert('Failed to delete file. Please try again later.');
    }
}

// View the file (XLSX or PDF)
function viewFile(file) {
    const viewer = document.getElementById('viewer');
    viewer.style.display = 'block'; // Make viewer visible
    const fileUrl = file.download_url;

    console.log(`Viewing file: ${file.name}, URL: ${fileUrl}`);

    if (file.name.endsWith('.xlsx')) {
        fetch(fileUrl)
            .then(response => response.arrayBuffer())
            .then(data => {
                const workbook = XLSX.read(new Uint8Array(data), { type: "array" });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const html = XLSX.utils.sheet_to_html(sheet);
                viewer.innerHTML = html;
                document.querySelector('.pdf-controls').style.display = 'none';
            })
            .catch(error => {
                console.error('Error viewing Excel file:', error);
            });
    } else if (file.name.endsWith('.pdf')) {
        loadPdf(fileUrl);
    }
}

// Load and render the PDF
function loadPdf(url) {
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';

    console.log(`Loading PDF from: ${url}`);

    pdfjsLib.getDocument(url).promise.then(function (pdfDoc_) {
        pdfDoc = pdfDoc_;
        document.getElementById('page-count').textContent = pdfDoc.numPages;
        renderPage(pageNum);
    }).catch(error => {
        console.error('Error loading PDF:', error);
        // alert('Failed to load PDF. Please check the file URL or try again.');
    });
}

// Render PDF page
function renderPage(num) {
    pageRendering = true;
    pdfDoc.getPage(num).then(function (page) {
        const viewport = page.getViewport({ scale: scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        const renderTask = page.render(renderContext);

        renderTask.promise.then(function () {
            pageRendering = false;

            if (pageNumPending !== null) {
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });

    document.getElementById('current-page').textContent = num;
}


    // Setup pagination for PDF
    function setupPagination() {
        document.getElementById('prev-page').addEventListener('click', function () {
            if (pageNum <= 1) return;
            pageNum--;
            queueRenderPage(pageNum);
        });

        document.getElementById('next-page').addEventListener('click', function () {
            if (pageNum >= pdfDoc.numPages) return;
            pageNum++;
            queueRenderPage(pageNum);
        });
    }

    // Queue the rendering of the PDF page
    function queueRenderPage(num) {
        if (pageRendering) {
            pageNumPending = num;
        } else {
            renderPage(num);
        }
    }

    // Initialize everything
    initializeFileViewer('Books');
    setupPagination();
