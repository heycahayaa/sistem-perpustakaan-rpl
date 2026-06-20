const form = document.getElementById("loginForm");

const usernameInput =
    document.getElementById("username");

const passwordInput =
    document.getElementById("password");

const loginError =
    document.getElementById("loginError");

const loginSuccess =
    document.getElementById("loginSuccess");

form.addEventListener("submit", function (e) {

    e.preventDefault();

    const username =
        usernameInput.value.trim();

    const password =
        passwordInput.value.trim();

    loginError.classList.add("d-none");
    loginSuccess.classList.add("d-none");

    usernameInput.classList.remove("is-invalid");
    passwordInput.classList.remove("is-invalid");

    // ADMIN

    if (
        username === "admin" &&
        password === "admin123"
    ) {

        loginSuccess.classList.remove("d-none");

        setTimeout(() => {

            window.location.href =
            "admin/dashboard-admin.html";

        }, 1000);

        return;
    }

    // ANGGOTA

    if (
        username === "anggota" &&
        password === "anggota123"
    ) {

        loginSuccess.classList.remove("d-none");

        setTimeout(() => {

            window.location.href =
            "anggota/dashboard-anggota.html";

        }, 1000);

        return;
    }

    // LOGIN GAGAL

    loginError.classList.remove("d-none");

    usernameInput.classList.add("is-invalid");
    passwordInput.classList.add("is-invalid");

});

function togglePassword(){

    const passwordField =
        document.getElementById("password");

    const eyeIcon =
        document.getElementById("eyeIcon");

    if(passwordField.type === "password"){

        passwordField.type = "text";

        eyeIcon.classList.remove("fa-eye");
        eyeIcon.classList.add("fa-eye-slash");

    }
    else{

        passwordField.type = "password";

        eyeIcon.classList.remove("fa-eye-slash");
        eyeIcon.classList.add("fa-eye");

    }

}