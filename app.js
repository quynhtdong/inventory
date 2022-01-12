// set up express & mongoose
var express = require('express')
var app = express()
var bodyParser = require('body-parser');
var mongoose = require('mongoose')

var fs = require('fs');
var path = require('path');
require('dotenv/config');

mongoose.connect(process.env.MONGO_URL,
  { useNewUrlParser: true, useUnifiedTopology: true }, err => {
      console.log('connected')
  });

  
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
  
// Set EJS as templating engine 
app.set("view engine", "ejs");
// set up multer for storing uploaded files

var multer = require('multer');

var storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'uploads')
	},
	filename: (req, file, cb) => {
		cb(null, file.fieldname + '-' + Date.now())
	}
});

var upload = multer({ storage: storage });

//load the mongoose model for item

var item = require('./models');

// the GET request handler that provides the HTML UI

app.get('/', (req, res) => {
	item.find({}, (err, items) => {
		if (err) {
			console.log(err);
			res.status(500).send('An error occurred', err);
		}
		else {
			res.render('page', { items: items });
		}
	});
});

// the POST handler for processing the uploaded item

app.post('/add', upload.single('image'), (req, res, next) => {

	var obj = {
		name: req.body.name,
		desc: req.body.desc,
		amount: req.body.amount,
		img: {
			data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
			contentType: 'image/png'
		}
	}
	item.create(obj, (err, item) => {
		if (err) {
			console.log(err);
		}
		else {
			res.redirect('/');
		}
	});
});

app.post("/delete", function (req, res) {
    const itemId = req.body.itemId
	console.log(itemId)
    item.findByIdAndRemove(itemId, function(err){
		if (!err) {
		  console.log("Successfully deleted item.");
		  res.redirect("/");
		}
	  });
})

app.post("/update", upload.single('image'), (req, res, next) => {
    const itemId = req.body.itemId
	console.log(req.body)
	var obj = {
		name: req.body.name,
		desc: req.body.desc,
		amount: req.body.amount,
		img: {
			data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
			contentType: 'image/png'
		}
	}
    item.updateOne(
        { _id: itemId },
        { $set: obj },
        function (err, result) {
            if (!err) res.redirect("/");
            else res.send(err)
    })
})

// configure the server's port

var port = process.env.PORT || '3000'
app.listen(port, err => {
	if (err)
		throw err
	console.log('Server listening on port', port)
})
