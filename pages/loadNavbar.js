// Load Navbar Function
function loadNavbar() {
  const xhr = new XMLHttpRequest();

  // Check if the current page is in a subdirectory
  const pathPrefix = window.location.pathname.includes('/pages/') ? '../' : '';
  xhr.open('GET', `${pathPrefix}navbar.html`, true);

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      // Inject the navbar content into the placeholder
      document.getElementById('navbar-placeholder').innerHTML = xhr.responseText;

      // Perform admin check after the navbar is loaded
      if (localStorage.getItem('username') === 'admin') {
        // Show admin link and upload icon for admin users
        document.getElementById('admin-link').style.display = 'block';
        document.getElementById('upload-icon').style.display = 'block';
      } else {
        // Hide admin link and upload icon for non-admin users
        document.getElementById('admin-link').style.display = 'none';
        document.getElementById('upload-icon').style.display = 'none';
      }
    }
  };

  // Send the request to load the navbar
  xhr.send();
}

// Call loadNavbar when the DOM is ready
document.addEventListener("DOMContentLoaded", loadNavbar);

// Toggle Sidebar Function
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  sidebar.classList.toggle('open');
  mainContent.classList.toggle('shifted');
}

// Automatically Close Sidebar on Outside Click
document.addEventListener("click", function(event) {
  const sidebar = document.getElementById('sidebar');
  const toggleButton = document.querySelector('.sidebar-toggle');

  // Check if the sidebar is open and the clicked element is outside the sidebar and toggle button
  if (sidebar.classList.contains('open') && 
      !sidebar.contains(event.target) && 
      !toggleButton.contains(event.target)) {
    sidebar.classList.remove('open');
    mainContent.classList.remove('shifted');
  }
});

// Go Back Function
function goBack() {
  window.history.back();
}

// Function to toggle dropdown visibility
function toggleDropdown(event, dropdownId) {
  event.preventDefault(); // Prevent default anchor behavior
  const dropdown = document.getElementById(dropdownId);
  dropdown.classList.toggle('show'); // Toggle the dropdown visibility
}

// Automatically close dropdowns on outside click
document.addEventListener("click", function(event) {
  const dropdowns = document.querySelectorAll('.dropdown-content');
  dropdowns.forEach(dropdown => {
    if (!dropdown.contains(event.target) && !dropdown.previousElementSibling.contains(event.target)) {
      dropdown.classList.remove('show'); // Close the dropdown if clicked outside
    }
  });
});
