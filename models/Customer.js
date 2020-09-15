var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var Customer = mongoose.Schema({
        firstname:
        {type: String, required:true},
        lastname:
        {type: String, required:true},
        email:
        {type: String, required: true},
        password:
        {type: String, required: true}, 
        mobilenumber:
        {type: String, required: true},
        location:
        {type: String, required: true},
        customertype:
        {type: String,required: true},
        dob:
        {type: String, default:""},
        gender:
        {type: String, default:""},
        currentposition:
        {type: String, default:""},
        profieimage:
        {type: String, default:""},
        qualification:
        {type: String, default:""},
        skills:
        {type: String, default:""},
        workexperience:
        {type: String, default:""},
        resume:
        {type: String, default:""},
        interestedjobs:
        {type: String, default:""},
        linkedinprofile:
        {type: String, default:""},
        facebookprofile:
        {type: String, default:""},
        industry:
        {type: String, default:""},
        companyname:
        {type: String, default:""},
        lookingjobs:
        {type: String, default:""},


})



Customer.methods.encryptPassword=(password) => {
    return bcrypt.hashSync(password,bcrypt.genSaltSync(10),null)
}

// Customer.methods.validPassword=(customer,password)=>{
//     console.log("Checking password"+password+customer.password);
//    var result= bcrypt.compareSync(password,customer.password);
//     console.log("Checking password done"+result);
//     return result;
// };
Customer.methods.validPassword=function(password) {
    console.log("Checking password"+password+this.password);
    var result= bcrypt.compareSync(password,this.password);
    console.log("Checking password done"+result);
    return result;
}
module.exports=mongoose.model('Customer', Customer);