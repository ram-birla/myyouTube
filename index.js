var express = require("express");
var app = express();
var http = require('http').createServer(app);
const mongoose = require('mongoose');
var bodyParser = require("body-parser");
// var bcrypt = require("bcrypt");
const session = require('express-session');
var formidable = require("formidable");
var fileSystem = require("fs");
var { getVideoDurationInSeconds } = require("get-video-duration");
const User = require("./model/User");
const Video = require("./model/Video");
const Comment = require("./model/Comment");
const Like = require("./model/Like");
const Dislike = require("./model/Dislike");
const Notification = require("./model/Notification");
const Replies = require("./model/Replies");
const Subscriber = require("./model/Subscriber");
const History = require("./model/History");

TWO_HOURS = 1000*60*60*2
const{
    PORT = 3000,
    NODE_ENV = 'development',
    SESS_NAME = 'ram',
    SESS_SECRET = 'ijo20fjfk',
    SESS_LIFETIME = TWO_HOURS
} = process.env

const IN_PROD = NODE_ENV === 'production'
mongoose.connect('mongodb+srv://test:test@cluster0-pjirh.mongodb.net/youTube?retryWrites=true&w=majority',{useNewUrlParser:true,useUnifiedTopology:true});
const db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error:'));
db.once('open',function(){
    console.log("connected to mongodb");
});

//use sessions for tracking logins
app.use(session({
    name: SESS_NAME,

    secret: SESS_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie :{
        maxAge: SESS_LIFETIME,
        sameSite: true,
        secure: IN_PROD

    }
  }));

// a function to return users document
async function getUser(id, callBack){
    await User.findOne({
        _id:id
    }, function (err, user){
        callBack(user);
    })
}

app.use(bodyParser.json({
    limit: "10000mb"
}));
app.use(bodyParser.urlencoded({
    extended:true,
    limit: "10000mb",
    parameterLimit: 1000000
}))
app.use("/public", express.static(__dirname + "/public"));
app.set("view engine", "ejs");

http.listen(3000, function(){
    console.log("Server started at 3000");

    app.get("/", function(req,res){
        res.render("index.ejs");
    });

    app.get("/signup", function(req,res){
        res.render("signup",{"msg":""})
    });

    app.post("/signup",(req,res)=>{
        (async()=>{
            try{
                let {name,email,pass1} = req.body
                let userData = {
                            name,
                            email,
                            password:pass1
                    };
                console.log(req.body)
                chkUser = await User.find({email:email}).exec()
                console.log(chkUser)
                if(chkUser.length == 0){
                    console.log("save user")
                    let user = new User(userData)
                    let x = await user.save()
                    req.session.user = {
                        email: x.email,
                        id: x._id
                    };
                    req.session.user.expires = new Date(
                        Date.now() + 3 * 24 * 3600 * 1000
                    );
                    console.log('successful login')
                    console.log(req.session)
                    res.redirect('/index')
                }
                else{
                    console.log('user already exists')
                    msg ="User Already registered"
                    res.redirect('/registered',{"msg":msg})
                }
            }
            catch(e){
                console.log(e)
                
            }
        })();
    })

    app.get("/login", function(req,res){
        res.render("login",{
            "msg": ""
        })
    })

    app.post("/login",  async (req,res) =>{
        let {email,password} = req.body;
        console.log(email,password);
        (async()=>{
            try {
            if(email && password){
                console.log("AAAAAAAAAAAA")
                await User.findOne({email: email,password: password}, (err, userData) =>{
                if(err){
                    // console.log(userData.password)
                    console.log('invalid credential')
                    msg = "Invalid Credentials"
                    res.render('/login',{"msg":msg})   
                    
                } else {
                    console.log("bbbbbbbbbbbbbb")
                    if(userData == null){
                        msg = "Password Incorrect"
                        res.render('login.ejs',{"msg":msg})
                    }else{
                        req.session.user = {
                            email: userData.email,
                            id: userData._id
                        };
                        console.log(userData)
    
                        req.session.user.expires = new Date(
                            Date.now() + 3 * 24 * 3600 * 1000
                        );
                        console.log('successful login')
                        console.log(req.session)
                        res.redirect('/index')
                    }
                        
                }
            })
            // const user = User.find(user=>{
            //     user.email === email && user.password1 === pass
            // }
            // )
            // if(user){
            //     console.log(user.email,user.pass)
            //     req.session.userId = user._id
            //     return res.redirect('/index')
            // }
        }else{
            msg="Invalid Credential"
            res.render('/login',{"msg":msg})
        }
            
        } catch (error) {
            console.log(e)
            msg = "Password Incorrect"
            res.render('/login',{"msg":msg})
        }
    })();
    });

    app.get('/logout', function(req,res){
        req.session.destroy(err =>{
            if(err){
                return res.redirect('/home')
            }
            res.clearCookie(SESS_NAME)
            res.redirect('/login')
        })
    
    })

    app.get("/index", async function(req,res){
        const user = await User.findById({"_id": req.session.user.id})
        const videos = await Video.find({}).populate('user').sort({
            "createdAt": -1
        });
        res.render("home",{
            "videos":videos,
            "user":user
        })
    });

    app.get("/upload", async function(req,res){
        if(req.session.user){
            const user = await User.findById({"_id": req.session.user.id})
            res.render("upload",{"user":user})
        } else{
            res.redirect("/login")
        }
    })
        
    app.post("/upload-video", async function(req,res){
        if(req.session.user){
            
            var formData = new formidable.IncomingForm();
            formData.maxFileSize = 1000 * 1024 * 1024;
            formData.parse(req, function(err, fields, files) {
                var title = fields.title;
                var description = fields.description;
                var tags = fields.tags;
                var category = fields.category;

                var oldPathThumbnail = files.thumbnail.path;
                var thumbnail = "public/thumbnails/" + new Date().getTime() + "-" + files.thumbnail.name;
                fileSystem.rename(oldPathThumbnail, thumbnail, function(err){

                })

                var oldPathVideo = files.video.path;
                var newPath = "public/videos/" + new Date().getTime() + "-" + files.video.name;
                fileSystem.rename(oldPathVideo, newPath, function(err){
                    //get user data to save in videos document
                    getUser(req.session.user.id, function(user){
                        var currentTime = new Date().getTime();

                        //get video duration
                        getVideoDurationInSeconds(newPath).then(async function(duration){
                            var hours = Math.floor(duration / 60 / 60);
                            var minutes = Math.floor(duration / 60) - (hours * 60);
                            var seconds = Math.floor(duration % 60)

                            //insert in database
                            console.log(hours,minutes,seconds)
                            d = {
                                "user":req.session.user.id,
                                "filePath": newPath,
                                "thumbnail": thumbnail,
                                "title": title,
                                "description": description,
                                "tags": tags,
                                "category": category,
                                "hours": hours,
                                "minutes": minutes,
                                "seconds": seconds,
                                "watch": currentTime,
                                "views": 0,
                                "playlist": "",
                                "likers": [],
                                "dislikers": [],
                                "comments": []
                            }
                            console.log(d)
                            const video = new Video(d)
                            console.log(video)
                            await video.save();
                            const usr = await User.findByIdAndUpdate({_id: req.session.user.id})
                            usr.videos.push(video);
                            console.log(usr);
                            await usr.save()
                            // const video = new Video(, async function(err, data){
                            //     await video.save();
                            //     console.log(video)
                            //     console.log(data)
                            //     // insert in users collection too
                            //     const usr = await User.findByIdAndUpdate({_id: req.session.user.id})
                            //     usr.videos.push(video);
                            //     await usr.save()
                            console.log("Saved")

                            // });
                            res.redirect("/index")
                        })
                    });
                })
            })

        } else{
            res.redirect("/login")
        }
    })

    app.get("/watch/:videoId", async function(req,res){
        const video = await Video.findOne({
            "_id":req.params.videoId
        }).populate('user')
//         Project.find(query)
//   .populate({ 
//      path: 'pages',
//      populate: {
//        path: 'components',
//        model: 'Component'
//      } 
//   })
        const cmnt = await Comment.find({"post":req.params.videoId}).populate('user').populate('replies.user')
        const reply = await Replies.find({"post":req.params.videoId}).populate('user')
        const user = await User.findById({"_id": req.session.user.id})
        console.log(video)
        console.log(cmnt)
        if(req.session.user){
            if(video == null){
                console.log("no seeeeeeeeeeeeeeee")
                res.send("Video Does Not Exist")
            } else{ 
                const view = await Video.findByIdAndUpdate(
                    { "_id": req.params.videoId },
                    {
                        $inc:{
                            "views": 1
                        }
                    }
                )

                res.json({
                    "video":video,
                    "comments": cmnt,
                    "user": user
                })
            }
        }else{
            res.redirect("/login")
        }
    })

    app.post("/do-like", async function(req,res){
        if(req.session.user){
            await Like.findOne({
                "post":req.body.videoId,
                "user": req.session.user.id
            }, async function(error, liked){
                if(liked == null){
                    //push in likers array
                    const like = new Like({
                        "post": req.body.videoId,
                        "user": req.session.user.id
                    })
                    console.log(like)
                    await like.save();
                    const vid = await Video.findByIdAndUpdate({_id: req.body.videoId})
                    vid.likers.push(like);
                    console.log(vid);
                    await vid.save()
                    res.json({
                        "status":"success",
                        "message":"Liked this videos"
                    })
                } else{
                    console.log("Liked alredy")
                    res.json({
                        "status":"error",
                        "message":"Already Liked this videos"
                    })
                }
            })
            

        } else{
            console.log("Logged out")
            res.json({
                "status":"error",
                "message":"Please login"
            })
        }
    })


    app.post("/do-dislike", async function(req,res){
        if(req.session.user){
            await Dislike.findOne({
                "post":req.body.videoId,
                "user": req.session.user.id
            }, async function(error, disliked){
                if(disliked == null){
                    //push in dislikers array
                    const dislike = new Dislike({
                        "post": req.body.videoId,
                        "user": req.session.user.id
                    })
                    console.log(dislike)
                    await dislike.save();
                    const vid = await Video.findByIdAndUpdate({_id: req.body.videoId})
                    vid.dislikers.push(dislike);
                    console.log(vid);
                    await vid.save()
                    res.json({
                        "status":"success",
                        "message":" DisLiked this videos"
                    })
                } else{
                    console.log("Liked alredy")
                    res.json({
                        "status":"error",
                        "message":"Already DisLiked this videos"
                    })
                }
            })
            

        } else{
            console.log("Logged out")
            res.json({
                "status":"error",
                "message":"Please login"
            })
        }
    })

    app.post("/do-comment", function (req,res){
        if(req.session.user){

            getUser(req.session.user.id, async function (user){
                const cmnt = new Comment({
                    "content":req.body.comment,
                    "replies":[],
                    "post":req.body.videoId,
                    "user": req.session.user.id
                })
                console.log(cmnt) 
                await cmnt.save()
                const vid = await Video.findOneAndUpdate({"_id": req.body.videoId})
                vid.comments.push(cmnt)
                await vid.save()
                // find channelId
                var channelId = vid.user._id
                //create a notification
                const notify = new Notification({
                    "typ": "new_comment",
                    "content": cmnt._id,
                    "user": channelId,
                    "post": vid._id,
                    "video_watch": vid.watch,
                    "is_read": false
                })
                await notify.save()
                // send notification to video publisher
                
                usr = await User.findByIdAndUpdate({ "_id": channelId})
                usr.notifications.push(notify)
                await usr.save();
                u = await User.findOne({"_id":req.session.user.id})
                console.log("Notified and commented successsfully")
                res.json({
                    "status":"success",
                    "message":"Comment has been posted",
                    "user": u
                })
            })
        }else{
            res.json({
                "status":"error",
                "message":"Please Login"
            })
        }
    })

    app.get("/get_user", async function(req,res){
        if(req.session.user){
           const usr = await User.findById({"_id":req.session.user.id})
           const notify = await Notification.find({"user":usr}).populate()
           res.json({
               "status":"success",
               "message": "Notifications",
               "user": notify
           })
        } else{
            res.json({
                "status": "error",
                "message": "Please login to perform this action"
            })
        }
    })

    app.post("/read-notification", async function (req,res){
        if(req.session.user){
            const usr = await User.findOne({"_id":req.session.user.id})
            const n = await Notification.findByIdAndUpdate({"_id":req.body.notificationId},{
                
                    "is_read":true
                
            }, function(err, data){
                res.json({
                    "status":"success",
                    "message": "Notification marked as read"
                })
            })
        } else{
            res.json({
                "status": "error",
                "message": "Please Login to perform this action"
            })
        }
    })

    app.post("/do-reply", async function(req,res){
        if(req.session.user){
            var r = req.body.reply;
            var commentId = req.body.commentId;
            const usr = await User.findById({"_id":req.session.user.id})
            const vid = await Video.findOne({"comments":commentId})
            const cmnt = await Comment.findById({"_id":commentId})
            const rply = new Replies({
                "content": r,
                "comment": cmnt,
                "post": vid,
                "user": usr
            })
            await rply.save();
            cmnt.replies.push(rply)
            await cmnt.save()

            const u = await User.find({
                "videos": vid._id
            })

            const notify = new Notification({
                "typ": "new_reply",
                "content": cmnt._id,
                "user": u._id,
                "post": vid._id,
                "video_watch": vid.watch,
                "is_read": false
            })
            await notify.save()

            u.notifications.push(notify)
            u.save()
            res.json({
                "status": "success",
                "message": "Reply has been posted",
                "user": u
            })
        } else{
            res.json({
                "status": "error",
                "message": "Please Login "
            })
        }
    })

    app.post("/do-subscribe", async function(req,res){
        if(req.session.user){
            await Video.findOne({
                "_id":req.body.videoId}, async function(error, video){
                    if(req.session.user.id == video.user._id){
                        res.json({
                            "status":"error",
                            "message":"You cannot subscribe Your Own Channel"
                        })
                    } else{
                        //Check if channel is alredy Subscribed
                        const subscribed = await Subscriber.findOne({
                            "channel": video.user._id,
                            "subscriber": req.session.user.id
                        })
                        if (subscribed == null){
                            const subscribe = new Subscriber({
                                "channel": video.user._id,
                                "subscriber": req.session.user.id
                            })
                            await subscribe.save()
                            const usr = await User.findByIdAndUpdate({
                                "_id": video.user._id
                            })
                            usr.subscription.push(subscribe)
                            await usr.save()
                            res.json({
                                "status" : "success",
                                "message": "SubScribed"
                            })

                        } else{
                            res.json({
                                "status": "error",
                                "message": "Already Subscribed"
                            })
                        }
                    }
                })

        } else{
            res.json({
                "status" : "error",
                "message": "Please Login"
            })
        }
    })


    app.get("/get-related-videos/:category/:videoId", async function(req,res){
        const videos = await Video.find({
            $and: [{
                "category": req.params.category
            },{
                "_id": {
                    $ne: req.params.videoId
                }
            }]
        })
        for(var a=0; a<videos.length; a++){
            var x = videos[a];
            var y = Math.floor(Math.random() * (a+1));
            videos[a] = videos[y];
            videos[y] = x;
        }
        console.log(videos)
        res.json(videos)
    })

    app.post("/save-history", async function(req,res){
        if(req.session.user){
            const vid = await Video.findOne({"_id": req.body.videoId})
            const usr = await User.findOne({"_id":req.session.user.id})
            const hstry = await History.findOne({"post" : req.body.videoId})
            if(hstry == null){
                const hst = new History({
                    "post": req.body.videoId,
                    "watched": req.body.watched,
                    "user": req.session.user.id
                })
                console.log("Saving History ......................")
                await hst.save();
                usr.history.push(hst);
                usr.save();

                res.json({
                    "status": "success",
                    "message": "History has been saved"
                })
            } else{
                console.log("History updating")
                const hsty = await History.findOne({"post" : req.body.videoId},{
                    $set:{
                        "watched": req.body.watched
                    }
                })
             res.json({
                 "status": "success",
                 "message": "History has been updated"
             })
            }

        } else{
            res.json({
                "status": "error",
                "message": "Please Login"
            })
        }
    })

    app.get("/watch-history", async function(req,res){
        if(req.session.user){
            const usr = await User.findOne({"_id": req.session.user.id}).populate('history')
            const hst = await History.find({"user": usr}).populate("post")
            console.log(hst)
            res.render("watchhistory",{
                "user": usr,
                "history": hst
            })
        } else{
            res.redirect("/login");
        }
    })

    app.get("/channel/:channelId", async function(req,res){
        const user = await User.findById({"_id":req.params.channelId}).populate('videos')
        if(user == null){
            res.send("Channel Not found")
        } else{
            res.render("singlechannel",{
                "user":user
            })
        }
    })

    app.post("/change-profile-picture", function(req,res){
        if(req.session.user){
            var formData = new formidable.IncomingForm();
            formData.parse(req, function (error,fields,files){
                var oldPath = files.image.path;
                var newPath = "public/images/profile/" + req.session.user.id + "-" + files.image.name;
                fileSystem.rename(oldPath, newPath, async function (error){
                    const usr = await User.findByIdAndUpdate({
                        "_id": req.session.user.id
                    },{
                        $set:{
                            "image":newPath
                        }
                    })
                    res.redirect("/channel/"+ req.session.user.id)
                })
            })
        } else{
            res.redirect("/login")
        }
    })

    app.post("/change-cover-picture", function(req,res){
        if(req.session.user){
            var formData = new formidable.IncomingForm();
            formData.parse(req, function (error,fields,files){
                var oldPath = files.image.path;
                var newPath = "public/images/covers/" + req.session.user.id + "-" + files.image.name;
                fileSystem.rename(oldPath, newPath, async function (error){
                    const usr = await User.findByIdAndUpdate({
                        "_id": req.session.user.id
                    },{
                        $set:{
                            "coverPhoto":newPath
                        }
                    })
                    res.redirect("/channel/"+ req.session.user.id)
                })
            })
        } else{
            res.redirect("/login")
        }
    })

    app.get("/edit/:videoId", async function (req,res){
        if(req.session.user){
            const vid = await Video.findById({
                "_id": req.params.videoId,
                "user": req.session.user.id
            })
            if(vid == null){
                res.send("Sorry You Did not won This Channel!!")
            } else{
                res.render("editvideo",{
                    "video": vid,
                    "user": req.session.user
                })
            }
        } else{
            res.redirect("/login");
        }
    })

    app.post("/edit", function(req,res){
        if(req.session.user){
            var formData = new formidable.IncomingForm();
            formData.parse(req, async function(error, fields, files) {
                const vid = await Video.findOne({
                    "_id" : fields.videoId,
                    "user": req.session.user.id
                })
                if(vid == null){
                    res.send("Sorry you do not own this Video");
                } else{
                    if( files.thumbnail.size > 0){
                        var oldPath = files.thumbnail.path;
                        fileSystem.rename(oldPath, vid.thumbnail, function(error){

                        })
                    }
                    const video = await Video.findOneAndUpdate({
                        "_id": fields.videoId
                    },{
                        $set: {
                            "title": fields.title,
                            "description": fields.description,
                            "tags": fields.tags,
                            "category": fields.category
                        }
                    })
                    res.redirect("/edit/" + vid._id)
                }
            })
        } else{
            res.redirect("/login")
        }
    })

    app.get("/chanel/:channelId", async function(req,res){
        const user = await User.findById({"_id":req.params.channelId}).populate('videos')
        if(user == null){
            res.send("Channel Not found")
        } else{
            res.render("userchannel",{
                "user":user
            })
        }
    })
    
    app.post("/delete-video", async function(req,res){
        if(req.session.user){
            const vid = await Video.findOne({
                "_id": req.body._id,
                "user": req.session.user.id
            })
            if(vid == null){
                res.send("Sorry you do not own this channel")
            } else{
                fileSystem.unlink(vid.filePath, function(error){
                    fileSystem.unlink(vid.thumbnail, function(error){

                    })
                })
                await Video.remove({
                    "_id": req.body._id,
                    "user": req.session.user.id
                })
                await User.findOneAndUpdate({
                    "_id": req.session.user.id
                },{
                    $pull:{
                        "videos": req.body._id
                    }
                
                })
                const hst = await History.findOne({
                    "post": req.body._id,
                    "user": req.session.user.id
                })
                await User.findOneAndUpdate({
                    "_id": req.session.user.id
                },{
                    $pull:{
                        "history":hst._id
                    }
                })
                await History.remove({
                    "post": req.body._id,
                    "user": req.session.user.id
                })

                
                res.redirect("/index")
            }
        } else{
            res.redirect("/login")
        }
    })
})