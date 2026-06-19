const API_URL = "https://public-health-chatbot-nuq7.onrender.com";

console.log("auth.js loaded. API_URL:", API_URL);

async function signupUser() {
    const name = document.getElementById("signupName").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    if (!name || !email || !password) {
        alert("Please fill all fields");
        return;
    }

    console.log("Attempting signup for:", email);

    try {
        const response = await fetch(`${API_URL}/api/auth/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();
        console.log("Signup response:", data);

        if (response.ok) {
            alert("Signup successful! Please login.");
            window.location.href = "login.html";
        } else {
            alert("Signup Failed: " + (data.message || "Unknown error") + (data.error ? " - " + data.error : ""));
        }
    } catch (error) {
        console.error("Signup Error:", error);
        alert("Signup Error. Check console for details.");
    }
}

async function loginUser() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        alert("Please enter email and password");
        return;
    }

    console.log("Attempting login for:", email);

    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        console.log("Login response:", data);

        if (response.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            console.log("Token saved to localStorage");

            alert("Login Successful");
            window.location.href = "index.html";
        } else {
            alert("Login Failed: " + (data.message || "Invalid credentials") + (data.error ? " - " + data.error : ""));
        }
    } catch (error) {
        console.error("Login Error:", error);
        alert("Login Error. Check connection.");
    }
}
