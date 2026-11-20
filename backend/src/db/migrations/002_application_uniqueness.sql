CREATE UNIQUE INDEX applications_one_active_per_offer_student
  ON applications (offer_id, student_id)
  WHERE status <> 'WITHDRAWN';
