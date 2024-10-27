## Overview

This project is an organizational management application that allows users to create and manage organizations, handle user authentication, and control access levels within organizations. It utilizes JWT for authentication and Redis for managing refresh token revocation, enhancing security and user experience.

## Routes

> [!IMPORTANT]  
> if you using `curl` make sure you add `content-type: application/json` in request headers when sending payloads

### 1. Signup Endpoint
- **Request Schema**: `POST /signup`
- **Request Body**:
    ```json
    {
      "name": "string",
      "email": "string",
      "password": "string"
    }
    ```
- **Response Schema**:
    ```json
    {
      "message": "string"
    }
    ```

### 2. Signin Endpoint
- **Request Schema**: `POST /signin`
- **Request Body**:
    ```json
    {
      "email": "string",
      "password": "string"
    }
    ```
- **Response Schema**:
    ```json
    {
      "message": "string",
      "access_token": "string",
      "refresh_token": "string"
    }
    ```

### 3. Refresh Token Endpoint
- **Request Schema**: `POST /refresh-token`
- **Request Body**:
    ```json
    {
      "refresh_token": "string"
    }
    ```
- **Response Schema**:
    ```json
    {
      "message": "string",
      "access_token": "string",
      "refresh_token": "string"
    }
    ```

### 4. Create Organization Endpoint
- **Request Schema**: `POST /organization`
- **Authorization**: Bearer [Token]
- **Request Body**:
    ```json
    {
      "name": "string",
      "description": "string"
    }
    ```
- **Response Schema**:
    ```json
    {
      "organization_id": "string"
    }
    ```

### 5. Read Organization Endpoint
- **Request Schema**: `GET /organization/{organization_id}`
- **Authorization**: Bearer [Token]
- **Response Schema**:
    ```json
    {
      "organization_id": "string",
      "name": "string",
      "description": "string",
      "owner": {
          "id": "string",
          "name": "string",
          "email": "string"
      }
      "organization_members": [
        {
          "name": "string",
          "email": "string",
          "access_level": "string"
        }
      ]
    }
    ```

### 6. Read All Organizations Endpoint
- **Request Schema**: `GET /organization`
- **Authorization**: Bearer [Token]
- **Response Schema**:
    ```json
    [
      {
        "organization_id": "string",
        "name": "string",
        "description": "string",
        "owner": {
          "id": "string",
          "name": "string",
          "email": "string"
        }
        "organization_members": [
          {
            "name": "string",
            "email": "string",
            "access_level": "string"
          }
        ]
      }
    ]
    ```

### 7. Update Organization Endpoint
- **Request Schema**: `PUT /organization/{organization_id}`
- **Authorization**: Bearer [Token]
- **Request Body**: name or description
    ```json
    {
      "name": "string",
      "description": "string"
    }
    ```
- **Response Schema**:
    ```json
    {
      "organization_id": "string",
      "name": "string",
      "description": "string"
    }
    ```

### 8. Delete Organization Endpoint
- **Request Schema**: `DELETE /organization/{organization_id}`
- **Authorization**: Bearer [Token]
- **Response Schema**:
    ```json
    {
      "message": "string"
    }
    ```

### 9. Invite User to Organization Endpoint
- **Request Schema**: `POST /organization/{organization_id}/invite`
- **Authorization**: Bearer [Token]
- **Request Body**:
    ```json
    {
      "user_email": "string"
    }
    ```
- **Response Schema**:
    ```json
    {
      "message": "string"
    }
    ```

### 10. Revoke Refresh Token Endpoint
- **Request Schema**: `POST /revoke-refresh-token`
- **Authorization**: Bearer [Token]
- **Request Body**:
    ```json
    {
      "refresh_token": "string"
    }
    ```
- **Response Schema**:
    ```json
    {
      "message": "string"
    }
    ```

## Run

To run the application, follow these steps:

1. Clone the repository:
   ```bash
   git clone <repository_link>
   ```

1. run docker images:
   ```bash
   docker-compose up
   ```

