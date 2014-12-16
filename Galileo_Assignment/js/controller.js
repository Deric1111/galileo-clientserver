app.controller('HomeCtrl', function ($scope, $mdSidenav, $state, $mdDialog, $http, $rootScope, $mdSidenav) {
$rootScope.Home = {
		Title: "Dashboard",
		ChartTitle: null,
		SelectedTemperatureUnit: "Celcius"
	};
	$scope.SelectedIndex = null;
    $scope.openLeftMenu = function() {
    	$mdSidenav('left').toggle();
    };
     $scope.HomeLink = function() {
    	$state.go('dashboard',{TempUnit : $scope.Home.SelectedTemperatureUnit});
    };
    
    $scope.SelectTemperatureOption = function() {
	    $mdDialog.show({
	      templateUrl: 'template/dialog_temperature.html',
	      controller:'DialogCtrl'
	    }).then(function(tempUnit){
	    	    $scope.Home.SelectedTemperatureUnit = tempUnit;
	    });
  	};
  	$scope.showTimeOption = function() {
	    $mdDialog.show({
	      templateUrl: 'template/dialog_time.html',
	      controller:'DialogCtrl'
	    }).then(function(dayId){
	    	    $state.go('day', {TempUnit : $scope.Home.SelectedTemperatureUnit, dayId: dayId});
	    });
  	};
    $scope.showLocationOption = function() {
	   $state.go('location', {TempUnit : $scope.Home.SelectedTemperatureUnit});
	   $mdSidenav('left').close();

    };
    $scope.showProfileOption = function() {
	    $mdDialog.show({
	      templateUrl: 'template/dialog_profile.html',
	      controller:'DialogProfileCtrl'
	    }).then(function(data){
		console.log(JSON.stringify(data));
	     	$state.go('temperature', {
			TempUnit : $scope.Home.SelectedTemperatureUnit, 
			locId: data.SelectedLocation.Id, 
			dayId: data.SelectedDay});
	    });
    };
});

app.controller('DialogCtrl', function ($scope, $mdSidenav, $mdDialog) {
  $scope.hide = function(id) {
	console.log(id);
    $mdDialog.hide(id);
    $mdSidenav('left').close();
  };
});

app.controller('DialogProfileCtrl', function ($scope, $mdSidenav, $mdDialog, socket) {
  $scope.data = {
  	'selectedIndex' : 0,
  	'SelectedDay': "Morning",
  	'SelectedLocation': {
  		'Id' : null,
  		'Name': null
  	}
  };
  
  $scope.Days = [
  	{"DayId": 1, "Name": "morning"},
  	{"DayId": 2, "Name": "noon"},
  	{"DayId": 3, "Name": "evening"},
  	{"DayId": 4, "Name": "night"}
  	];
  	
  	
  $scope.next = function() {
      $scope.data.selectedIndex = Math.min($scope.data.selectedIndex + 1, 1) ;
    };
    $scope.previous = function() {
      $scope.data.selectedIndex = Math.max($scope.data.selectedIndex - 1, 0);
    };
  $scope.submit = function() {
  	//TODO:: Create location name record and get locId
	socket.emit('create_location',{'locName': $scope.data.SelectedLocation.Name});
  	socket.on('create_location_client',function(res){
		console.log(res[0].values[0][0]);
		$scope.data.SelectedLocation.Id = res[0].values[0][0];
		$mdDialog.hide($scope.data);
    		$mdSidenav('left').close();
	});
    	
  };
});

app.controller('DashboardCtrl', function ($scope, $rootScope, $http, RandomService, $stateParams, socket) {
	 //initialize socket.io
	$rootScope.Home.Title="Dashboard";
	$rootScope.Home.ChartTitle="Overall Temperature Graph for all Locations";
	var Dashboard_Data={
		labels: null,
	 	datasets: null
	};
	var graph_data= new Array();
	var label=new Array();
	var dataset_label=new Array();	
	 socket.emit('dashboard', {
      		mode: $stateParams.TempUnit
    		});
	 socket.on('dashboard_client', function(data){
		
		var results = data[0].values;
		var label_count = 4;
		
		for (x in results) {
			var set_count = 0; 
			var temp_dataset = new Array();
    			var result = results[x];
			graph_data.push(result[0]);
			label.push(result[2]);
			dataset_label.push(result[1]);
		}
		

		dataset_label = dataset_label.splice(0,4);
		var temp_label = new Array();
		for(var i = 0; i<16 ; i++){
			if(i %4==0){
				temp_label.push(label.splice(0,1)[0]);
				//Dashboard_Data.labels.push(label.splice(0,1)[0]);
			}
			else{
				label.splice(0,1);
			}
		}
		Dashboard_Data.labels = temp_label;
		
		//Add Data to graph
		temp_dataset = new Array();
		for (x in dataset_label){
			var color = RandomService.RandomColorRGBA();
			console.log(dataset_label[x]);
			temp_dataset.push(
				{
					label: dataset_label[x],
					fillColor: color.Color4,
					strokeColor: color.Color2,
					highlightFill: color.Color3,
					highlightStroke: color.Color1,
					data:graph_data.splice(0,4)
				}
			);
		}
			
	Dashboard_Data.datasets = temp_dataset;	
      	var layout = document.getElementById("dashboard");
	var ctx = layout.getContext("2d");
	var BarChart = new Chart(ctx).Bar(Dashboard_Data, options );
	});
});

app.controller('DayCtrl', function ($scope, $rootScope, $stateParams, $http, socket, RandomService) {
      //initialize socket.io
	$rootScope.Home.Title="Time Analysis";
	$rootScope.Home.ChartTitle="Breakdown Graph for Day in every 20 minutes";

   var Day_Data={
		labels: null,
	 	datasets: null
	};
	var graph_data= new Array();
	var label=new Array();
	var dataset_label=new Array();	

	 socket.emit('day', {
      		mode: $stateParams.TempUnit,
      		time_of_day: $stateParams.dayId
    		});
	 socket.on('day_client', function(data){
		console.log(JSON.stringify(data));
		var results = data[0].values;
		var label_count = 4;
		//console.log("start");
		for (x in results) {
			var set_count = 0; 
			var temp_dataset = new Array();
    			var result = results[x];
			graph_data.push(result[0]);
			label.push(result[2]);
			dataset_label.push(result[1]);
		}
		
		
		dataset_label= dataset_label.splice(0,4);
		for(x in dataset_label){
			dataset_label[x] = (dataset_label[x]-1)*20 + " minutes";
		}


		var temp_label = new Array();
		for(var i = 0; i<16 ; i++){
			if(i %4==0){
				temp_label.push(label.splice(0,1)[0]);
				//Dashboard_Data.labels.push(label.splice(0,1)[0]);
			}
			else{
				label.splice(0,1);
			}
		}

		Day_Data.labels = dataset_label;
		label = temp_label;
		
		//Add Data to graph
		temp_dataset = new Array();
		for (x in label){
			var color = RandomService.RandomColorRGBA();
			
			temp_dataset.push(
				{
					label: label[x],
					fillColor: color.Color4,
					strokeColor: color.Color2,
					 pointColor: color.Color1,
		            pointStrokeColor: color.Color2,
					pointHighlightFill: color.Color3,
					pointlightStroke: color.Color1,
					data:graph_data.splice(0,4)
				}
			);
		}
		
			
		Day_Data.datasets = temp_dataset;
			

		//console.log(JSON.stringify(Day_Data));
      		var layout = document.getElementById("day");
		var ctx = layout.getContext("2d");
		var BarChart = new Chart(ctx).Line(Day_Data, options );
	});
  });
  
app.controller('LocationCtrl', function ($scope, $rootScope, $stateParams, $http, socket, RandomService) {
      //initialize socket.io
	$rootScope.Home.Title="Location Summary Analysis";
	$rootScope.Home.ChartTitle="Graph of average temperature against location";

	  var Location_Data = {
  			labels : [],
			datasets : [
				{
		            label: "Average Temperature on Location",
		            fillColor: "rgba(220,220,220,0.2)",
		            strokeColor: "rgba(220,220,220,1)",
		            pointColor: "rgba(220,220,220,1)",
		            pointStrokeColor: "#fff",
		            pointHighlightFill: "#fff",
		            pointHighlightStroke: "rgba(220,220,220,1)",
		            data: []
        	}]};

	 socket.emit('location', {
      		mode: $stateParams.TempUnit
    		});
	 socket.on('location_client', function(data){
		//console.log(JSON.stringify(data));
		var result = data[0].values;
		for(x in result){
			Location_Data.labels.push(result[x][1]);
			Location_Data.datasets[0].data.push(result[x][0]);
		}
		//console.log(Location_Data);
	  var layout = document.getElementById("location");
	  var ctx = layout.getContext("2d");
	  var BarChart = new Chart(ctx).Line(Location_Data, options );
		
	});

    
  });
  
app.controller('TemperatureCtrl', function ($scope, $rootScope, $state, $stateParams, socket, RandomService){
	$scope.spec = $stateParams;
	$rootScope.Home.Title="Location Profile";
	$rootScope.Home.ChartTitle="Real-time Graph for Temperature on 1-second interval";

	console.log($scope.SelectedIndex);
	var color = RandomService.RandomColorRGBA();
	var layout = document.getElementById("temperature");
	var ctx = layout.getContext("2d");
	var Temperature_Data = {
  			labels : [],
			datasets : [
				{
		            label: "Average Temperature on Location",
		            fillColor: color.Color5,
		            strokeColor: color.Color1,
		            pointColor: color.Color1,
		            pointStrokeColor: '#fff',
		            pointHighlightFill: '#fff',
		            pointHighlightStroke: color.Color1,
		            data: []
        	}]};

	 socket.emit('record_temperature_location', {
      		mode: $stateParams.TempUnit,
		//time_part_var: $stateParams.TempUnit,
		loc_id_var: $stateParams.locId,
		day_name_var: $stateParams.dayId
    		});
	socket.on('record_temperature_location_client', function(data){
		var today = new Date();
		Temperature_Data.labels.push(today.toLocaleTimeString());
		Temperature_Data.datasets[0].data.push(data);
		if(Temperature_Data.labels.length >50){
			Temperature_Data.labels.shift();
			Temperature_Data.datasets[0].data.shift();

		}
		
		ctx.clearRect(0,0,layout.width, layout.height);
	  	var BarChart = new Chart(ctx).Line(Temperature_Data,optionsRealTime );
	$scope.record = function(day, id){
		$scope.SelectedIndex = id;
		$state.go('temperature', {
			TempUnit : $stateParams.TempUnit, 
			locId: $stateParams.locId, 
			dayId: day});

	}
				
	});


	
});