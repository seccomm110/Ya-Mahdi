// loadNavbar.js

// Function to load the navbar content
function loadNavbar() {
  const xhr = new XMLHttpRequest();
  const pathPrefix = window.location.pathname.includes('/pages/') ? '../' : '';
  xhr.open('GET', `${pathPrefix}navbar.html`, true);

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      document.getElementById('navbar-placeholder').innerHTML = xhr.responseText;
    }
  };

  xhr.send();
}

// Define toggleSidebar function here
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.classList.toggle('open');
  }
}

document.addEventListener("DOMContentLoaded", loadNavbar);


document.addEventListener('DOMContentLoaded', function () {
  loadBooksDropdown();
});

async function loadBooksDropdown() {
  const dropdown = document.getElementById('books-dropdown');
  dropdown.innerHTML = '<li>Loading...</li>';

  const token = 'YOUR_GITHUB_TOKEN'; // Replace this with your actual token
  const apiUrl = 'https://api.github.com/repos/seccomm110/Ya-Mahdi/contents/Books';

  try {
      const response = await fetch(apiUrl, {
          headers: { 'Authorization': `token ${token}` }
      });
      
      if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
      }

      const files = await response.json();
      dropdown.innerHTML = ''; // Clear "Loading..." message

      files.forEach(file => {
          if (file.name.endsWith('.pdf') || file.name.endsWith('.xlsx')) {
              const listItem = document.createElement('li');
              const link = document.createElement('a');
              link.href = '#';
              link.textContent = file.name;
              link.addEventListener('click', (e) => {
                  e.preventDefault();
                  // Handle file view on click
                  viewFile(file.download_url);
              });
              listItem.appendChild(link);
              dropdown.appendChild(listItem);
          }
      });
  } catch (error) {
      console.error('Error loading files:', error);
      dropdown.innerHTML = '<li>Error loading files</li>';
  }
}

// Function to toggle the dropdown
function toggleDropdown() {
  const dropdown = document.getElementById('books-dropdown');
  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

// Function to view file (add necessary PDF or Excel view handling here)
function viewFile(fileUrl) {
  // Handle file viewing logic for PDF or Excel files
  alert(`Viewing file: ${fileUrl}`);
}
