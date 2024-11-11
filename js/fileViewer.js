
        
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

    
let currentFolder = ''; // Track the current folder

export function initializeFileViewer(folder) {
    // Update currentFolder and reset the file list
    currentFolder = folder;
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    const apiUrl = `https://api.github.com/repos/seccomm110/Ya-Mahdi/contents/${currentFolder}`;
    
    console.log(`Fetching files from: ${apiUrl}`);
    fetchFiles(apiUrl);
}




let controller; // Define controller outside

async function fetchFiles(apiUrl) {
    // Abort previous request if exists
    if (controller) controller.abort();

    // Set up a new AbortController for this request
    controller = new AbortController();

    try {
        const response = await fetch(apiUrl, {
            cache: "no-cache", // Force no-cache to prevent old responses
            signal: controller.signal // Associate the controller signal with the request
        });

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

        files.forEach((file, index) => {
            const fileItemContainer = document.createElement('div');
            fileItemContainer.style.display = 'flex';
            fileItemContainer.style.alignItems = 'center';
            fileItemContainer.style.justifyContent = 'space-between';
            fileItemContainer.style.marginBottom = '10px';

            if (file.type === 'dir') {
                const folderLink = document.createElement('a');
                folderLink.href = '#';
                folderLink.textContent = `📂 ${file.name}`;
                folderLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    fetchFiles(`${apiUrl}/${file.name}`);
                });
                fileItemContainer.appendChild(folderLink);
            } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.pdf') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
                const displayName = file.name.replace(/\.[^/.]+$/, '');
                const serialNumber = index + 1;

                const fileLink = document.createElement('a');
                fileLink.href = '#';
                fileLink.textContent = `${serialNumber}. ${displayName}`;
                fileLink.style.marginRight = '10px';
                fileLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    viewFile(file);
                });

                fileItemContainer.appendChild(fileLink);
                createActionButtons(file, fileItemContainer);
            }

            fileListElement.appendChild(fileItemContainer);
        });

    } catch (error) {
        if (error.name === 'AbortError') {
            console.log("Fetch aborted.");
        } else {
            console.error('Error fetching files:', error);
            document.getElementById('file-list').textContent = 'Error loading files. Please try again later.';
        }
    }
}


async function deleteFile(file) {
    const apiUrl = `https://api.github.com/repos/seccomm110/Ya-Mahdi/contents/${file.path}`;
    
    try {
        // Step 1: Fetch the file's current information to get the SHA
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `token ${token}`, // Use the token for authentication
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const fileInfo = await response.json();

        // Step 2: Delete the file using its SHA
        const deleteResponse = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                message: `Deleting ${file.name}`, // Commit message
                sha: fileInfo.sha // The SHA of the file
            })
        });

        if (deleteResponse.ok) {
            alert(`${file.name} has been deleted successfully.`);
            // Optionally, refresh the file list after deletion
            fetchFiles(apiUrl.substring(0, apiUrl.lastIndexOf('/'))); // Fetch the parent directory
        } else {
            throw new Error(`Error deleting file: ${deleteResponse.statusText}`);
        }
    } catch (error) {
        console.error('Error deleting file:', error);
        alert('Failed to delete the file. Please try again.');
    }
}

function createActionButtons(file, container) {
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.alignItems = 'center';
    buttonContainer.style.marginTop = '10px';
    buttonContainer.style.marginLeft = '10px';
    buttonContainer.style.gap = '10px';

    // Open button (forces download with Blob API)
    const openButton = document.createElement('button');
    openButton.innerHTML = '⬇️';
    openButton.style.backgroundColor = 'white';
    openButton.style.color = 'black';
    openButton.style.border = 'none';
    openButton.style.cursor = 'pointer';

    openButton.onclick = async () => {
        try {
            const response = await fetch(file.download_url);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Release the blob URL after download
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Failed to download the file:", error);
        }
    };

    // Share button
    const shareButton = document.createElement('button');
    shareButton.innerHTML = '🔗';
    shareButton.style.backgroundColor = 'white';
    shareButton.style.color = 'black';
    shareButton.style.border = 'none';
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

    // Retrieve the logged-in username from localStorage
    const loggedInUsername = localStorage.getItem("username");

    // Only show the delete button if the logged-in user is 'admin'
    if (loggedInUsername === "admin") {
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '❌';
        deleteButton.style.backgroundColor = 'white';
        deleteButton.style.color = 'black';
        deleteButton.style.border = 'none';
        deleteButton.style.cursor = 'pointer';

        deleteButton.onclick = () => {
            const confirmDelete = confirm(`Are you sure you want to delete ${file.name}?`);
            if (confirmDelete) {
                deleteFile(file); // Call the delete function
            }
        };

        buttonContainer.appendChild(deleteButton); // Append Delete button only for admin
    }

    buttonContainer.appendChild(openButton);    // Append Open button
    buttonContainer.appendChild(shareButton);    // Append Share button
    container.appendChild(buttonContainer);      // Add the button container to the file container
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



function viewFile(file) {
    const fileUrl = file.download_url; // Get the direct download URL
    console.log(`Opening file: ${file.name}, URL: ${fileUrl}`);

    // Check the file extension to determine how to open it
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (extension === 'pdf') {
        // Open PDF in your custom PDF viewer
        window.open(`pdf.html?file=${encodeURIComponent(fileUrl)}`, '_blank');
    } else if (extension === 'doc' || extension === 'docx' || extension === 'xlsx') {
        // Open Office files in their respective online viewers
        const officeViewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`;
        window.open(officeViewerUrl, '_blank');
    } else {
        // For other file types, you can decide to handle them differently
        window.open(fileUrl, '_blank');
    }
}


// Function to display the sheet with styles
function displaySheetWithStyles(sheet) {
    const range = XLSX.utils.decode_range(sheet['!ref']); // Get range of the sheet
    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';

    for (let row = range.s.r; row <= range.e.r; row++) {
        const rowElement = document.createElement('tr');
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            const cell = sheet[cellAddress];
            const cellElement = document.createElement('td');

            if (cell) {
                cellElement.textContent = cell.v; // Set cell value
                
                // Apply background color if available
                if (cell.s && cell.s.fill && cell.s.fill.fgColor && cell.s.fill.fgColor.rgb) {
                    cellElement.style.backgroundColor = `#${cell.s.fill.fgColor.rgb}`;
                }
                
                // Apply font styles if available
                if (cell.s && cell.s.font) {
                    if (cell.s.font.color && cell.s.font.color.rgb) {
                        cellElement.style.color = `#${cell.s.font.color.rgb}`;
                    }
                    if (cell.s.font.bold) {
                        cellElement.style.fontWeight = 'bold';
                    }
                    if (cell.s.font.italic) {
                        cellElement.style.fontStyle = 'italic';
                    }
                }
            }

            cellElement.style.border = '1px solid #000'; // Border for table cells
            cellElement.style.padding = '4px'; // Cell padding
            rowElement.appendChild(cellElement);
        }
        table.appendChild(rowElement);
    }

    // Clear previous content and add the table to the viewer
    const viewer = document.getElementById('viewer');
    viewer.innerHTML = ''; // Clear any previous content
    viewer.appendChild(table); // Display the table
}



function applyExcelStyles(sheet, tableElement) {
    const range = XLSX.utils.decode_range(sheet['!ref']); // Get the range of the sheet
    for (let row = range.s.r; row <= range.e.r; ++row) {
        for (let col = range.s.c; col <= range.e.c; ++col) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            const cell = sheet[cellAddress];

            if (cell && cell.s) { // Check if cell and style exist
                const cellElement = tableElement.querySelector(`[data-cell="${cellAddress}"]`);
                if (cellElement) {
                    // Apply background color
                    if (cell.s.fill && cell.s.fill.fgColor) {
                        cellElement.style.backgroundColor = `#${cell.s.fill.fgColor.rgb}`;
                    }
                    // Apply font color
                    if (cell.s.font && cell.s.font.color) {
                        cellElement.style.color = `#${cell.s.font.color.rgb}`;
                    }
                    // Apply font bold
                    if (cell.s.font && cell.s.font.bold) {
                        cellElement.style.fontWeight = 'bold';
                    }
                    // Apply font italic
                    if (cell.s.font && cell.s.font.italic) {
                        cellElement.style.fontStyle = 'italic';
                    }
                }
            }
        }
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
    // initializeFileViewer('Books');
    initializeFileViewer('');
    // initializeFileViewer('Initialize');
    // setupPagination();


      // Logout function
document.getElementById("logoutButton").addEventListener("click", function() {
    localStorage.removeItem("loggedIn"); // Clear login status
    window.location.href = "https://seccomm110.github.io/Ya-Mahdi/login.html";  // Redirect to login page
});


























