# Overview
This is a Express Typescript web application. The features contains:
1. Mongodb and Mysql
2. User login and authentication
3. Save and read Image in S3.
   
# How to run
## 1. Install and start Mongodb and Mysql Locally
1. Install Mysql and run it.
2. To connect to MySQL, use the following command in your terminal: `mysql -u root -p`. During installation, you may encounter prompts guiding you on how to establish the connection.
3. Create the database and user, the scripts store in `sql` folder.

## 2. Launch a AWS S3 Bucket
1. Since we're utilizing Terraform for the AWS S3 bucket creation in this project, please install the Terraform kits by following [these instructions](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli).
2. In addition to Terraform, there are specific requirements for [AWS](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/aws-build#prerequisites) that need to be met. In a nutshell:
   1. You need to have a `AWS` account.
   2. Install the `AWS CLI`.
   3. Configure the credential.
3. Go to `terraform` folder then:
   1. `terraform init`
   2. `terraform plan`
   3. `terraform apply`
   The S3 bucket should be created under your account.

# All dependencies
1. `typescript`: For using TypeScript.
2. `ts-node`: To run TypeScript files directly without explicitly compiling them to JavaScript, providing a runtime environment for executing TypeScript code.
3. `express` and `@types/express`: For adding Express framework under `typescript`.
4. `uuid` and `@types/uuid`: For generating unique IDs.
5. `bcryptjs` and `@types/bcryptjs`: For encrypting the password.
6. `mongoose` and `@types/mongoose`: For mongodb schema and connection: https://mongoosejs.com/docs/api/mongoose.html
7. `mongodb` and `@types/mongodb`: A peer dependency of `mongoose` and is required for Mongoose to connect and interact with a MongoDB database.
8. `jsonwebtoken`: For using jwt.
9. `jest`, `ts-jest`, `@types/jest`: For providing testing framework, understanding Typescript and compile it on the fly and providing Typescript typings for Jest respectively.
10. `supertest`: For making HTTP requests, which is useful for testing the Express routes and middleware.
11. `mongodb-memory-server`: For providing an in-memory MongoDB server