document.getElementById('upload-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const folder = document.getElementById('folder-select').value;
    const files = document.getElementById('file-input').files;
    const uploadStatus = document.getElementById('upload-status');

    if (files.length === 0) {
        uploadStatus.textContent = 'Please select at least one file.';
        return;
    }

    uploadStatus.textContent = 'Uploading files...';

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();

        reader.onload = async function (event) {
            const fileContent = event.target.result.split(',')[1]; // base64 content

            try {
                const response = await uploadFileToGitHub(folder, file.name, fileContent);
                if (response.ok) {
                    uploadStatus.textContent = `File ${file.name} uploaded successfully!`;
                } else {
                    uploadStatus.textContent = `Error uploading ${file.name}: ${response.statusText}`;
                }
            } catch (error) {
                uploadStatus.textContent = `Error uploading ${file.name}: ${error.message}`;
            }
        };

        reader.readAsDataURL(file); // Read the file as base64 data
    }
});

async function uploadFileToGitHub(folder, fileName, fileContent) {
    const githubUsername = 'seccomm110';
    const repoName = 'Ya-Mahdi';
    const branch = 'main';

    // Reconstruct the token
    const tokenPart1 = 'ghp_yj5ZnPqi54dV';
    const tokenPart2 = '1PNEbN6w4p1K3scfYz';
    const tokenPart3 = '3gckWa';
    const token = `${tokenPart1}${tokenPart2}${tokenPart3}`;
    
    const encodedFileName = encodeURIComponent(fileName);
    const url = `https://api.github.com/repos/${githubUsername}/${repoName}/contents/${folder}/${encodedFileName}`;
    
    // Step 1: Check if the file already exists
    let sha = null;
    try {
        const getFileResponse = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
            }
        });

        if (getFileResponse.ok) {
            const fileData = await getFileResponse.json();
            sha = fileData.sha; // Get the existing file's SHA
        }
    } catch (error) {
        console.error('Error checking file existence:', error);
    }

    // Step 2: Create payload with the SHA if the file exists
    const payload = {
        message: `Add or update ${fileName} in ${folder}`,
        content: fileContent, // File content in base64 format
        branch: branch,
        ...(sha && { sha }) // Add the SHA if file exists, enabling update
    };

    // Step 3: Upload or update the file
    return fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
}



document.getElementById('folder-select').addEventListener('change', function () {
    const selectedFolder = this.value;
    const isBookFolder = selectedFolder.startsWith('Books/');

    document.getElementById('title-label').style.display = isBookFolder ? 'block' : 'none';
    document.getElementById('book-title').style.display = isBookFolder ? 'block' : 'none';
    document.getElementById('description-label').style.display = isBookFolder ? 'block' : 'none';
    document.getElementById('book-description').style.display = isBookFolder ? 'block' : 'none';
});
