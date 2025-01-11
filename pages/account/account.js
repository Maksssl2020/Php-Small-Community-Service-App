const emailDisplayLabel = document.getElementById('emailDisplayLabel');

window.addEventListener('DOMContentLoaded', async () => {
    let userData;

    const userId = await getSignedUserId();

    if (userId) {
        userData = await fetchUserData(userId);
        console.log(userData);

        await populatePageWithUserData(userData);
    } else {
        window.location.href = '../dashboard.php';
    }
})

async function getSignedUserId() {
    return await fetch('../../utils/users/get_signed_user_id.php', {
        method: 'GET',
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                return data.data;
            } else {
                return null;
            }
        })
        .catch((error) => {
            console.log(error)
            return null;
        })
}

async function populatePageWithUserData(userData) {
    const {id, userNickname, userEmail} = userData;
    emailDisplayLabel.textContent = userEmail;
}