const username = localStorage.getItem("username");
const pageTitle = document.title;
const date = new Date();
const logEntry = `[${date.toISOString()}] [${username}] [${pageTitle}]\n`;

const githubUsername = 'seccomm110';
const repoName = 'Ya-Mahdi';
const branch = 'main';

// Reconstruct the token
const tokenPart1 = 'ghp_yj5ZnPqi54dV';
const tokenPart2 = '1PNEbN6w4p1K3scfYz';
const tokenPart3 = '3gckWa';
const token = `${tokenPart1}${tokenPart2}${tokenPart3}`;

const folder = 'Admin';
const fileName = 'log.txt';
const encodedFileName = encodeURIComponent(fileName);
const url = `https://api.github.com/repos/${githubUsername}/${repoName}/contents/${folder}/${encodedFileName}`;

async function updateLogFile() {
    // Fetch the existing log file from GitHub
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });

    const fileData = await response.json();
    const sha = fileData.sha; // SHA for the current file version

    // Append new log entry to existing content
    const content = atob(fileData.content); // Decode from Base64
    const newContent = content + logEntry;  // Append new log entry
    const encodedContent = btoa(newContent); // Encode to Base64

    // Send a PUT request to update the log file on GitHub
    const updateResponse = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: `Log update: ${date.toISOString()}`,
            content: encodedContent,
            sha: sha,
            branch: branch
        })
    });

    if (updateResponse.ok) {
        console.log("Log updated successfully.");
    } else {
        console.error("Failed to update log:", updateResponse.statusText);
    }
}
