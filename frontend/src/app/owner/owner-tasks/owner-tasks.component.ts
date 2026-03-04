import { Component, OnInit } from '@angular/core';
import { OwnerService } from '../services/owner.service';
import { AIService } from '../../core/services/ai.service';

@Component({
    selector: 'app-owner-tasks',
    templateUrl: './owner-tasks.component.html',
    styleUrls: ['./owner-tasks.component.css']
})
export class OwnerTasksComponent implements OnInit {
    tasks: any[] = [];
    projects: any[] = [];
    employees: any[] = [];
    loading = true;
    showModal = false;
    editMode = false;
    viewMode: 'table' | 'tracker' = 'tracker';
    activeTab = 'tasks';
    saving = false;
    errorMessage = '';
    aiEnhancing = false;


    filterProject = '';
    filterStatus = '';
    searchTerm = '';

    taskForm = {
        id: null as number | null,
        project: null as number | null,
        title: '',
        description: '',
        assignee: null as number | null,
        priority: 'MEDIUM',
        status: 'TODO',
        task_type: 'TASK',
        progress: 0,
        due_date: ''
    };

    priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    statusOptions = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
    typeOptions = ['TASK', 'IMPROVEMENT'];
    minDate = '';

    constructor(
        private ownerService: OwnerService,
        private aiService: AIService
    ) {
        // Fix: Use local date for minDate validation to prevent UTC mismatch
        const today = new Date();
        const year = today.getFullYear();
        const month = ('0' + (today.getMonth() + 1)).slice(-2);
        const day = ('0' + today.getDate()).slice(-2);
        this.minDate = `${year}-${month}-${day}`;
    }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.loading = true;
        this.ownerService.getProjects().subscribe(p => this.projects = p);
        this.ownerService.getEmployees().subscribe(e => this.employees = e.employees || []);
        this.loadTasks();
    }

    loadTasks(): void {
        const filters: any = {};
        if (this.filterProject) filters.project = this.filterProject;
        if (this.filterStatus) filters.status = this.filterStatus;

        this.ownerService.getTasks(filters).subscribe({
            next: (data) => {
                this.tasks = data;
                this.loading = false;
            },
            error: () => this.loading = false
        });
    }



    openCreateModal(): void {
        this.editMode = false;
        this.errorMessage = '';
        this.taskForm = {
            id: null,
            project: this.filterProject ? Number(this.filterProject) : null,
            title: '', description: '',
            assignee: null, priority: 'MEDIUM', status: 'TODO', task_type: 'TASK', progress: 0, due_date: ''
        };
        this.showModal = true;
    }

    openEditModal(task: any): void {
        this.editMode = true;
        this.errorMessage = '';
        this.taskForm = { ...task, due_date: task.due_date || '' };
        this.showModal = true;
    }

    closeModal(): void { this.showModal = false; }

    saveTask(): void {
        if (!this.taskForm.title || !this.taskForm.project) return;

        this.saving = true;
        const action = this.editMode && this.taskForm.id
            ? this.ownerService.updateTask(this.taskForm.id, this.taskForm)
            : this.ownerService.createTask(this.taskForm);

        action.subscribe({
            next: () => {
                this.saving = false;
                this.closeModal();
                this.loadTasks();
            },
            error: (err) => {
                this.saving = false;
                this.errorMessage = err.error?.error || err.error?.detail || 'Failed to save task. Please try again.';
                console.error('Error saving task:', err);
            }
        });
    }

    deleteTask(task: any): void {
        if (confirm(`Delete "${task.title}"?`)) {
            this.ownerService.deleteTask(task.id).subscribe(() => this.loadTasks());
        }
    }

    getPriorityClass(priority: string): string {
        return priority.toLowerCase();
    }

    getStatusClass(status: string): string {
        return status.toLowerCase().replace('_', '-');
    }

    getTasksByStatus(status: string): any[] {
        let filtered = this.tasks.filter(t => t.status === status);
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(t =>
                t.title?.toLowerCase().includes(term) ||
                t.project_name?.toLowerCase().includes(term)
            );
        }
        return filtered;
    }

    onSearch(): void {
        this.loadTasks();
    }

    enhanceDescription(): void {
        if (!this.taskForm.title) {
            alert('Please enter a task title first.');
            return;
        }

        this.aiEnhancing = true;
        this.aiService.refineDescription(this.taskForm.title, this.taskForm.description).subscribe({
            next: (res) => {
                this.taskForm.description = res.description;
                this.aiEnhancing = false;
            },
            error: () => {
                this.aiEnhancing = false;
                alert('Failed to enhance description with AI.');
            }
        });
    }
}
