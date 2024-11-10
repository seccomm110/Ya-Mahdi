           // Your GitHub info
           const githubUsername = 'seccomm110';  // Replace with your GitHub username
           const repoName = 'Ya-Mahdi';          // Replace with your repository name
           const branch = 'main';                // Replace with the branch (e.g., 'main')
   
           const tokenPart1 = 'ghp_yj5ZnPqi54dV'; // Replace with your actual token parts
           const tokenPart2 = '1PNEbN6w4p1K3scfYz'; 
           const tokenPart3 = '3gckWa';  
           const token = `${tokenPart1}${tokenPart2}${tokenPart3}`;  // Complete token
   
           const apiUrl = `https://api.github.com/repos/${githubUsername}/${repoName}/contents`;
   
           // Handle form submission
           document.getElementById('createUserForm').addEventListener('submit', async function(event) {
               event.preventDefault();
               
               const username = document.getElementById('username').value;
               const password = document.getElementById('password').value;
               
               // Send data to GitHub API to store it in a JSON file
               const response = await createUserInGitHub(username, password);
               
               if (response.ok) {
                   document.getElementById('statusMessage').textContent = 'User created successfully!';
               } else {
                   const data = await response.json();
                   document.getElementById('statusMessage').textContent = `Error: ${data.message}`;
               }
           });
   
   
   
           async function createUserInGitHub(username, password) {
       const filePath = 'users.json'; // Path where the file will be created
   
       // First, check if the file exists by fetching its content (to get the SHA if updating)
       let currentData = [];
   
       try {
           const fileResponse = await fetch(`${apiUrl}/${filePath}`, {
               method: 'GET',
               headers: {
                   'Authorization': `token ${token}`,
                   'Accept': 'application/vnd.github.v3+json'
               }
           });
   
           if (fileResponse.ok) {
               const fileData = await fileResponse.json();
               try {
                   // Decode the base64 content and parse it
                   const decodedContent = atob(fileData.content);
                   const parsedData = JSON.parse(decodedContent);
                   
                   // Ensure the data is an array of users
                   if (Array.isArray(parsedData.users)) {
                       currentData = parsedData.users;
                   } else {
                       currentData = [];  // Initialize as empty array if structure is wrong
                   }
               } catch (err) {
                   console.error('Error decoding or parsing file content:', err);
                   currentData = [];  // Initialize as empty array if error occurs
               }
           }
       } catch (error) {
           console.log('File not found or error fetching file:', error);
           // If file not found, we'll initialize it with an empty array
       }
   
       // Add the new user to the list
       currentData.push({ username, password });
   
       // Convert the updated data to base64
       const encodedContent = btoa(JSON.stringify({ users: currentData }));
   
       // Prepare the data for the PUT request
       const createFileData = {
           message: 'Add new user',
           content: encodedContent,
           branch: branch
       };
   
       // If the file exists, we need to include the SHA to update it
       let sha = '';
       if (currentData.length > 0) {
           const fileResponse = await fetch(`${apiUrl}/${filePath}`, {
               method: 'GET',
               headers: {
                   'Authorization': `token ${token}`,
                   'Accept': 'application/vnd.github.v3+json'
               }
           });
           if (fileResponse.ok) {
               const fileData = await fileResponse.json();
               sha = fileData.sha;
           }
       }
   
       if (sha) {
           createFileData.sha = sha; // Attach the file SHA if updating
       }
   
       // Send the PUT request to GitHub to create or update the file
       return fetch(`${apiUrl}/${filePath}`, {
           method: 'PUT',
           headers: {
               'Authorization': `token ${token}`,
               'Accept': 'application/vnd.github.v3+json'
           },
           body: JSON.stringify(createFileData)
       });
   }
   