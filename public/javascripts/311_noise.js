var days_of_the_week = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var hour_of_the_day = ["12:00 AM", "1:00 AM", "2:00 AM", "3:00 AM", "4:00 AM", "5:00 AM", "6:00 AM", "7:00 AM", "8:00 AM", 
"9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", 
"8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM"];

d3.json("/public/data/manhattan.geojson", function(err, geo){
	d3.csv("/public/data/noise_filter.csv", function(err_data, data){
		main(geo, data);
	});
});

function closeIntro(){
	var ele = document.getElementById("intro");
	ele.className += " hidden"; 
}

function main(geojson, data){
	//used as counter to caluclate day + hour; 
	//you could make a ledgend for the color 
	var colors = d3.scale.quantize().domain([70, 1]).range(["#FF0000", "#FF1000", "#FF2000", "#FF3000", "#FF4000", "#FF5000", 
			"#FF6000", "#FF7000", "#FF8000", "#FF9000", '#FFA000', "#FFB000", "#FFC000"]);
	var DAY = 0; 
	//9PM - 9AM
	//hour 21 is 9PM 
	var HOUR = 21; 

	//preproces data
	var parsed = categorizeData(data);
	var polys = geojson.features;
	var processedData =  countNoisePoints(parsed, polys);
	var dataCount = processedData["counts"];
	var description = processedData["description"];
	var topDescrition = rankNoise(description);

	mapboxgl.accessToken = 'pk.eyJ1IjoiYXZpa2FuYXJ1bGEiLCJhIjoiY2l0dDZwNGJ5MDAwYTMwbjJrMTdqaHc2MyJ9.wojo_GFOo5GTGlk3zHk37g'

	//Setup mapbox-gl map
	var map = new mapboxgl.Map({
	  container: 'map', // container id
	  style: "mapbox://styles/mapbox/dark-v9",
	  center: [-73.9712,40.7831],
	  zoom: 11, 
	  minZoom: 10, 
	  maxZoom: 15
	})

	//map.scrollZoom.disable()
	map.addControl(new mapboxgl.Navigation());

	//map functions for interactivity

	map.on('load', function () {
    // Add a GeoJSON source containing the state polygons.
    map.addSource('states', {
        'type': 'geojson',
        'data': '../data/manhattan.geojson'
    });

    // Add a layer showing the state polygons.
    map.addLayer({
        'id': 'states-layer',
        'type': 'fill',
        'source': 'states',
        'paint': {
        	//fill none, use d3 fill instead
            'fill-color': 'rgba(200, 100, 240, 0)',
            'fill-outline-color': 'rgba(200, 100, 240, 0)'
	        }
	    });
	});

	// Create a popup, but don't add it to the map yet.
	var popup = new mapboxgl.Popup({
	    closeButton: false,
	    closeOnClick: false
	});

	map.on('mousemove', function(e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ['states-layer'] });
    // Change the cursor style as a UI indicator.
    map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

    if (!features.length) {
        popup.remove();
        return;
    }

    var feature = features[0];

    // Populate the popup and set its coordinates
    // based on the feature found
    var customID = feature.properties.customID;

    var neighbor = feature.properties.neighborhood;
    var complaint = topDescrition[DAY][HOUR][customID]["complaint"]; 
    var string = "<div>" + neighbor +  "</div> <div>" + complaint + "</div>";
    
    popup.setLngLat(map.unproject(e.point))
        .setHTML(string)
        .addTo(map);
	});


	var container = map.getCanvasContainer()
	var svg = d3.select(container).append("svg")

	var path = d3.geo.path().projection(mapboxProjection); 
	
	var featureElement = svg.selectAll("path")
			.data(geojson.features)
			.enter()
			.append("path")
			.attr("stroke-width", "2px")
			.attr("fill", "none")
			.attr("fill", function(d, i){
				if(dataCount[DAY][HOUR][i] > 0){
					return colors(dataCount[DAY][HOUR][i]);
				}
				else{
					return "green"; 
				}
			})
			.attr("stroke", "white")
			.attr("opacity", 0.55);
			

	var vp = getVP();
	var d3Projection = getD3(); 

	function render() {
	  vp = getVP();
	  d3Projection = getD3();
	  featureElement.attr("d", path);
	}

	map.on("viewreset", function() {
	  render()
	})

	map.on("move", function() {
	  render()
	})

	render()

	function getVP() {
	  var bbox = document.body.getBoundingClientRect();
	  var center = map.getCenter();
	  var zoom = map.getZoom();
	  var vp = ViewportMercator({
	    longitude: center.lng,
	    latitude: center.lat,
	    zoom: zoom,
	    width: bbox.width,
	    height: bbox.height,
	  })
	  return vp;
	}

	function getD3() {
	  var bbox = document.body.getBoundingClientRect();
	  var center = map.getCenter();
	  var zoom = map.getZoom();
	  // 512 is hardcoded tile size, might need to be 256 or changed to suit your map config
	  var scale = (512) * 0.5 / PI * pow(2, zoom);

	  var d3projection = d3.geo.mercator()
	    .center([center.lng, center.lat])
	    .translate([bbox.width/2, bbox.height/2])
	    .scale(scale);

	  return d3projection;
	}

	function mapboxProjection(lonlat) {
	  var p = map.project(new mapboxgl.LngLat(lonlat[0], lonlat[1]))
	  return [p.x, p.y];
	}

	//button events
	d3.select("#previousDay").on("click", previousDay);
	d3.select("#nextDay").on("click", nextDay);
	d3.select("#previousHour").on("click", previousHour);
	d3.select("#nextHour").on("click", nextHour); 

	//keep it as is
	function previousDay(){
		if(DAY > 0){ DAY--;}
		else{ DAY = 6; }
		document.getElementById("day").textContent= days_of_the_week[DAY];
		featureElement.transition().duration(1200).attr("fill", function(d,i){
			if(dataCount[DAY][HOUR][i] > 0){
				return colors(dataCount[DAY][HOUR][i]);
			}
			else{
				return "green"; 
			}
		});	
	}

	function nextDay(){
		if(DAY < 6){ DAY++;}
		else{ DAY = 0; }
		document.getElementById("day").textContent= days_of_the_week[DAY];
		featureElement.transition().duration(1200).attr("fill", function(d,i){
			if(dataCount[DAY][HOUR][i] > 0){
				return colors(dataCount[DAY][HOUR][i]);
			}
			else{
				return "green"; 
			}
		});
	}


	function previousHour(){
		if(HOUR === 0){
			previousDay();
			HOUR = 23;
		}
		else if(HOUR === 21){
			HOUR = 9; 
		}
		else{
			HOUR--; 
		}
		document.getElementById("hour").textContent= hour_of_the_day[HOUR];
		featureElement.transition().duration(1200).attr("fill", function(d,i){
			if(dataCount[DAY][HOUR][i] > 0){
				return colors(dataCount[DAY][HOUR][i]);
			}
			else{
				return "green"; 
			}
		});

	}

	function nextHour(){
		if(HOUR === 23){
			//midnight the next day
			nextDay();
			HOUR = 0; 
		}
		else if(HOUR === 9){
			HOUR = 21; 
		}
		else{
			HOUR++; 
		}
		document.getElementById("hour").textContent= hour_of_the_day[HOUR];
		featureElement.transition().duration(1200).ease("quad").attr("fill", function(d,i){
			if(dataCount[DAY][HOUR][i] > 0){
				return colors(dataCount[DAY][HOUR][i]);
			}
			else{
				return "green"; 
			}
		});
	}

	function categorizeData(data){
		var list = [];
		var listComplaint = [];
		//create lists for days of the week & hrs 
		for(var day = 0; day <= 6; day++){
			list[day] = [];
			for(var hour = 0; hour <= 23; hour++){
				list[day][hour] = [];
			}
		}
		data.forEach(function(d){
			var date = new Date(d['Created Date']);
			var day = date.getDay(); 
			var hour = date.getHours();
			list[day][hour].push(d);
		});
		return list; 
	}

	//cache data -> compute once
	function countNoisePoints(parsed, polygons){
		var counts = [];
		var description = [];
		for(var day = 0; day <= 6; day++){
			counts[day] = []; 
			description[day] = [];
			for(var hour = 0; hour <= 23; hour++){
				//empty obj
				counts[day][hour] = []; 
				description[day][hour] = [];
				for(var pcount = 0; pcount < polygons.length; pcount++){
					counts[day][hour][pcount] = 0; 
					description[day][hour][pcount] = {};
				}
			}
		}

		for(var day = 0; day <= 6; day++){ 
			for(var hour = 0; hour <= 23; hour++){
				parsed[day][hour].forEach(function(d){
					var pt = {
					    "type": "Feature",
					    "geometry": {
					      "type": "Point",
					      "coordinates": [d.Longitude, d.Latitude]
					    }
					  };
					for(var i = 0 ; i < polygons.length; i++){
						var isin = inside(pt, polygons[i]); 
						if(isin){
							counts[day][hour][i]++; 
							var complain = d["Complaint Type"]; 
							if(complain in description[day][hour][i]){
								//map compalin to count
								description[day][hour][i][complain]++; 
							}
							else{
								//add complaint
								description[day][hour][i][complain] = 1; 
							}

							break; 
						}
					}
				}); 
			}
		}
		return {"counts" : counts, "description": description};
	}

	function rankNoise(data){
		var top = [];
		for(var day = 0; day <= 6; day++){
			top[day] = []; 
			for(var hour = 0; hour <= 23; hour++){
				top[day][hour] = []; 
				//35 areas
				for(var pcount = 0; pcount <= 34; pcount++){
					var max = 0;
					var complain = ""; 
					var list = data[day][hour][pcount]; 
					for(var key in list){
						if(data[day][hour][pcount][key] > max){
							max = data[day][hour][pcount][key];
							complain = key; 
						}
					}

					if(complain === ""){
						complain = "No Noise Complaints : ꒰◍ᐡᐤᐡ◍꒱"; 
					}
					else if(complain === "Noise"){
						complain = "Top Noise Complaint: Unspecified"; 
					}
					else{
						complain = complain.replace("-", ":");
						complain = complain.replace("Noise", "Top Noise Complaint");
					}

					top[day][hour][pcount] = {"complaint": complain}; 
				}
			}
		}
		return top; 
	}
}

