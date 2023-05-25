
CREATE USER 'codejays'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
GRANT ALL PRIVILEGES ON CodeJays.* TO 'codejays'@'localhost';

-- TODO: password should be configurable
-- TODO: use caching_sha2_password mode and update the code

-- In MySQL 8.0 and later versions, the default authentication plugin was `caching_sha2_password`.
-- 1. `mysql_native_password`: Uses a simple hashing algorithm that hashes the password with a single SHA-1 function.
-- 2. `caching_sha2_password`: Uses a stronger hashing algorithm (SHA-256) for password storage and verification.
-- the "ER_NOT_SUPPORTED_AUTH_MODE" error could be fixed by `mysql_native_password`.
-- https://dev.mysql.com/doc/refman/8.0/en/create-user.html#create-user-overview