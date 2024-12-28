let signUpModal = document.getElementById('signUpModal');
let signUpButton = document.getElementById('signUpButton');
let signInButton = document.getElementById('signInButton');

signUpButton.onclick = () => {
    console.log('signUpModal');
    signUpModal.style.display = 'block';
}

signInButton.onclick = () => {
    console.log('signInButton');
}

window.onclick = (event) => {
    if (event.target === signUpModal) {
        signUpModal.style.display = 'none';
    }
}