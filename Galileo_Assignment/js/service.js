app.service('RandomService', function(){
    this.RandomColorRGBA= function() 
    {
        var random = function () { return Math.floor(Math.random()*256) };
	var r =random();
	var g = random();
	var b = random();
        var ColorSets = {
            "Color1": "rgba(" + r + "," + g + "," + b + ", 1.0)",
            "Color2": "rgba(" + r + "," + g + "," + b + ", 0.75)",
            "Color3": "rgba(" + r + "," + g + "," + b + ", 0.6)",
            "Color4": "rgba(" + r + "," + g + "," + b + ", 0.5)",
            "Color5": "rgba(" + r + "," + g + "," + b + ", 0.25)"
        }
        
        return ColorSets;
    };
     
});