var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');


var connection = mysql.createConnection({
host     : 'localhost',
user     : 'root',
password : '',
database : 'nodelogin'
});

//Express es lo que usaremos para nuestras aplicaciones web, esto incluye paquetes útiles en el desarrollo web, como sesiones y manejo de solicitudes HTTP, para inicializarlo podemos hacer:
var app = express();


app.use(session({
secret: 'secret',
resave: true,
saveUninitialized: true
}));


app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());


app.get('/', function(request, response) {
response.sendFile(path.join(__dirname + '/login.html')); 
});


app.post('/auth', function(request, response) {
    var username = request.body.username; 
    var password = request.body.password; 

    if (username && password) { 
        
        connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
        if (results.length > 0) { 
            request.session.loggedin = true; 
            request.session.username = username; // Asignamos el nombre de usuario a una variable de sesión.
            response.redirect('/home'); 
        } else {
            response.send('Usuarios y/o contraseña incorrectos!'); 
        }
        response.end(); 
        });
    } else {
        response.send('Ingresa usuario y contraseña!'); 
        response.end(); 
    }
});

app.get('/home', function(request, response) {
if (request.session.loggedin) { 
response.send('Bienvenido de nuevo, ' + request.session.username + '! <br><br> <a href="/logout" class="btn btn-success">Cerrar sesión</a>'); 
} else {
response.send('Iniciar sesión de nuevo, por favor!'); 
}
response.end(); 
});

// Cerrar sesión 
app.get('/logout', function (request, response) {
  request.session.destroy();
  response.send('Sesión terminada correctamente <br><br> <a href="/" class="btn btn-success">Inicar sesión de nuevo.</a>');
});


app.listen(3000, function(){
console.log('Puesto en marcha el server en puerto 3000');
});