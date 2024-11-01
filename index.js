const { error } = require('console');
const express = require('express');
const mysql = require('mysql2');
const path = require('path');
require("dotenv").config();
var methodOverride = require('method-override')
const { v4: uuidv4 } = require('uuid');
const app = express();
app.set("view engine" , "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended:true}));
const port = 8080;
const connection = mysql.createConnection({
    host:"localhost",
    user:"root",
    database:"amazon",
    password:"Harsha@25"
}); 
   var userInput_username="";
   var userInput_mobNo="";
   var userInput_email="";
   var userInput_password="";
   
    var otp;
    let userInput="";
    let loginInput;
    var input_mobile="";
    var input_email="";

  
    
    
    app.get("/Amazon",(req,res)=>{
        res.render("Amazon.ejs",{username:null})
    })    
    
    app.get("/signin" ,(req,res)=>{
        res.render("signinEmail.ejs",{error:false,content:"" });
    })
    //  Checking User input to render to the password page
    app.post("/password" ,(req,res)=>{
        userInput = req.body.email;
        console.log(userInput)
        if(userInput.includes('@')){
            
            try{
                let q=`SELECT email FROM login WHERE email = '${userInput}'`
                connection.query(q,(err,result)=>{
                    if(err) throw err;
                    if(result.length>0){
                        loginInput=result;
                    }else{
                        loginInput=null;
                    }
                    input_email=loginInput[0].email;
                    console.log(input_email);
                    if( loginInput && input_email.includes('@')){
                        res.render("password.ejs",{error:false,content:"",email:loginInput[0].email});
                    }
                    else if(userInput!=input_email){
                        res.render("signinemail.ejs",{error:true,content:"!Account is not Existing"});
                    }
                    else{
                        res.render("signinemail.ejs", {error:true,content:"! Enter your email or mobile phone number"});
                    }
                    
                })
            }catch(err){
                console.log(err);
                res.render("signinemail.ejs",{error:true,content:"Account does not exist"});
            }
        }
         else{
            try{
                let q=`SELECT mobNo FROM login WHERE mobNo = '${userInput}'`
                connection.query(q,(err,result)=>{
                    if(err) throw err;
                    if(result.length>0){
                        loginInput=result
                        input_mobile=loginInput[0].mobNo;
                    }else{
                        loginInput=null;
                    }
                    console.log(input_mobile);
                    if(loginInput && input_mobile){
                        res.render("password.ejs",{error:false,content:"",email:loginInput[0].mobNo})
                    }else if(userInput!=input_mobile){
                        res.render("signinemail.ejs",{error:true,content:"!Account is not Exisiting"})
                    }
                    else{
                        res.render("signinemail.ejs", {error:true,content:"! Enter your email or mobile phone number"});
                    }
                })
            } catch(err){
                console.log(err);
                res.render("Signinemail.ejs",{error:true,content:"Account Does not Exist!"})
            }
        }
    })
    // Password Checking to login;
    app.post("/Amazon",(req,res)=>{
        let {password} = req.body;
        let q=`SELECT password,username FROM login WHERE mobNo='${input_mobile}' OR email ='${input_email}'`
        try{
            connection.query(q,(err,result)=>{
                if(err) throw err;
                console.log(result);
                if(password==result[0].password){
                    res.render("Amazon.ejs",{username:result[0].username});
                } else{
                    
                    res.render("password.ejs",{error:true,content1:"There was a problem",content2:"You password is incorret",email:userInput})
                }
            })
        }catch(err){
            console.log(err);
        }
        
    })
    // inserting data to the database;
    app.post("/VerifyNumber",(req,res)=>{
        var{username:userInput_username,mobNo:userInput_mobNo,email:userInput_email,password:userInput_password}=req.body;
        console.log(userInput_email,userInput_mobNo,userInput_password,userInput_username);
        const generateOTP = () => {
         return Math.floor(100000 + Math.random() * 900000).toString();
     };
     otp = generateOTP();
     // Your AccountSID and Auth Token from console.twilio.com
     const accountSid =process.env.ACCOUNTSID;
     const authToken = process.env.AUTHTOKEN;
    const client = require('twilio')(accountSid, authToken);
    const sendSMS = async (body) =>{
        let msgOptions = {
             from:"",//yours twilio number;
             to:`+91 ${userInput_mobNo}`,
             body
         }
    try{
        const message = await client.messages.create(msgOptions);
        console.log(message)
        res.render("verifyNo.ejs",{data:userInput_mobNo,error:false,content:""});
    }catch(err){
        console.log(err)
    }
  }
sendSMS(`${otp} One-Time_password for your amazon login dont share with anyone`);
        app.post("/signin",(req,res)=>{
                let{user_otp}=req.body;
                console.log(user_otp);
                console.log(otp);
                console.log(userInput_email,userInput_mobNo,userInput_password,userInput_username);
                if(user_otp==otp.trim()){
                        try{
                            let q =`INSERT INTO login (id,username,mobNo,email,password) VALUES (?,?,?,?,?)`; 
                            let values=[uuidv4(),userInput_username,userInput_mobNo,userInput_email,userInput_password];
                            connection.query(q,values,(err,result)=>{
                            if(err) throw err;
                            console.log(result);
                            console.log("Data inserted ");
                            res.render("Amazon.ejs",{username:userInput_username });
                            })
                        } catch(err){
                            console.log(err);
                            res.render("signinEmail.ejs",{error:true,content:"Already Exist"});
                        }
                     }else{
                        res.render("verifyNO.ejs",{data:userInput_mobNo,error:true,content:"Incorrect OTP,Please try again"});
                     }
                    })
     })
    let  number_for_password_change;
    // post request- for otp to change password
    app.post("/verification",(req,res)=>{
        number_for_password_change=req.body.number_for_otp;
      
        console.log(number_for_password_change)
    
        const generateOTP = () => {
            return Math.floor(100000 + Math.random() * 900000).toString();
        };
        otp = generateOTP();
        // Your AccountSID and Auth Token from console.twilio.com
        const accountSid =process.env.ACCOUNTSID;
        const authToken = process.env.AUTHTOKEN;
            const client = require('twilio')(accountSid, authToken);
            const sendSMS = async (body) =>{
                let msgOptions = {
                    from:"",//yours twilio numbers
                    to:`+91 ${number_for_password_change}`,
                    body
                }
             try{
                const message = await client.messages.create(msgOptions);
                console.log(message)
                res.render("EnterVerCode.ejs",{number:number_for_password_change,error:false,content:""});
             }catch(err){
                console.log(err)
                }
            }        
            sendSMS(`${otp} One-Time_password for your amazon login dont share with anyone`);
     })
  //  Reset  the password  
    app.post("/newpassword",(req,res)=>{
        let{otp_for_verification}=req.body;
        if(otp==otp_for_verification.trim()){
            res.render("createNewpas.ejs",{error:false,content:""});
        } else{
            res.render("EnterVercode.ejs",{number:number_for_password_change,error:true,content:"Incorrect Otp"})
        }
    })
    //Entering new password
    app.post("/new/amazon",(req,res)=>{
        let{user_entered_password,re_user_entered_password} = req.body;
        console.log(user_entered_password,re_user_entered_password);
        let q=`select username from login where mobNo ='${number_for_password_change}'`
        let usernametoSendAmazon;
        try{
            connection.query(q,(err,result)=>{
                if(err) throw err;
                console.log(result);
              usernametoSendAmazon=result[0]["username"];
            })
        }catch(err){
            console.log(err);
        }
        if(user_entered_password==re_user_entered_password){

            let q=`update login set password='${user_entered_password}' where mobNo='${ number_for_password_change}'`
            try{
                connection.query(q,(err,result)=>{
                    if(err) throw err;
                    console.log(result);
                    res.render("Amazon.ejs",{username:usernametoSendAmazon});
                })
            }catch(err){
                console.log(err);
            }
        } else{
            res.render("createNewPas.ejs",{error:true,content:"Passwords are no matching enter again"})
        }
    })

            
app.get("/createAccount" ,(req,res)=>{
    res.render("createAcc.ejs");
})
app.get("/Forgotpassword",(req,res)=>{
    res.render("passwordAss.ejs");
})
app.listen(port,()=>{
    console.log(`server is running on port : ${port}`);
})
                












    
    
    



