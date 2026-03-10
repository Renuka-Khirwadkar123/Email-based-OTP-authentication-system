const {google}=require("googleapis")
const fs=require("fs");
const express=require("express");
const readline=require("readline");
const credentials=JSON.parse(fs.readFileSync("credentials.json"));
const {client_secret,client_id,redirect_uris}=credentials.web;
const nodemailer=require("nodemailer");
const app=express();
const PORT=3000;
let currentOTP="";

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

oAuth2Client.setCredentials(token);

const gmail = google.gmail({
  version: "v1",
  auth: oAuth2Client
});

function generateOTP(){

return Math.floor(100000 + Math.random() * 900000).toString();

}


async function sendOTPEmail(to, otp) {

  const message = [
    "From: Your App <your-email@gmail.com>",
    `To: ${to}`,
    "Subject: Your OTP Code",
    "",
    `Your OTP is: ${otp}`
  ].join("\n");

  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage
    }
  });

}
app.use(express.json())
app.use(express.static("public"))
app.use(express.urlencoded({extended:true}));

app.get("/",(req,res)=>{

    res.send("Server chal raha hai !!!!");
});

app.post("/send-otp",async (req,res)=>{

    const email=req.body.email;
    const otp=generateOTP();
    currentOTP=otp;
    

    console.log("Email:", email);
    console.log("OTP_GENERATED:", otp);

    try {
        // await sendEmail(email, otp);
        res.redirect("/verify.html");
    } catch (error) {
        res.status(500).send("Failed to send OTP. Please check server credentials and try again.");
    }


});

app.post("/verify-Otp",(req,res)=>{

    const userOtp=req.body.otp;
    if(userOtp===currentOTP){
        res.send("Login hogaya badhai ho!!!!")
    }
    else{
        res.send("Invalid OTP :(. Try again with valid otp.")
    }
});



app.listen(PORT, ()=>{

    console.log(`Server running at http://localhost:${PORT}`);

    
})