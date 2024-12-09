// Helper functions for localStorage
function getLocalStorage(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch (error) {
        console.error("Error parsing localStorage data:", error);
        return [];
    }
}

// Logout Function
function logout() {
    sessionStorage.removeItem("loggedInUser");
    alert("Logged out successfully!");
    window.location.href = "login.html";
}

// Display Users and Scores
document.addEventListener("DOMContentLoaded", () => {
    const users = getLocalStorage("users"); // Fetch users from localStorage
    const tableBody = document.getElementById("userScoresTable").querySelector("tbody");

    if (tableBody) {
        tableBody.innerHTML = ""; // Clear any existing rows

        // Populate table with user data
        users.forEach(user => {
            const row = document.createElement("tr");

            // Username Cell
            const usernameCell = document.createElement("td");
            usernameCell.textContent = user.username;
            row.appendChild(usernameCell);

            // Scores Cell
            const scoresCell = document.createElement("td");
            scoresCell.textContent = user.scores.length
                ? user.scores.map(score => `Quiz: ${score.quiz}, Score: ${score.score}`).join(" | ")
                : "No scores recorded";
            row.appendChild(scoresCell);

            // Append row to table
            tableBody.appendChild(row);
        });
    } else {
        console.error("Table body element not found!");
    }
});

