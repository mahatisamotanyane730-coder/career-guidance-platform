// User roles
const ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student',
  INSTITUTION: 'institution',
  COMPANY: 'company'
};

// Application statuses
const APPLICATION_STATUS = {
  PENDING: 'pending',
  ADMITTED: 'admitted',
  REJECTED: 'rejected',
  WAITLIST: 'waitlist'
};

// Job statuses
const JOB_STATUS = {
  ACTIVE: 'active',
  CLOSED: 'closed',
  DRAFT: 'draft'
};

// Institution verification status
const VERIFICATION_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
};

module.exports = {
  ROLES,
  APPLICATION_STATUS,
  JOB_STATUS,
  VERIFICATION_STATUS
};