import { Component, OnInit, OnDestroy } from '@angular/core';
import { OwnerService } from '../services/owner.service';
import { Subscription, interval, of } from 'rxjs';
import { startWith, switchMap, catchError } from 'rxjs/operators';

@Component({
    selector: 'app-owner-task-tracker',
    templateUrl: './owner-task-tracker.component.html',
    styleUrls: ['./owner-task-tracker.component.css']
})
export class OwnerTaskTrackerComponent implements OnInit, OnDestroy {
    tasks: any[] = [];
    projects: any[] = [];
    loading = true;
    viewMode: 'table' | 'tracker' = 'table'; // Forced to table
    activeTab = 'tasks';

    filterProject = '';
    filterStatus = '';
    filterPriority = ''; // New filter
    filterAssignee = ''; // New filter
    searchTerm = '';

    stats = {
        total: 0,
        completed: 0,
        inProgress: 0,
        teamMembers: 0
    };

    // Calendar
    currentMonth: Date = new Date();
    calendarDays: any[] = [];
    selectedDateTasks: any[] = [];
    weekDays = ['Sun', 'Mon', 'Tue', 'Thu', 'Fri', 'Sat'];


    analytics: {
        byStatus: { [key: string]: number },
        byPriority: { [key: string]: number },
        byAssignee: { [key: string]: number },
        avgProgressStatus: { [key: string]: number },
        avgProgressPriority: { [key: string]: number },
        completionRate: number
    } = {
            byStatus: {},
            byPriority: {},
            byAssignee: {},
            avgProgressStatus: {},
            avgProgressPriority: {},
            completionRate: 0
        };

    // Settings (Edit Task)
    editingTask: any = null;
    successMessage = '';

    statusOptions = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];

    // Analytics Visualization
    getChartGradient(data: any, type: 'status' | 'priority'): string {
        const total = this.stats.total;
        if (total === 0) return 'conic-gradient(#e2e8f0 0% 100%)';

        let gradientParts: string[] = [];
        let currentPercent = 0;

        const colors: any = type === 'status' ? {
            'TODO': '#94a3b8',
            'IN_PROGRESS': '#0ea5e9',
            'REVIEW': '#f59e0b',
            'DONE': '#10b981'
        } : {
            'LOW': '#22c55e',
            'MEDIUM': '#eab308',
            'HIGH': '#f97316',
            'URGENT': '#ef4444'
        };

        // Ensure we iterate in specific order for consistency
        const keys = type === 'status' ? this.statusOptions : this.priorityOptions;

        keys.forEach(key => {
            const val = data[key] || 0;
            if (val > 0) {
                const percent = (val / total) * 100;
                const endPercent = currentPercent + percent;
                gradientParts.push(`${colors[key]} ${currentPercent}% ${endPercent}%`);
                currentPercent = endPercent;
            }
        });

        if (gradientParts.length === 0) return 'conic-gradient(#e2e8f0 0% 100%)';

        return `conic-gradient(${gradientParts.join(', ')})`;
    }

    getPercentage(val: number): number {
        return this.stats.total > 0 ? (val / this.stats.total) * 100 : 0;
    }

    getColor(key: string, type: 'status' | 'priority'): string {
        const colors: any = type === 'status' ? {
            'TODO': '#94a3b8',
            'IN_PROGRESS': '#3b82f6', // Bright Blue
            'REVIEW': '#f97316', // Orange
            'DONE': '#10b981' // Green
        } : {
            'LOW': '#60a5fa', // Light Blue
            'MEDIUM': '#8b5cf6', // Purple
            'HIGH': '#facc15', // Yellow (as requested)
            'URGENT': '#ef4444' // Red
        };
        return colors[key] || '#cbd5e1';
    }
    priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    assignees: any[] = []; // List of employees

    private updateSubscription: Subscription = new Subscription();

    constructor(private ownerService: OwnerService) { }

    ngOnInit(): void {
        this.loadProjects();
        this.loadAssignees();
        this.startPolling();
        this.generateCalendar();
    }

    ngOnDestroy(): void {
        if (this.updateSubscription) {
            this.updateSubscription.unsubscribe();
        }
    }

    loadAssignees(): void {
        this.ownerService.getEmployees().subscribe(data => {
            // Check if data is array or object with employees field
            if (Array.isArray(data)) {
                this.assignees = data;
            } else if (data.employees) {
                this.assignees = data.employees;
            } else if (data.data) {
                this.assignees = data.data;
            }
        });
    }

    loadProjects(): void {
        this.ownerService.getProjects().subscribe(p => {
            this.projects = p;
            // Requirement: "like when select project sepecific project type load"
            // Auto-select the first project if available so the view is specific
            if (this.projects.length > 0 && !this.filterProject) {
                this.filterProject = this.projects[0].id;
            }
            this.startPolling();
        });
    }

    startPolling(): void {
        // Cancel existing if any (e.g. when filters change)
        if (this.updateSubscription) this.updateSubscription.unsubscribe();

        this.updateSubscription = interval(15000) // Poll every 15s for task tracker
            .pipe(
                // Trigger immediately
                startWith(0),
                switchMap(() => {
                    const filters: any = {};
                    if (this.filterProject) filters.project = this.filterProject;
                    if (this.filterStatus) filters.status = this.filterStatus;
                    if (this.filterPriority) filters['priority'] = this.filterPriority; // Need backend support?
                    if (this.filterAssignee) filters.assignee = this.filterAssignee;

                    // If no project selected, maybe don't load anything or load all?
                    // Request implies specific project focus. 
                    // But we should allow empty filter for "All".
                    // Client side filtering for priority as getTasks might not support it yet
                    // But let's try passing it. Actually OwnerTaskViewSet supports 'assignee', 'status', 'project'
                    // It does NOT support 'priority' in the viewset get_queryset currently.
                    // I will filter client side for priority if needed or update backend. 
                    // Let's filter client side to be safe for now in the subscribe block

                    return this.ownerService.getTasks(filters).pipe(
                        catchError(err => {
                            console.error('Polling error', err);
                            return of(null);
                        })
                    );
                })
            )
            .subscribe(data => {
                if (data) {
                    let filtered = data;
                    if (this.filterPriority) {
                        filtered = data.filter((t: any) => t.priority === this.filterPriority);
                    }
                    this.tasks = filtered;
                    this.calculateStats();
                    this.calculateAnalytics();
                    this.generateCalendar(); // Refresh marks
                    this.loading = false;
                }
            });
    }

    // Triggered by filter change
    loadTasks(): void {
        this.loading = true;
        this.startPolling(); // Restart polling with new filters
    }

    calculateStats(): void {
        this.stats.total = this.tasks.length;
        this.stats.completed = this.tasks.filter(t => t.status === 'DONE').length;
        this.stats.inProgress = this.tasks.filter(t => t.status === 'IN_PROGRESS').length;
        this.stats.teamMembers = new Set(this.tasks.map(t => t.assignee)).size || 0;
    }

    calculateAnalytics(): void {
        const statuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
        const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

        // By Status
        this.analytics.byStatus = {};
        this.analytics.avgProgressStatus = {};
        statuses.forEach(status => {
            const tasksInStatus = this.tasks.filter(t => t.status === status);
            this.analytics.byStatus[status] = tasksInStatus.length;

            const totalProgress = tasksInStatus.reduce((acc, t) => acc + (t.progress || 0), 0);
            this.analytics.avgProgressStatus[status] = tasksInStatus.length > 0 ? (totalProgress / tasksInStatus.length) : 0;
        });

        // By Priority
        this.analytics.byPriority = {};
        this.analytics.avgProgressPriority = {};
        priorities.forEach(priority => {
            const tasksInPriority = this.tasks.filter(t => t.priority === priority);
            this.analytics.byPriority[priority] = tasksInPriority.length;

            const totalProgress = tasksInPriority.reduce((acc, t) => acc + (t.progress || 0), 0);
            this.analytics.avgProgressPriority[priority] = tasksInPriority.length > 0 ? (totalProgress / tasksInPriority.length) : 0;
        });

        // By Assignee
        const assigneeCounts: any = {};
        this.tasks.forEach(t => {
            const name = t.assignee_name || 'Unassigned';
            assigneeCounts[name] = (assigneeCounts[name] || 0) + 1;
        });
        this.analytics.byAssignee = assigneeCounts;

        // Completion Rate
        this.analytics.completionRate = this.stats.total > 0
            ? Math.round((this.stats.completed / this.stats.total) * 100)
            : 0;
    }

    // Calendar Logic
    generateCalendar(): void {
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days = [];
        const padding = firstDay.getDay(); // 0 is Sunday

        // Padding days
        for (let i = 0; i < padding; i++) {
            days.push({ day: null });
        }

        // Real days
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const date = new Date(year, month, i);
            // Fix: Create local YYYY-MM-DD string to match backend date format
            const yearStr = date.getFullYear();
            const monthStr = ('0' + (date.getMonth() + 1)).slice(-2);
            const dayStr = ('0' + date.getDate()).slice(-2);
            const dateStr = `${yearStr}-${monthStr}-${dayStr}`;

            const tasksDue = this.tasks.filter(t => t.due_date === dateStr);

            days.push({
                day: i,
                date: date,
                tasks: tasksDue,
                hasDeadline: tasksDue.length > 0
            });
        }

        this.calendarDays = days;
    }

    changeMonth(offset: number): void {
        this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + offset, 1);
        this.generateCalendar();
    }

    selectDate(day: any): void {
        if (!day.day) return;
        this.selectedDateTasks = day.tasks;
    }

    // Settings (Edit Task) Logic
    editTask(task: any): void {
        // Clone to avoid immediate effect
        this.editingTask = { ...task };
        this.activeTab = 'settings';
        this.successMessage = '';
    }

    saveTask(): void {
        if (!this.editingTask) return;

        this.ownerService.updateTask(this.editingTask.id, this.editingTask).subscribe({
            next: (res) => {
                this.successMessage = 'Task updated successfully!';
                this.startPolling(); // Refresh data
                setTimeout(() => {
                    this.editingTask = null;
                    this.successMessage = '';
                }, 1500);
            },
            error: (err) => alert('Failed to update task')
        });
    }

    cancelEdit(): void {
        this.editingTask = null;
        this.successMessage = '';
    }

    getSelectedProjectName(): string {
        const p = this.projects.find(proj => proj.id == +this.filterProject);
        return p ? p.name : 'All Projects Tracking';
    }

    getSelectedProjectStatus(): string {
        const p = this.projects.find(proj => proj.id == +this.filterProject);
        return p ? p.status : 'ACTIVE';
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

    getStatusClass(status: string): string {
        return status.toLowerCase().replace('_', '-');
    }

    getPriorityClass(priority: string): string {
        return priority.toLowerCase();
    }

    getTasksByStatus(status: string): any[] {
        return this.tasks.filter(t => t.status === status);
    }
}
