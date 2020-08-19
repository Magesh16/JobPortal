var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var Userschema = mongoose.Schema({
    fullname: {type: String, required: true},
    email : {type: String, required: true},
    password : {type: String },
    role : {type: String, default:'' },
    company : {
        name:{type:String, default:''},
        image: {type: String, default:''},
    },
    passwordResetToken:{type:String, default:''},
    passwordResetExpires:{type: Date , default: Date.now},
    facebook : {type:String, default:''},
    tokens:Array
})

Userschema.methods.encryptPassword=(password) => {
    return bcrypt.hashSync(password,bcrypt.genSaltSync(10),null)
}

// Userschema.methods.validPassword=(user,password)=>{
//     console.log("Checking password"+password+user.password);
//    var result= bcrypt.compareSync(password,user.password);
//     console.log("Checking password done"+result);
//     return result;
// };
Userschema.methods.validPassword=function(password) {
    console.log("Checking password"+password+this.password);
    var result= bcrypt.compareSync(password,this.password);
    console.log("Checking password done"+result);
    return result;
}
module.exports=mongoose.model('User', Userschema);