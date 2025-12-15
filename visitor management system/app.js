var express =   require("express"),
        app =   express(),
 bodyParser =   require("body-parser"),
   mongoose =   require("mongoose"),
 nodemailer = require("nodemailer"),
    unirest = require("unirest");

const path = require("path");
app.use(express.static(path.join(__dirname, "client/build")));

var flag1=-1;
var flag2=-1;

mongoose.connect("mongodb://localhost/user",{ useNewUrlParser: true , useUnifiedTopology: true, useFindAndModify: false});
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:true}));

app.set("view engine","ejs");

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'ENTER E-MAIL ID',                                  //Enter your E-mail ID and Password
      pass: 'ENTER YOUR PASSWORD'
    }
  });

  function sndMsg(content,to){                            //function for sending message using fast2sms api
   
    var req = unirest("POST", "https://www.fast2sms.com/dev/bulk");
                
    req.headers({
    "authorization": "ENTER YOUR AUTHORIZATION KEY"
    });
                 
    req.form({
    "sender_id": "FSTSMS",
    "message": content,
    "language": "english",
    "route": "p",
    "numbers": to,
    });

    req.end(function (res) {
    if (res.error) throw new Error(res.error);
                
    console.log(res.body);
    });  
                
}

function sndMail(content,mailto){                   //function for sending e-mail using nodemailer

var mailOptions = {
    from: 'ENTER E-MAIL ID',                     //Enter your e-mail id
    to: mailto,
    subject: 'Entry Management Desk',
    text: content
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
 });    
 
}  

//SchemaSetUp - Made 3 Schemas namely: 'Clients','Hosts' and 'Visits' to reduce redundancy and repetition of visitor details and host details.
var Schema = mongoose.Schema;           
var clientSchema=new Schema({                   
    name: String,                                   
    email: String,                                                       //Client Schema
    phone: String
})

var Client=mongoose.model("Client",clientSchema);

var visitSchema=new Schema({
   
    email: String,
    checkin: String,                                                     //Visit Schema
    checkout: String,
    hemail: String
})

var Visit=mongoose.model("Visit",visitSchema);

var hostSchema=new Schema({
    hname: String,
    hemail: String,                                                       //Host Schema
    hphone: String
})

var Host=mongoose.model("Host",hostSchema);

app.get("/",function(req,res){
    var p=flag1;
    flag1=-1;   
    res.render("landing",{flag:p});
})

app.get("/checkin",function(req,res){
    res.render("checkin");
})

app.get("/checkout",function(req,res){
    var p=flag2;
    flag2=-1; 
    res.render("checkout",{flag:p});
})

function clientCheck(email,callback){                       //function to check if Visitor is present in Client collection or not
    var z=null;                                             //using visitor's email as primary key
    Client.find({email:email},function(err,update)
    {
       
        if(err)
            console.log(err);
        else{
           
            if(update.length==0)
            z=false;
            else
            z=true;
           
        }
        callback(z);
    });
  
  
}

function visitCheck(email,callback){                        //function to check if any visit corresponding to visitor's email 
    var z=null;                                             //is recorded in Visit collection or not
    Visit.find({email:email},function(err,update)
    {
        if(err)
            console.log(err);
        else{
            if(update.length==0)
            z= false;
            else
            z= true;
        }
        callback(z);
    });
  
}

function hostCheck(hemail,callback){                            //function to check if Host is present in Host collection or not
    var z=null;                                                  //using host's email as primary key
    Host.find({hemail:hemail},function(err,update)
    {
        if(err)
            console.log(err);
        else{
            if(update.length==0)
            z= false;
            else
            z= true;
        }
        callback(z);
    });
  
}



function currTime(){                                        //function to capture and return current time during checkin and checkout
    var date= new Date();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM IST' : 'AM IST';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
    // returns Time;
}

app.post("/checkin",function(req,res){
    var name= req.body.name;
    var email= req.body.email;
    var phone= req.body.phone;
    var hname= req.body.hname;
    var hemail= req.body.hemail;
    var hphone= req.body.hphone;
    var add  = "Innovaccer, Industrial Area, Sector 62, Noida, Uttar Pradesh 201309";
    var dateTime=currTime();
    var newClient = {name:name, email:email , phone:phone };
    var newVisit={email:email, checkin:dateTime, checkout:"",hemail:hemail };
    var newHost={hname:hname, hemail:hemail ,hphone};
    var content = name + ' just checked in. \nVisitor Details: \nName: '+name+'\nEmail: '+email+'\nContact no.: '+phone+'\nCheck in Time: '+dateTime;
    
    visitCheck(email,function(flag){
       
        if(!flag)
        {
        Visit.create(newVisit, function(err, newlyCreated)
               {
                   if(err)
                       console.log(err);
                   else{
                       console.log('Visit Recorded!');

                       sndMsg(content,hphone);
                      sndMail(content,hemail);
                   
                   }
                });
                                         
                

                clientCheck(email,function(flag){
                    if(!flag)
                    {
                        Client.create(newClient, function(err, newlyCreated)
                               {
                                   if(err)
                                       console.log(err);
                                   else{
                                       console.log(' Visitor updated ');
                                   }
                            });
                      }
                    });
                    hostCheck(hemail,function(flag){
                        if(!flag)
                        {
                        Host.create(newHost, function(err, newlyCreated)
                               {
                                   if(err)
                                       console.log(err);
                                   else{
                                       console.log(' Host updated! ');
                                   }
                                });
                       }
                    });
                    flag1=1;
               res.redirect("/");
     }
     else{
        Visit.find({email:email},function(err,update){
            if(err)
            console.log(err);
            else
            {
                var latestentry=update.length-1;
                if(update[latestentry].checkout.length==0)
                {
                console.log("This User is already checked-in!");
                flag1=2;
                res.redirect("/");
                }
                else
                {
                    Visit.create(newVisit, function(err, newlyCreated)
                   {
                       if(err)
                           console.log(err);
                       else{
                           console.log('Visit Recorded!');
                           
                          sndMsg(content,hphone);
                           sndMail(content,hemail);
                       
                       }
                    });
                         
                   
                    
                    clientCheck(email,function(flag){
                        if(!flag)
                        {
                            Client.create(newClient, function(err, newlyCreated)
                                   {
                                       if(err)
                                           console.log(err);
                                       else{
                                           console.log(' Visitor updated ');
                                       }
                                });
                          }
                        });
                        hostCheck(hemail,function(flag){
                            if(!flag)
                            {
                            Host.create(newHost, function(err, newlyCreated)
                                   {
                                       if(err)
                                           console.log(err);
                                       else{
                                           console.log(' Host updated! ');
                                         
                                       }
                                    });
                           }
                        });
                        
                        flag1=1;
                        res.redirect("/");
                }
            }
        });
     }
    });
    
       

   
})

app.post("/checkout",function(req,res){
    
    var email= req.body.email;
    var dateTime=currTime();
    var add  = "Innovaccer, Industrial Area, Sector 62, Noida, Uttar Pradesh 201309";
    clientCheck(email,function(flag){
        if(!flag)
        {
        console.log("No user with this email-id!");
        flag2= 2;
        res.redirect("/checkout");
        }
    
        else
        {
               
                Visit.findOneAndUpdate({email:email,checkout:""},{checkout:dateTime},function(err, updated){
                    if(err)
                        console.log(err);
                    else{
                      
                        if(updated==null){
                        console.log("User has already Checked out!");
                        flag2= 1;
                        res.redirect("/checkout");
                    }
                        else
                        {
                       console.log("Check out Time updated");
                       Visit.find({email:email},function(err, update){
                        if(err)
                            console.log(err);
                        else{
                         
                        if(update.length>0){    
                           
                            Client.find({email:email},function(err,update1){
                                var content = 'Thank You for your visit! \nYour Visit Details: \nName: '+update1[update1.length-1].name+'\nEmail: '+update1[update1.length-1].email+'\nContact no.: '+update1[update1.length-1].phone+'\nCheck in Time: '+update[update.length-1].checkin +'\nCheck out Time: '+dateTime +'\nAddress: '+add;
                        
                                sndMail(content,update[update.length-1].email);
                               
                                flag1= 3;
                                res.redirect("/");
                            });
                            
                        
                            }
                        }
                    
                    });
                 }
              }
            });

         }
    });
});


app.listen(3000,function(){
    console.log("Server has started");
})
