import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OwnerService } from '../services/owner.service';
import { Subscription, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-owner-employees',
    templateUrl: './owner-employees.component.html',
    styleUrls: ['./owner-employees.component.css']
})
export class OwnerEmployeesComponent implements OnInit, OnDestroy {
    employees: any[] = [];
    pendingInvitations: any[] = [];
    loading = true;
    showInviteModal = false;

    inviteEmail = '';
    inviteRole = 'ASSIGNEE';
    inviting = false;
    inviteError = '';
    inviteSuccess = '';

    private updateSubscription: Subscription = new Subscription();

    constructor(
        private ownerService: OwnerService,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        // Initial load + Poll every 30 seconds
        this.updateSubscription = interval(30000)
            .pipe(
                startWith(0),
                switchMap(() => this.ownerService.getEmployees())
            )
            .subscribe({
                next: (data) => {
                    this.employees = data.employees || [];
                    this.pendingInvitations = data.pending_invitations || [];
                    // Only hide loading on first load
                    if (this.loading) this.loading = false;
                },
                error: (err) => {
                    console.error('Fetch error:', err);
                    this.loading = false;
                }
            });

        this.route.queryParams.subscribe(params => {
            if (params['invite'] === 'true') this.openInviteModal();
        });
    }

    ngOnDestroy(): void {
        if (this.updateSubscription) {
            this.updateSubscription.unsubscribe();
        }
    }

    loadEmployees(): void {
        // specific trigger if needed (e.g. after action)
        this.loading = true;
        this.ownerService.getEmployees().subscribe({
            next: (data) => {
                this.employees = data.employees || [];
                this.pendingInvitations = data.pending_invitations || [];
                this.loading = false;
            },
            error: (err) => {
                console.error('Fetch error:', err);
                this.loading = false;
            }
        });
    }

    openInviteModal(): void {
        this.showInviteModal = true;
        this.inviteEmail = '';
        this.inviteRole = 'ASSIGNEE';
        this.inviteError = '';
        this.inviteSuccess = '';
    }

    closeInviteModal(): void {
        this.showInviteModal = false;
    }

    sendInvite(): void {
        if (!this.inviteEmail) {
            this.inviteError = 'Email is required';
            return;
        }

        this.inviting = true;
        this.inviteError = '';

        this.ownerService.inviteEmployee(this.inviteEmail, this.inviteRole).subscribe({
            next: (res) => {
                if (res.email_sent) {
                    this.inviteSuccess = 'Invitation sent successfully!';
                    setTimeout(() => this.closeInviteModal(), 2000);
                } else {
                    this.inviteError = 'Invitation created, but failed to send email.';
                }
                this.inviting = false;
                this.loadEmployees();
            },
            error: (err) => {
                this.inviteError = err.error?.error || 'Failed to send invitation';
                this.inviting = false;
            }
        });
    }

    toggleEmployee(employee: any): void {
        this.ownerService.toggleEmployee(employee.id).subscribe({
            next: (res) => employee.is_active_employee = res.is_active_employee,
            error: (err) => console.error('Toggle error:', err)
        });
    }

    cancelInvitation(invitation: any): void {
        if (confirm(`Cancel invitation for ${invitation.email}?`)) {
            this.ownerService.cancelInvitation(invitation.id).subscribe({
                next: () => this.loadEmployees(),
                error: (err) => console.error('Cancel error:', err)
            });
        }
    }

    getRoleBadgeClass(role: string): string {
        return 'role-assignee';
    }
}
