UPDATE alburhan_classroom.users SET password='$2a$10$TiiwHEkzWE3AH5uUUrzmfu74qLY2gkwaaR3.6nq6GfPABbpxkzpQy' WHERE email='admin@alburhan.com';
SELECT id, email, password, role FROM alburhan_classroom.users WHERE email='admin@alburhan.com';
