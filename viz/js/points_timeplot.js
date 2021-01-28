var half_height = height / 1.5;

// append the svg object to the body of the page
var timeplot_svg = d3.select("#lineplot")
    .append("svg")
        .attr("class", "dark_svg")
        .attr("width", width + plots_margin.left + plots_margin.right)
        .attr("height", half_height + plots_margin.top + plots_margin.bottom)
    .append("g")
        .attr("transform", "translate(" + plots_margin.left + "," + plots_margin.top + ")");


// d3.csv("data/" + game_id + "/moves.csv", function(data) {
function drawTimeplot(){

    data.forEach(function(d, i){
        d.redPoints = +d.redPoints;
        d.bluePoints = +d.bluePoints;
        d.yellowPoints = +d.yellowPoints;
        d.greenPoints = +d.greenPoints;

        d.moveNumber = i;

    });

    const max1 = d3.max(data, function(d) { return d.redPoints; });
    const max2 = d3.max(data, function(d) { return d.bluePoints; });
    const max3 = d3.max(data, function(d) { return d.yellowPoints; });
    const max4 = d3.max(data, function(d) { return d.greenPoints; });
    const maxPoints = d3.max([max1, max2, max3, max4]);

    // Build X scales and axis:
    var x = d3.scaleLinear()
        .range([ padding, width-padding])
        .domain([0, d3.max(data, function(d) { return d.moveNumber; })]);
    timeplot_svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + half_height + ")")
        .call(d3.axisBottom(x).ticks(5));
    
    // Build Y scales and axis:
    var y = d3.scaleLinear()
        .range([ half_height-padding, padding ])
        .domain([0, maxPoints]);
    var yaxis = timeplot_svg.append("g")
        .attr("id", "timeplotYaxis")
        .attr("class", "axis")
        .attr('transform', 'translate(0, 0)')
        .call(d3.axisLeft(y).ticks(3));

    //////////// draw lines ////////////////

    var yellowline = d3.line()
            .x(function(d) { return x(d.moveNumber); })
            .y(function(d) { return y(d.yellowPoints); });
    // draw yellow line
    timeplot_svg.append("path")
        .data([data])
        .attr("class", "yellowline")
        .attr("d", yellowline)
        //.call(transition);

    var blueline = d3.line()
        .x(function(d) { return x(d.moveNumber); })
        .y(function(d) { return y(d.bluePoints); });
    // draw blue line
    timeplot_svg.append("path")
        .data([data])
        .attr("class", "blueline")
        .attr("d", blueline)
        //.call(transition);

    var greenline = d3.line()
        .x(function(d) { return x(d.moveNumber); })
        .y(function(d) { return y(d.greenPoints); });
    // draw green line
    timeplot_svg.append("path")
        .data([data])
        .attr("class", "greenline")
        .attr("d", greenline)
        //.call(transition);

    var redline = d3.line()
        .x(function(d) { return x(d.moveNumber); })
        .y(function(d) { return y(d.redPoints); });
    // draw red line
    timeplot_svg.append("path")
        .data([data])
        .attr("class", "redline")
        .attr("d", redline)
        //.call(transition);

    // create animation curtain
    var curtain = timeplot_svg.append('rect')
        .attr('x', -width + padding - 2)
        .attr('y', -half_height)
        .attr('height', half_height + plots_margin.top + plots_margin.bottom)
        .attr('width', width - padding)
        .attr('class', 'curtain')
        .attr('transform', 'rotate(180)')
        //.style('fill', '#fff')
        //.style("opacity", 0.5)
        // .transition()
        // .ease(d3.easeLinear)
        // .duration(data.length * 500)
        // .attr("width", 0)

    /////////////////////////////////////////

    //// text labels /////////////////////////
    timeplot_svg.append("text")
    .attr("x", x(0))
    .attr("y", y(maxPoints)+ (padding * 3))
    .text("Points")
    .attr("class", "axis_label")
    .style("text-anchor", "start");

    timeplot_svg.append("text")
    .attr("x", x(data.length))
    .attr("y", y(0))
    .text("Move")
    .attr("class", "axis_label")
    .style("text-anchor", "end");

    function updateYAxis(move, duration, delay){

        // var duration = 500;
        // var delay = 500;

        // take data up to move param number
        var subset = data.filter(function(d) { return d.moveNumber < move })

        // compute max points value in this subset
        const max1 = d3.max(subset, function(d) { return d.redPoints; });
        const max2 = d3.max(subset, function(d) { return d.bluePoints; });
        const max3 = d3.max(subset, function(d) { return d.yellowPoints; });
        const max4 = d3.max(subset, function(d) { return d.greenPoints; });
        var currentMax = d3.max([max1, max2, max3, max4]);

        // min y-axis max should be 20
        if (currentMax < 20){
            currentMax = 20;
        }
        // and never touch the actual currentMax - give it some breathing room
        else{
            currentMax = currentMax + 5;
        }

        // don't let that breathing room exceed reality - currentMax shouldn't ever exceed maxPoints
        if (currentMax > maxPoints){
            currentMax = maxPoints;
        }

        y.domain([0, currentMax]);
        d3.select("#timeplotYaxis").transition().duration(duration).delay(move * delay).ease(d3.easeLinear).call(d3.axisLeft(y).ticks(3));

        redline.y(function(d) { return y(d.redPoints); });
        d3.select(".redline").transition().duration(duration).delay(move * delay).ease(d3.easeLinear).attr("d", redline);

        blueline.y(function(d) { return y(d.bluePoints); });
        d3.select(".blueline").transition().duration(duration).delay(move * delay).ease(d3.easeLinear).attr("d", blueline);

        yellowline.y(function(d) { return y(d.yellowPoints); });
        d3.select(".yellowline").transition().duration(duration).delay(move * delay).ease(d3.easeLinear).attr("d", yellowline);

        greenline.y(function(d) { return y(d.greenPoints); });
        d3.select(".greenline").transition().duration(duration).delay(move * delay).ease(d3.easeLinear).attr("d", greenline);
    }

    animateTimeplot = function(duration, delay){

        curtain // reset curtain, then start to 'move' it
        .attr('x', -width + padding - 2)
        .attr('y', -half_height)
        .attr('height', half_height + plots_margin.top + plots_margin.bottom)
        .attr('width', width - padding)
        .transition()
        .ease(d3.easeLinear)
        .duration(data.length * duration)
        .attr("width", 0)

        for (i=1; i<data.length; i++){
            updateYAxis(i, duration, delay);
        };   
    };

}




