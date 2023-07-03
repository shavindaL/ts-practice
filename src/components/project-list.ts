import Component from "./base-component.js";
import { Project, ProjectStatus } from "../models/project.js";
import { Autobind } from "../decorators/autobind.js";
import { DragTarget } from "../models/drag-drop.js";
import { projectState } from "../state/project-state.js";
import { ProjectItem } from "./project-item.js";

export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
    assignedProject: Project[];


    constructor(private type: 'active' | 'finished') {
        super('project-list', 'app', false, `${type}-projects`,);

        this.assignedProject = [];

        this.configure();
        this.renderContent();
    }

    @Autobind
    dragOverHandler(event: DragEvent): void {

        if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
            event.preventDefault();
            const listELement = this.element.querySelector('ul')!;
            listELement.classList.add('droppable');
        }

    }

    @Autobind
    dropHandler(event: DragEvent): void {
        const projectId = event.dataTransfer!.getData('text/plain');
        projectState.moveProject(projectId, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished);
    }

    @Autobind
    dragLeaveHandler(_: DragEvent): void {
        const listELement = this.element.querySelector('ul')!;
        listELement.classList.remove('droppable')
    }

    private renderProjects() {
        this.element.addEventListener('dragover', this.dragOverHandler);
        this.element.addEventListener('drop', this.dropHandler);
        this.element.addEventListener('dragleave', this.dragLeaveHandler);

        const listEl = document.getElementById(`${this.type}`)! as HTMLUListElement;
        listEl.innerHTML = ''
        for (const projectItem of this.assignedProject) {
            new ProjectItem(this.element.querySelector('ul')!.id, projectItem);
        }
    }

    renderContent() {
        const listId = `${this.type}`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS'

    }

    configure(): void {
        projectState.addListener((projects: Project[]) => {
            const relevantProjects = projects.filter(project => {
                if (this.type === 'active')
                    return project.status === ProjectStatus.Active

                return project.status === ProjectStatus.Finished
            })
            this.assignedProject = relevantProjects;
            this.renderProjects();
        })

    }
}
