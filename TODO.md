- [ ] **Appointments Router** (`packages/api/src/routers/appointments.ts`)

  - [ ] Implement `create` mutation - Insert appointment into database
  - [ ] Implement `update` mutation - Update appointment status and notes
  - [ ] Add validation for appointment time conflicts
  - [ ] Add patient-clinician relationship validation

- [ ] **Medical Records Router** (`packages/api/src/routers/medicalRecords.ts`)

  - [ ] Implement `create` mutation - Insert medical record
  - [ ] Implement `update` mutation - Update diagnosis and notes
  - [ ] Add authorization check (only assigned clinician can create/update)

- [ ] **Prescriptions Router** (`packages/api/src/routers/prescriptions.ts`)

  - [ ] Implement `create` mutation - Insert prescription linked to appointment
  - [ ] Implement `update` mutation - Update prescription status
  - [ ] Add validation for expiry dates
  - [ ] Auto-expire prescriptions (cron job or on-fetch check)

- [ ] **Patients Router** (`packages/api/src/routers/patients.ts`)

  - [ ] Implement `addPatient` mutation - Create clinician-patient relationship
  - [ ] Implement `removePatient` mutation - Delete relationship
  - [ ] Add duplicate relationship check

- [ ] **Users Router** (`packages/api/src/routers/users.ts`)

  - [ ] Implement `updateRole` mutation - Update user role (admin only)
  - [ ] Implement `delete` mutation - Soft delete or hard delete user
  - [ ] Add cascade delete handling for related records

- [ ] **Appointment Form** (`apps/web/src/components/dashboard/appointment-form.tsx`)

  - [ ] Wire up to `appointments.create` mutation
  - [ ] Add form validation
  - [ ] Add success/error toast notifications
  - [ ] Reset form after successful submission

- [ ] **Medical Record Form** (`apps/web/src/components/dashboard/record-form.tsx`)

  - [ ] Wire up to `medicalRecords.create` mutation
  - [ ] Add form validation
  - [ ] Add success/error toast notifications

- [ ] **Prescription Form** (`apps/web/src/components/dashboard/prescription-form.tsx`)

  - [ ] Wire up to `prescriptions.create` mutation
  - [ ] Add medication autocomplete/dropdown
  - [ ] Add dosage validation
  - [ ] Add expiry date validation (must be future date)

- [ ] **Clinician Pages**

  - [ ] `dashboard/clinician/page.tsx` - Fetch stats and recent appointments
  - [ ] `dashboard/clinician/appointments/page.tsx` - Fetch appointments list
  - [ ] `dashboard/clinician/patients/page.tsx` - Fetch patients list
  - [ ] `dashboard/clinician/records/page.tsx` - Fetch medical records
  - [ ] `dashboard/clinician/prescriptions/page.tsx` - Fetch prescriptions

- [ ] **Patient Pages**

  - [ ] `dashboard/patient/page.tsx` - Fetch stats, appointments, prescriptions
  - [ ] `dashboard/patient/appointments/page.tsx` - Fetch appointments list
  - [ ] `dashboard/patient/records/page.tsx` - Fetch medical records
  - [ ] `dashboard/patient/prescriptions/page.tsx` - Fetch prescriptions

- [ ] **Admin Pages**
  - [ ] `dashboard/admin/page.tsx` - Fetch user stats and activity
  - [ ] `dashboard/admin/users/page.tsx` - Fetch all users

Current data tables are basic. Add advanced features:

- [ ] **Pagination** (`apps/web/src/components/dashboard/data-table.tsx`)

  - [ ] Implement client-side pagination
  - [ ] Add page size selector (10, 25, 50, 100)
  - [ ] Add page navigation (first, prev, next, last)
  - [ ] Consider server-side pagination for large datasets

- [ ] **Sorting**

  - [ ] Add column header click sorting
  - [ ] Support ascending/descending sort
  - [ ] Add visual indicators for sort direction

- [ ] **Filtering**

  - [ ] Implement status filters (already have UI, need logic)
  - [ ] Add date range filtering for appointments
  - [ ] Add multi-column filtering

- [ ] **Clinician Patients Search** (`dashboard/clinician/patients/page.tsx`)

  - [ ] Implement client-side search by name/email
  - [ ] Consider debounced server-side search for large datasets

- [ ] **Admin Users Search** (`dashboard/admin/users/page.tsx`)

  - [ ] Implement client-side search by name/email/role
  - [ ] Add advanced filters (email verified, creation date, etc.)

- [ ] **Appointment Details Modal**

  - [ ] View full appointment information
  - [ ] Show patient/clinician details
  - [ ] Display appointment notes
  - [ ] Add edit/cancel actions

- [ ] **Medical Record Details Modal**

  - [ ] View full diagnosis and notes
  - [ ] Show clinician information
  - [ ] Add edit capability (clinician only)

- [ ] **Prescription Details Modal**

  - [ ] View full prescription information
  - [ ] Show medication details
  - [ ] Display instructions and refills
  - [ ] Add status update actions

- [ ] **Confirmation Dialogs**

  - [ ] Delete appointment confirmation
  - [ ] Cancel appointment confirmation
  - [ ] Update user role confirmation (admin)
  - [ ] Delete user confirmation (admin)

- [ ] **Loading States**

  - [ ] Add skeleton loaders for data tables
  - [ ] Add loading spinners for form submissions
  - [ ] Add page-level loading states

- [ ] **Error Handling**

  - [ ] Add error boundaries for pages
  - [ ] Add toast notifications for errors
  - [ ] Add retry mechanisms for failed requests
  - [ ] Add better error messages from tRPC procedures

- [ ] **Lab Results Table**

  - [ ] Create schema in `packages/db/src/schema/healthcare.ts`
  - [ ] Create migration
  - [ ] Add tRPC router for lab results
  - [ ] Add UI pages for viewing/managing lab results

- [ ] **Billing Table**

  - [ ] Create schema in `packages/db/src/schema/healthcare.ts`
  - [ ] Create migration
  - [ ] Add tRPC router for billing
  - [ ] Add UI pages for viewing/managing billing

- [ ] **Real-time Notifications**

  - [ ] Add notification table to database
  - [ ] Create notification service
  - [ ] Add notification bell icon to header
  - [ ] Show unread count badge
  - [ ] Implement notification preferences

- [ ] **Email Notifications**

  - [ ] Appointment reminders (24 hours before)
  - [ ] New prescription notifications
  - [ ] Medical record updates
  - [ ] System announcements (admin)

- [ ] **Appointment Calendar**

  - [ ] Add calendar view for appointments
  - [ ] Drag-and-drop appointment scheduling
  - [ ] Time slot availability checking
  - [ ] Recurring appointment support

- [ ] **Clinician Analytics**

  - [ ] Patient visit trends
  - [ ] Common diagnoses chart
  - [ ] Prescription patterns
  - [ ] Appointment completion rates

- [ ] **Admin Analytics**

  - [ ] User growth charts
  - [ ] System usage statistics
  - [ ] Most active clinicians/patients
  - [ ] Export reports to CSV/PDF

- [ ] **Medical Documents**

  - [ ] Add file upload for medical records
  - [ ] Support PDF, images, documents
  - [ ] File preview/download
  - [ ] Storage integration (S3, Cloudinary, etc.)

- [ ] **Profile Pictures**

  - [ ] User avatar upload
  - [ ] Image cropping/resizing
  - [ ] Default avatar generation

- [ ] **Audit Logging**

  - [ ] Log all data modifications
  - [ ] Track who accessed what records
  - [ ] Admin audit trail viewer

- [ ] **Two-Factor Authentication**

  - [ ] Add 2FA setup for users
  - [ ] SMS or authenticator app support
  - [ ] Backup codes

- [ ] **Session Management**

  - [ ] Show active sessions
  - [ ] Remote session termination
  - [ ] Session timeout configuration

- [ ] **Keyboard Shortcuts**

  - [ ] Quick search (Cmd/Ctrl + K)
  - [ ] Navigate between pages
  - [ ] Create new records

- [ ] **Bulk Actions**

  - [ ] Bulk appointment cancellation
  - [ ] Bulk status updates
  - [ ] Bulk exports

- [ ] **Responsive Design**

  - [ ] Mobile-optimized data tables
  - [ ] Touch-friendly forms
  - [ ] Mobile navigation menu

- [ ] **Dark Mode**

  - [ ] Already have theme toggle, ensure all new components support it
  - [ ] Add theme persistence

- [ ] **Unit Tests**

  - [ ] Test tRPC procedures
  - [ ] Test form validation
  - [ ] Test utility functions

- [ ] **Integration Tests**

  - [ ] Test API endpoints
  - [ ] Test authentication flows
  - [ ] Test role-based access

- [ ] **E2E Tests**
  - [ ] Test user registration/login
  - [ ] Test appointment booking flow
  - [ ] Test prescription creation flow
