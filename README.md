# AWS Cloud Resume Challenge — Frontend

**Marrio Hinkle | Cloud & Network Engineer**

**Live Website:** https://marriohinkle.com

## Overview

This repository contains the frontend of my AWS Cloud Resume Challenge project: a responsive personal portfolio built with HTML, CSS, and JavaScript and deployed using AWS cloud services.

The website is hosted in a private Amazon S3 bucket and delivered through Amazon CloudFront, with Amazon Route 53 managing DNS and AWS Certificate Manager providing HTTPS support.

The frontend also integrates with a serverless visitor counter built using Amazon API Gateway, AWS Lambda, Python, and Amazon DynamoDB.

GitHub Actions automates frontend deployment using AWS OpenID Connect (OIDC), allowing secure authentication without storing long-lived AWS access keys in GitHub.

This project demonstrates practical experience in cloud infrastructure, networking, web development, security configuration, application integration, CI/CD automation, and troubleshooting.

## Architecture

### Frontend — Static Website Delivery

```text
User Browser
     |
     | DNS Resolution
     v
Amazon Route 53
     |
     | Resolves domain to CloudFront
     v
Amazon CloudFront (HTTPS)
     |
     | Origin Access Control (OAC)
     v
Private Amazon S3 Bucket
     |
     v
HTML / CSS / JavaScript / Images
```

**AWS Services**

- **Amazon S3:** Stores the website's static assets.
- **Amazon CloudFront:** Delivers website content through a globally distributed content delivery network.
- **Amazon Route 53:** Manages DNS records for `marriohinkle.com` and `www.marriohinkle.com`.
- **AWS Certificate Manager (ACM):** Provides the TLS certificate used by CloudFront for HTTPS.
- **Origin Access Control (OAC):** Restricts direct public access to S3 objects while allowing CloudFront to retrieve website content.

### Backend — Serverless Visitor Counter

```text
Browser JavaScript
       |
       | HTTPS POST Request
       v
Amazon API Gateway
       |
       v
AWS Lambda (Python)
       |
       | DynamoDB UpdateItem
       v
Amazon DynamoDB
       |
       | Updated Count
       v
Lambda → API Gateway → Browser
```

The visitor counter increments when the frontend successfully invokes the API. It records site visits rather than unique visitors.

The Lambda function uses a DynamoDB atomic update operation to increment the counter and return its updated value.

### CI/CD — Automated Frontend Deployment

```text
Developer
    |
    | Git Commit and Push
    v
GitHub Repository (main branch)
    |
    v
GitHub Actions
    |
    | OIDC Authentication
    v
AWS IAM Deployment Role
    |
    v
Amazon S3
    |
    | CloudFront Cache Invalidation
    v
Amazon CloudFront
    |
    v
Live Website
```

## Technologies

| Category | Technologies |
|---|---|
| Frontend | HTML5, CSS3, JavaScript |
| Cloud Hosting | Amazon S3, Amazon CloudFront |
| Networking & Security | Amazon Route 53, AWS Certificate Manager, IAM, HTTPS, OAC, OIDC |
| Serverless Backend | Amazon API Gateway, AWS Lambda |
| Database | Amazon DynamoDB |
| Backend Programming | Python, Boto3 |
| CI/CD | GitHub Actions, AWS CLI |
| Development Tools | Visual Studio Code, Git, GitHub, Chrome DevTools |

## Website Features

- Responsive layouts for desktop and mobile devices
- Professional background and resume presentation
- Dedicated project portfolio page
- Downloadable resume
- HTTPS-enabled custom domain
- JavaScript integration with a serverless visitor counter
- Links to GitHub and professional profiles
- Automated deployment to AWS through GitHub Actions

## Architecture Decisions

### Private S3 Bucket with CloudFront OAC

The website's S3 bucket is not configured for public website hosting. Instead, CloudFront accesses the private bucket through Origin Access Control.

This provides controlled access to website objects while allowing the site to remain publicly accessible through CloudFront.

### CloudFront and HTTPS

CloudFront delivers the static website and supports HTTPS using a certificate issued through AWS Certificate Manager.

The certificate is provisioned in the `us-east-1` AWS Region, as required for CloudFront custom-domain certificates.

The S3 bucket is hosted in `us-east-2` (Ohio).

### Serverless API Integration

API Gateway and Lambda provide backend functionality without requiring a continuously running EC2 instance or web server.

The frontend communicates with the API through JavaScript, keeping the website's presentation separate from its backend processing.

### DynamoDB Atomic Counter

The Lambda function uses DynamoDB's `UpdateItem` operation to increment the visitor count atomically.

This avoids a separate application-level read-modify-write sequence and helps prevent lost updates when requests occur concurrently.

### GitHub Actions and AWS OIDC

The frontend deployment pipeline uses GitHub Actions with AWS OpenID Connect authentication.

Rather than storing permanent AWS access keys as GitHub secrets, the workflow requests a temporary identity token and assumes an AWS IAM role.

The IAM role's trust policy restricts access to the authorized GitHub repository and its `main` branch.

The deployment role has permissions scoped to the website's S3 bucket and the CloudFront distribution.

This approach supports automated deployments while reducing reliance on long-lived credentials.

## Deployment Process

The frontend uses an automated CI/CD pipeline powered by GitHub Actions and AWS OpenID Connect (OIDC).

1. Develop and test website changes locally using Visual Studio Code and Live Server.
2. Stage and commit changes using Git.
3. Push the changes to the `main` branch on GitHub.
4. GitHub Actions automatically starts the deployment workflow.
5. GitHub Actions authenticates with AWS using temporary OIDC credentials.
6. The workflow synchronizes website files to the private Amazon S3 bucket.
7. The workflow creates a CloudFront cache invalidation.
8. Verify the changes on the live website at https://marriohinkle.com.

**Current deployment method:** Automated GitHub Actions deployment to Amazon S3 and CloudFront.

**Workflow file:** `.github/workflows/deploy.yml`

### Deployment Verification

The automated deployment workflow successfully completed the following operations:

- Checked out the GitHub repository
- Authenticated with AWS using OIDC
- Assumed the configured IAM deployment role
- Synchronized website files to Amazon S3
- Requested a CloudFront cache invalidation

The live website, downloadable resume, and project links were manually verified after deployment.

### Manual Workflow Execution

The deployment workflow also supports manual execution using GitHub Actions.

To run it manually:

1. Open the repository on GitHub.
2. Select the **Actions** tab.
3. Choose **Deploy Cloud Resume Frontend**.
4. Select **Run workflow**.
5. Choose the `main` branch and start the workflow.

## Troubleshooting and Lessons Learned

### Incident 1 — Visitor Counter JavaScript Not Executing

**Symptoms**

The visitor counter did not update on the live website, even though the browser received an HTTP 200 response for the JavaScript file.

**Investigation**

I inspected the browser developer tools and checked the JavaScript objects stored in S3.

The expected `js/main.js` object existed but contained zero bytes. A separate object had been uploaded under an incorrect S3 key.

**Resolution**

- Uploaded the correct JavaScript file to `js/main.js`.
- Verified that the object contained the expected code.
- Removed the incorrectly placed object.
- Invalidated the CloudFront cache.
- Confirmed that the visitor counter executed successfully.

**Root cause**

The website was receiving an empty JavaScript object from the expected S3 path. The precise cause of the empty upload was not established.

**Prevention**

Verify S3 object keys and file sizes after deployment, inspect browser network responses, and validate application functionality after cache invalidation.

**Lesson learned:** An HTTP 200 response confirms that a resource was returned, but not that it contains the expected application code.

### Incident 2 — CORS Error After Custom Domain Configuration

**Symptoms**

After connecting the custom domain, the frontend could no longer successfully access the visitor counter API from the browser.

**Investigation**

Browser developer tools indicated a Cross-Origin Resource Sharing (CORS) issue.

The API Gateway CORS configuration permitted the original CloudFront domain but did not yet include the new custom-domain origins.

**Resolution**

Updated API Gateway's allowed origins to include:

- `https://marriohinkle.com`
- `https://www.marriohinkle.com`

Then verified that the frontend could successfully invoke the visitor counter API.

**Lesson learned:** Browser origins are defined by scheme, hostname, and port. The root domain and `www` subdomain are separate origins and must be configured accordingly.

### Incident 3 — GitHub Personal Access Token Permissions

**Symptoms**

Git rejected a push containing the GitHub Actions workflow file.

The error indicated that the Personal Access Token lacked permission to create or update workflow files.

**Investigation**

The token had repository permissions but was missing the `workflow` scope required for updating files in `.github/workflows/`.

**Resolution**

Updated the GitHub Personal Access Token permissions to include the `workflow` scope and successfully pushed the deployment workflow.

**Lesson learned:** Repository write permissions alone may not be sufficient for updating GitHub Actions workflow definitions when authenticating with a classic Personal Access Token.

### Incident 4 — AWS OIDC Role Assumption Failure

**Symptoms**

GitHub Actions successfully checked out the repository but failed during AWS authentication.

The workflow reported:

`Not authorized to perform sts:AssumeRoleWithWebIdentity`

**Investigation**

Reviewed the AWS IAM OIDC provider, deployment role trust policy, and GitHub Actions workflow configuration.

Added a temporary diagnostic step to inspect the GitHub OIDC token claims, including the issuer, audience, and subject.

The diagnostic output showed that the token's subject differed from the value initially configured in the IAM trust policy.

**Resolution**

Updated the IAM role's trust policy to match the actual GitHub OIDC subject.

Re-ran the workflow and confirmed that AWS authentication succeeded.

Removed the temporary diagnostic step after troubleshooting.

**Lesson learned:** Federated authentication requires the identity provider's token claims to match the conditions configured in the IAM role's trust policy. Inspecting actual token claims can help diagnose authentication failures without exposing the token itself.

## Infrastructure and Security Configuration

### DNS

Configured Route 53 alias records to direct the root domain and `www` subdomain to the CloudFront distribution.

### TLS Certificate

Used AWS Certificate Manager to issue a certificate covering both domain names and associated it with the CloudFront distribution.

### S3 Access

Configured the S3 bucket for private access through CloudFront Origin Access Control.

### API Permissions

Configured the Lambda execution role with permissions to update the DynamoDB visitor counter.

### Deployment Permissions

Created a dedicated IAM deployment role for GitHub Actions.

The deployment role allows the workflow to synchronize objects in the website's S3 bucket and request invalidations for the CloudFront distribution.

AWS OIDC authentication provides temporary credentials for deployment.

## Repository Structure

```text
cloud-resume-frontend/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── assets/
│   └── resume/
│       └── Marrio_Hinkle_Resume_1.pdf
├── css/
│   └── styles.css
├── images/
│   ├── hero-elder.webp
│   └── hero-figure.webp
├── js/
│   └── main.js
├── index.html
├── projects.html
├── resume.html
├── .gitignore
└── README.md
```

The frontend repository contains the website's static files, JavaScript API integration, and GitHub Actions deployment workflow.

The visitor counter's Python Lambda function and AWS backend configuration are separate from the frontend source code.

## Project Status

**Frontend deployed and operational**

The following components are implemented:

- AWS-hosted portfolio website
- CloudFront content delivery
- Custom domain with HTTPS
- Private S3 origin
- Responsive project portfolio
- Downloadable resume
- Serverless visitor counter using API Gateway, Lambda, and DynamoDB
- Automated frontend CI/CD using GitHub Actions
- Secure AWS authentication using OIDC
- Automated S3 synchronization and CloudFront invalidation

---

**Marrio Hinkle**  
Cloud & Network Engineer  
https://marriohinkle.com