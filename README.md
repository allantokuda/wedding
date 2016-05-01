# Install dependencies

```
nvm use 5
npm install
```

# Configure

Create file `.env` based on `.env.example`.

# Development

Frontend development:

```
npm run start
```

Server development:

```
npm run start:serverdev
```

# Production config

In addition to deploying the app to Heroku, environment variables need to be defined on Heroku. With `.env` created, run

```
npm run configure:heroku
```

# Google setup

- Create Google OAuth 2.0 client ID for a web application: https://console.cloud.google.com/project

# Firebase setup

- Configure Firebase "Login & Auth":
    > "Google"
      > Client ID and Client Secret
    > "Authorized Domains for OAuth Requests" in Firebase
      > added 'localhost' and 'your-firebase-address.firebaseio.com'
