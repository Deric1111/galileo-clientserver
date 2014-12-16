var http = require("http");
var url = require('url');
var fs = require('fs');
var io = require('socket.io')(server);
var Galileo = require('galileo-io');
var SQL = require('sql.js');
var filebuffer = fs.readFileSync('project.db');

// Load the db
var db = new SQL.Database(filebuffer);
var board = new Galileo();
console.log("success");

var server = http.createServer(function(request, response){
    //Post Method
	console.log(request.method);
    
    var path = url.parse(request.url).pathname;
	
	if(request.method == 'POST'){
		console.log(path);
		switch(path){
			case 'dashboard:get':
			case '/dashboard:get':
				var data = sql_dashboard();
				OnSuccess(response, JSON.stringify(data), 'json')
				break;
			default: OnFailure(response, error);
		}
    }

	if(request.method == 'GET'){
	    switch(path){
			//SUMMARY:: Default Page 
			case '/':
	        case '/home':
				console.log(__dirname + path);
		            	fs.readFile(__dirname + '/index.html', 'utf8', function(error, data){
		                	if (error){
						OnFailure(response, error);
		                	}
		                	else{
				    		OnSuccess(response, data, 'html');
		                	}
		            	});
		            	break;
		
		        default:
				var dir = path.split('/');
				console.log(dir[1]);
				console.log(__dirname + path);
		        	fs.readFile(__dirname + path, 'utf8', function(error, data){
		                	if (error){
						OnFailure(response, error);
		                	}
		                	if(dir[1] == 'js' || dir[1] == 'lib' ){
				    		OnSuccess(response, data, 'javascript');
		                	}
		
					if(dir[1] == 'template' ){
				    		OnSuccess(response, data, 'html');
		                	}
		
		
					if(dir[1] == 'css' ){
				    		OnSuccess(response, data, 'css');
		                	}
		
		
		           	});
		    	}
		
		}



});

server.listen(344);
io.listen(server);
board.on("ready", function() {

var temperature ;
console.log("Galileo ready...");
board.analogRead("A0", function(data) {
  	temperature = data;
	
});
io.sockets.on('connection', function(socket){
	console.log("websocket ready...");
	socket.on('dashboard', function(req){
		console.log(req);
		socket.emit('dashboard_client', sql_dashboard(req.mode));
	});

	socket.on('day', function(req){
		console.log(req);
		socket.emit('day_client', sql_time_analysis(req.mode, req.time_of_day));
	});

	socket.on('location', function(req){
		console.log(req);
		socket.emit('location_client', sql_location_analysis(req.mode));
	});
	
	var counter = 0; //counter to control setInterval
	socket.on('record_temperature_location', function(req){ // add loc_id, day_name, time_part // time_part_var loc_id_var day_name_var
		console.log(req);
		setInterval(function(){ 
			socket.emit('record_temperature_location_client', galileo_read_temperature(req.mode, temperature));
		}, 1000);
		
			setInterval(function(){ 
				if (counter < 4){
				//socket.emit('record_temperature_location_client', galileo_read_temperature(req.mode, temperature));
				console.log("insert into time(time_part, time_status, day_id) values ("+counter+", 1, (select day_id from day where loc_id="+req.loc_id_var+" and day_name='"+req.day_name_var+"'));");
				db.exec("insert into time(time_part, time_status, day_id) values ("+counter+", 1, (select day_id from day where loc_id="+req.loc_id_var+" and day_name='"+req.day_name_var+"'));");
				db.exec("insert into temperature(temp, temp_status, time_id, loc_id) values ("+temperature+", 1, (select time_id from time where day_id=(select day_id from day where loc_id="+req.loc_id_var+" and day_name='"+req.day_name_var+"') and time_part="+counter+"), "+req.loc_id_var+");");
				SaveDB();
				console.log(counter);
				console.log("stored");
				counter++;
				}
			}, 1200000);
		
	});

	
	//TODO:: create and update location // parameter - loc_name_var
	socket.on('create_location', function(req){
		console.log(req);
		socket.emit('create_location_client', create_location(req.locName));
	});
	
	socket.on('update_create_location', function(req){
		console.log(req);
		socket.emit('update_location_client', sql_location_analysis(req.mode));
	});

});

});



//sql_dashboard();
function sql_dashboard(mode){
	console.log('Sql started');
	if(mode=="Celcius"){
		var res = db.exec("select (avgtemp*0.4882814), day_name, loc_name from dashboard;");
	}
	else if (mode=='Farenheit'){
		var res = db.exec("select (avgtemp*0.4882814*9/5 + 32), day_name, loc_name from dashboard;");
	}
	else if (mode=='Kelvin'){
		var res = db.exec("select (avgtemp*0.4882814 + 273.15), day_name, loc_name from dashboard;");
	}
	
	console.log(JSON.stringify(res ));
	return res; //res - array of json objects array
}

//sql_time_analysis_morning
function sql_time_analysis(mode, time_of_day){
	console.log('Sql started'); 
	if(mode=="Celcius"){
		var res = db.exec("select (temp*0.4882814), time_part, loc_name from time_analysis where day_name='"+time_of_day+"';");
	}
	else if (mode=='Farenheit'){
		var res = db.exec("select (temp*0.4882814*9/5 + 32), time_part, loc_name, day_name from time_analysis where day_name='"+time_of_day+"';");
	}
	else if (mode=='Kelvin'){
		var res = db.exec("select (temp*0.4882814 + 273.15), time_part, loc_name, day_name from time_analysis where day_name='"+time_of_day+"';");
	}
	console.log(JSON.stringify(res ));
	return res; //res - array of json objects array
}

//sql_location_analysis
function sql_location_analysis(mode){
	console.log('Sql started');
	if(mode=="Celcius"){
		var res = db.exec("select (avgtemp*0.4882814), loc_name from location_analysis;");
	}
	else if (mode=='Farenheit'){
		var res = db.exec("select (avgtemp*0.4882814*9/5 + 32), loc_name from location_analysis;");
	}
	else if (mode=='Kelvin'){
		var res = db.exec("select (avgtemp*0.4882814 + 273.15), loc_name from location_analysis;");
	}
	console.log(JSON.stringify(res));
	return res; //res - array of json objects array
}

function galileo_read_temperature(mode, val){

	if(mode=="Celcius"){
		val= val*0.4882814;
	}
	else if (mode=='Farenheit'){
		val= val*0.4882814*9/5 + 32;
	}
	else if (mode=='Kelvin'){
		val= val*0.4882814 + 273.15;
	}
			
  	return val;	
}

function create_location(loc_name_var){
	
	db.exec("insert into location(loc_name, loc_status) values('"+loc_name_var+"', 1);");
	loc_id = db.exec("select loc_id from location where loc_name='"+loc_name_var+"';");
	console.log(loc_id);
	db.exec("insert into day(day_name, day_status, loc_id) values('morning', 1, "+loc_id[0].values[0][0]+");");
	console.log("done");
	db.exec("insert into day(day_name, day_status, loc_id) values('noon', 1, "+loc_id[0].values[0][0]+");");
	console.log("done");
	db.exec("insert into day(day_name, day_status, loc_id) values('evening', 1, "+loc_id[0].values[0][0]+");");
	console.log("done");
	db.exec("insert into day(day_name, day_status, loc_id) values('night', 1, "+loc_id[0].values[0][0]+");");
	SaveDB();
	return loc_id;
}


//Method

function SaveDB(){
	var data = db.export();
	var buffer = new Buffer(data);
	fs.writeFileSync("project.db", buffer);
	filebuffer = fs.readFileSync('project.db');

	// Load the db
	db = new SQL.Database(filebuffer);
}

function OnSuccess(response, Body, FileType){
	response.writeHead(200, {
  		'Content-Type': 'text/' + FileType });
        response.write(Body);
	response.end();
}

function OnFailure(response, err){
	console.log("failed");
	console.log(JSON.stringify(err));
        response.writeHead(404);
        response.write("opps this doesn't exist - 404");
	response.end();
}


















