
const e = require("express");
const express = require("express"),
  bodyParser = require("body-parser"),
  request = require("request"),
  flash = require("connect-flash"),
   cors = require('cors');
const { forEach, filter } = require("lodash");
  userRoutes = require("./routes/User"),
  postRoutes = require("./routes/Post"),
  thiefRoutes = require("./routes/Thief"),
  { auth, firestore } = require("./models/index"),
  moment = require("moment")
  moment.locale("th")
// set up express
 app = express();
 app.use(express.json({limit: '50mb' }));
 app.use(express.urlencoded({limit: '50mb' , extended:true }))
 app.use(cors())
 
 app.post('/webhook', (req, res) => {
  let tokenUser = req.body.events[0].replyToken;
  let message = req.body.events[0].message.text;
    replyToUser(tokenUser,message)
   
})

const replyToUser = async(tokenUser,message) => {
  
  let headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer 3f6X573q0fD0AORDQWaZ22z8mJreeV6t/DxWBQ9o1obR5ETV9o6MiD/1FaahCjxmyCxA3WmMQm3ToPt9A8IqgUB3WQT6nUeJTbSnGcDQ/wYVIG2GdaZK05pPlby1YAdCxbSfhKPIN3rPfBFt8fLtDAdB04t89/1O/w1cDnyilFU='
}
let item = []
let textBot
let BotReply 
const getDb = await firestore.collection("Thief")
await getDb.get().then(doc => {
    if(doc){
      doc.forEach(doc2 => {
        if(doc2){
          textBot = {nameSurnameAccount : `${doc2.data().name} ${doc2.data().surname} ${doc2.data().accountnumber}` , nameSurname : `${doc2.data().name} ${doc2.data().surname}` , account : `${doc2.data().accountnumber}` ,data : doc2.data()}
           item.push(textBot)
        }
      })
    }
  })
  
   item.filter(res => {
   if(res.nameSurnameAccount === message){
      BotReply = 
      `
      ${res.data.name} ${res.data.surname} 
      มีประวัติการโกงในระบบ 
      เลขบัญชี ${res.data.accountnumber} 
      ธนาคาร ${res.data.bank} 
      จำนวนครั้งที่โกง ${res.data.count} 
      ครั้ง ยอดโกงทั้งหมด ${res.data.summoney} บาท 
      วันที่โกงล่าสุด ${moment(new Date(res.data.wanteedon.seconds * 1000)).format("lll")} 
      https://monkeyfruad-54aff.web.app/thief/post/${res.data.accountnumber}?are%20you%20ok
      `
    }
    else if(res.nameSurname === message){
      BotReply =  
      `
      ${res.data.name} ${res.data.surname} 
      มีประวัติการโกงในระบบ 
      เลขบัญชี ${res.data.accountnumber} 
      ธนาคาร ${res.data.bank} 
      จำนวนครั้งที่โกง ${res.data.count} 
      ครั้ง ยอดโกงทั้งหมด ${res.data.summoney} บาท 
      วันที่โกงล่าสุด ${moment(new Date(res.data.wanteedon.seconds * 1000)).format("lll")} 
      https://monkeyfruad-54aff.web.app/thief/post/${res.data.accountnumber}?are%20you%20ok
      `
    }else if(res.account === message){
      BotReply =  
      `
      ${res.data.name} ${res.data.surname} 
      มีประวัติการโกงในระบบ 
      เลขบัญชี ${res.data.accountnumber} 
      ธนาคาร ${res.data.bank} 
      จำนวนครั้งที่โกง ${res.data.count} 
      ครั้ง ยอดโกงทั้งหมด ${res.data.summoney} บาท 
      วันที่โกงล่าสุด ${moment(new Date(res.data.wanteedon.seconds * 1000)).format("lll")} 
      https://monkeyfruad-54aff.web.app/thief/post/${res.data.accountnumber}?are%20you%20ok
      `
    }else if(message === "ตรวจสอบคนโกง"){
      BotReply = 
      `
      พะโล้สามารถช่วยตรวจสอบความปลอดภัยของคุณได้
      - ตัวอย่างการพิมพ์ ชื่อ - นามสกุล
      เช่น สมชาย สายบัว

      - ตัวอย่างการพิมพ์ เลขที่บัญชี
      เช่น 1234567890

      แล้วพะโล้จะตรวจสอบให้ว่าคนที่คุณต้องการตรวจสอบเคยมีประวัติการโกงหรือไม่
      `
    }
  })
  if(BotReply === undefined){
        BotReply = "พะโล้ไม่เข้าใจ พูดใหม่ได้มั้ย เจี๊ยก-"
  }

  console.log(BotReply)
    let body = JSON.stringify({
  replyToken: tokenUser,
  messages: [{
      type: 'text',
      text: BotReply
  }]
  })
  request.post({
    url: 'https://api.line.me/v2/bot/message/reply',
    headers: headers,
    body: body
  }, (err, res, body) => {
    console.log(body);
    // console.log(err);
  });
}

// app
// Set Route
app.use("/user", userRoutes);
app.use("/post", postRoutes);
app.use("/thief", thiefRoutes);
const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
  console.log("server start on port 7000");
});