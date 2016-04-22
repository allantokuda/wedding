# Install dependencies

```
nvm use 5
npm install
```


# Development

```
DATABASE_LOCATION="your-firebase-address.firebaseio.com" npm run start
```

# Production config

```
heroku config:set DATABASE_LOCATION=your-firebase-address.firebaseio.com
```

# Google setup

- Create Google OAuth 2.0 client ID for a web application: https://console.cloud.google.com/project

# Firebase setup

- Configure Firebase "Login & Auth":
    > "Google"
      > Client ID and Client Secret
    > "Authorized Domains for OAuth Requests" in Firebase
      > added 'localhost' and 'your-firebase-address.firebaseio.com'
