import { Component, OnInit } from '@angular/core';
import { AdminService } from '../services/admin.service';

@Component({
    selector: 'app-admin-support',
    templateUrl: './admin-support.component.html',
    styleUrls: ['./admin-support.component.css']
})
export class AdminSupportComponent implements OnInit {
    tickets: any[] = [];
    loading = true;
    replyMessage: string = '';
    selectedTicket: any = null;

    constructor(private adminService: AdminService) { }

    ngOnInit(): void {
        this.fetchTickets();
    }

    fetchTickets(): void {
        this.loading = true;
        this.adminService.getAllTickets().subscribe({
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

    openTicket(ticket: any): void {
        this.selectedTicket = ticket;
        this.replyMessage = '';
    }

    closeTicket(ticketId: number): void {
        if (confirm('Are you sure you want to close this ticket?')) {
            this.adminService.closeTicket(ticketId).subscribe({
                next: () => {
                    this.fetchTickets(); // Refresh
                    if (this.selectedTicket?.id === ticketId) {
                        this.selectedTicket = null;
                    }
                },
                error: (err) => console.error(err)
            });
        }
    }

    sendReply(): void {
        if (!this.selectedTicket || !this.replyMessage.trim()) return;

        this.adminService.replyTicket(this.selectedTicket.id, this.replyMessage).subscribe({
            next: (res) => {
                // Optimistically update or refresh
                // For simplicity, refresh to get new reply in list if we displayed it
                this.replyMessage = '';
                this.selectedTicket = null; // Close detail
                this.fetchTickets();
                alert('Reply sent successfully');
            },
            error: (err) => console.error(err)
        });
    }
}
