document.addEventListener("DOMContentLoaded", function () { 
    const githubUsername = 'seccomm110';  // Replace with your GitHub username
    const repoName = 'Ya-Mahdi';          // Replace with your repository name
    const branch = 'main';                // Replace with the branch (e.g., 'main')

    // Reconstruct the token (ensure your token is stored securely)
    const tokenPart1 = 'ghp_yj5ZnPqi54dV';
    const tokenPart2 = '1PNEbN6w4p1K3scfYz';
    const tokenPart3 = '3gckWa';
    const token = `${tokenPart1}${tokenPart2}${tokenPart3}`;

    // API URL to fetch the users data from the repository
    const apiUrl = `https://api.github.com/repos/${githubUsername}/${repoName}/contents/users.json`;

    // Fetch and display user data when the page is loaded
    fetchUserData();

    // Handle Edit and Delete actions
    document.getElementById("userTableBody").addEventListener("click", function (event) {
        if (event.target.classList.contains("delete-btn")) {
            deleteUser(event.target.dataset.username);
        } else if (event.target.classList.contains("edit-btn")) {
            editUserPassword(event.target.dataset.username);
        }
    });

    // Function to fetch and display user data
    async function fetchUserData() {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (response.ok) {
            const fileData = await response.json();
            const decodedContent = atob(fileData.content);  // Decode the content from base64
            const usersData = JSON.parse(decodedContent);  // Parse the JSON content
            renderUserTable(usersData.users);  // Render users in the table
        } else {
            console.error('Error fetching users data');
        }
    }

    // Function to render the user table
    function renderUserTable(users) {
        const userTableBody = document.getElementById("userTableBody");
        userTableBody.innerHTML = "";  // Clear current table rows

        users.forEach((user, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>  <!-- Serial number starts from 1 -->
                <td>${user.username}</td>
                <td>${user.password}</td>
                <td>
                    <button class="edit-btn" data-username="${user.username}">Edit....</button>
                    <button class="delete-btn" data-username="${user.username}">Delete</button>
                </td>
            `;
            userTableBody.appendChild(row);
        });
    }

    // Function to edit user password
    function editUserPassword(username) {
        const newPassword = prompt(`Enter new password for ${username}:`);
        if (newPassword) {
            updateUserPassword(username, newPassword);
        }
    }

    // Function to update the password of a user
    async function updateUserPassword(username, newPassword) {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (response.ok) {
            const fileData = await response.json();
            const decodedContent = atob(fileData.content);
            const usersData = JSON.parse(decodedContent);

            // Find and update the user
            const userIndex = usersData.users.findIndex(user => user.username === username);
            if (userIndex !== -1) {
                usersData.users[userIndex].password = newPassword;

                const updatedContent = btoa(JSON.stringify({ users: usersData.users }));

                await fetch(apiUrl, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    },
                    body: JSON.stringify({
                        message: 'Update user password',
                        content: updatedContent,
                        branch: branch,
                        sha: fileData.sha
                    })
                });
                fetchUserData();  // Refresh the user table
            }
        } else {
            console.error('Error fetching user data for update');
        }
    }

    // Function to delete a user
    async function deleteUser(username) {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (response.ok) {
            const fileData = await response.json();
            const decodedContent = atob(fileData.content);
            const usersData = JSON.parse(decodedContent);

            // Remove the user from the array
            const updatedUsers = usersData.users.filter(user => user.username !== username);

            const updatedContent = btoa(JSON.stringify({ users: updatedUsers }));

            await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                    message: 'Delete user',
                    content: updatedContent,
                    branch: branch,
                    sha: fileData.sha
                })
            });
            fetchUserData();  // Refresh the user table
        } else {
            console.error('Error fetching user data for deletion');
        }
    }
});
