# AWS Cloud Resume Challenge — Frontend

**Marrio Hinkle | Cloud & Network Engineer**

**Live Website:** https://marriohinkle.com

## Overview

This repository contains the frontend of my AWS Cloud Resume Challenge project: a responsive personal portfolio built with HTML, CSS, and JavaScript and deployed using AWS cloud services.

The website is hosted in a private Amazon S3 bucket and delivered through Amazon CloudFront, with Amazon Route 53 managing DNS and AWS Certificate Manager providing HTTPS support.

The frontend also integrates with a serverless visitor counter built using Amazon API Gateway, AWS Lambda, Python, and Amazon DynamoDB.

This project demonstrates practical experience in cloud infrastructure, networking, web development, security configuration, application integration, and troubleshooting.

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

## Technologies

| Category | Technologies |
|---|---|
| Frontend | HTML5, CSS3, JavaScript |
| Cloud Hosting | Amazon S3, Amazon CloudFront |
| Networking & Security | Amazon Route 53, AWS Certificate Manager, IAM, HTTPS, OAC |
| Serverless Backend | Amazon API Gateway, AWS Lambda |
| Database | Amazon DynamoDB |
| Backend Programming | Python, Boto3 |
| Development Tools | Visual Studio Code, Git, GitHub, Chrome DevTools |

## Website Features

- Responsive layouts for desktop and mobile devices
- Professional background and resume presentation
- Dedicated project portfolio page
- Downloadable resume
- HTTPS-enabled custom domain
- JavaScript integration with a serverless visitor counter
- Links to GitHub and professional profiles

## Architecture Decisions

### Private S3 Bucket with CloudFront OAC

The website's S3 bucket is not configured for public website hosting. Instead, CloudFront accesses the private bucket through Origin Access Control.

This provides controlled access to website objects while allowing the site to remain publicly accessible through CloudFront.

### CloudFront and HTTPS

CloudFront delivers the static website and supports HTTPS using a certificate issued through AWS Certificate Manager.

The certificate is provisioned in the `us-east-1` AWS Region, as required for CloudFront custom-domain certificates.

### Serverless API Integration

API Gateway and Lambda provide backend functionality without requiring a continuously running EC2 instance or web server.

The frontend communicates with the API through JavaScript, keeping the website's presentation separate from its backend processing.

### DynamoDB Atomic Counter

The Lambda function uses DynamoDB's `UpdateItem` operation to increment the visitor count atomically.

This avoids a separate application-level read-modify-write sequence and helps prevent lost updates when requests occur concurrently.

## Deployment Process

The frontend currently uses a manual deployment workflow:

1. Develop and test changes locally using Visual Studio Code and Live Server.
2. Stage and commit changes using Git.
3. Push the committed changes to the GitHub repository.
4. Upload modified website files to their corresponding paths in Amazon S3.
5. Create a CloudFront cache invalidation for updated objects.
6. Verify the changes on the live website using browser developer tools and desktop/mobile testing.

**Current deployment method:** Manual S3 uploads and CloudFront invalidations.

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

## Infrastructure and Security Configuration

### DNS

Configured Route 53 alias records to direct the root domain and `www` subdomain to the CloudFront distribution.

### TLS Certificate

Used AWS Certificate Manager to issue a certificate covering both domain names and associated it with the CloudFront distribution.

### S3 Access

Configured the S3 bucket for private access through CloudFront Origin Access Control.

### API Permissions

Configured the Lambda execution role with permissions to update the DynamoDB visitor counter.

## Repository Structure

```text
cloud-resume-frontend/
├── index.html
├── resume.html
├── projects.html
├── css/
│   └── styles.css
├── js/
│   └── main.js
├── images/
├── assets/
└── README.md
```

The frontend repository contains the website's static files and JavaScript API integration.

The visitor counter's Python Lambda function and AWS backend configuration are separate from the frontend source code.

## Project Status

**Active development**

The following components are deployed and operational:

- AWS-hosted portfolio website
- CloudFront content delivery
- Custom domain with HTTPS
- Private S3 origin
- Responsive project portfolio
- Serverless visitor counter using API Gateway, Lambda, and DynamoDB

---

**Marrio Hinkle**  
Cloud & Network Engineer  
https://marriohinkle.com