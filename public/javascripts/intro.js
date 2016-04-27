      var w = 700;
      var h = 200;
      var numelements = 550;
      var angle = 0.0;
      var angleVel = 0.05;
      var startAngle = 0;

      /*
        some stuff to track your mouse movements
      */
      var interval = 500;  //update display every 500ms
      var lastmousex = -1;
      var lastmousey = -1; 
      var lastmousetime; 
      var mousetravel = 0; 

      var waveScale = d3.scale.linear().domain([0,6]).range([0.030,0.09]).clamp([true]);


    $('html').mousemove(function(e) {
         var mousex = e.pageX;
         var mousey = e.pageY;
         if (lastmousex > -1)
             mousetravel = Math.max( Math.abs(mousex-lastmousex), Math.abs(mousey-lastmousey) );
         lastmousex = mousex;
         lastmousey = mousey;
    });


    //update mousetravel if mouse stops

      noise.seed(Math.random());

      //create an svg
      var svg = d3.select("#intro-svg").append('svg');
      //set svg attributes
      svg.attr('width', w)
         .attr('height', h);

      var x_pos = 0;
      var y_pos = 0;
      var pts = [];
      var yScale = d3.scale.linear().domain([-1, 1]).range([(h/2) + 50, (h/2) - 50]);

      for(var i = 0; i<numelements; i+=10)
      {
        var x_position = i;
        var y_position = yScale(Math.pow(Math.sin(angle),6));
        var y_noise = yScale(noise.perlin2(angle,angle));
        pts.push({x: x_position, y:y_noise});
        angle+=angleVel;
      }

      //line function
      var line = d3.svg.line()
          .x(function(d) { return d.x; })  //use to set x of point
          .y(function(d) { return d.y; }) // set y of point
          .interpolate("basis");

      // create a parent element the scene graph
      var group = svg.append('g').attr('transform', 'translate(30,10)');

      // append a <defs> element
      var defs = group.append('defs');

      //set path with points
      var path = defs.append('path')
            .attr('id', 'our_path')  
            //enter a straight line first    
            .attr('d', line(pts))
            .attr('fill', 'none')
            .attr('stroke', '#219bb5')
            .style('stroke-width', 1);


      // make the line the text is on visible by actually drawing it
      // textPath doesn't draw the line, it makes sense
      var path_use = group.append("use")
          .attr("xlink:href", "#our_path");


      var txt = group.append('text') 
            .attr("dy", -10)
            .attr("id", "my-name")
            .style('text-anchor', 'start')
            .style('font-size', '40px')
            .style('font-family', 'Kranky')
            .style('opacity', '0.1');


      var textPath = txt.append('textPath') // create a textPath element with a fill an actual text
            .attr('startOffset', '50%')        //to text append textpath
            .attr('xlink:href', '#our_path')    // from earlier, see defs.append('path')
            .attr('fill', "#d94701")
            .attr('letter-spacing', '3px')
            .text('Avika Narula');

      d3.select('#my-name')
          .transition()
          .duration(2000)
          .ease('linear')
          .style('opacity', '1');

      //update text path
      function loop_wave()
      {
         wave();
      }

      //loop_wave();
      wave();

      function wave()
      {
        startAngle+= waveScale(mousetravel);
        angle = startAngle;
        pts = [];
        for(var i = 0; i<numelements; i+=10)
        {
          var x_position = i;
          var y_position = yScale(Math.pow(Math.sin(angle),2));
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