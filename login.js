var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

//Ahora podemos conectarnos a nuestra base de datos con el siguiente código:
var connection = mysql.createConnection({
host     : 'localhost',
user     : 'root',
password : '',
database : 'nodelogin'
});

//Express es lo que usaremos para nuestras aplicaciones web, esto incluye paquetes útiles en el desarrollo web, como sesiones y manejo de solicitudes HTTP, para inicializarlo podemos hacer:
var app = express();

//Ahora necesitamos informarle a Express que usaremos algunos de sus paquetes:
app.use(session({
secret: 'secret',
resave: true,
saveUninitialized: true
}));

//Asegúrese de cambiar el código secreto de las sesiones, el paquete de sesiones es lo que usaremos para determinar si el usuario ha iniciado sesión, el paquete bodyParser extraerá los datos del formulario de nuestro archivo login.html.
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

//Ahora necesitamos mostrar nuestro archivo login.html al cliente:
app.get('/', function(request, response) {
response.sendFile(path.join(__dirname + '/login.html')); //Cuando el cliente se conecta al servidor, se mostrará la página de inicio de sesión, el servidor enviará el archivo login.html.
});


app.post('/auth', function(request, response) {
    var username = request.body.username; //Obtenemos el nombre de usuario.
    var password = request.body.password; //Obtenemos la contraseña. 

    if (username && password) { // Verificamos que no estén vacios.
        //Sino están vacios los campos hacemos la consulta para verificar el usuario y contraseña.
        connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
        if (results.length > 0) { // El result es más de 1, es que si se encuentra correcto.
            request.session.loggedin = true; // asignamos a loggedin como TRUE
            request.session.username = username; // Asignamos el nombre de usuario a una variable de sesión.
            response.redirect('/home'); //Redireccionamos a /home
        } else {
            response.send('Usuarios y/o contraseña incorrectos!'); //En dado caso que el result de 0, es que no encontro coincidencias en la consulta de usuario y contraseña; mandamos mensaje.
        }
        response.end(); // Terminamos el proceso
        });
    } else {
        response.send('Ingresa usuario y contraseña!'); // Si se encuentran vacios los campos mandamos mensaje.
        response.end(); // Terminamos el proceso.
    }
});

app.get('/home', function(request, response) {
if (request.session.loggedin) { // Verificamos la variable de sesión loggedin sea TRUE
response.send('Bienvenido de nuevo, ' + request.session.username + '! <br><br> <a href="/logout" class="btn btn-success">Cerrar sesión</a>'); // Si es TRUE mostramos mensaje con el nombre de usuario de la sesión.
} else {
response.send('Iniciar sesión de nuevo, por favor!'); // Si loggedin es FALSO solicitamos que inicie sesión de nuevo.
}
response.end(); // Terminamos proceso.
});

// Cerrar sesión 
app.get('/logout', function (request, response) {
  request.session.destroy();
  response.send('Sesión terminada correctamente <br><br> <a href="/" class="btn btn-success">Inicar sesión de nuevo.</a>');
});

//Nuestra aplicación web necesita escuchar en un puerto, para propósitos de prueba usaremos el puerto 3000:
app.listen(3000, function(){
console.log('Puesto en marcha el server en puerto 3000');
});