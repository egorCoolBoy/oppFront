const loginUrl = 'http://localhost:5044/api/login'
const meUrl = 'http://localhost:5044/api/me'

const loginForm = document.forms['login']
const submitButton = loginForm.submitButton
submitButton.addEventListener('click', onLoginFormSubmit)


async function onLoginFormSubmit(event) {
    event.preventDefault()
    const email = loginForm.email.value
    const password = loginForm.password.value
    // await login({email, password})
    if (await login({email, password})){
        location.href = '../projects/index.html'
    }
        
}

async function login(data) {
    const response = await fetch(loginUrl, {
        method: 'POST',
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: 'include'
    })
    if (response.ok === true) {
        console.log(await response.json())
    }
    else {
        const error = await response.json()
        console.log(error)
    }
    return response.ok
}

async function me() {
    const response = await fetch(meUrl, {
        method: "GET",
        credentials: "include"
    })
    if (response.ok === true) {
        console.log(await response.json())
    }
    else {
        const error = await response.json()
        console.log(error)
    }
}
