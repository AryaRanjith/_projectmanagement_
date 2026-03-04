import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../services/employee.service';

@Component({
    selector: 'app-employee-dashboard',
    templateUrl: './employee-dashboard.component.html',
    styleUrls: ['./employee-dashboard.component.css']
})
export class EmployeeDashboardComponent implements OnInit {
    tasks: any[] = [];
    stats: any = null;
    loading = true;

    // Innovative Feature: Focus Timer
    activeFocusTaskId: number | null = null;
    focusStartTime: number | null = null;

    constructor(private employeeService: EmployeeService) { }

    ngOnInit(): void {
        this.loadDashboard();

        // Restore focus timer if exists
        const storedFocus = localStorage.getItem('focusTask');
        if (storedFocus) {
            const { taskId, startTime } = JSON.parse(storedFocus);
            this.activeFocusTaskId = taskId;
            this.focusStartTime = startTime;
        }
    }

    loadDashboard(): void {
        this.loading = true;
        this.employeeService.getMyDashboard().subscribe({
            next: (data) => {
                this.stats = data;
                this.tasks = (data.tasks || []).map((t: any) => ({
                    ...t,
                    originalStatus: t.status, // Track original for dirty check
                    originalProgress: t.progress // Track original progress
                }));
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading employee dashboard:', err);
                this.loading = false;
            }
        });
    }

    updateStatus(task: any): void {
        task.updating = true;

        const statusChanged = task.status !== task.originalStatus;
        const progressChanged = task.progress != task.originalProgress;

        if (!statusChanged && !progressChanged) {
            task.updating = false;
            return;
        }

        // If progress changed, update it first
        if (progressChanged) {
            this.employeeService.updateTaskProgress(task.id, task.progress).subscribe({
                next: (res) => {
                    task.originalProgress = task.progress;

                    // If status ALSO changed, update it next
                    if (statusChanged) {
                        this.performStatusUpdate(task);
                    } else {
                        // Only progress changed
                        task.updating = false;
                        task.progressSaved = true;
                        setTimeout(() => task.progressSaved = false, 2000);

                        // Sync status if backend auto-changed it (e.g. 100% -> DONE)
                        if (res.status && res.status !== task.status) {
                            task.status = res.status;
                            task.originalStatus = res.status;
                        }
                    }
                },
                error: (err) => {
                    console.error('Progress update failed', err);
                    task.updating = false;
                    alert('Failed to update progress');
                }
            });
        } else {
            // Only status changed
            this.performStatusUpdate(task);
        }
    }

    private performStatusUpdate(task: any): void {
        this.employeeService.updateTaskStatus(task.id, task.status).subscribe({
            next: (res) => {
                task.status = res.status;
                task.progress = res.progress;
                task.originalStatus = res.status;
                task.originalProgress = res.progress;
                task.updating = false;

                if (res.status === 'DONE') this.loadDashboard();
            },
            error: (err) => {
                console.error('Status update failed', err);
                task.updating = false;
                alert('Failed to update status');
            }
        });
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'TODO': return '#5e6c84';
            case 'IN_PROGRESS': return '#00b0d8';
            case 'REVIEW': return '#ffab00';
            case 'DONE': return '#00a850';
            default: return '#333';
        }
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'TODO': return 'Pending';
            case 'IN_PROGRESS': return 'In Progress';
            case 'REVIEW': return 'Under Review';
            case 'DONE': return 'Completed';
            default: return 'Pending';
        }
    }

    updateProgress(task: any): void {
        // Just local update to enable button
        // No API call here
    }

    // Live update while dragging
    onProgressDragging(task: any, event: any): void {
        task.progress = event.target.value;
    }

    // API call on release
    onProgressChange(task: any, event: any): void {
        const newProgress = event.target.value;
        task.progress = newProgress;
        task.updating = true;

        this.employeeService.updateTaskProgress(task.id, newProgress).subscribe({
            next: (res) => {
                task.progress = res.progress;
                task.status = res.status;
                task.originalProgress = res.progress;
                task.originalStatus = res.status;
                task.updating = false;
            },
            error: (err) => {
                console.error('Progress update failed', err);
                task.updating = false;
                // Revert
                task.progress = task.originalProgress;
                alert('Failed to update progress');
            }
        });
    }

    // Innovative: Focus Timer
    isFocusMode(taskId: number): boolean {
        return this.activeFocusTaskId === taskId;
    }

    toggleFocusMode(taskId: number): void {
        if (this.activeFocusTaskId === taskId) {
            // Stop
            const duration = Math.floor((Date.now() - (this.focusStartTime || 0)) / 1000 / 60);
            if (duration > 0) alert(`Great job! You focused on this task for ${duration} minutes.`);

            this.activeFocusTaskId = null;
            this.focusStartTime = null;
            localStorage.removeItem('focusTask');
        } else {
            // Start
            if (this.activeFocusTaskId) {
                alert('You already have a focused task. Stop it first.');
                return;
            }
            this.activeFocusTaskId = taskId;
            this.focusStartTime = Date.now();
            localStorage.setItem('focusTask', JSON.stringify({
                taskId,
                startTime: this.focusStartTime
            }));
        }
    }
}
