//export the cvs of all the comments into 1 file
	//map the sun and the earth's orbit
	var w = 1430, 
		h = 1200; 

	//append path to a group 
	var svg = d3.select("#vis").append("svg");
	var group = svg.append('g').attr("transform", "translate(715, 450), scale(0.04)");                                                   
    // append a <defs> element
    var defs = group.append('defs');
	var line = d3.svg.line()
			.x(function(d) { return d.x; })
			.y(function(d) { return d.y; })
			.interpolate("basis");

	svg.attr('width', w)
			.attr('height', h);

	d3.csv("/public/javascripts/comets.csv", function(data){
		var comets = []; 
		var cometObj = [];
		data.forEach(function(name){
			if(name.x == '0' && name.y == '0'){
				comets.push(cometObj); 
				cometObj = []; 
			}
			else{
				cometObj.push(name); 
			}
		});

		comets.forEach(function(c){
			group.append("path")
				.attr('d', line(c))
				.attr('fill', 'none')
				.attr('stroke', "#6D9BF1")
				.style('stroke-width', "12px");
		}); 

	});
