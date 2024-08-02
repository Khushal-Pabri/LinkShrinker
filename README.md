# LinkShrinker

A URL shortener service built using Node.js, Express, and MongoDB. This service allows users to shorten URLs, track visits, and view analytics.

## Features

- **Short URL Generation**: Generate a short, unique identifier for any URL.
- **Custom Alias**: Optionally create a custom alias for your shortened URL.
- **Redirection**: Redirect users to the original URL when accessing the short URL.
- **Analytics**: Track the total number of visits and detailed visit history including IP address and geolocation.
- **RickRoll Easter Egg**: Special endpoint that logs a visit and sends back a binary message.
- **User Registration**: Register new users with password hashing using bcrypt.
- **User Authentication**: Authenticate users before generating or deleting URLs.
- **User-Specific URLs**: Allow users to create, view, and delete their own URLs.
- **QR Code Generation**: Generate a QR code for any shortened URL for easy sharing.
 
## Getting Started
 
### Prerequisites
 
- Node.js
- MongoDB
 
### Installation
 
1. Clone the repository:
    ```sh
    git clone https://github.com/Khushal-Pabri/LinkShrinker.git
    ```
 
3. Install dependencies:
    ```sh
    npm install
    ```
 
4. Create a `.env` file in the root directory and add the following:
    ```env
    PORT=any_port_you_want_to_run_this_on
    IPINFO_TOKEN=your_ipinfo_token
    MONGO_URI=your_mongodb_connection_uri 
    ```
 
### Running the Application
 
1. Start the MongoDB server (if not already running)
 
2. Start the application:
    ```sh
    node index.js
    ```
 
## API Endpoints

### 1. Generate Short URL

**Endpoint**: `POST /url/`
**Description**: Generates a short URL for the given original URL. Optionally, you can provide a custom alias and user credentials.
**Request Body**:
   ```json
   {
       "originalUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
       "customAlias": "mycustomalias", // Optional
       "username": "user1", // Optional
       "password": "password123" // Optional
   }
   ```
**Response**:
   ```json
   {
       "shortId": "mycustomalias",
       "redirectUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
       "visitHistory": [],
       "user": "66aca3805b0e00ff0b06fc9f",
       "_id": "66aca42b5b0e00ff0b06fca3",
       "createdAt": "2024-08-02T09:17:31.644Z",
       "updatedAt": "2024-08-02T09:17:31.644Z",
       "__v": 0
   }
   ```

### 2. Redirect to Original URL

**Endpoint**: `GET /to/:shortId`
**Description**: Redirects to the original URL corresponding to the short URL.
**Example**: Accessing `http://localhost:4000/to/mycustomalias` will redirect to `https://www.youtube.com/watch?v=dQw4w9WgXcQ`.

### 3. Get URL Analytics

**Endpoint**: `GET /analytics/:shortId`
**Description**: Retrieves analytics for the specified short URL.
**Response**:
   ```json
   {
    "totalVisits": 2,
    "analytics": [
        {
            "location": {
                "city": "Mountain View",
                "region": "California",
                "country": "US",
                "loc": "37.4056,-122.0775",
                "org": "AS15169 Google LLC",
                "postal": "94043",
                "timezone": "America/Los_Angeles"
            },
            "timestamp": "Aug 2, 2024 14:53",
            "ipAddress": "8.8.8.8",
            "_id": "66aca5a52631ef3c8e977f2f"
        },
        {
            "location": {
                "city": "Mountain View",
                "region": "California",
                "country": "US",
                "loc": "37.4056,-122.0775",
                "org": "AS15169 Google LLC",
                "postal": "94043",
                "timezone": "America/Los_Angeles"
            },
            "timestamp": "Aug 2, 2024 14:54",
            "ipAddress": "8.8.4.4",
            "_id": "66aca5c92631ef3c8e977f31"
        }
    ]
}
   ```

### 4. RickRoll Easter Egg

**Endpoint**: `GET /lol/lol`
**Description**: Logs the visit and returns a binary message.
**Response**:
   ```text
   01001110 01100101 01110110 01100101 01110010 00100000 01100111 01101111 01101110 01101110 01100001 00100000 01100111 01101001 01110110 01100101 00100000 01111001 01101111 01110101 00100000 01110101 01110000 00001101 00001010 01001110 01100101 01110110 01100101 01110010 00100000 01100111 01101111 01101110 01101110 01100001 00100000 01101100 01100101 01110100 00100000 01111001 01101111 01110101 00100000 01100100 01101111 01110111 01101110 00001101 00001010 01001110 01100101 01110110 01100101 01110010 00100000 01100111 01101111 01101110 01101110 01100001 00100000 01110010 01110101 01101110 00100000 01100001 01110010 01101111 01110101 01101110 01100100 00100000 01100001 01101110 01100100 00100000 01100100 01100101 01110011 01100101 01110010 01110100 00100000 01111001 01101111 01110101 00001101 00001010 01001110 01100101 01110110 01100101 01110010 00100000 01100111 01101111 01101110 01101110 01100001 00100000 01110100 01100101 01101100 01101100 00100000 01100001 00100000 01101100 01101001 01100101 00100000 01100001 01101110 01100100 00100000 01101000 01110101 01110010 01110100 00100000 01111001 01101111 01110101
   ```

### 5. Delete Short URL

**Endpoint**: `POST /deleteurl/:shortId`
**Description**: Deletes a shortened URL. Requires authentication if the URL is associated with a user.
**Request Body**:
   ```json
   {
       "username": "user",
       "password": "password"
   }
   ```
**Response**:
   ```json
   {
       "message": "URL deleted successfully"
   }
   ```

### 6. Generate QR Code

**Endpoint**: `GET /qrcode/:shortId`
**Description**: Generates a QR code for the shortened URL.

### 7. Register User

**Endpoint**: `POST /register`
**Description**: Registers a new user with a username and password.
**Request Body**:
   ```json
   {
    "username":"user1",
    "password":"password123"
   }
   ```
**Response**:
   ```json
   {
       "message": "User registered successfully"
   }
   ```

### 8. Get User URLs

**Endpoint**: `GET /getmyurls`
**Description**: Retrieves all URLs created by the authenticated user.
**Request Body**:
   ```json
   {
    "username":"user2",
    "password":"password123"
   }
```
**Response**:
   ```json
   [
    {
        "_id": "66acac144efc43def7d418cf",
        "shortId": "wLjAy4OLnw",
        "redirectUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "visitHistory": [
            {
                "location": {
                    "city": "Mountain View",
                    "region": "California",
                    "country": "US",
                    "loc": "37.4056,-122.0775",
                    "org": "AS15169 Google LLC",
                    "postal": "94043",
                    "timezone": "America/Los_Angeles"
                },
                "timestamp": "Aug 2, 2024 15:26",
                "ipAddress": "8.8.4.4",
                "_id": "66acad69efa81253a5b680f4"
            }
        ],
        "user": "66acaba24efc43def7d418c5",
        "createdAt": "2024-08-02T09:51:16.396Z",
        "updatedAt": "2024-08-02T09:51:33.611Z",
        "__v": 0
    }
]
  ```
