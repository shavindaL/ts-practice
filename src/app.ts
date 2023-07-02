//ProjectType
enum ProjectStatus { Active, Finished }
class Project {

    constructor(
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus
    ) { }
}
type Listener = (items: Project[]) => void;

//Project State Management
class ProjectState {
    private listeners: Listener[] = [];
    private projects: any[] = [];
    private static instance: ProjectState;

    private constructor() {

    }
    //Singleton Constructor
    static getInstance() {
        if (this.instance)
            return this.instance
        this.instance = new ProjectState();
        return this.instance;
    }

    addListener(listenerFn: Listener) {
        this.listeners.push(listenerFn)
    }

    addProject(title: string, description: string, numOfPeople: number) {
        const newProject = new Project(
            Math.random.toString(),
            title,
            description,
            numOfPeople,
            ProjectStatus.Active
        )

        this.projects.push(newProject);
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice())
        }
    }
}

const projectState = ProjectState.getInstance();

//Validation Logic
interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validate(validatableInput: Validatable): boolean {
    let isValid = true;

    if (validatableInput.required) {
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    }

    if (validatableInput.minLength != null && typeof validatableInput.value === "string") {
        isValid = isValid && validatableInput.value.length >= validatableInput.minLength
    }

    if (validatableInput.maxLength != null && typeof validatableInput.value === "string") {
        isValid = isValid && validatableInput.value.length <= validatableInput.maxLength
    }

    if (validatableInput.min != null && typeof validatableInput.value === "number") {
        isValid = isValid && validatableInput.value >= validatableInput.min
    }

    if (validatableInput.max != null && typeof validatableInput.value === "number") {
        isValid = isValid && validatableInput.value <= validatableInput.max
    }

    return isValid;
}

//Autobind Decorator
function Autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const adjustedDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this)
            return boundFn;
        }
    }
    return adjustedDescriptor;
}

//Input Class
class Input {
    templateElement: HTMLTemplateElement
    hostElement: HTMLDivElement;
    element: HTMLFormElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    //class contructor
    constructor() {
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;

        const importedContent = document.importNode(this.templateElement.content, true);
        this.element = importedContent.firstElementChild as HTMLFormElement;
        this.element.id = 'user-input';

        this.titleInputElement = this.element.querySelector('#title')!;
        this.descriptionInputElement = this.element.querySelector('#description')!;
        this.peopleInputElement = this.element.querySelector('#people')!;

        this.configure();
        this.attach();
    }

    private getUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDesc = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        const titleValidatable: Validatable = {
            value: enteredTitle,
            required: true,
        }

        const descValidatable: Validatable = {
            value: enteredDesc,
            required: true,
            minLength: 5
        }

        const peopleValidatable: Validatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 5
        }

        if (!validate(titleValidatable) || !validate(descValidatable) || !validate(peopleValidatable))
            alert('invalid input')
        else
            return [enteredTitle, enteredDesc, +enteredPeople]
    }

    private resetInputs() {
        this.titleInputElement.value = "";
        this.descriptionInputElement.value = "";
        this.peopleInputElement.value = "";
    }

    @Autobind
    private handleSubmit(e: Event) {
        e.preventDefault();
        const userInput = this.getUserInput()
        if (Array.isArray(userInput)) {
            const [title, desc, people] = userInput;
            projectState.addProject(title, desc, people)
            this.resetInputs()
        }
    }

    private configure() {
        this.element.addEventListener('submit', this.handleSubmit)
    }

    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }
}

//Project List Class
class ProjectList {
    templateElement: HTMLTemplateElement
    hostElement: HTMLDivElement;
    element: HTMLElement;
    assignedProject: Project[];


    constructor(private type: 'active' | 'finished') {
        this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;
        this.assignedProject = [];

        const importedContent = document.importNode(
            this.templateElement.content,
            true
        );
        this.element = importedContent.firstElementChild as HTMLElement;
        this.element.id = `${this.type}-projects`;

        projectState.addListener((projects: Project[]) => {
            const relevantProjects = projects.filter(project => {
                if (this.type === 'active')
                    return project.status === ProjectStatus.Active

                return project.status === ProjectStatus.Finished
            })
            this.assignedProject = relevantProjects;
            this.renderProjects();
        })

        this.attach();
        this.renderContent();
    }

    private renderProjects() {
        const listEl = document.getElementById(`${this.type}`)! as HTMLUListElement;
        listEl.innerHTML = ''
        for (const projectItem of this.assignedProject) {
            const listItem = document.createElement('li');
            listItem.textContent = projectItem.title;
            listEl.appendChild(listItem);
        }
    }

    private renderContent() {
        const listId = `${this.type}`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS'

    }

    private attach() {
        this.hostElement.insertAdjacentElement('beforeend', this.element);
    }
}

const input = new Input();
const activeLists = new ProjectList('active')
const finishedLists = new ProjectList('finished')

