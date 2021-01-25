// var game_id = "6258741";
// const circle_radius = 12;

// // set the dimensions and margins of the graph
// var margin = {top: 30, right: 30, bottom: 30, left: 30},
// width = (window.innerWidth * .33) - margin.left - margin.right,
// height = width,
//     padding = 10;

// if (screen.width < 600){
//     margin = {top: 30, right: 30, bottom: 70, left: 70},
//     width = screen.width - 40 - margin.left - margin.right,
//     height = screen.width - 40 - margin.top - margin.bottom,
//     padding = 5;
// }

// append the svg object to the body of the page
var scatter_svg = d3.select("#scatterplot")
    .append("svg")
        .attr("class", "dark_svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        //.on("click", animate);

//Read the data
//d3.csv("data/" + game_id + "/moves.csv", function(data) {
function drawScatterplot(){

    redPieces = [];
    redMaterialValues = [];

    bluePieces= [];
    blueMaterialValues = [];

    yellowPieces = [];
    yellowMaterialValues = [];

    greenPieces = [];
    greenMaterialValues = [];

    data.forEach(function(d, i){
        d.redNumPieces = +d.redNumPieces;
        redPieces.push(d.redNumPieces);
        d.blueNumPieces = +d.blueNumPieces;
        bluePieces.push(d.blueNumPieces);
        d.yellowNumPieces = +d.yellowNumPieces;
        yellowPieces.push(d.yellowNumPieces);
        d.greenNumPieces = +d.greenNumPieces;
        greenPieces.push(d.greenNumPieces);

        d.redMaterial = +d.redMaterial;
        redMaterialValues.push(d.redMaterial);
        d.blueMaterial = +d.blueMaterial;
        blueMaterialValues.push(d.blueMaterial);
        d.yellowMaterial = +d.yellowMaterial;
        yellowMaterialValues.push(d.yellowMaterial);
        d.greenMaterial = +d.greenMaterial;
        greenMaterialValues.push(d.greenMaterial);
    });

    // not necesarilly 43, because players can queen promote early on and exceed starting material value
    const redMaxMaterial = d3.max(data, function(d) { return d.redMaterial; });
    const blueMaxMaterial = d3.max(data, function(d) { return d.blueMaterial; });
    const yellowMaxMaterial = d3.max(data, function(d) { return d.yellowMaterial; });
    const greenMaxMaterial = d3.max(data, function(d) { return d.greenMaterial; });
    const maxMaterial = d3.max([redMaxMaterial, blueMaxMaterial, yellowMaxMaterial, greenMaxMaterial])

    const maxPieces = 16; // players start with 16 pieces
    const minPieces = 1; // can't lose your king

    // Build X scales and axis:
    var x = d3.scaleLinear()
        .range([padding, width-padding])
        .domain([minPieces, maxPieces]);
    scatter_svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));
    
    // Build Y scales and axis:
    var y = d3.scaleLinear()
        .range([ height-padding, padding ])
        .domain([0, maxMaterial]);
    scatter_svg.append("g")
        .attr("class", "axis")
        .attr('transform', 'translate(0, 0)')
        .call(d3.axisLeft(y).ticks(5));

    ///////// draw circles ////////

    scatter_svg.append("circle")
        .attr("id", function(d){ return "redCircle"})
        .attr("cy", function(d) { return y(redMaterialValues[0]) })
        .attr("cx", function(d) { return x(redPieces[0]) })
        .style("r", circle_radius)
        .style("fill", function(d){return "red"} );

    scatter_svg.append("circle")
        .attr("id", function(d){ return "blueCircle"})
        .attr("cy", function(d) { return y(blueMaterialValues[0]) })
        .attr("cx", function(d) { return x(bluePieces[0]) })
        .style("r", circle_radius)
        .style("fill", function(d){return "blue"} );

    scatter_svg.append("circle")
        .attr("id", function(d){ return "yellowCircle"})
        .attr("cy", function(d) { return y(yellowMaterialValues[0]) })
        .attr("cx", function(d) { return x(yellowPieces[0]) })
        .style("r", circle_radius)
        .style("fill", function(d){return "yellow"} );

    scatter_svg.append("circle")
        .attr("id", function(d){ return "greenCircle"})
        .attr("cy", function(d) { return y(greenMaterialValues[0]) })
        .attr("cx", function(d) { return x(greenPieces[0]) })
        .style("r", circle_radius)
        .style("fill", function(d){return "green"} );

    //Container for the gradients
    var defs = scatter_svg.append("defs");

    //Filter for the outside glow
    var filter = defs.append("filter")
        .attr("id","glow");
    filter.append("feGaussianBlur")
        .attr("stdDeviation","2.5")
        .attr("result","coloredBlur");
    var feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode")
        .attr("in","coloredBlur");
    feMerge.append("feMergeNode")
        .attr("in","SourceGraphic");

    d3.selectAll("circle")
        .style("filter", "url(#glow)");

    //////////////////////////////////////////

    //////////// draw lines ////////////////

    // y=x line
    scatter_svg.append('line')
        .attr("class", "yxline")
        .attr("x1", x(minPieces))
        .attr("y1", y(0))
        .attr("x2", x(maxPieces))
        .attr("y2", y(maxMaterial));

    /////////////////////////////////////////

    //// text labels /////////////////////////
    scatter_svg.append("text")
    .attr("y", y(0))
    .attr("x", x(maxPieces))
    .text("Remaining Pieces")
    .attr("class", "axis_label")
    .style("text-anchor", "end");

    scatter_svg.append("text")
    .attr("y", y(maxMaterial)+padding)
    .attr("x", x(minPieces))
    .text("Material Strength")
    .attr("class", "axis_label")
    .style("text-anchor", "start");

    /////////////////////////////////////////

    // animate function /////////////////////////
    animateScatterplot = function(duration, delay){

        var redFill = 'red';
        var blueFill = 'blue';
        var yellowFill = 'yellow';
        var greenFill = 'green';

        const lastRound = data[data.length-1]["round"];
        const y_gap = 5;
        const x_gap = 20;

        for (i=0; i<data.length; i++){

            d3.select("#scatterplot_move_count").transition().delay(i * delay).text(i);

            // gray out circle if corresponding player resigns or times out, also add notation
            if ((data[i]['move'] == "R") | (data[i]['move'] == "T")){

                if (data[i]['player'] == 'red'){
                    if (redFill == 'red'){ // if false, don't add any more text - we already did
                        scatter_svg.append("text")
                        .attr("y", y(redMaterialValues[i]) + y_gap)
                        .attr("x", x(redPieces[i]) + x_gap)
                        .text("Red resigns in round " + data[i]["round"] + "!")
                        .style("text-anchor", "start")
                        .style("visibility", "hidden")
                        .transition()
                        .delay(delay * i)
                        .style("visibility", "visible");
                    }
                    redFill = '#b56d5b';
                }
                else if (data[i]['player'] == 'blue'){

                    if (blueFill == 'blue'){
                        scatter_svg.append("text")
                        .attr("y", y(blueMaterialValues[i]) + y_gap)
                        .attr("x", x(bluePieces[i]) + x_gap)
                        .text("Blue resigns in round " + data[i]["round"] + "!")
                        .style("text-anchor", "start")
                        .style("visibility", "hidden")
                        .transition()
                        .delay(delay * i)
                        .style("visibility", "visible");
                    }
                    blueFill = '#7a61ab';
                }
                else if (data[i]['player'] == 'yellow'){

                    if (yellowFill == 'yellow'){ 
                        scatter_svg.append("text")
                        .attr("y", y(yellowMaterialValues[i]) + y_gap)
                        .attr("x", x(yellowPieces[i]) + x_gap)
                        .text("Yellow resigns in round " + data[i]["round"] + "!")
                        .style("text-anchor", "start")
                        .style("visibility", "hidden")
                        .transition()
                        .delay(delay * i)
                        .style("visibility", "visible");
                    }
                    yellowFill = '#ada86d';
                }
                else if (data[i]['player'] == 'green'){

                    if (greenFill == 'green'){ 
                        scatter_svg.append("text")
                        .attr("y", y(greenMaterialValues[i]) + y_gap)
                        .attr("x", x(greenPieces[i]) + x_gap)
                        .text("Green resigns in round " + data[i]["round"] + "!")
                        .style("text-anchor", "start")
                        .style("visibility", "hidden")
                        .transition()
                        .delay(delay * i)
                        .style("visibility", "visible");
                    }
                    greenFill = '#66815d';
                }
            }
            // gray out if player doesn't move because they were checkmated by a prior move; add notation
            else if ((data[i]['move'] == "") & (data[i]['round'] != lastRound)){

                if (data[i]['player'] == 'red'){
                    if (redFill == 'red'){ //  if false, don't add any more text - we already did
                        scatter_svg.append("text")
                        .attr("y", y(redMaterialValues[i]) + y_gap)
                        .attr("x", x(redPieces[i]) + x_gap)
                        .text("Red checkmated in round " + data[i-1]["round"] + "!") // subtract a round # because it's red, who starts rounds
                        .style("text-anchor", "start")
                        .style("visibility", "hidden")
                        .transition()
                        .delay(delay * i)
                        .style("visibility", "visible");
                    }
                    redFill = '#b56d5b';
                }
                else if (data[i]['player'] == 'blue'){

                    if (blueFill == 'blue'){ 
                        scatter_svg.append("text")
                        .attr("y", y(blueMaterialValues[i]) + y_gap)
                        .attr("x", x(bluePieces[i]) + x_gap)
                        .text("Blue checkmated in round " + data[i]["round"] + "!")
                        .style("text-anchor", "start")
                        .style("visibility", "hidden")
                        .transition()
                        .delay(delay * i)
                        .style("visibility", "visible");
                    }
                    blueFill = '#7a61ab';
                }
                else if (data[i]['player'] == 'yellow'){

                    if (yellowFill == 'yellow'){ 
                        scatter_svg.append("text")
                        .attr("y", y(yellowMaterialValues[i]) + y_gap)
                        .attr("x", x(yellowPieces[i]) + x_gap)
                        .text("Yellow checkmated in round " + data[i]["round"] + "!")
                        .style("text-anchor", "start")
                        .style("visibility", "hidden")
                        .transition()
                        .delay(delay * i)
                        .style("visibility", "visible");
                    }
                    yellowFill = '#ada86d';
                }
                else if (data[i]['player'] == 'green'){

                    if (greenFill == 'green'){ 
                        scatter_svg.append("text")
                        .attr("y", y(greenMaterialValues[i]) + y_gap)
                        .attr("x", x(greenPieces[i]) + x_gap)
                        .text("Green checkmated in round " + data[i]["round"] + "!")
                        .style("text-anchor", "start")
                        .style("visibility", "hidden")
                        .transition()
                        .delay(delay * i)
                        .style("visibility", "visible");
                    }
                    greenFill = '#66815d';
                }
            }

            // move circles
            d3.select("#redCircle")
                .transition()
                .delay(function(d){return delay * i})
                .duration(duration)
                .attr("cy", function(d) { return y(redMaterialValues[i]) })
                .attr("cx", function(d) { return x(redPieces[i]) })
                .style("fill", redFill);

            d3.select("#blueCircle")
                .transition()
                .delay(function(d){return delay * i})
                .duration(duration)
                .attr("cy", function(d) { return y(blueMaterialValues[i]) })
                .attr("cx", function(d) { return x(bluePieces[i]) })
                .style("fill", blueFill);

            d3.select("#yellowCircle")
                .transition()
                .delay(function(d){return delay * i})
                .duration(duration)
                .attr("cy", function(d) { return y(yellowMaterialValues[i]) })
                .attr("cx", function(d) { return x(yellowPieces[i]) })
                .style("fill", yellowFill);
            
            d3.select("#greenCircle")
                .transition()
                .delay(function(d){return delay * i})
                .duration(duration)
                .attr("cy", function(d) { return y(greenMaterialValues[i]) })
                .attr("cx", function(d) { return x(greenPieces[i]) })
                .style("fill", greenFill);

            // draw line from previous position to current position
            if (i>0){
                scatter_svg.append('line')
                    .style("stroke", "none")
                    .attr("y1", y(redMaterialValues[i-1]))
                    .attr("x1", x(redPieces[i-1]))
                    .attr("y2", y(redMaterialValues[i]))
                    .attr("x2", x(redPieces[i]))
                    .transition()
                    .duration(duration)
                    .delay((delay * i) + delay)
                    .style("stroke", "red");

                scatter_svg.append('line')
                    .style("stroke", "none")
                    .attr("y1", y(blueMaterialValues[i-1]))
                    .attr("x1", x(bluePieces[i-1]))
                    .attr("y2", y(blueMaterialValues[i]))
                    .attr("x2", x(bluePieces[i]))
                    .transition()
                    .duration(duration)
                    .delay((delay * i) + delay)
                    .style("stroke", "blue");

                scatter_svg.append('line')
                    .style("stroke", "none")
                    .attr("y1", y(yellowMaterialValues[i-1]))
                    .attr("x1", x(yellowPieces[i-1]))
                    .attr("y2", y(yellowMaterialValues[i]))
                    .attr("x2", x(yellowPieces[i]))
                    .transition()
                    .duration(duration)
                    .delay((delay * i) + delay)
                    .style("stroke", "yellow"); 

                scatter_svg.append('line')
                    .style("stroke", "none")
                    .attr("y1", y(greenMaterialValues[i-1]))
                    .attr("x1", x(greenPieces[i-1]))
                    .attr("y2", y(greenMaterialValues[i]))
                    .attr("x2", x(greenPieces[i]))
                    .transition()
                    .duration(duration)
                    .delay((delay * i) + delay)
                    .style("stroke", "green"); 
            }
        } // end for loop

        d3.select("#greenCircle").raise();
        d3.select("#yellowCircle").raise();
        d3.select("#blueCircle").raise();
        d3.select("#redCircle").raise();
    }

};





