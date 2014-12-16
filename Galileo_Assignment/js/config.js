var app = angular.module('app', ['ui.router', 'ngMaterial']);

app.config(function($stateProvider, $urlRouterProvider, $mdThemingProvider) {

  //
  // Now set up the states
  $stateProvider
    .state('dashboard', {
      url: "/dashboard/:TempUnit",
      templateUrl: "template/dashboard.html",
      controller: 'DashboardCtrl'
    })
    
    .state('day', {
      url: "/day/:TempUnit/:dayId",
      templateUrl: "template/day.html",
      controller: 'DayCtrl'
    })
    
    .state('location', {
      url: "/location/:TempUnit",
      templateUrl: "template/location.html",
      controller: 'LocationCtrl'
    })
    
    .state('create', {
      url: "/profile",
      templateUrl: "template/profile.html",
      controller: 'ProfileCtrl'
    })
    
    .state('update', {
      url: "/profile/:locId",
      templateUrl: "template/profile.html",
      controller: 'ProfileCtrl'
    })
    
    .state('temperature', {
      url: "/temperature/:TempUnit/:locId/:dayId",
      templateUrl: "template/temperature.html",
      controller: 'TemperatureCtrl'
    })
    

  //
  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise("/dashboard/Celcius");
  //
  
  
});

//Constants 
var options = {
				animation : true,
				showTooltips: true,
				responsive: true,
				maintainAspectRatio: true,
				//scaleOverride : true,
				scaleShowValues: true, 
				//scaleSteps : 10,//Number - The number of steps in a hard coded scale
				//scaleStepWidth : 10,//Number - The value jump in the hard coded scale				
				scaleStartValue : 0,//Number - The scale starting value
				barShowStroke: true,
				TooltipTemplate: function(obj){
				  return obj.datasetLabel + ": " + obj.value;
				},
			  multiTooltipTemplate: function(obj){
				  return obj.datasetLabel + ": " + obj.value;
				}
			};
var optionsRealTime = {
				animation : false,
				showTooltips: true,
				showScale: true,
				maintainAspectRatio: true,
				responsive: true,
				pointDot: false,
				scaleShowLabels: true,
				//scaleOverride : true,
				scaleShowValues: true, 
				//scaleSteps : 10,//Number - The number of steps in a hard coded scale
				//scaleStepWidth : 10,//Number - The value jump in the hard coded scale				
				scaleStartValue : 0,//Number - The scale starting value
				barShowStroke: false,
				TooltipTemplate: function(obj){
				  return obj.datasetLabel + ": " + obj.value;
				},
			  multiTooltipTemplate: function(obj){
				  return obj.datasetLabel + ": " + obj.value;
				}
			};