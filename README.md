# QueueLess

> A full-stack digital queue management platform that allows customers to join queues remotely, track their position, and manage their waiting time efficiently.

QueueLess connects **customers, service staff, and administrators** through a centralized digital queue system.

Instead of physically waiting in line, customers can join a queue remotely, receive a digital token, and monitor their queue status in real time.

---

## 🚀 Live Application

**QueueLess:** https://queueless-tnhv.onrender.com

> 🎯 **Want to take a demo tour of QueueLess?**
> You can use the demo credentials below to explore the application from the perspective of a **Customer, Staff member, or Admin**.

### Demo Credentials

| Role | Email | Password | What You Can Explore |
|------|-------|----------|----------------------|
|  **Customer** | `customer@queueless.com` | `QueueLess@123` | Browse services, join queues, track tokens, view queue history, and use the AI Assistant |
|  **Staff** | `staff@queueless.com` | `QueueLess@123` | Manage queues, call the next customer, serve customers, and cancel tokens |
|  **Admin** | `admin@queueless.com` | `QueueLess@123` | Manage service centers, services, and service availability |

> **💡 Recommended:** Open QueueLess in 3 separate browser tabs or windows and log in with different roles to experience the complete queue workflow.

### Quick Demo Flow

**Customer**
→ Find a service  
→ Join a queue  
→ Receive a token  
→ Track queue position  

**Staff**
→ Select the queue  
→ Call next customer  
→ Serve / cancel token  

**Customer**
→ See token status update  

**Admin**
→ Manage service centers and services

---

## 📌 Overview

QueueLess is designed to simplify the traditional queue management process.

### The platform allows customers to:

- Discover service centers
- Browse available services
- Join queues remotely
- Receive digital queue tokens
- Track their position in the queue
- View estimated waiting time
- Leave queues when required
- View previous queue history
- Receive AI-powered service recommendations

### The platform allows staff to:

- View and manage queues
- Monitor waiting customers
- Call the next customer
- Serve customers
- Cancel tokens
- Open or close queues

### The platform allows administrators to:

- Manage service centers
- Manage services
- Activate or deactivate services
- Manage service center information

---

## ✨ Key Features

### 🎟️ Digital Queue Management

- Remote queue joining
- Automatic token generation
- Queue position tracking
- Estimated waiting time
- Token status tracking
- Queue history
- Leave queue functionality

### 👥 Role-Based Access

QueueLess provides separate functionality for:

- **Customer**
- **Staff**
- **Admin**

Access to features and APIs is controlled based on the authenticated user's role.

### 🔄 Real-Time Queue Updates

Queue information is periodically refreshed so that customers and staff can see changes without manually refreshing the page.

This includes:

- Queue position changes
- Token status changes
- Service availability
- Service center availability
- Staff queue updates

### 🤖 AI Service Assistant

QueueLess includes an AI-powered assistant that helps customers find the appropriate service.

Customers can describe what they need in natural language instead of manually searching through services.

**Example:**

> "I need to renew my passport."

The assistant:

- Understands the customer's request
- Identifies the relevant service
- Checks available queue information
- Recommends a suitable queue
- Allows the customer to proceed directly to the recommended queue

---

## 🔄 How QueueLess Works

The core workflow can be summarized as:

**Customer → Service → Queue → Token → Staff → Completion**

### Customer Flow

1. Browse available service centers
2. Select a service
3. Join the corresponding queue
4. Receive a digital token
5. Track queue position
6. Monitor estimated waiting time
7. Receive updates as the queue progresses
8. Get served when the token reaches the front

### Staff Flow

1. Log in as Staff
2. Select a queue
3. View waiting customers
4. Call the next customer
5. Serve or cancel the token
6. Continue processing the queue

### Admin Flow

1. Log in as Admin
2. Manage service centers
3. Manage available services
4. Activate or deactivate services
5. Maintain service availability

---

## 👤 User Roles

### Customer

Customers can:

- Browse service centers
- View available services
- Join queues
- Receive digital tokens
- Track queue position
- View estimated waiting time
- Leave queues
- View queue history
- Use the AI Service Assistant

### Staff

Staff can:

- View available queues
- Select queues
- Monitor waiting customers
- Call the next customer
- Serve customers
- Cancel tokens
- Open queues
- Close queues

### Admin

Admins can:

- Create and manage service centers
- Update service center information
- Add services
- Update services
- Activate services
- Deactivate services

---

## 🤖 AI Service Assistant

The AI Service Assistant provides a natural-language interface for discovering services.

Instead of navigating through multiple service centers, customers can simply describe their requirement.

### Example

**Customer:**

> "I need to renew my passport."

**QueueLess AI:**

- Identifies the user's intent
- Searches available services
- Evaluates relevant queue information
- Recommends a suitable queue
- Provides a direct option to join the queue

The AI functionality is powered by **Spring AI** and a **Groq-hosted LLM** through an OpenAI-compatible API.

---

## 🏗️ Application Architecture

QueueLess follows a full-stack architecture consisting of:

- **React frontend**
- **Spring Boot REST API**
- **PostgreSQL database**
- **JWT-based authentication**
- **Role-based authorization**
- **Spring AI + Groq AI integration**

---

## 💻 Run QueueLess Locally

You can run the complete QueueLess application locally on your own machine.

### Prerequisites

Make sure the following are installed:

- **Java 21**
- **Node.js**
- **npm**
- **PostgreSQL**
- **Git**
- **Maven** *(optional — the project includes the Maven Wrapper)*

> **Important:** Make sure all required environment variables are configured correctly before starting the application.

---

### 1. Clone the Repository

```bash
git clone https://github.com/ShantanuKH/QueueLess.git
cd QueueLess
```

---

### 2. Configure the Frontend

Add the following:

```bash
VITE_API_BASE_URL=YOUR_LOCALHOST_URL
```

---

### 3. Configure the Backend

Configure the following environment variables for the Spring Boot application:

```text
DB_URL
DB_USERNAME
DB_PASSWORD

JWT_SECRET
JWT_ACCESS_TOKEN_EXPIRATION
JWT_REFRESH_TOKEN_EXPIRATION

GROQ_BASE_URL
GROQ_API_KEY
GROQ_MODEL
```

---

### 4. Start the Backend

### 5. Start the Frontend

Open another terminal and navigate to the frontend:

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```
---

### 6. Open QueueLess

Once both the backend and frontend are running, open the application.

You can use the demo credentials provided in the **Live Application** section to explore the different user roles.

---

## ⭐ Explore QueueLess

Want to explore the project yourself?

Clone the repository, configure the required environment variables, start the backend and frontend, and you're ready to explore QueueLess locally.

```bash
git clone https://github.com/ShantanuKH/QueueLess.git
cd QueueLess
```

> 💡 **Tip:** QueueLess is designed as a full-stack project, so both the frontend and backend need to be running for the complete application experience.

---

---

## 🙌 Thanks for Checking Out QueueLess!

If you found the project interesting, feel free to:

- Explore the source code
- Try the live application
- Clone the repository and run it locally
- Share your feedback or suggestions

### 💬 Feedback & Suggestions

If you have any questions, concerns, feedback, or ideas for improvement, please feel free to reach out.

I’d be happy to hear your thoughts and suggestions for making QueueLess better. 🚀

📧 **Email:** [khadseshantanu02@gmail.com](mailto:khadseshantanu02@gmail.com)  
💼 **LinkedIn:** [Connect with me on LinkedIn](https://www.linkedin.com/in/shantanu-khadse-a62585230/)
