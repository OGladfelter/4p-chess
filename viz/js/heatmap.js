var game_id = "6258741";

// set the dimensions and margins of the graph
var margin = {top: 30, right: 30, bottom: 30, left: 30},
width = (window.innerWidth * .33) - margin.left - margin.right,
height = width;

if (screen.width < 600){
    margin = {top: 30, right: 30, bottom: 70, left: 70},
    width = screen.width - 40 - margin.left - margin.right,
    height = screen.width - 40 - margin.top - margin.bottom;
}

// append the svg object to the body of the page
var svg_heatmap = d3.select("#heatmap")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .on("click", animate);

//Read the data
d3.csv("data/" + game_id + "/destinations.csv", function(data) {

    // Build color scale for cells
    myColor = d3.scaleLinear()
        .range(["white", "black"])
        .domain([0,d3.max(data, function(d) { return d.value; })])

    var letters = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n"]
    var numbers = [1,2,3,4,5,6,7,8,9,10,11,12,13,14];

    for (i=0; i<letters.length; i++){
        for (n=0; n<numbers.length; n++){

            // if we find coordinates that fall off the 4-player chess board, we can skip this loop iteration
            if ((n>=11 & i<=2) | (n>=11 & i>=11) | (n<=2 & i<=2) | (n<=2 & i>=11)){
                continue;
            }

            // loop over every possible a1-n14 coordinate (minus the 36 squares that fall off the board, like a1, a2, a3, etc)
            var coord = letters[i]+numbers[n];
            var missing = 1;

            // check if it's in the dataset
            for (d=0; d<data.length; d++){
                if (coord == data[d].coordinate){
                    // we found it! coord is not missing
                    missing = 0;
                    break; // no need to check the rest of the dataset
                }
            }

            // if it was not found, we need to add it to the dataset. with a value of 0.
            if (missing == 1){
                data.push({coordinate: coord, value: "0"})
            }
            
        }
    }

    data.forEach(function(d, i){
        d.value = +d.value;
    });

    // Build X scales and axis:
    var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(letters)
        .padding(0.01);
        svg_heatmap.append("g")
        .attr("class", "heatmap_axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));
    
    // Build Y scales and axis:
    var y = d3.scaleBand()
        .range([ height, 0 ])
        .domain(numbers)
        .padding(0.01);
        svg_heatmap.append("g")
        .attr("class", "heatmap_axis")
        .attr('transform', 'translate(0, 0)')
        .call(d3.axisLeft(y));

    // if (screen.width < 600){
    //     d3.selectAll(".axis>.tick>text")
    //     .each(function(d, i){
    //         d3.select(this).style("font-size","12px");
    //     });
    // }
    
    // draw and color the cells
    svg_heatmap.selectAll()
        .data(data)
        .enter()
        .append("rect")
        .attr("y", function(d) { return y((d.coordinate.substring(1))) })
        .attr("x", function(d) { return x(d.coordinate[0]) })
        .attr("width", width / 14 )
        .attr("height", height / 14 )
        .attr("class", "square")
        .attr("id", function(d) { return d.coordinate })
        .style("fill", function(d){return myColor(d.value)} )
        .on("mouseover", function(d){showAll(d.coordinate)})
        .on("mouseout", function(d){showAgg(d.coordinate)});


    // squareLabelFontSize = '18px'
    // if (screen.width < 600){
    //     squareLabelFontSize = '10px'
    // }

    // labels for squares
    texts = svg_heatmap.selectAll(".heatmapLabels")
        .data(data, function(d) {return d.coordinate+':'+d.value;})
        .enter()
        .append("text")
        .attr("class", "heatmapLabels")
        .attr("id", function(d) { return d.coordinate + "text" })
        .text(function(d){return d.value;})
        .attr("y", function(d) { return y((d.coordinate.substring(1))) + (height/14/2) })
        .attr("x", function(d) { return x(d.coordinate[0]) + (width/14/2) })
        //.attr('font-size', squareLabelFontSize)
        .style("fill", function(d) {if (d.value > 2){return 'white'} else if (d.value > 1){return 'black'} else{return "none"}});

    // mini labels for squares - 4 per. One for each player. Normally hidden, except on rect mouseover.
    svg_heatmap.selectAll(".redText")
        .data(data, function(d) {return d.coordinate+':'+d.value;})
        .enter()
        .append("text")
        .attr("class", "redText colorText")
        .attr("id", function(d) { return d.coordinate + "redText" })
        .attr("y", function(d) { return y((d.coordinate.substring(1))) + (height/14/4) })
        .attr("x", function(d) { return x(d.coordinate[0]) + (width/14/4) });
    svg_heatmap.selectAll(".yellowText")
        .data(data, function(d) {return d.coordinate+':'+d.value;})
        .enter()
        .append("text")
        .attr("class", "yellowText colorText")
        .attr("id", function(d) { return d.coordinate + "yellowText" })
        .attr("y", function(d) { return y((d.coordinate.substring(1))) + (height/14/1.5) })
        .attr("x", function(d) { return x(d.coordinate[0]) + (width/14/4) });
    svg_heatmap.selectAll(".blueText")
        .data(data, function(d) {return d.coordinate+':'+d.value;})
        .enter()
        .append("text")
        .attr("class", "blueText colorText")
        .attr("id", function(d) { return d.coordinate + "blueText" })
        .attr("y", function(d) { return y((d.coordinate.substring(1))) + (height/14/4) })
        .attr("x", function(d) { return x(d.coordinate[0]) + (width/14/1.5) });
    svg_heatmap.selectAll(".greenText")
        .data(data, function(d) {return d.coordinate+':'+d.value;})
        .enter()
        .append("text")
        .attr("class", "greenText colorText")
        .attr("id", function(d) { return d.coordinate + "greenText" })
        .attr("y", function(d) { return y((d.coordinate.substring(1))) + (height/14/1.5) })
        .attr("x", function(d) { return x(d.coordinate[0]) + (width/14/1.5) });

    // when activated, flip the visibility of the main text and the four-color texts
    function showAll(coord){
        d3.selectAll("#" + coord + "redText").style("visibility", "visible");
        d3.selectAll("#" + coord + "blueText").style("visibility", "visible");
        d3.selectAll("#" + coord + "yellowText").style("visibility", "visible");
        d3.selectAll("#" + coord + "greenText").style("visibility", "visible");
        d3.selectAll("#" + coord + "text").style("visibility", "hidden");
    }
    function showAgg(coord){
        d3.selectAll("#" + coord + "redText").style("visibility", "hidden");
        d3.selectAll("#" + coord + "blueText").style("visibility", "hidden");
        d3.selectAll("#" + coord + "yellowText").style("visibility", "hidden");
        d3.selectAll("#" + coord + "greenText").style("visibility", "hidden");
        d3.selectAll("#" + coord + "text").style("visibility", "visible");
    }

    // read moves data     
    d3.csv("data/" + game_id + "/moves.csv", function(data) {

        // if a row doesn't represent an actual move, remove it
        data = data.filter(function(d) { return d.move != "" });

        playerSquareCounts = {"red":{}, "blue":{}, "yellow":{}, "green":{}};

        for (i=0; i<data.length; i++){

            // skip the no-moves
            if (data[i].destination == ""){
                continue;
            }

            //  if this destination is already in the dicts, increment its value
            if (playerSquareCounts[data[i].player].hasOwnProperty(data[i].destination)){
                playerSquareCounts[data[i].player][data[i].destination] = playerSquareCounts[data[i].player][data[i].destination] + 1;
            }
            // otherwise, add it with value of 1
            else{
                playerSquareCounts[data[i].player][data[i].destination] = 1;
            }
        
            // update the normally hidden more detailed texts too
            d3.select("#" + data[i].destination + "redText").text(playerSquareCounts["red"][data[i].destination]);
            d3.select("#" + data[i].destination + "blueText").text(playerSquareCounts["blue"][data[i].destination]);
            d3.select("#" + data[i].destination + "yellowText").text(playerSquareCounts["yellow"][data[i].destination]);
            d3.select("#" + data[i].destination + "greenText").text(playerSquareCounts["green"][data[i].destination]);
        
        }; // close for loop
    })

})

function animate(){

    // reset color and labels
    d3.selectAll(".square").style("fill","white");
    d3.selectAll(".heatmapLabels").each(function() {d3.select(this).text("");});
    d3.selectAll(".colorText").each(function() {d3.select(this).text("");});

    // read and save moves data     
    d3.csv("data/" + game_id + "/moves.csv", function(data) {

        var delay = 500;

        // if a row doesn't represent an actual move, remove it
        //data = data.filter(function(d) { return d.move != "" });

        // start with blank slates
        squareCounts = {};
        playerSquareCounts = {"red":{}, "blue":{}, "yellow":{}, "green":{}};

        for (i=0; i<data.length; i++){

            // skip the no-moves
            if (data[i].destination == ""){
                d3.select("#heatmap_move_count").transition().delay(i * delay).text(i);
                continue;
            }

            // if this destination is already in the dicts, increment its value
            if (squareCounts.hasOwnProperty(data[i].destination)){
                squareCounts[data[i].destination] = squareCounts[data[i].destination] + 1;
            }
            // otherwise, add it with value of 1
            else{
                squareCounts[data[i].destination] = 1;
            }

            // repeat but for individual player counts
            if (playerSquareCounts[data[i].player].hasOwnProperty(data[i].destination)){
                playerSquareCounts[data[i].player][data[i].destination] = playerSquareCounts[data[i].player][data[i].destination] + 1;
            }
            // otherwise, add it with value of 1
            else{
                playerSquareCounts[data[i].player][data[i].destination] = 1;
            }

            // update color of square
            d3.select("#" + data[i].destination)
                .transition()
                .delay(delay * i) // delay each animation by factor of i, so they don't all trigger at once
                .style("fill", function (d){return data[i]["player"]}) // change square color to reflect player who moved here 
                .transition()
                .delay(delay/2) // pause 
                .duration(delay/2) // gradually switch to new color
                .style("fill", myColor(squareCounts[data[i].destination])); // new color: darker if this square has already been visited

            // update text label in same square
            d3.select("#" + data[i].destination + "text")
                .transition()
                .delay(delay * i)
                .text(squareCounts[data[i].destination])
                .style("fill", function(d) {if (squareCounts[data[i].destination] > 2){return 'white'} else if (squareCounts[data[i].destination] > 1){return 'black'} else{return "none"}});
        
            // update the normally hidden more detailed texts too
            d3.select("#" + data[i].destination + "redText").transition().delay(delay * i).text(playerSquareCounts["red"][data[i].destination]);
            d3.select("#" + data[i].destination + "blueText").transition().delay(delay * i).text(playerSquareCounts["blue"][data[i].destination]);
            d3.select("#" + data[i].destination + "yellowText").transition().delay(delay * i).text(playerSquareCounts["yellow"][data[i].destination]);
            d3.select("#" + data[i].destination + "greenText").transition().delay(delay * i).text(playerSquareCounts["green"][data[i].destination]);
        
            d3.select("#heatmap_move_count").transition().delay(i * delay).text(i);

        }; // close for loop
    })
}

animate();