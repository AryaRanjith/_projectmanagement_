import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OwnerService } from '../../services/owner.service';
import { AIService } from '../../../core/services/ai.service';

@Component({
    selector: 'app-project-details',
    templateUrl: './project-details.component.html',
    styleUrls: ['./project-details.component.css']
})
export class ProjectDetailsComponent implements OnInit {
    projectId: number | null = null;
    project: any = null;
    allProjects: any[] = [];
    tasks: any[] = [];
    loading = true;
    showProjectList = false;
    activeTab = 'tasks';

    // AI related
    aiAnalysis: string = '';
    aiLoading = false;
    aiSuggestions: any[] = [];
    showAISuggestions = false;

    // Stats
    stats = {
        total: 0,
        completed: 0,
        inProgress: 0,
        teamMembers: 0
    };

    constructor(
        private route: ActivatedRoute,
        public router: Router,
        private ownerService: OwnerService,
        private aiService: AIService
    ) { }

    ngOnInit(): void {
        this.loadAllProjects();
        this.route.params.subscribe(params => {
            this.projectId = +params['id'];
            if (this.projectId) {
                this.loadProjectDetails();
            }
        });
    }

    loadAllProjects(): void {
        this.ownerService.getProjects().subscribe(data => {
            this.allProjects = data;
        });
    }

    selectProject(project: any): void {
        this.showProjectList = false;
        this.router.navigate(['/owner/projects', project.id]);
    }

    loadProjectDetails(): void {
        if (!this.projectId) return;
        this.loading = true;

        this.ownerService.getProject(this.projectId).subscribe({
            next: (data) => {
                this.project = data;
                this.calculateStats();
                this.loadTasks();
            },
            error: (err) => {
                console.error('Error loading project:', err);
                this.loading = false;
            }
        });
    }

    loadTasks(): void {
        if (!this.projectId) return;
        this.ownerService.getTasks({ project: this.projectId }).subscribe({
            next: (data) => {
                this.tasks = data;
                this.loading = false;
                this.calculateStats();
            }
        });
    }

    calculateStats(): void {
        if (!this.tasks.length) return;
        this.stats.total = this.tasks.length;
        this.stats.completed = this.tasks.filter(t => t.status === 'DONE').length;
        this.stats.inProgress = this.tasks.filter(t => t.status === 'IN_PROGRESS').length;
        this.stats.teamMembers = this.project?.members_count || 1;
    }

    getTaskTypeIcon(type: string): string {
        switch (type?.toUpperCase()) {
            case 'FEATURE': return 'fa-bolt';
            case 'IMPROVEMENT': return 'fa-arrow-up';
            default: return 'fa-check-square';
        }
    }

    getTaskTypeClass(type: string): string {
        return type?.toLowerCase() || 'task';
    }

    getPriorityClass(priority: string): string {
        return priority?.toLowerCase() || 'medium';
    }

    getTaskStatusClass(status: string): string {
        return status?.toLowerCase().replace('_', '-') || 'todo';
    }

    openCreateModal(): void {
        // We'll use the existing modal if possible, but for now let's just log
        // In a real app we'd trigger a shared modal or navigate to a task creation page
        console.log('Open Create Task Modal');
        this.router.navigate(['/owner/tasks']);
    }

    editTask(task: any): void {
        console.log('Edit Task', task);
        // Navigate to tasks with prepopulated data or open modal
        this.router.navigate(['/owner/tasks']);
    }

    deleteTask(task: any): void {
        if (confirm(`Delete task "${task.title}"?`)) {
            this.ownerService.deleteTask(task.id).subscribe(() => {
                this.loadTasks();
            });
        }
    }

    generateAIHealthCheck(): void {
        if (!this.projectId) return;
        this.aiLoading = true;
        this.aiService.getProjectAnalysis(this.projectId).subscribe({
            next: (res) => {
                this.aiAnalysis = res.analysis;
                this.aiLoading = false;
            },
            error: () => {
                this.aiAnalysis = 'Failed to generate AI health check.';
                this.aiLoading = false;
            }
        });
    }

    suggestAITasks(): void {
        if (!this.project) return;
        this.aiLoading = true;
        this.aiService.suggestTasks(this.project.name, this.project.description).subscribe({
            next: (res) => {
                this.aiSuggestions = res;
                this.showAISuggestions = true;
                this.aiLoading = false;
            },
            error: () => {
                this.aiLoading = false;
                alert('Failed to get AI suggestions');
            }
        });
    }

    addAllSuggestedTasks(): void {
        if (!this.projectId) return;
        // In a real app, this would be a bulk create API call
        // For now, we'll just log and maybe add one for demonstration
        console.log('Adding suggested tasks:', this.aiSuggestions);
        alert('Suggested tasks would be added here!');
        this.showAISuggestions = false;
    }
}
