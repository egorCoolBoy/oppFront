const registerUrl = 'http://localhost:5044/api/register'

const registerForm = document.forms['register']
const submitButton = registerForm.submitButton
submitButton.addEventListener('click', onRegisterFormSubmit)


async function onRegisterFormSubmit(event) {
    event.preventDefault()
    const email = registerForm.email.value
    const password = registerForm.password.value
    await register({email, password})
}

async function register(data) {
    const response = await fetch(registerUrl, {
        method: 'POST',
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
    })
    if (response.ok === true) {
        console.log("Аккаунт успешно создан")
        location.href = '../login/index.html';

    }
    else {
        const error = await response.json()
        console.log(error)
    }
}

