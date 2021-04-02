const e = require("express");
const express = require("express"),
  bodyParser = require("body-parser"),
  request = require("request"),
  flash = require("connect-flash"),
   cors = require('cors')
  userRoutes = require("./routes/User"),
  postRoutes = require("./routes/Post"),
  thiefRoutes = require("./routes/Thief"),
// set up express
 app = express();
 app.use(express.json({limit: '50mb' }));
 app.use(express.urlencoded({limit: '50mb' , extended:true }))
 app.use(cors())
 
 app.post('/webhook', (req, res) => {
   if(req.body.event){
    let tokenUser = req.body.event[0].replyToken
    console.log(tokenUser)
    replyToUser(tokenUser)
 
   }
    res.sendStatus(200)
   
  
})

const replyToUser = (tokenUser) => {
  let headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer OmVUWBXZY9gE9N/F6yHHXHIyoh1ahnKIpUOChGZmxqaUfjkucGYO8zRF2OGwPrYYyCxA3WmMQm3ToPt9A8IqgUB3WQT6nUeJTbSnGcDQ/wZRxvJqd5eAXHBQeBu4Mc8PJzQ1ZUHngoPvEFHIkoMlhgdB04t89/1O/w1cDnyilFU='
}
    let body = JSON.stringify({
  replyToken: tokenUser,
  messages: [{
      type: 'text',
      text: 'Hello'
  },
  {
      type: 'text',
      text: 'How are you?'
  }]
  })
  request.post({
    url: 'https://api.line.me/v2/bot/message/reply',
    headers: headers,
    body: body
  }, (err, res, body) => {
    console.log(res);
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