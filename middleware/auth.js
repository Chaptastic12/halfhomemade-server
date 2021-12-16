const User = require('../models/user');

//Check that our user is an Admin user
//If we don't find them, or the isAdmin is false, return false
const verifyUserIsAdmin = (req, res, next) => {
    User.findById(req.user.id, (err, user) =>{

        if(err){
            return false;
        } else {
            //If they are a user, we need to check if any of the passed refreshToken matches any of the ones in the DB
            if(user.isAdmin){
                let isValid;
                for(let i=0; i < user.refreshToken.length; i++){
                    for(let k=0; k < req.user.refreshToken.length; k++){
                        console.log('DBUSER' + user.refreshToken[i].refreshToken) 
                        console.log('SENTUSER' + req.user.refreshToken[k])
                        if(user.refreshToken[i].refreshToken === req.user.refreshToken[k].refreshToken){
                            isValid = true;
                            break;
                        }
                    }
                }
                if(isValid){
                    console.log('success')
                    return next();
                } else {
                    return false;
                }               
            } else {
                return false;
            }
        }
    });
}

module.exports = verifyUserIsAdmin;