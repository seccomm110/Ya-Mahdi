document.addEventListener("DOMContentLoaded", function () {
    const navLinks = document.querySelectorAll(".horizontal-nav a");
    const sections = document.querySelectorAll("section");

    // Function to handle navigation click
    function handleNavClick(event) {
        event.preventDefault(); // Prevent default link behavior

        // Hide all sections
        sections.forEach(section => section.classList.remove("active"));

        // Remove active class from all nav links
        navLinks.forEach(link => link.classList.remove("active"));

        // Show the clicked section
        const targetSection = document.querySelector(event.target.getAttribute("href"));
        targetSection.classList.add("active");

        // Add active class to the clicked nav link
        event.target.classList.add("active");
    }

    // Add click event listeners to all nav links
    navLinks.forEach(link => {
        link.addEventListener("click", handleNavClick);
    });

    // Optionally, you can trigger a click on the first link to show the first section by default
    navLinks[0].click();
});



