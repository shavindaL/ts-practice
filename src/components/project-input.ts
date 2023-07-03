import Component from "./base-component.js";
import { Autobind } from "../decorators/autobind.js";
import { Validatable, validate } from "../util/validation.js";
import { projectState } from "../state/project-state.js";

//Input Class
export class Input extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    //class contructor
    constructor() {
        super('project-input', 'app', true, 'user-input');

        this.titleInputElement = this.element.querySelector('#title')!;
        this.descriptionInputElement = this.element.querySelector('#description')!;
        this.peopleInputElement = this.element.querySelector('#people')!;


        this.configure();
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

    configure(): void {
        this.element.addEventListener('submit', this.handleSubmit)
    }

    renderContent(): void { /* Just a placeholder */ }
}
