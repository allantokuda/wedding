# Install dependencies

```
sh ./install.sh
```

Development: "jsx" precompilation command line tool, that continuously
compiles JSX in "src" directory into JS in "build" directory

```
sudo npm install -g react-tools
jsx --watch src build
```

# Google setup

- Create Google OAuth 2.0 client ID for a web application: https://console.cloud.google.com/project

# Firebase setup

- Configure Firebase "Login & Auth":
    > "Google"
      > Client ID and Client Secret
    > "Authorized Domains for OAuth Requests" in Firebase
      > added 'localhost' and 'your-firebase-address.firebaseio.com'
