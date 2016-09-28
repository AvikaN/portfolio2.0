    
    var w = 700;
    var h = 200;
    var numelements = 700;
    var angle = 0.0;
    var angleVel = 0.05;
    var startAngle = 0;
    var nodeSize = 30; 

    noise.seed(Math.random());

    var arrowSvg = d3.selectAll(".arrow-svg").append('svg')
          .attr('width', 60)
          .attr('height', 45);

    arrowSvg.append("path")
            .attr('d', "M12 10 L30 32 L50 10")
            .attr("fill", "none")
            .attr('stroke-width', '2px')
            .attr('stroke', '#219bb5');

    arrowSvg.append("path")
            .attr("d", "M12 20 L30 42 L50 20")
            .attr("fill", "none")
            .attr('stroke-width', "2px")
            .attr('stroke', '#219bb5');

    var arrowSvg2 = d3.select("#arrow-svg-2").append('svg')
          .attr('width', 60)
          .attr('height', 45);

    arrowSvg2.append("path")
            .attr('d', "M12 10 L30 32 L50 10")
            .attr("fill", "none")
            .attr('stroke-width', '2px')
            .attr('stroke', '#219bb5');

    arrowSvg2.append("path")
            .attr("d", "M12 20 L30 42 L50 20")
            .attr("fill", "none")
            .attr('stroke-width', "2px")
            .attr('stroke', '#219bb5');

    //create an svg
    var svg = d3.select("#intro-svg").append('svg');
 
    svg.attr('width', w)
       .attr('height', h);

    var pts = [];
    var yScale = d3.scale.linear().domain([-1, 1]).range([(h/2) + 50, (h/2) - 50]);

    for(var i = 0; i<numelements; i+=10)
      {
        var x_position = i;
        var y_noise = yScale(noise.perlin2(angle,angle));
        pts.push({x: x_position, y:y_noise});
        angle+=angleVel;
      }

    //line, returns a function
    var line = d3.svg.line()
          .x(function(d) { return d.x; })  //use to set x of point
          .y(function(d) { return d.y; }) // set y of point
          .interpolate("basis");

    var group = svg.append('g').attr('transform', 'translate(30,10)');

    // append a <defs> element
    var defs = group.append('defs');

    //set path with points
    //shapes inside def elements are not displayed, until they are referenced
    //path takes a line, which is a function 
    var path = defs.append('path')
            .attr('id', 'our_path')  
            .attr('d', line(pts))
            .attr('fill', 'none')
            .attr('stroke', '#219bb5')
            .style('stroke-width', '2.5px');

    //create a use group to use defs element 
    var path_use = group.append("use")
          .attr("xlink:href", "#our_path");

    var txt = group.append('text') 
            .attr("dy", -12)
            .attr("id", "my-name")
            .style('text-anchor', 'start')
            .style('font-size', '50px')
            .style('font-family', 'Amatica SC')
            .style('opacity', '0.1');

    var textPath = txt.append('textPath') // create a textPath element with a fill an actual text
            .attr('startOffset', '40%')        //to text append textpath
            .attr('xlink:href', '#our_path')    // from earlier, see defs.append('path')
            .attr('fill', "#d94701")
            .attr('letter-spacing', '2px')
            .text('Avika Narula');

    d3.select('#my-name')
          .transition()
          .duration(2000)
          .ease('linear')
          .style('opacity', '1');

    wave();

    function wave()
    {
      startAngle+= 0.05;
      angle = startAngle;
      pts = [];
      for(var i = 0; i<numelements; i+=10)
      {
        var x_position = i;
        var y_noise = yScale(noise.perlin2(angle,angle));
        pts.push({x: x_position, y:y_noise});
        angle+=angleVel;
      }
      //get a smooth transition to the new line
      //recursive
      path.transition().attr('d', line(pts))
          .ease("linear")
          .each('end', wave);
    }
    
   
