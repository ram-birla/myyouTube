const ipfsAPI = require('ipfs-api');
const express = require('express');
const fs = require('fs');
const app = express();
var formidable = require("formidable");



app.set("view engine", "ejs");
//Connceting to the ipfs network via infura gateway
const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})

//Reading file from computer


app.get('/',function(req,res){
  res.render('ip')
})


//Addfile router for adding file a local file to the IPFS network without any local node
app.post('/addfile', function(req, res) {
    var formData = new formidable.IncomingForm();
    formData.parse(req, function(err, fields, files) {
      var vpath = files.video.path;
      let testFile = fs.readFileSync(vpath);
      //Creating buffer for ipfs function to add file to the system
      let testBuffer = new Buffer(testFile);
      ipfs.files.add(testBuffer, function (err, file) {
          if (err) {
            console.log(err);
          }
          console.log(file)
        })
    })

})
//Getting the uploaded file via hash code.
app.get('/getfile', function(req, res) {
    
    //This hash is returned hash of addFile router.
    const validCID = 'HASH_CODE'

    ipfs.files.get(validCID, function (err, files) {
        files.forEach((file) => {
          console.log(file.path)
        })
      })

})

app.listen(3000, () => console.log('App listening on port 3000!'))