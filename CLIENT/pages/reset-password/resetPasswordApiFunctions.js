import {newPasswordInput} from "./resetPassword.js";
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
            setTimeout(() => {
                window.location = "../dashboard/dashboard.php?section=dashboard";
            }, 1000);
        } else {
            showToast("Something went wrong!", "error");
        }
    })
    .catch(error => {
        showToast("Something went wrong!", error);
        console.log(error);
    });
}