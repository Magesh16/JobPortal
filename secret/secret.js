module.exports={
    auth:{
        customer:'mageshsk16@gmail.com',
        pass:'magi_ash@16'
    },

    facebook:{
        clientID: '947946335646160',
        clientSecret: '7ac795a11158114c0ca81b646971b731',
        profileFields :['email', 'displayName'],
        callbackURL: 'http://localhost:3000/auth/facebook/callback',
        passReqToCallback: true

    }
}

