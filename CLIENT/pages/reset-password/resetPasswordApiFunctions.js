import {
    newPasswordInput,
    passwordResetSuccessInformation,
    resendEmailMessageContainer,
    resetPasswordContainer
} from "./resetPassword.js";
import {showToast} from "../../../indexUtils.js";

export async function resetUserPassword(token) {
    const newPasswordValue = newPasswordInput.value;

    fetch("http://localhost/php-small-social-service-app/authentication/reset-password", {
        method: "POST",
        body: JSON.stringify({
            token: token,
            password: newPasswordValue,
        }),
        headers: {
            "Content-Type": "application/json",
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast(data.message, "success");
            resetPasswordContainer.classList.replace("visible", "hidden")
            passwordResetSuccessInformation.classList.replace("hidden", "visible")
        } else {
            showToast(data.message, "error");
            resetPasswordContainer.classList.replace("visible", "hidden")
            resendEmailMessageContainer.classList.replace("hidden", "visible");
        }
    })
    .catch(error => {
        showToast("Something went wrong!", error);
        console.log(error);
    });
}