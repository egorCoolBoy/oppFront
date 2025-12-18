class ProjectsPage{
    
    serverOrigin = "http://localhost:5044/"
    urls = {
        getSubjects: this.serverOrigin + "get/subjects",
        getProjects: this.serverOrigin + "api/get/projects",
        getProject: this.serverOrigin + "api/get/project", // id
        createProject: this.serverOrigin + "api/post/project",
        deleteProject: this.serverOrigin + "api/delete/project", // id
        logout: this.serverOrigin + "api/logout",
        me: this.serverOrigin + "api/me"
    }
    selectors = {
        subjectsList: ".subjects-list",
        projectCreateButton: ".project-create-button",
        projectDeleteButton: ".project-delete-button",
        projectCreateDialog: ".project-create-dialog",
        logoutButton: ".button-logout",
        projectsList: ".projects-list",
        projectItem: ".project-item",
    }

    constructor() {
        this.me() 
        
        this.subjectsList = document.querySelector(this.selectors.subjectsList)
        this.projectCreateButton = document.querySelector(this.selectors.projectCreateButton)
        this.projectCreateDialog = document.querySelector(this.selectors.projectCreateDialog)
        this.logoutButton = document.querySelector(this.selectors.logoutButton)

        this.projectCreateForm = document.forms["project-create-form"]
        this.titleInput = this.projectCreateForm.title
        this.descriptionInput = this.projectCreateForm.description
        this.subjectInput = this.projectCreateForm.subjectId

        this.subjectsPromise = this.getSubjects()
        this.renderSubjects()
        this.renderProjects()
        this.bindEvents()
    }

    bindEvents() {
        this.projectCreateButton.addEventListener('click', this.onProjectCreateButtonClick)
        this.projectCreateForm.addEventListener('submit', this.onProjectCreateFormSubmit)
        this.logoutButton.addEventListener('click', this.onLogoutButtonClick)
    }
    
    async getSubjects() {
        const response = await fetch(this.urls.getSubjects, {
            method: 'GET',
            headers: { "Accept": "application/json" },
            credentials: 'include'
        })
        if (response.ok) {
            return await response.json()
        }
        console.log("subjects is null")
        return null
    }

    async getProjects() {
        const response = await fetch(this.urls.getProjects, {
            method: 'GET',
            headers: { "Accept": "application/json" },
            credentials: 'include'
        })
        if (response.ok) {
            const projects = await response.json()
            // console.log(projects)
            return projects
        }
        console.log("projects is null")
        return null
    }

    async getProject(id) {
        if (id === null) {
            return
        }
        const url = `${this.urls.getProject}/${id}`
        const response = await fetch(url, {
            method: 'GET',
            headers: { "Accept": "application/json" },
            credentials: 'include'
        })
        if (response.ok) {
            const project = await response.json()
            return project
        }
        else {
            console.log(await response.json())
        }
    }

    async createProject(data) {
        if (data === null) {
            return
        }
        const params = new URLSearchParams(data)
        const url = `${this.urls.createProject}?${params.toString()}`
        console.log(params.toString())

        const response = await fetch(url, { 
            method: "POST",
            credentials: "include",
        })
        if (response.ok) {
            const projectId = (await response.json()).id
            return projectId
        }
        return null
    }

    async deleteProject(id) {
        if (id === null) {
            return
        }
        console.log(id)
        const url = `${this.urls.deleteProject}/${id}`
        const response = await fetch(url, {
            method: 'DELETE',
            credentials: 'include'
        })
        if (response.ok) {
            console.log("project deleted")
        }
        else {
            console.log(await response.json())
        }
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

    async me() {
        fetch(this.urls.me, {
            method: "GET",
            credentials: "include"
        }).then(response => {
            if (response.ok === false) {
                // location.href = "../login/index.html"
                console.log("unauth")
            }

        })
    }

    onProjectCreateButtonClick = ({target}) => {
        this.projectCreateDialog.showModal()
    }

    onProjectDeleteButtonClick = ({target}) => {
        const projectItem = target.closest(this.selectors.projectItem)
        this.deleteProject(projectItem.id)
        projectItem.remove()
    }

    onProjectCreateFormSubmit = () => {
        const data = this.serializeForm(this.projectCreateForm)
        console.log(Array.from(data.entries()))
        this.createProject(data).then(projectId => {
            this.getProject(projectId).then(project => {
                this.renderProject(project)
            })
        })
    }

    onProjectItemClick = ({target}) => {
        if (!target.matches(this.selectors.projectDeleteButton)) {
            localStorage.setItem("projectId", target.id)
            location.href = "../project/index.html"
        }
    }

    onLogoutButtonClick = () => {
        this.logout()
    }

    serializeForm(formNode) {
        return new FormData(formNode)
    }

    renderSubjects() {
        this.subjectsPromise.then(subjects => {
            if (subjects === null) {
                return
            }
            subjects.forEach(subject => {
                this.subjectsList.innerHTML += `
                <li class="subject-item" id="${subject.id}">
                    <h2 class="subject-item-heading">${subject.title}</h2>
                    <ul class="projects-list"></ul>
                </li>
                `
                this.subjectInput.innerHTML += `
                <option value="${subject.id}">${subject.title}</option>
                `
            });
        })
    }

    renderProjects() {
        this.getProjects().then(projects => {
            if (projects === null) {
                return
            }
            projects.forEach(project => this.renderProject(project))
        })
    }

    renderProject(project) {
        if (project === null) {
            return
        }
        this.subjectsPromise.then(subjects => {
            if (subjects === null) {
                return
            }
            const subject = subjects.find(subject => subject.title === project.subject)
            const subjectItem = document.getElementById(subject.id)
            const projectsList = subjectItem.querySelector(this.selectors.projectsList)
            const projectItem = document.createElement("li")
            projectItem.addEventListener("click", this.onProjectItemClick)
            projectItem.setAttribute("class", "project-item")
            projectItem.setAttribute("id", project.id)
            projectItem.append(project.title)
            if (project.isOwner === true) {
                const deleteButton = document.createElement("button")
                deleteButton.setAttribute("class", "project-delete-button")
                deleteButton.append("Delete")
                deleteButton.addEventListener("click", this.onProjectDeleteButtonClick)
                projectItem.append(deleteButton)
            }                    
            projectsList.append(projectItem)
        })
    }
}



new ProjectsPage()