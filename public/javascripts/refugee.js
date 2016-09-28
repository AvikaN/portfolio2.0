
  var arrowSvg2 = d3.select(".arrow-svg").append('svg')
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

  var width = 1400,
          height = 1100,
          clusterPadding=30, 
          maxRadius=0,
          perpixel= 10,
          minpopulation=3000,
          minRadius=Math.sqrt(minpopulation/Math.PI)/perpixel,
          region=23,
          continent=8,
          year=1985,
          firstyear=1985,
          lastyear=2013,
          yeardiff=lastyear-firstyear+1;


  var color = d3.scale.category20b()
      .domain(d3.range(region));

  var opacityscale=d3.scale.linear().domain([0,1]).range([0.25,1]).clamp([true]);

  var svg = d3.select("#vis-div").append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g");

  var arc = d3.svg.arc()
      .innerRadius(55)
      .outerRadius(75)
      .startAngle(0)
      .endAngle(function(d) { return d.value * 2 * Math.PI;});


    d3.csv("/public/javascripts/refugee5.csv", function(error, data){

        //initialize lists and scales
        var scale = d3.scale.linear()
              .domain([year,lastyear])
              .range([0,1]); 

        var tempnodes=[],
            clusters=new Array(region),
            continentclusters= new Array(1);

        var yearlist=[],
            halftotal=(lastyear-firstyear)/2,
            halftotalyear=halftotal+firstyear;

        timeindex=0;
        for(a=firstyear;a<=lastyear;a++){
          if(a<=halftotalyear){yearlist.push({data:a,half:0,index:timeindex})}
          else{yearlist.push({data:a,half:1,index:timeindex-halftotal-0.5})}
          timeindex++;
        }

        var yeartotal=[];
        for(var j=year; j<=lastyear; j++){
            yeartotal[j]=data[data.length-1][j];
        }

        //initialize clock node
        clockNode={cluster:0,radius:65,clock:1,padding:20,name:1, prevr:0,skip:0,tempradius:65,x:width/2, y:height/4,color:"#C0C0C0"};
        tempnodes.push(clockNode)
        clusters[0]=clockNode;

        //build nodes
        for (var j=0; j<data.length-1; j++){
          var r= Math.sqrt(data[j][year]/Math.PI)/perpixel;
          if(maxRadius<r){maxRadius=r;}
          var pad= 5+Math.ceil(Math.random()*5);
            if(r<minRadius){
              r=0,pad=0; 
            }
          var name=data[j]["name"];
          var clus=data[j]["cluster"];
          var continentID=data[j]["continentID"];
          tempnodes[name]={cluster:clus, radius:r,people:data[j][year],padding:pad,name:name, region:data[j]["region"], 
                           prevr:0,skip:1,tempradius:r,continentID:continentID,color:data[j]["clustercolor"],country:1,topfive:0,
                           x: Math.cos((continentID / continent) * 2 * Math.PI) * 200 + width/2 + Math.random(),
                           y: Math.sin((continentID / continent) * 2 * Math.PI) * 200 + height/4 + Math.random()
          };
          if (!clusters[clus] || (r > clusters[clus].radius)) clusters[clus] = tempnodes[name];
          if(!continentclusters[continentID]){
              var conname=data[j]["continent"]+"C";
              var conobj={cluster:continentID, name:data[j]["continent"], padding:pad,radius:38, prevr:0,skip:0,tempradius:38,continent:1,color:data[j]["continentcolor"],continentID:continentID,
                          x: Math.cos((continentID / continent) * 2 * Math.PI) * 200 + width/2 + Math.random(),
                          y: Math.sin((continentID / continent) * 2 * Math.PI) * 200 + height/4 + Math.random()
              };
              continentclusters[continentID]=conobj;
              tempnodes[conname]=conobj;
          }
        }
        //initialize force
        var nodes=d3.values(tempnodes);

        var force=d3.layout.force()
          .nodes(nodes)
          .size([width, height])
          .gravity(0)
          .charge(0)
          .on("tick", run)
          .start();

        //parse and organize data
        var nodesvalue=d3.values(tempnodes),
            sortednodes=nodesvalue.sort(function(a,b){
               if(a.country && b.country){return b.tempradius-a.tempradius}
             }),
            topfive=sortednodes.slice(1,6);

        for(value in topfive){
              var name=topfive[value].name;
              tempnodes[name].topfive=1;
        }

        //initalize main circles
        svg.selectAll(".maincircles")
          .data(nodes)
          .enter().append("circle")
          .attr("fill", function(d){
            if(d.topfive){return "rgba(160,160,160,1)"}
            else{return "rgba(160,160,160,0)" }
          })
          .attr("stroke", function(d) { 
            return d.color;
          })
          .attr("opacity",1)
          .attr("stroke-width",3)
          .attr("class",function(d){
            if(d.clock){return "clock maincircles"}
            else if(d.continent){return "continent maincircles"}
            else{return "countries maincircles"}
          })
          .call(force.drag);

          var node = svg.selectAll(".maincircles");

          node.transition()
          .duration(2000)
          .attrTween("r", function(d) {
            var i = d3.interpolate(d.prevr, d.radius);
            return function(t) { return d.radius = i(t); };
          });

        //initialize i
        i = 0;

        //texts
        fields = [
            {location: 0.7, name: "year", value: scale(year), size: lastyear, text:year, totalrefugee:yeartotal[year]} 
        ];

        var continentname=d3.values(continentclusters);

        svg.append("text").data(fields).attr("class","year");
        svg.append("text").data(fields).attr("class","totalrefugee");

        svg.select(".year")
                .text(function(d){
                  return d.text;
                });

        svg.select(".totalrefugee")
              .text(function(d){
                return Number(d.totalrefugee).toLocaleString('en');
              });

        svg.selectAll(".continentname").data(continentname)
                      .enter().append("text")
                      .attr("class","continentname")
                      .attr("id", function(d){
                        return "continent"+d.cluster;
                      })      
                     .text(function(d){
                        return d.name;
                      });

        d3.selectAll(".clock,.timelinetext")
          .on("click", function(d){

              //only needs to be done the first time actually
              for(value in tempnodes){
                if(tempnodes[value].continent || tempnodes[value].clock) tempnodes[value].prevr=tempnodes[value].tempradius;
              }

              var yearindex= ++i % (yeardiff);
              if(d.clock){
                year=firstyear+yearindex;
              }
              else{
                year=d.data;
                i=year-firstyear;
              }

              //update nodes
              for (var j=0; j<data.length-1; j++){
                    var r= Math.sqrt(data[j][year]/Math.PI)/perpixel,
                        name=data[j]["name"];
                        group=data[j]["cluster"];
                        if(tempnodes[name]){
                          var previousr=tempnodes[name].prevr;
                          tempnodes[name].prevr=tempnodes[name].radius;
                          var prepeople=tempnodes[name].people;
                          tempnodes[name].people=data[j][year]; 
                          tempnodes[name].topfive=0; 
                          if(r<minRadius){
                            tempnodes[name].tempradius=0;
                            tempnodes[name].pad=0;
                          }
                          else{
                            if(prepeople>0){
                              tempnodes[name].difference=(tempnodes[name].people-prepeople)/prepeople;
                            }
                            tempnodes[name].tempradius=r;
                            if(tempnodes[name].prevr<minRadius){ 
                                tempnodes[name].difference="new";
                                tempnodes[name].padding=5+Math.ceil(Math.random()*5); //give new padding if previous was less than 0
                            }
                          }
                          tempnodes[name].skip=0; 
                        }
              }

            /*update for transition*/
            for(value in tempnodes){
                if(tempnodes[value].skip){
                  tempnodes[value].prevr=tempnodes[value].tempradius;
                  tempnodes[value].tempradius=0;
                }
                if(!tempnodes[value].clock && !tempnodes[value].continent){
                    tempnodes[value].skip=1;
               }
            }

            var nodesvalue=d3.values(tempnodes),
                sortednodes=nodesvalue.sort(function(a,b){
                  if(a.country && b.country){return b.tempradius-a.tempradius}
                }),
                topfive=sortednodes.slice(1,6);

            for(value in topfive){
              var name=topfive[value].name;
              tempnodes[name].topfive=1;
            }

            /*update countries*/
            node=svg.selectAll(".maincircles");

            node.transition()
                .duration(2000)
                .attr("fill",function(d){
                  if(d.topfive){return "rgba(160,160,160,1)"}
                  else{return "rgba(160,160,160,0)" }
                })
                .attr("opacity",function(d){
                  // if(d.country){
                  //   if(d.difference !== undefined || d.difference !== null){
                  //     if(d.difference=="new")return 1;
                  //     return opacityscale(Math.abs(d.difference));
                  //   }
                  //   else{return 0} 
                  // }
                  // else{return 1}
                  return 1;
                })
                .attrTween("r", function(d){
                  var i = d3.interpolate(d.prevr, d.tempradius);
                  return function(t) { return d.radius = i(t); };
                });

            //paths
            var now = scale(year);
            fields[0].previous = fields[0].value; fields[0].value = now; fields[0].text = year; fields[0].totalrefugee=yeartotal[year];

            var path = svg.selectAll(".path")
              .data(fields.filter(function(d) { return d.value; }), 
                                  function(d) { return d.name; });

            svg.select(".year")
              .text(function(d){
                return d.text;
              });

            svg.select(".totalrefugee")
              .text(function(d){
                return Number(d.totalrefugee).toLocaleString('en');
              });
            
            path.enter().append("path")
                .attr("class", "path")
                .transition()
                  .ease("elastic")
                  .duration(1000)
                  .attrTween("d", arcTween);

            path.transition()
                  .ease("elastic")
                  .duration(1000)
                  .attrTween("d", arcTween);

             path.exit().transition()
                  .ease("elastic")
                  .duration(1000)
                  .attrTween("d", arcTween)
                  .remove();

            //update location of path
            node.each(updatePath());
            force.alpha(0.1);
        });

        svg.selectAll(".countries")
            .on("mouseover",function(d){
              if(d.tempradius>minRadius){
                  var xPos=d.px;
                  var yPos=d.py;

                  d3.select("#tooltip")
                      .style("left", xPos + "px")
                      .style("top", yPos + "px")
                      .select("#name")
                      .text(d.name+", "+d.region);

                  d3.select('#tooltip')
                      .select("#people")
                      .text(Number(d.people).toLocaleString('en'));

                  d3.select('#tooltip')
                      .select('#change')
                      .text(function(){
                        if(d.difference !== undefined && d.difference !== null && d.difference !== NaN){
                            if(d.difference == "new")return "Population last year < " + minpopulation;

                            var rounded=Math.floor((d.difference*100));
                            if(rounded>0){return "Population change: " + rounded + "% increase"}
                            else if(rounded<0){return "Population change: " + Math.abs(rounded)+"% decrease"}
                            else{return "Population change: none"}
                        }
                      });

                  d3.select("#tooltip").classed("hidden", false);
              }
            })
            .on("mouseout", function() {
                  d3.select("#tooltip").classed("hidden", true);
            });

        function run(e) {
        node
            .each(cluster(11 * e.alpha * e.alpha)) 
            .each(clockcluster(6 * e.alpha * e.alpha))
            .each(continentcluster(1 * e.alpha * e.alpha))
            .each(collide(.1)) 
            .each(updateText())
            .each(updatePath())
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
        }

        function updateText(){
            return function(d){
              if(d.clock){
                svg.select(".year") //one text
                    .attr("x", d.x)
                    .attr("y", d.y);
                
                svg.select(".totalrefugee")
                    .attr("x", d.x)
                    .attr("y",d.y+20);
              }
              if(d.continent){
                svg.select("#continent"+(d.cluster))
                    .attr("x",d.x)
                    .attr("y",d.y+5);
              }
            }
        }

        function updatePath(){
            return function(d){
              if(d.clock){
                svg.select("path")// one path
                    .attr("transform", "translate("+d.x+","+d.y+")");
              }

            }
        }

        function cluster(alpha) {
          return function(d) {
            var cluster=clusters[d.cluster];  
            if (cluster === d || d.continent) return; 
            var x = d.x - cluster.x,  
                y = d.y - cluster.y,  
                l = Math.sqrt(x * x + y * y), 
                r = d.radius + cluster.radius;  
            if (l != r) { 
              l = (l - r) / l * alpha;  
              d.x -= x *= l; 
              d.y -= y *= l;
              cluster.x += x;
              cluster.y += y;  
            }
          };
        }

        function clockcluster(alpha){
          return function(d){
            var cluster=continentclusters[d.cluster];
            var clock=clusters[0]; 
            if(cluster!==d || cluster===clock) return;
            var x = d.x - clock.x,
                y = d.y - clock.y,
                l = Math.sqrt(x * x + y * y),
                r = d.radius + clock.radius;
            if(l != r){
              l=(l - r) / l * alpha;
              d.x -= x *= l;
              d.y -= y *= l;
              clock.x+=x;
              clock.y+=y;
            }
          }

        }

        function continentcluster(alpha){
          return function(d){
            if(d.clock || d.continent) return;
            var continent=continentclusters[d.continentID];
           // console.log(continent);
           // console.log(d);
            var x = d.x-continent.x,
                y = d.y-continent.y,
                l = Math.sqrt(x * x + y * y),
                r = d.radius + continent.radius;
            if(l != r){
              l=(l - r) / l * alpha;
              d.x -= x *= l;
              d.y -= y *= l;
              continent.x+=x;
              continent.y+=y;
            }
          }
        }

        // Resolves collisions between d and all other circles.
        function collide(alpha) {
          var quadtree = d3.geom.quadtree(nodes);
          return function(d) {
            var r = d.radius + maxRadius + Math.max(d.padding, clusterPadding),
                nx1 = d.x - r,
                nx2 = d.x + r,
                ny1 = d.y - r,
                ny2 = d.y + r;
            quadtree.visit(function(quad, x1, y1, x2, y2) {
              if (quad.point && (quad.point !== d)) {
                var x = d.x - quad.point.x,
                    y = d.y - quad.point.y,
                    l = Math.sqrt(x * x + y * y),
                    finalpadding=0,
                    r=0;
                    if((d.clock && quad.point.continent)|| (d.clock && quad.point.country)){finalpadding=d.padding}
                    else if((d.continent && quad.point.clock) || (d.country && quad.point.clock)){finalpadding=quad.point.padding}
                    else if(d.continentID === quad.point.continentID){finalpadding=d.padding}
                    else{finalpadding=(d.cluster === quad.point.cluster ? d.padding : clusterPadding)}
                    r = d.radius + quad.point.radius + finalpadding;
                if (l < r) {
                  l = (l - r) / l * alpha;
                  d.x -= x *= l;
                  d.y -= y *= l;
                  quad.point.x += x;
                  quad.point.y += y;
                }
              }
              return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            });
          };
        }
    });

   function arcTween(b) {
        var i = d3.interpolate({value: b.previous}, b);
        return function(t) {
            return arc(i(t));
        };
    }
