# Overview
Use SQL to create database and user in the command line

# How to use
1. Install MySQL on-premises, set the root user password. Log in if no password:
    ```shell
    mysql -u root
    ```
    and create a password for it.
    ```sql
    mysql> ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
    ```
2. Create the database `codejays` by 
    ```shell
    mysql -u root -p < sql/create_database.sql
    ```
    and show databases
    ```sql
    mysql> SHOW DATABASES;
    ```
3. Create the user upon the database `codejays` by
    ```shell
    mysql -u root -p codejays < sql/create_user.sql
    ```
    and show all users
    ```sql
    mysql> SELECT User, Host FROM mysql.user;
    ```