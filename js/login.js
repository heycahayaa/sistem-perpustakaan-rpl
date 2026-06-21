document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const loginError = document.getElementById("loginError");
    const loginSuccess = document.getElementById("loginSuccess");

    if (!form) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        loginError.classList.add("d-none");
        loginSuccess.classList.add("d-none");
        usernameInput.classList.remove("is-invalid");
        passwordInput.classList.remove("is-invalid");

        fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                loginSuccess.classList.remove("d-none");
                setTimeout(() => {
                    if (data.role === 'admin') {
                        window.location.href = "admin/dashboard-admin.html";
                    } else {
                        window.location.href = "anggota/dashboard-anggota.html";
                    }
                }, 1000);
            } else {
                loginError.classList.remove("d-none");
                usernameInput.classList.add("is-invalid");
                passwordInput.classList.add("is-invalid");
            }
        })
        .catch(err => {
            alert("Gagal terhubung ke server backend!");
        });
    });
});

window.togglePassword = function() {
    const passwordField = document.getElementById("password");
    const eyeIcon = document.getElementById("eyeIcon");
    if (passwordField.type === "password") {
        passwordField.type = "text";
        eyeIcon.classList.replace("fa-eye", "fa-eye-slash");
    } else {
        passwordField.type = "password";
        eyeIcon.classList.replace("fa-eye-slash", "fa-eye");
    }
};
