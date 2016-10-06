var sideArrow = d3.selectAll('.side-arrow').append('svg')
        .attr('width', 45)
        .attr('height', 60);

    sideArrow.append('path')
        .attr('d', "M12 10 L30 32 L50 10")
        .attr("fill", "none")
        .attr("stroke-width", '2px')
        .attr("stroke", "#d94701");

    sideArrow.append('path')
        .attr("d", "M12 20 L30 42 L50 20")
        .attr("fill", "none")
        .attr('stroke-width', "2px")
        .attr("stroke", "#d94701");


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