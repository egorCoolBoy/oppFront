export class Team {
    serverOrigin = "http://localhost:5044/"
    urls = {
        getUsers: this.serverOrigin + "api/get/users",
        addUser: this.serverOrigin + "api/add/user",
        deleteUser: this.serverOrigin + "api/delete/user",
    }
    selectors = {
        ownerEmail: ".owner-email",
        usersList: ".users-list",
        userItem: ".user-item",
        userAddButton: ".user-add-button",
        userDeleteButton: ".user-delete-button",
        userAddDialog: ".user-add-dialog",
        userAddForm: ".user-add-form",
        usersHeading: ".users-heading",
        teamPanelOpenButton: ".team-panel-open-button",
        teamPanelCloseButton: ".team-panel-close-button",
        teamPanelDialog: ".team-panel-dialog"
    }

    constructor(currentProject) {
        this.userAddDialog = document.querySelector(this.selectors.userAddDialog)
        this.userAddForm = document.querySelector(this.selectors.userAddForm)
        this.emailInput = this.userAddForm.email
        this.ownerEmailElement = document.querySelector(this.selectors.ownerEmail)
        this.usersHeading = document.querySelector(this.selectors.usersHeading)
        
        this.teamPanelDialog = document.querySelector(this.selectors.teamPanelDialog)
        this.teamPanelOpenButton = document.querySelector(this.selectors.teamPanelOpenButton)
        this.teamPanelCloseButton = document.querySelector(this.selectors.teamPanelCloseButton)

        this.currentProject = currentProject
        this.usersPromise = this.getUsers()
        
        this.render()
        this.bindEvents()
    }

    bindEvents() {
        this.teamPanelOpenButton.addEventListener("click", this.onTeamPanelOpenButtonClick)
        this.teamPanelCloseButton.addEventListener("click", this.onTeamPanelCloseButtonClick)
        this.userAddForm.addEventListener('submit', this.onUserAddFormSubmit)
    }

    async getUsers() {
        const params = new URLSearchParams({ projectId: this.currentProject.id })
        const url = `${this.urls.getUsers}?${params}`
        return await fetch(url, {
            method: "GET",
            credentials: "include"
        }).then(response => {
            if (response.ok) {
                const users = response.json()
                return users
            }
            const error = response.json()
            console.log(error)
            return null
        })
    }

    async addUser(data) {
        if (!data) return
        const response = await fetch(this.urls.addUser, {
            method: "PATCH",
            headers: { "Accept": "application/json", "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(data)
        })
        const {message} = await response.json()
        console.log(message)
        return response.ok

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

    onTeamPanelOpenButtonClick = ({target}) => {
        this.teamPanelDialog.show()
    }

    onTeamPanelCloseButtonClick = ({target}) => {
        this.teamPanelDialog.close()
    }

    onUserAddButtonClick = () => {
        this.userAddDialog.showModal()
    }

    onUserDeleteButtonClick = ({target}) => {
        if (target.matches(this.selectors.userDeleteButton)) {
            const userItem = target.closest(this.selectors.userItem)
            const data = {
                projectId: this.currentProject.id,
                userId: userItem.id
            }
            this.deleteUser(data)
            userItem.remove()
        }
    }

    onUserAddFormSubmit = () => {
        const data = { 
            projectId: this.currentProject.id, 
            email: this.emailInput.value
        }
        this.addUser(data).then(isSuccessful => {
            if (!isSuccessful) return
            this.getUsers().then(users => {
                if (!users) return
                console.log(users)
                const newUser = users.at(-1)
                this.renderUser (newUser)
            })
        })
    }

    serializeForm(formNode) {
        return new FormData(formNode)
    }
    render() {
        if (this.currentProject.isOwner) {
            const userAddButton = document.createElement("button")
            userAddButton.setAttribute("class", this.toClassName(this.selectors.userAddButton))
            userAddButton.addEventListener("click", this.onUserAddButtonClick)
            userAddButton.append("Add new user")
            this.teamPanelDialog.insertBefore(userAddButton, this.usersHeading)
        }
        
        this.ownerEmailElement.append(this.currentProject.ownerName)
        this.usersPromise.then(users => {
            if (!users) return
            users.forEach(user => {
                if (user.email !== this.currentProject.ownerName)
                    this.renderUser(user)
            })
        })
    }
    
    renderUser(user) {
        const usersList = document.querySelector(this.selectors.usersList)
        const userItem = document.createElement("li")
        userItem.setAttribute("class", this.toClassName(this.selectors.userItem))
        userItem.setAttribute("id", user.id)
        userItem.append(user.email)
        if (this.currentProject.isOwner) {
            const deleteButton = document.createElement("button")
            deleteButton.setAttribute("class", this.toClassName(this.selectors.userDeleteButton))
            deleteButton.append("Delete")
            deleteButton.addEventListener("click", this.onUserDeleteButtonClick)
            userItem.append(deleteButton)
        }                    
        usersList.append(userItem)
    }

    toClassName(selector) {
        return selector.slice(1)
    }
}