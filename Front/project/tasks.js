export class Tasks {
    serverOrigin = "http://localhost:5044/"
    urls = {
        createTask: this.serverOrigin + "api/post/task",
        deleteTask: this.serverOrigin + "api/delete/task",
        getTasks: this.serverOrigin + "api/get/tasks",
        getTask: this.serverOrigin + "api/get/task",
        editTask: this.serverOrigin + "api/put/task",
        getUsers: this.serverOrigin + "api/get/users",

    }

    selectors = {
        taskCreateButton: ".task-create-button",
        taskDeleteButton: ".task-delete-button",
        taskEditButton: ".task-edit-button",
        taskCreateDialog: ".task-create-dialog",
        taskCreateForm: ".task-create-form",
        taskCreateTitleInput: ".task-create-title-input",
        taskCreateSubmitButton: ".task-create-submit-button",
        tasksTableBody: ".tasks-table-body",
        taskEditDialog: ".task-edit-dialog",
        taskEditForm: ".task-edit-form",

        usersSelectorDialog: ".users-selector-dialog",
        usersSelectorOpenButton: ".users-selector-open-button",
        usersSelectorForm: ".users-selector-form",
        usersSelectorList: ".users-selector-list",

        tasksSelectorDialog: ".tasks-selector-dialog",
        tasksSelectorOpenButton: ".tasks-selector-open-button",
        tasksSelectorForm: ".tasks-selector-form",
        tasksSelectorList: ".tasks-selector-list",
    }

    constructor(currentProjectId) {
        this.currentProjectId = currentProjectId
        this.taskCreateButton = document.querySelector(this.selectors.taskCreateButton)
        this.taskCreateDialog = document.querySelector(this.selectors.taskCreateDialog)
        this.taskCreateForm = document.querySelector(this.selectors.taskCreateForm)
        this.taskCreateTitleInput = document.querySelector(this.selectors.taskCreateTitleInput)
        this.tasksTableBody = document.querySelector(this.selectors.tasksTableBody)
        this.taskEditDialog = document.querySelector(this.selectors.taskEditDialog)
        this.taskEditForm = document.querySelector(this.selectors.taskEditForm)
        this.taskIdInput = this.taskEditForm.id
        this.taskEditTitleInput = this.taskEditForm.title
        this.taskEditDescriptionInput = this.taskEditForm.description
        this.taskEditDeadlineInput = this.taskEditForm.deadline
        this.taskEditStatusInput = this.taskEditForm.taskStatus
        this.taskEditPredecessorsInput = this.taskEditForm.predecessors

        this.usersSelectorDialog = document.querySelector(this.selectors.usersSelectorDialog)
        this.usersSelectorOpenButton = document.querySelector(this.selectors.usersSelectorOpenButton)
        this.usersSelectorForm = document.querySelector(this.selectors.usersSelectorForm)
        this.usersSelectorList = document.querySelector(this.selectors.usersSelectorList)

        this.tasksSelectorDialog = document.querySelector(this.selectors.tasksSelectorDialog)
        this.tasksSelectorOpenButton = document.querySelector(this.selectors.tasksSelectorOpenButton)
        this.tasksSelectorForm = document.querySelector(this.selectors.tasksSelectorForm)
        this.tasksSelectorList = document.querySelector(this.selectors.tasksSelectorList)
        
        this.renderUsersSelector()
        this.renderTasksSelector()
        this.renderTasks()
        this.bindEvents()
    }

    bindEvents() {
        this.taskCreateButton.addEventListener("click", this.onTaskCreateButtonClick)
        this.taskCreateForm.addEventListener("submit", this.onTaskCreateFormSubmit)
        this.tasksTableBody.addEventListener("click", this.onTaskDeleteButtonClick)
        this.tasksTableBody.addEventListener("click", this.onTaskEditButtonClick)
        this.taskEditForm.addEventListener("submit", this.onTaskEditFormSubmit)

        this.usersSelectorOpenButton.addEventListener("click", this.onUsersSelectorOpenButton)
        this.usersSelectorForm.addEventListener("submit", this.onUsersSelectorFormSubmit)  
        this.tasksSelectorOpenButton.addEventListener("click", this.onTasksSelectorOpenButton)
        this.tasksSelectorForm.addEventListener("submit", this.onTasksSelectorFormSubmit)    
    }

    async getTasks() {
        const url = this.queryString(this.urls.getTasks, { projectId: this.currentProjectId })
        const response = await fetch(url, {
            method: "GET",
            headers: { "Accept": "application/json" },
            credentials: "include",
        })
        if (response.ok) {
            const tasks = await response.json()
            return tasks
        }
        const error = await response.json()
        console.log(error)
        return null
    }

    async getTask(id) {
        if (!id) return
        const url = this.queryString(this.urls.getTask, { taskId: id }) 
        const response = await fetch(url, {
            method: "GET",
            headers: { "Accept": "application/json" },
            credentials: "include",
        })
        if (response.ok) {
            const task = await response.json()
            return task
        }
        const error = await response.json()
        console.log(error)
        return null
    }

    async createTask(data) {
        if (!data) return
        const url = this.queryString(this.urls.createTask, data)
        const response = await fetch(url, {
            method: "POST",
            credentials: "include",
        })
        if (response.ok) {
            const taskId = await response.json()
            return taskId
        }
        const error = await response.json()
        console.log(error)
        return null
    }

    async deleteTask(id) {
        if (!id) return
        const url = this.queryString(this.urls.deleteTask, { taskId: id }) 
        const response = await fetch(url, {
            method: "DELETE",
            credentials: "include",
        })
        return response.ok
    }

    async updateTask(task) {
        if (!task) return
        const url = this.queryString(this.urls.editTask, { taskId: task.id })
        const response = await fetch(url, {
            method: "PUT",
            credentials: "include",
            headers: { "Accept": "application/json", "Content-Type": "application/json" },
            body: JSON.stringify(task)
        })
        console.log(await response.json())
        return response.ok
    }

    async getUsers() {
        const url = this.queryString(this.urls.getUsers, { projectId: this.currentProjectId })
        const response = await fetch(url, {
            method: "GET",
            credentials: "include"
        })
        if (response.ok) {
            const users = await response.json()
            return users
        }
        console.log(await response.json())
        return null
    }

    onTaskCreateButtonClick = () => {
        this.taskCreateDialog.show()
    }

    onTaskCreateFormSubmit = ({target}) => {
        console.log(target)
        const data = {
            projectId: this.currentProjectId,
            title: this.taskCreateTitleInput.value
        }
        this.createTask(data).then(taskId => {
            this.taskCreateForm.reset()
            if (!taskId) return
            // const defaultTask = {
            //     id: taskId,
            //     title: this.taskCreateTitleInput.value,
            //     description: null,
            //     users: [],
            //     deadline: new Date().toISOString(),
            //     taskStatus: "None",
            //     predecessors: []
            // }
            // this.updateTask(defaultTask)
            this.getTask(taskId).then( task => {
                if (!task) return
                this.renderTask(task)
            })
        })
    }

    onTaskDeleteButtonClick = ({target}) => {
        if (target.matches(this.selectors.taskDeleteButton)) {
            const taskItem = target.closest("tr")
            this.deleteTask(taskItem.id).then(isSuccess => {
                if (isSuccess) {
                    taskItem.remove()
                }
            })
        }
    }

    onTaskEditButtonClick = ({target}) => {
        if (target.matches(this.selectors.taskEditButton)) {
            const taskItem = target.closest("tr")
            this.getTask(taskItem.id).then(task => {
                if (!task) return
                this.taskIdInput.value = task.id
                this.taskEditTitleInput.value = task.title
                this.taskEditDescriptionInput.value = task.description
                this.taskEditDeadlineInput.value = this.dateIn(task.deadline)
                this.taskEditDialog.show()
            })
        }
    }

    onTaskEditFormSubmit = () => {
        const usersId = []
        for (let userItem of this.usersSelectorList.children) {
            const userCheckbox = userItem.querySelector(".user-checkbox")
            if (userCheckbox.checked) {
                usersId.push(userItem.id)
            }
        }
        const tasksId = []
        for (let taskItem of this.tasksSelectorList.children) {
            const taskCheckbox = taskItem.querySelector(".task-checkbox")
            if (taskCheckbox.checked) {
                tasksId.push(taskItem.id)
            }
        }
        const task = {
            id: this.taskIdInput.value,
            title: this.taskEditTitleInput.value,
            description: this.taskEditDescriptionInput.value,
            users: usersId,
            deadline: this.dateOut(this.taskEditDeadlineInput.value),
            taskStatus: this.taskEditStatusInput.value,
            predecessors: tasksId
        }
        this.updateTask(task)
        this.renderTask(task)
    }
    
    onUsersSelectorOpenButton = () => {
        this.renderUsersSelector()
        this.usersSelectorDialog.show()
    }

    onTasksSelectorOpenButton = () => {
        this.renderTasksSelector()
        this.tasksSelectorDialog.show()
    }

    onUsersSelectorFormSubmit = (event) => {
        event.preventDefault()
        this.usersSelectorDialog.close()
    }

    onTasksSelectorFormSubmit = (event) => {
        event.preventDefault()
        this.tasksSelectorDialog.close()
    }

    renderUsersSelector() {
        this.getUsers().then(users => {
            if (!users) return
            this.usersSelectorList.innerHTML = ""
            users.forEach(user => {
                this.usersSelectorList.innerHTML += `
                <li class="users-selector-item" id="${user.id}">
                    <input class="user-email" type="text" value="${user.email}" hidden>
                    <label>
                        <input class="user-checkbox" type="checkbox" name="checkbox">
                        ${user.email}
                    </label>
                </li>`
            })
        })
    }

    renderTasksSelector() {
        this.getTasks().then(tasks => {
            if (!tasks) return
            this.tasksSelectorList.innerHTML = ""
            tasks.forEach(task => {
                this.tasksSelectorList.innerHTML += `
                <li class="users-selector-item" id="${task.id}">
                    <input class="task-title" type="text" value="${task.title}" hidden>
                    <label>
                        <input class="task-checkbox" type="checkbox" name="checkbox">
                        ${task.title}
                    </label>
                </li>`
            })
        })
    }

    // async loadUsersItems() {
    //     return await this.getUsers().then(users => {
    //         if (!users) return
    //         users.forEach(user => {
    //             const userItem = document.createElement("option")
    //             userItem.value = user.id
    //             userItem.text = user.email
    //             this.taskEditUsersInput.append(userItem)
    //         })
    //     })
    // }

    // resetSelectUsers() {
    //     for (let userItem of this.taskEditUsersInput.children) {
    //         userItem.selected = false
    //     }
    // }

    // getUserItem(userId) {
    //     for (let userItem of this.taskEditUsersInput.children) {
    //         if (userItem.value === userId && userItem.value !== "") {
    //             return userItem
    //         }
    //     }
    // }

    // getSelectedUsers() {
    //     const result = []
    //     for (let userItem of this.taskEditUsersInput.children) {
    //         if(userItem.selected) {
    //             result.push(userItem.value)
    //         }
    //     }
    //     return result
    // }

    // getUsersEmails(users) {
    //     const result = users.map(user => {
    //         if (user.id) {
    //             return this.getUserItem(user.id).text
    //         }
    //         return this.getUserItem(user).text
    //     })
    //     return result
    // }

    renderTask(task) {
        if (!task) return
        let taskItem
        for (let item of this.tasksTableBody.children) {
            if (task.id === item.id) {
                taskItem = item
                break
            }
        }
        const isExists = taskItem ? true : false 
        if (!isExists) {
            taskItem = document.createElement("tr")
            taskItem.setAttribute("id", task.id)
        }
        taskItem.innerHTML = `
            <td>${task.title}</td>
            <td>${this.getUsersEmails(task.users)}</td>
            <td>${this.dateIn(task.deadline)}</td>
            <td>${this.getStatusItem(task.taskStatus).innerHTML}</td>
            <td>${this.getTasksTitles(task.predecessors)}</td>
            <td><button class="task-edit-button">Edit</button></td>
            <td><button class="task-delete-button">Delete</button></td>
        `
        if (!isExists) {
            this.tasksTableBody.append(taskItem)
        }
    }

    renderTasks() {
        this.getTasks().then(tasks => {
            if (!tasks) return
            tasks.forEach(task => {
                this.renderTask(task)
            })
        })
    }

    getStatusItem(status) {
        for (let statusItem of this.taskEditStatusInput.children) {
            if (statusItem.value === status) {
                return statusItem
            }
        }
    }

    getUsersEmails(users) {
        const emails = []
        users.forEach(user => {
            for (let userItem of this.usersSelectorList.children) {
                if (userItem.id === user || userItem.id === user.id) {
                    emails.push(userItem.querySelector(".user-email").value)
                }
            }
        })
        return emails
    }

    getTasksTitles(tasks) {
        const titles = []
        tasks.forEach(task => {
            for (let taskItem of this.tasksSelectorList.children) {
                if (taskItem.id === task || taskItem.id === task.id) {
                    titles.push(taskItem.querySelector(".task-title").value)
                }
            }
        })
        return titles
    }

    dateIn(date) {
        if (!date) return null
        return date.split('T')[0]
    }

    dateOut(date) {
        if (!date) return null
        const [y, m, d] = date.split('-')
        return new Date(+y, +m - 1, +d, 7).toISOString()
    }

    queryString(url, data) {
        return url + "?" + new URLSearchParams(data)
    }
}