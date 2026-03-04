import { Component, OnInit } from '@angular/core';
import { AdminService } from '../services/admin.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-admin-organisation',
    templateUrl: './admin-organisation.component.html',
    styleUrls: ['./admin-organisation.component.css']
})
export class AdminOrganisationComponent implements OnInit {
    organisations: any[] = [];
    filteredOrganisations: any[] = [];
    loading = true;

    filterStatus: 'all' | 'active' | 'disabled' = 'all';
    searchTerm: string = '';
    successMessage: string = '';
    errorMessage: string = '';

    showCreateModal = false;
    creating = false;
    newOrg = {
        name: '',
        owner_email: '',
        owner_password: ''
    };

    constructor(
        private adminService: AdminService,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            this.searchTerm = params['search'] || '';
            this.fetchOrganisations();
        });
    }

    fetchOrganisations(): void {
        this.loading = true;
        this.adminService.getAllOrganisations(this.searchTerm).subscribe({
            next: (data) => {
                this.organisations = data;
                this.filteredOrganisations = data;
                this.applyFilter();
                this.loading = false;
            },
            error: (err) => {
                console.error('Error fetching organisations:', err);
                this.loading = false;
            }
        });
    }

    applyFilter(): void {
        let temp = this.organisations;

        // Filter by Status
        if (this.filterStatus === 'active') {
            // Include organisations that are platform-active, even if they have no paid plan yet
            temp = temp.filter(org => org.is_active);
        } else if (this.filterStatus === 'disabled') {
            // User requested: "suspeneded like admin whose company is disabled ..should see in disabled"
            temp = temp.filter(org => !org.is_active);
        }

        // Filter by Search
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            temp = temp.filter(org =>
                org.name.toLowerCase().includes(term) ||
                (org.owner_email && org.owner_email.toLowerCase().includes(term))
            );
        }

        this.filteredOrganisations = temp;
    }

    setFilter(status: 'all' | 'active' | 'disabled'): void {
        this.filterStatus = status;
        this.applyFilter();
    }

    onSearch(event: any): void {
        this.searchTerm = event.target.value;
        // Trigger backend search for better results
        this.fetchOrganisations();
    }

    // --- Actions ---

    toggleStatus(org: any, status: boolean): void {
        const originalStatus = org.is_active;

        // Optimistic Update
        org.is_active = status;
        org.updating = true;
        this.applyFilter();

        const obs = status ?
            this.adminService.activateOrganisation(org.id) :
            this.adminService.suspendOrganisation(org.id);

        obs.subscribe({
            next: () => {
                org.updating = false;
                this.showSuccess(`Organisation ${status ? 'enabled' : 'disabled'} successfully.`);
                this.adminService.getAllOrganisations().subscribe(data => {
                    this.organisations = data;
                    this.applyFilter();
                });
            },
            error: (err) => {
                org.is_active = originalStatus;
                org.updating = false;
                this.applyFilter();
                console.error('Action failed:', err);
                const msg = err.error?.error || err.message || 'Server error';
                this.showError(`Failed: ${msg}`);
            }
        });
    }

    private showSuccess(msg: string): void {
        this.successMessage = msg;
        setTimeout(() => this.successMessage = '', 3000);
    }

    private showError(msg: string): void {
        this.errorMessage = msg;
        setTimeout(() => this.errorMessage = '', 5000);
    }

    updateStatus(org: any, event: any): void {
        const action = event.target.value;
        if (!action) return;

        if (action === 'disable') {
            if (confirm(`Are you sure you want to disable ${org.name}?`)) {
                this.toggleStatus(org, false);
            }
        } else if (action === 'enable') {
            this.toggleStatus(org, true);
        }

        // Reset select to "Actions"
        event.target.value = '';
    }

    deleteOrganisation(org: any): void {
        if (confirm(`Are you sure you want to PERMANENTLY delete ${org.name}? This will remove all its members, projects, and data. This action cannot be undone.`)) {
            org.updating = true;
            this.adminService.deleteOrganisation(org.id).subscribe({
                next: () => {
                    this.showSuccess(`Organisation ${org.name} deleted successfully.`);
                    this.fetchOrganisations();
                },
                error: (err) => {
                    org.updating = false;
                    console.error('Delete failed:', err);
                    this.showError(`Failed: ${err.error?.error || 'Server error'}`);
                }
            });
        }
    }

    // Modal Methods
    openCreateModal(): void {
        this.showCreateModal = true;
        this.newOrg = { name: '', owner_email: '', owner_password: '' };
    }

    closeCreateModal(): void {
        this.showCreateModal = false;
    }

    createOrg(event: Event): void {
        event.preventDefault();
        this.creating = true;
        this.adminService.createOrganisation(this.newOrg).subscribe({
            next: () => {
                this.creating = false;
                this.showCreateModal = false;
                this.showSuccess('Organisation created successfully.');
                this.fetchOrganisations();
            },
            error: (err) => {
                this.creating = false;
                console.error('Creation failed:', err);
                this.showError(err.error?.error || 'Failed to create organisation');
            }
        });
    }
}
