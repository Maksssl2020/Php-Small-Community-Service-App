import {validateFormInput} from "../../../indexUtils.js";
import {resetUserPassword} from "./resetPasswordApiFunctions.js";

export const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");
const resetPasswordButton = document.getElementById("resetPasswordButton");

let token;

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    token = urlParams.get("token");
})

newPasswordInput.addEventListener("change", () => {
    validateFormInput(newPasswordInput, newPasswordInput.value.trim().length >= 8)
    validateResetPasswordForm()
})

confirmPasswordInput.addEventListener("change", () => {
    validateFormInput(confirmPasswordInput, confirmPasswordInput.value.trim() === newPasswordInput.value.trim())
    validateResetPasswordForm()
})

resetPasswordButton.onclick = async (e) => {
    e.preventDefault();
    await resetUserPassword(token)
}

function validateResetPasswordForm() {
    const isNewPasswordValid = newPasswordInput.value.trim().length >= 8;
    const isConfirmPasswordValid = confirmPasswordInput.value.trim() === newPasswordInput.value.trim();

    resetPasswordButton.disabled = !(isNewPasswordValid && isConfirmPasswordValid);
}