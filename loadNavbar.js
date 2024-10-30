function loadNavbar() {
  const xhr = new XMLHttpRequest();

  // Check if the current page is in a subdirectory
  const pathPrefix = window.location.pathname.includes('/pages/') ? '../' : '';
  xhr.open('GET', `${pathPrefix}navbar.html`, true);

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      document.getElementById('navbar-placeholder').innerHTML = xhr.responseText;
    }
  };

  xhr.send();
}

document.addEventListener("DOMContentLoaded", loadNavbar);

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  sidebar.classList.toggle('open');
  mainContent.classList.toggle('shifted');
}

function goBack() {
  window.history.back();
}


