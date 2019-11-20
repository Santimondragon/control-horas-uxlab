let eye = document.getElementById('eye');
let passwordInput = document.getElementById('password-input');

eye.addEventListener('click', () => {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        eye.src = "./images/show.svg";
    } else {
        passwordInput.type = "password";
        eye.src = "./images/hide.svg";
    }
});