// set up
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var stormpath = require('express-stormpath');

//instagram.set('client_id','288e244b773348d0901b17a3ba931bbd');
//instagram.set('client_secret','0c2a06c2830d435b988b6668724b3c42');

// execute mongod from mongo folder with --dbpath into todoData
// start with nodemon.js
// wallah
mongoose.connect('mongodb://localhost/data');

app.use(stormpath.init(app, {
  client: {
    apiKey: {
      id: '2WOUH2UXLEOZXAMV78GFEOK97',
      secret: '95yknE1sZ5+v7a4FFS9flsR1/tbhTAgc1hJOAfzioJM'
    }
  },
  application: {
    href: 'https://api.stormpath.com/v1/applications/6wjb9o5n7bmRHeEwjemWnI'
  }
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

app.get('/', function(req,res) {
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