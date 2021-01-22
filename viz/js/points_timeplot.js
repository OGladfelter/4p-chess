var game_id = "6258741";

// set the dimensions and margins of the graph
var margin = {top: 30, right: 30, bottom: 30, left: 30},
width = (window.innerWidth * .33) - margin.left - margin.right,
height = width,
    padding = 10;

if (screen.width < 600){
    margin = {top: 30, right: 30, bottom: 70, left: 70},
    width = screen.width - 40 - margin.left - margin.right,
    height = screen.width - 40 - margin.top - margin.bottom,
    padding = 5;
}

// append the svg object to the body of the page
var timeplot_svg = d3.select("#lineplot")
    .append("svg")
        .attr("class", "dark_svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        //.on("click", animate);

//Read the data
d3.csv("data/" + game_id + "/moves.csv", function(data) {

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
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(5));
    
    // Build Y scales and axis:
    var y = d3.scaleLinear()
        .range([ height-padding, padding ])
        .domain([0, maxPoints]);
    var yaxis = timeplot_svg.append("g")
        .attr("class", "axis")
        .attr('transform', 'translate(0, 0)')
        .call(d3.axisLeft(y).ticks(3));

    //////////// draw lines ////////////////

    // function transition(path) {
    //     path.transition()
    //         .duration((data.length * 100))
    //         .attrTween("stroke-dasharray", tweenDash);
    // }
    // function tweenDash() {
    //     var l = this.getTotalLength(),
    //         i = d3.interpolateString("0," + l, l + "," + l);
    //     return function (t) { return i(t); };
    // }

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
        .attr('y', -height)
        .attr('height', height + margin.top + margin.bottom)
        .attr('width', width - padding)
        .attr('class', 'curtain')
        .attr('transform', 'rotate(180)')
        .style('fill', '#181818')
        //.style('fill', '#fff')
        //.style("opacity", 0.5)
        .transition()
        .ease(d3.easeLinear)
        .duration(data.length * 500)
        .attr("width", 0)

    /////////////////////////////////////////

    //// text labels /////////////////////////
    timeplot_svg.append("text")
    .attr("x", x(0))
    .attr("y", y(maxPoints)+padding)
    .text("Points")
    .attr("class", "axis_label")
    .style("text-anchor", "start");

    timeplot_svg.append("text")
    .attr("x", x(data.length))
    .attr("y", y(0))
    .text("Move")
    .attr("class", "axis_label")
    .style("text-anchor", "end");


    // params: newPointsMax is the new y-axis max
    // params: move helps coordinate y-axis shift with curtain reveal. 
    // ex: if move = 50, we should see the y-axis shift just when the points at move 50 are being revealed
    function updateYAxis(move){

        var duration = 500;
        var delay = 500;

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
        yaxis.transition().duration(duration).delay(move * delay).ease(d3.easeLinear).call(d3.axisLeft(y).ticks(3));

        redline.y(function(d) { return y(d.redPoints); });
        d3.select(".redline").transition().duration(duration).delay(move * delay).ease(d3.easeLinear).attr("d", redline);

        blueline.y(function(d) { return y(d.bluePoints); });
        d3.select(".blueline").transition().duration(duration).delay(move * delay).ease(d3.easeLinear).attr("d", blueline);

        yellowline.y(function(d) { return y(d.yellowPoints); });
        d3.select(".yellowline").transition().duration(duration).delay(move * delay).ease(d3.easeLinear).attr("d", yellowline);

        greenline.y(function(d) { return y(d.greenPoints); });
        d3.select(".greenline").transition().duration(duration).delay(move * delay).ease(d3.easeLinear).attr("d", greenline);

        d3.select("#lineplot_move_count").transition().delay(move * delay).text(move);
    }

    for (i=0; i<data.length; i++){
        updateYAxis(i);
    };


})


