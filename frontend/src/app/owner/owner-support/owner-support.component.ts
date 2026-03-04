import { Component, OnInit } from '@angular/core';
import { OwnerService } from '../services/owner.service';

@Component({
    selector: 'app-owner-support',
    templateUrl: './owner-support.component.html',
    styleUrls: ['./owner-support.component.css']
})
export class OwnerSupportComponent implements OnInit {
    tickets: any[] = [];
    loading = true;
    showCreateModal = false;

    newTicket = {
        subject: '',
        description: '',
        priority: 'MEDIUM'
    };

    successMessage = '';
    errorMessage = '';

    constructor(private ownerService: OwnerService) { }

    ngOnInit(): void {
        this.fetchTickets();
    }

    fetchTickets(): void {
        this.loading = true;
        this.ownerService.getMyTickets().subscribe({
            next: (data) => {
                this.tickets = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error fetching tickets:', err);
                this.loading = false;
            }
        });
    }

    onSubmitTicket(): void {
        if (!this.newTicket.subject || !this.newTicket.description) return;

        this.ownerService.createTicket(this.newTicket).subscribe({
            next: () => {
                this.showCreateModal = false;
                this.newTicket = { subject: '', description: '', priority: 'MEDIUM' };
                this.showSuccess('Ticket submitted successfully.');
                this.fetchTickets();
            },
            error: (err) => {
                console.error('Error creating ticket:', err);
                this.showError('Failed to submit ticket.');
            }
        });
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'OPEN': return 'status-open';
            case 'IN_PROGRESS': return 'status-progress';
            case 'RESOLVED': return 'status-resolved';
            case 'CLOSED': return 'status-closed';
            default: return '';
        }
    }

    private showSuccess(msg: string): void {
        this.successMessage = msg;
        setTimeout(() => this.successMessage = '', 3000);
    }

    private showError(msg: string): void {
        this.errorMessage = msg;
        setTimeout(() => this.errorMessage = '', 5000);
    }
}
