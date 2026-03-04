import { Component, OnInit } from '@angular/core';
import { OwnerService } from '../services/owner.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-owner-projects',
    templateUrl: './owner-projects.component.html',
    styleUrls: ['./owner-projects.component.css']
})
export class OwnerProjectsComponent implements OnInit {
    projects: any[] = [];
    loading = true;
    showModal = false;
    editMode = false;
    saving = false;
    searchTerm = '';

    projectForm = {
        id: null as number | null,
        name: '',
        description: '',
        status: 'PLANNING',
        start_date: '',
        end_date: ''
    };

    minDate = '';
    errorMessage = '';

    statusOptions = [
        { value: 'PLANNING', label: 'Planning' },
        { value: 'ACTIVE', label: 'Active' },
        { value: 'ON_HOLD', label: 'On Hold' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'CANCELLED', label: 'Cancelled' }
    ];

    constructor(
        private ownerService: OwnerService,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.minDate = new Date().toISOString().split('T')[0];

        this.route.queryParams.subscribe(params => {
            this.searchTerm = params['search'] || '';
            this.loadProjects();
        });
    }

    loadProjects(): void {
        this.loading = true;
        this.ownerService.getProjects(this.searchTerm).subscribe({
            next: (data) => {
                this.projects = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading projects:', err);
                this.loading = false;
            }
        });
    }

    openCreateModal(): void {
        this.editMode = false;
        this.errorMessage = '';
        this.projectForm = {
            id: null,
            name: '',
            description: '',
            status: 'PLANNING',
            start_date: this.minDate,
            end_date: ''
        };
        this.showModal = true;
    }

    openEditModal(project: any): void {
        this.editMode = true;
        this.errorMessage = '';
        this.projectForm = {
            id: project.id,
            name: project.name,
            description: project.description || '',
            status: project.status,
            start_date: project.start_date || '',
            end_date: project.end_date || ''
        };
        this.showModal = true;
    }

    closeModal(): void {
        this.showModal = false;
    }

    saveProject(): void {
        this.saving = true;
        const data = {
            name: this.projectForm.name,
            description: this.projectForm.description,
            status: this.projectForm.status,
            start_date: this.projectForm.start_date || null,
            end_date: this.projectForm.end_date || null
        };

        const obs = this.editMode && this.projectForm.id
            ? this.ownerService.updateProject(this.projectForm.id, data)
            : this.ownerService.createProject(data);

        obs.subscribe({
            next: () => {
                this.saving = false;
                this.closeModal();
                this.loadProjects();
            },
            error: (err) => {
                this.saving = false;
                this.errorMessage = err.error?.error || err.error?.detail || 'Failed to save project. Ensure you have an active organization.';
                console.error('Error saving project:', err);
            }
        });
    }

    deleteProject(project: any): void {
        if (confirm(`Delete "${project.name}"? This cannot be undone.`)) {
            this.ownerService.deleteProject(project.id).subscribe({
                next: () => this.loadProjects(),
                error: (err) => console.error('Error deleting:', err)
            });
        }
    }

    getStatusClass(status: string): string {
        return status.toLowerCase().replace('_', '-');
    }
}
