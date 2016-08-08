// set up
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var stormpath = require('express-stormpath');

// execute mongod from mongo folder with --dbpath into todoData
// start with nodemon.js
// wallah
mongoose.connect('mongodb://minipunch:redlego123@ds145385.mlab.com:45385/heroku_xv47kkpq');

app.use(stormpath.init(app, {
  application: process.env.STORMPATH_URL
}));

app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({type: 'application/vnd.api+json'}));
app.use(methodOverride());

// model
var Todo = mongoose.model('Todo', {
  text: String
});

app.get('/', stormpath.loginRequired, function(req,res) {
  res.sendfile('./public/index.html')
});

// listen
app.on('stormpath.ready',function() {
 var port = Number(process.env.PORT || 8080);
 app.listen(port);
  console.log("App listening on port 8080");
});

// routes
//get all todos
app.get('/api/todos', function(req,res) {
  Todo.find(function(err, todos) {
    if(err)
      res.send(err);

    res.json(todos);
  });
});

// create todo and send back all todos afterwards
app.post('/api/todos', function(req,res) {
  Todo.create({
    text: req.body.text,
    done: false,
    isBeingEdited: false,
    needConfirmation: false
  }, function(err, todo) {
    if(err)
      res.send(err);

    Todo.find(function(err, todos) {
      if(err)
        res.send(err);
      res.json(todos);
    });
  });
});

// delete
app.delete('/api/todos/:todo_id', function(req,res) {
  Todo.remove({
  _id: req.params.todo_id
}, function(err, todo) {
  if(err)
    res.send(err);

  Todo.find(function(err,todos) {
    if(err)
      res.send(err)
    res.json(todos);
  });
});
});

// edit
app.put('/api/todos/edit',function(req,res) {
  var query = {'_id':req.body._id};

  Todo.findOneAndUpdate(query, {"text":req.body.text}, {upsert:true}, function(err, doc){
    if (err) return res.send(500, { error: err });
  });

  Todo.find(function(err,todos) {
    if(err)
      res.send(err)
    res.json(todos);
  });
});
