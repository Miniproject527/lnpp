// Helper functions for localStorage
function getLocalStorage(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch (error) {
        console.error("Error parsing localStorage data:", error);
        return [];
    }
}

function setLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Handle User Registration
document.getElementById("registerForm")?.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!username) {
        alert("Username cannot be empty!");
        return;
    }

    if (!passwordRegex.test(password)) {
        alert(
            "Password must be at least 8 characters long, include uppercase and lowercase letters, a number, and a special character."
        );
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    const users = getLocalStorage("users");
    if (users.find(user => user.username === username)) {
        alert("Username already exists!");
        return;
    }

    users.push({ username, password, scores: [] });
    setLocalStorage("users", users);
    alert("Registration successful! You can now log in.");
    window.location.href = "login.html";
});

// Handle User Login
document.getElementById("loginForm")?.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    const users = getLocalStorage("users");
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        alert("Login successful!");
        sessionStorage.setItem("loggedInUser", JSON.stringify(user));
        window.location.href = "quiz.html";
    } else {
        alert("Invalid credentials!");
    }
});

// Logout Function
function logout() {
    sessionStorage.removeItem("loggedInUser");
    alert("Logged out successfully!");
    window.location.href = "login.html";
}

// Dynamically Display Quiz Questions
document.addEventListener("DOMContentLoaded", () => {
    const quizForm = document.getElementById("quizForm");
    if (quizForm) {
        const quizQuestions = getLocalStorage("quizQuestions");

        quizQuestions.forEach((q, index) => {
            const div = document.createElement("div");
            div.classList.add("question");

            const question = document.createElement("p");
            question.textContent = `${index + 1}. ${q.question}`;
            div.appendChild(question);

            q.options.forEach(option => {
                const label = document.createElement("label");
                const input = document.createElement("input");
                input.type = "radio";
                input.name = `q${index}`;
                input.value = option;
                label.appendChild(input);
                label.appendChild(document.createTextNode(option));
                div.appendChild(label);
            });

            quizForm.appendChild(div);
        });

        // Add submit button
        const submitButton = document.createElement("button");
        submitButton.textContent = "Submit Quiz";
        submitButton.type = "button";
        submitButton.addEventListener("click", submitQuiz);
        quizForm.appendChild(submitButton);
    }
});

// Submit Quiz and Save Score
function submitQuiz() {
    const answers = document.querySelectorAll('input[type="radio"]:checked');
    const quizQuestions = getLocalStorage("quizQuestions");
    let score = 0;

    answers.forEach((answer, index) => {
        if (answer.value === quizQuestions[index].correctAnswer) {
            score++;
        }
    });

    const result = document.getElementById("result");
    const scoreDisplay = document.getElementById("score");

    if (result && scoreDisplay) {
        scoreDisplay.textContent = `Your score: ${score}/${quizQuestions.length}`;
        result.style.display = "block";
    }

    const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));
    if (loggedInUser) {
        loggedInUser.scores.push({ quiz: "CS Quiz", score });
        sessionStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));

        const users = getLocalStorage("users");
        const updatedUsers = users.map(user =>
            user.username === loggedInUser.username ? loggedInUser : user
        );
        setLocalStorage("users", updatedUsers);
    }
}

// Update Admin Panel - Leaderboard and Questions
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("admin.html")) {
        const users = getLocalStorage("users");
        const quizQuestions = getLocalStorage("quizQuestions");

        // Update Leaderboard
        const leaderboardTable = document.getElementById("userScoresTable")?.querySelector("tbody");
        if (leaderboardTable) {
            leaderboardTable.innerHTML = "";
            users.forEach(user => {
                const row = document.createElement("tr");

                const usernameCell = document.createElement("td");
                usernameCell.textContent = user.username;
                row.appendChild(usernameCell);

                const scoresCell = document.createElement("td");
                scoresCell.textContent = user.scores.length
                    ? user.scores.map(score => `Quiz: ${score.quiz}, Score: ${score.score}`).join(" | ")
                    : "No scores recorded";
                row.appendChild(scoresCell);

                leaderboardTable.appendChild(row);
            });
        }

        // Update Questions
        updateQuestionsTable();
    }
});

// Update Questions Table
function updateQuestionsTable() {
    const tableBody = document.getElementById("questionTableBody");
    const quizQuestions = getLocalStorage("quizQuestions");
    if (tableBody) {
        tableBody.innerHTML = ""; // Clear existing content

        quizQuestions.forEach((question, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${question.question}</td>
                <td>${question.options.join(", ")}</td>
                <td>${question.correctAnswer}</td>
                <td>
                    <button onclick="deleteQuestion(${index})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
}

// Handle Adding New Questions
document.getElementById("addQuestionForm")?.addEventListener("submit", (e) => {
    e.preventDefault();

    const questionText = document.getElementById("newQuestion").value;
    const options = [
        document.getElementById("option1").value,
        document.getElementById("option2").value,
        document.getElementById("option3").value,
        document.getElementById("option4").value
    ];
    const correctAnswer = document.getElementById("correctAnswer").value;

    if (!questionText || options.some(opt => !opt) || !correctAnswer) {
        alert("All fields are required!");
        return;
    }

    const newQuestion = { question: questionText, options, correctAnswer };
    const quizQuestions = getLocalStorage("quizQuestions");
    quizQuestions.push(newQuestion);
    setLocalStorage("quizQuestions", quizQuestions);

    updateQuestionsTable();
    alert("Question added successfully!");
    document.getElementById("addQuestionForm").reset();
});

// Handle Deleting Questions
function deleteQuestion(index) {
    const quizQuestions = getLocalStorage("quizQuestions");
    quizQuestions.splice(index, 1); // Remove the question at the given index
    setLocalStorage("quizQuestions", quizQuestions);
    updateQuestionsTable(); // Refresh the table
}

// On Page Load, update the questions table
document.addEventListener("DOMContentLoaded", updateQuestionsTable);
