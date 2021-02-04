var half_height = height / 1.5;

// append the svg object to the body of the page
var scatter_svg = d3.select("#scatterplot")
    .append("svg")
        .attr("class", "dark_svg")
        .attr("width", width + plots_margin.left + plots_margin.right)
        .attr("height", half_height + plots_margin.top + plots_margin.bottom)
    .append("g")
        .attr("transform", "translate(" + plots_margin.left + "," + plots_margin.top + ")")
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
        .attr("transform", "translate(0," + half_height + ")")
        .call(d3.axisBottom(x));
    
    // Build Y scales and axis:
    var y = d3.scaleLinear()
        .range([ half_height-padding, padding ])
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
        .style("fill", function(d){return "rgb(191, 59, 67)"} );

    scatter_svg.append("circle")
        .attr("id", function(d){ return "blueCircle"})
        .attr("cy", function(d) { return y(blueMaterialValues[0]) })
        .attr("cx", function(d) { return x(bluePieces[0]) })
        .style("r", circle_radius)
        .style("fill", function(d){return "rgb(65, 133, 191)"} );

    scatter_svg.append("circle")
        .attr("id", function(d){ return "yellowCircle"})
        .attr("cy", function(d) { return y(yellowMaterialValues[0]) })
        .attr("cx", function(d) { return x(yellowPieces[0]) })
        .style("r", circle_radius)
        .style("fill", function(d){return "rgb(192, 149, 38)"} );

    scatter_svg.append("circle")
        .attr("id", function(d){ return "greenCircle"})
        .attr("cy", function(d) { return y(greenMaterialValues[0]) })
        .attr("cx", function(d) { return x(greenPieces[0]) })
        .style("r", circle_radius)
        .style("fill", function(d){return "rgb(78, 145, 97)"} );

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
    .attr("y", y(maxMaterial)+ (padding * 3))
    .attr("x", x(minPieces))
    .text("Material Strength")
    .attr("class", "axis_label")
    .style("text-anchor", "start");

    scatter_svg.append("text")
    .attr("y", y(maxMaterial)+ (padding * 8))
    .attr("x", x(minPieces))
    .style("font-size", "20px")
    .html("&#x2655; = 9, &#x2657;&#x2656; = 5, &#x2658; = 3, &#x2659; = 1")
    .style("text-anchor", "start");

    /////////////////////////////////////////

    // animate function /////////////////////////
    animateScatterplot = function(duration, delay){

        var redFill = 'rgb(191, 59, 67)';
        var blueFill = 'rgb(65, 133, 191)';
        var yellowFill = 'rgb(192, 149, 38)';
        var greenFill = 'rgb(78, 145, 97)';

        // const lastRound = data[data.length-1]["round"];
        // const y_gap = -5;
        // const x_gap = 20;

        for (i=0; i<data.length; i++){

            // gray out circle if corresponding player resigns or times out
            if ((data[i]['move'] == "R") | (data[i]['move'] == "T") | (data[i]['move'] == "S")){

                if (data[i]['player'] == 'red'){redFill = '#8d7877';}
                else if (data[i]['player'] == 'blue'){blueFill = '#7b8189';}
                else if (data[i]['player'] == 'yellow'){yellowFill = '#8c8375';}
                else if (data[i]['player'] == 'green'){greenFill = '#7a837c';}
            }
            // or if a player was checkmated, find who and gray out their pieces
            else if (data[i].move.includes("#")){
                if (data[i]['checkmate_target'] == 'red'){redFill = '#8d7877';}
                else if (data[i]['checkmate_target'] == 'blue'){blueFill = '#7b8189';}
                else if (data[i]['checkmate_target'] == 'yellow'){yellowFill = '#8c8375';}
                else if (data[i]['checkmate_target'] == 'green'){greenFill = '#7a837c';}
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
                    .attr("class", "linePath")
                    .style("stroke", "none")
                    .attr("y1", y(redMaterialValues[i-1]))
                    .attr("x1", x(redPieces[i-1]))
                    .attr("y2", y(redMaterialValues[i]))
                    .attr("x2", x(redPieces[i]))
                    .transition()
                    .duration(duration)
                    .delay((delay * i) + delay)
                    .style("stroke", "rgb(191, 59, 67)");

                scatter_svg.append('line')
                    .attr("class", "linePath")
                    .style("stroke", "none")
                    .attr("y1", y(blueMaterialValues[i-1]))
                    .attr("x1", x(bluePieces[i-1]))
                    .attr("y2", y(blueMaterialValues[i]))
                    .attr("x2", x(bluePieces[i]))
                    .transition()
                    .duration(duration)
                    .delay((delay * i) + delay)
                    .style("stroke", "rgb(65, 133, 191)");

                scatter_svg.append('line')
                    .attr("class", "linePath")
                    .style("stroke", "none")
                    .attr("y1", y(yellowMaterialValues[i-1]))
                    .attr("x1", x(yellowPieces[i-1]))
                    .attr("y2", y(yellowMaterialValues[i]))
                    .attr("x2", x(yellowPieces[i]))
                    .transition()
                    .duration(duration)
                    .delay((delay * i) + delay)
                    .style("stroke", "rgb(192, 149, 38)"); 

                scatter_svg.append('line')
                    .attr("class", "linePath")
                    .style("stroke", "none")
                    .attr("y1", y(greenMaterialValues[i-1]))
                    .attr("x1", x(greenPieces[i-1]))
                    .attr("y2", y(greenMaterialValues[i]))
                    .attr("x2", x(greenPieces[i]))
                    .transition()
                    .duration(duration)
                    .delay((delay * i) + delay)
                    .style("stroke", "rgb(78, 145, 97)"); 
            }
        } // end for loop

        d3.select("#greenCircle").raise();
        d3.select("#yellowCircle").raise();
        d3.select("#blueCircle").raise();
        d3.select("#redCircle").raise();
    }

    // remove lines, reset circle position, reset circle color
    resetScatterplot = function(){
        scatter_svg.selectAll('.linePath').remove();

        d3.select("#redCircle")
            .transition()
            .duration(500)
            .attr("cy", function(d) { return y(redMaterialValues[0]) })
            .attr("cx", function(d) { return x(redPieces[0]) })
            .style("fill", function(d){return "rgb(191, 59, 67)"} );

        d3.select("#blueCircle")
            .transition()
            .duration(500)
            .attr("cy", function(d) { return y(blueMaterialValues[0]) })
            .attr("cx", function(d) { return x(bluePieces[0]) })
            .style("fill", function(d){return "rgb(65, 133, 191)"} );

        d3.select("#yellowCircle")
            .transition()
            .duration(500)
            .attr("cy", function(d) { return y(yellowMaterialValues[0]) })
            .attr("cx", function(d) { return x(yellowPieces[0]) })
            .style("fill", function(d){return "rgb(192, 149, 38)"} );

        d3.select("#greenCircle")
            .transition()
            .duration(500)
            .attr("cy", function(d) { return y(greenMaterialValues[0]) })
            .attr("cx", function(d) { return x(greenPieces[0]) })
            .style("fill", function(d){return "rgb(78, 145, 97)"} );
    };

};





