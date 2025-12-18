import {Team} from "./team.js"
import {Tasks} from "./tasks.js"

class Project {
    serverOrigin = "http://localhost:5044/"
    urls = {
        getProject: this.serverOrigin + "api/get/project",
        logout: this.serverOrigin + "api/logout",
        me: this.serverOrigin + "api/me"
    }

    selectors = {
        logoutButton: ".button-logout",
        projectTitleElement: ".project-title",
        subjectTitleElement: ".subject-title",
    }

    constructor() {
        this.logoutButton = document.querySelector(this.selectors.logoutButton)
        this.projectTitleElement = document.querySelector(this.selectors.projectTitleElement)
        this.subjectTitleElement = document.querySelector(this.selectors.subjectTitleElement)
        

        this.getCurrentProject().then(project => {
            this.team = new Team(project)
            this.projectTitleElement.append(project.title)
            this.subjectTitleElement.append(project.subject)

            this.tasks = new Tasks(project.id)
        }) 

        this.bindEvents()
    }

    bindEvents() {

    }

    async getCurrentProject() {
        const projectId = localStorage.getItem("projectId")
        return await fetch(this.urls.getProject+"/"+projectId, {
            method: "GET",
            credentials: "include"
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
        if (response.ok) {
            location.href = '../login/index.html'
        }
    }

    renderTasks() {
        this.taskTableBodyElement.innerHTML = this.items.map(
            ({id, title, deadline, executors ,status, dependencies }) => `
        <tr id="${id}">
            <td>${title}</td>
            <td>${executors}</td>
            <td>${deadline}</td>
            <td>${status}</td>
            <td>${dependencies}</td>
            <td><button type="button" class="task-edit-button" name="task-edit-button">Edit</button></td>
        </tr>
        `).join('')
    }

    onLogoutButtonClick = () => {
        this.logout()
    }

    onCreateTaskButtonClick = () => {
        
    }

    onEditTaskButtonClick = ({ target }) => {
        if (target.matches('.task-edit-button')) {
            window.taskParamsDialog.showModal();
            const item = this.items.find(item => item.id === target.closest('tr').id)
            this.idElement.value = item.id
            this.titleInputElement.value = item.title
            this.executorsInputElement.value = item.executors
            this.deadlineInputElement.value = item.deadline
            this.statusInputElement.value = item.status
            this.dependenciesInputElement.value = item.dependencies
        }
    }

    onEditTaskFormSubmit = (event) => {
        const data = this.serializeForm(this.editTaskForm)
        console.log(Array.from(data.entries()))
    }


    
    serializeForm(formNode) {
        return new FormData(formNode)
    }

    getCurrentDate() {
        const formattedDate = new Date().toLocaleString('ru', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric'
        });
        return formattedDate.split('.').reverse().join('-')
    }
}

new Project()