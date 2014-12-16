var http = require("http");
var url = require('url');
var fs = require('fs');
var io = require('socket.io')(server);
var galileo = require('galileo-io');
var SQL = require('sql.js');
var filebuffer = fs.readFileSync('project.db');

// Load the db
var db = new SQL.Database(filebuffer);
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

server.listen(811);
io.listen(server);
io.sockets.on('connection', function(socket){
	socket.on('dashboard', function(req){
		console.log(req);
		socket.emit('dashboard_client', sql_dashboard(req.mode));
	});
});



//sql_dashboard();
function sql_dashboard(mode){
	console.log('Sql started');
	if(mode=="Celcius"){
		var res = db.exec("select (avgtemp*0.004882814), day_name, loc_name from dashboard;");
	}
	else if (mode=='Farenheit'){
		var res = db.exec("select (avgtemp*0.004882814*9/5 + 32), day_name, loc_name from dashboard;");
	}
	else if (mode=='Kelvin'){
		var res = db.exec("select (avgtemp*0.004882814 + 273.15), day_name, loc_name from dashboard;");
	}
	console.log(JSON.stringify(res ));
	return res; //res - array of json objects array
}

//sql_time_analysis_morning
function sql_time_analysis(value, mode, time_of_day){
	console.log('Sql started');   
	if(mode=="Celcius"){
		var res = db.exec("select (temp*0.004882814), time_part, loc_name, day_name from time_analysis;");
	}
	else if (mode=='Farenheit'){
		var res = db.exec("select (temp*0.004882814*9/5 + 32), loc_name, day_name from time_analysis;");
	}
	else if (mode=='Kelvin'){
		var res = db.exec("select (temp*0.004882814 + 273.15), loc_name, day_name from time_analysis;");
	}
	console.log(JSON.stringify(res ));
	return res; //res - array of json objects array
}

//sql_location_analysis
function sql_location_analysis(value, mode){
	console.log('Sql started');
	if(mode=="Celcius"){
		var res = db.exec("select (avgtemp*0.004882814), day_name, loc_name from location_analysis;");
	}
	else if (mode=='Farenheit'){
		var res = db.exec("select (avgtemp*0.004882814*9/5 + 32), day_name, loc_name from location_analysis;");
	}
	else if (mode=='Kelvin'){
		var res = db.exec("select (avgtemp*0.004882814 + 273.15), day_name, loc_name from location_analysis;");
	}
	console.log(JSON.stringify(res));
	return res; //res - array of json objects array
}



//Method

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

function GetTemperature(val, mode){
	//Get the temperature in celcius as standard
	var result = val * 0.004882814; // Source: https://learn.sparkfun.com/tutorials/galileo-experiment-guide/sik-galileo---part-7-reading-a-temperature-sensor
	if(mode=="Celcius"){
		return result;
	}
	else if (mode=="Farenheit"){
		return val * 0.004882814 * 9/5 + 32; //Source: http://www.mathsisfun.com/temperature-conversion.html
	}

	else if (mode=="Kelvin"){
		return val * 0.004882814+ 273.15; //Source: http://www.metric-conversions.org/temperature/celsius-to-kelvin.htm
	}
	else{
		//Return as Celcius by default
		return result;
	}

}

/*function GetTemperature(val, mode){
	//Get the temperature in celcius as standard
	var result = val * 0.004882814; // Source: https://learn.sparkfun.com/tutorials/galileo-experiment-guide/sik-galileo---part-7-reading-a-temperature-sensor
	if(mode=="Celcius"){
		return result;
	}
	else if (mode=="Farenheit"){
		return val * 0.004882814 * 9/5 + 32; //Source: http://www.mathsisfun.com/temperature-conversion.html
	}

	else if (mode=="Kelvin"){
		return val * 0.004882814+ 273.15; //Source: http://www.metric-conversions.org/temperature/celsius-to-kelvin.htm
	}
	else{
		//Return as Celcius by default
		return result;
	}

}*/

















