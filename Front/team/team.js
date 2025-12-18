class Team {
    serverOrigin = "http://localhost:5044/"
    urls = {
        getUsers: this.serverOrigin + "api/get/users",
        addUser: this.serverOrigin + "api/add/user",
        deleteUser: this.serverOrigin + "api/delete/user",
        getProject: this.serverOrigin + "api/get/project", // id
        logout: this.serverOrigin + "api/logout",
    }
    selectors = {
        ownerEmail: ".owner-email",
        usersList: ".users-list",
        userItem: ".user-item",
        userAddButton: ".user-add-button",
        userDeleteButton: ".user-delete-button",
        userAddDialog: ".user-add-dialog",
        userAddForm: ".user-add-form",
        projectCreateDialog: ".project-create-dialog",
        logoutButton: ".button-logout",
    }

    constructor() {
        this.logoutButton = document.querySelector(this.selectors.logoutButton)
        this.userAddDialog = document.querySelector(this.selectors.userAddDialog)
        this.userAddForm = document.querySelector(this.selectors.userAddForm)
        this.emailInput = this.userAddForm.email
        this.ownerEmailElement = document.querySelector(this.selectors.ownerEmail)
        

        this.projectId = localStorage.getItem("projectId")
        this.projectPromise = this.getProject(this.projectId)
        this.usersPromise = this.getUsers()
        
        this.render()
        this.bindEvents()
    }

    bindEvents() {
        this.logoutButton.addEventListener('click', this.onLogoutButtonClick)
        this.userAddForm.addEventListener('submit', this.onUserAddFormSubmit)
    }

    async getUsers() {
        const params = new URLSearchParams({ projectId: this.projectId })
        const url = `${this.urls.getUsers}?${params}`
        return await fetch(url, {
            method: "GET",
            credentials: "include"
        }).then(response => {
            const users = response.json()
            return users
        }).catch(response => {
            const error = response.json();
            console.log(error.message)
            return null
        })
    }

    async addUser(data) {
        if (!data) return
        return await fetch(this.urls.addUser, {
            method: "PATCH",
            headers: { "Accept": "application/json", "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(data)
        }).then(response => console.log(response.json()))
        .catch(response => {
            const error = response.json();
            console.log(error)
            return null
        })
    }

    async deleteUser(data) {
        if (!data) return
        return await fetch(this.urls.deleteUser, {
            method: "DELETE",
            headers: { "Accept": "application/json", "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(data)
        }).catch(response => {
            const error = response.json();
            console.log(error)
            return null
        })
    }

    async getProject(id) {
        if (!id) return
        const url = `${this.urls.getProject}/${id}`
        return await fetch(url, {
            method: 'GET',
            headers: { "Accept": "application/json" },
            credentials: 'include'
        }).then(response => {
            const project = response.json()
            return project
        }).catch(response => {
            const error = response.json();
            console.log(error.message)
            return null
        })
    }

    async logout() {
        const response = await fetch(this.urls.logout, {
            method: 'POST',
            credentials: 'include'
        })
        if (response.ok === true) {
            location.href = '../login/index.html'
        }
    }

    onUserAddButtonClick = () => {
        this.userAddDialog.showModal()
    }

    onUserDeleteButtonClick = ({target}) => {
        if (target.matches(this.selectors.userDeleteButton)) {
            const userItem = target.closest(this.selectors.userItem)
            const data = {
                projectId: this.projectId,
                userId: userItem.id
            }
            this.deleteUser(data)
            userItem.remove()
        }
    }

    onUserAddFormSubmit = (event) => {
        const data = { 
            projectId: this.projectId, 
            email: this.emailInput.value
        }
        this.addUser(data)
        render
    }

    onLogoutButtonClick = () => {
        this.logout()
    }

    serializeForm(formNode) {
        return new FormData(formNode)
    }

    render() {
        this.projectPromise.then(project => {
            if (!project) return
            if (project.isOwner) {
                const userAddButton = document.createElement("button")
                userAddButton.setAttribute("class", this.toClassName(this.selectors.userAddButton))
                userAddButton.addEventListener("click", this.onUserAddButtonClick)
                userAddButton.append("Add new user")
                const mainElement = document.querySelector("main")
                mainElement.append(userAddButton)
            }
            
            this.ownerEmailElement.append(project.ownerName)
            this.usersPromise.then(users => {
                if (!users) return
                users.forEach(user => {
                    if (user.email !== project.ownerName)
                        this.renderUser(user)
                })
            })
        })
    }
    
    renderUser(user) {
        const usersList = document.querySelector(this.selectors.usersList)
        const userItem = document.createElement("li")
        userItem.setAttribute("class", this.toClassName(this.selectors.userItem))
        userItem.setAttribute("id", user.id)
        userItem.append(user.email)
        this.projectPromise.then(project => {
            if (!project) return
            if (project.isOwner) {
                const deleteButton = document.createElement("button")
                deleteButton.setAttribute("class", this.toClassName(this.selectors.userDeleteButton))
                deleteButton.append("Delete")
                deleteButton.addEventListener("click", this.onUserDeleteButtonClick)
                userItem.append(deleteButton)
            }                    
        })
        usersList.append(userItem)
    }

    toClassName(selector) {
        return selector.slice(1)
    }
}

new Team()