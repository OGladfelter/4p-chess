// append the svg object to the body of the page
var replica_svg = d3.select("#replica")
    .append("svg")
    .attr("width", width + board_margin.left + board_margin.right)
    .attr("height", height + board_margin.top + board_margin.bottom)
    .append("g")
    .attr("transform", "translate(" + board_margin.left + "," + board_margin.top + ")");

var letters = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n"]
var numbers = [1,2,3,4,5,6,7,8,9,10,11,12,13,14];

var coordinates = [];
var visibilities = []

for (i=0; i<letters.length; i++){
    for (n=0; n<numbers.length; n++){

        // if we find coordinates that fall off the 4-player chess board, we don't want them visible
        if ((n>=11 & i<=2) | (n>=11 & i>=11) | (n<=2 & i<=2) | (n<=2 & i>=11)){
            visibilities.push("hidden");
        }
        else{
            visibilities.push("visible");
        }

        // loop over every possible a1-n14 coordinate (minus the 36 squares that fall off the board, like a1, a2, a3, etc)
        var coord = letters[i]+numbers[n];
        
        coordinates.push(coord);
    }
}

// Build X scales and axis:
var x = d3.scaleBand()
    .range([ 0, width ])
    .domain(letters)
    .padding(0.01);
    // replica_svg.append("g")
    // .attr("class", "axis")
    // .attr("transform", "translate(0," + height + ")")
    // .call(d3.axisBottom(x));

// Build Y scales and axis:
var y = d3.scaleBand()
    .range([ height, 0 ])
    .domain(numbers)
    .padding(0.01);
    // replica_svg.append("g")
    // .attr("class", "axis")
    // .attr('transform', 'translate(0, 0)')
    // .call(d3.axisLeft(y));
    
var row = 0;
var squareCount = 0;
for (cell=0; cell<coordinates.length; cell++){

    if (squareCount == 14){
        row = row + 1;
        squareCount = 0;
    }
    squareCount = squareCount + 1;

    // draw and color the cells
    replica_svg
        .append("rect")
        .attr("x", function(d) { return x(coordinates[cell][0]) })
        .attr("y", function(d) { return y((coordinates[cell].substring(1))) })
        .attr("width", width / 14 )
        .attr("height", height / 14 )
        .attr("class", "gameboard")
        .style("visibility", visibilities[cell])
        .style("fill", function(){
            
            // if even row, color every even column ___
            if (row%2==0){ // if 
                if (cell%2==0){
                    return "#adadad";
                }
                else{
                    return "#dadada";
                }
            }
            // if even row, color every odd column ___
            else{
                if (cell%2==0){
                    return "#dadada";
                }
                else{
                    return "#adadad";
                }
            }
        })
        //.attr("id", function(d) { return coordinates[cell] }); 
}

// set up grayscale filter
replica_svg.append('filter')
.attr('id','grayscale')
.append('feColorMatrix')
.attr('type','matrix')
.attr('values',"0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0");

function drawReplica(){

    replica_svg.selectAll('image')
    .data(startingPositions)
    .enter()
    .append('image')
    .attr("id", function(d){return d.coordinate})
    .attr("x", function(d){return x(d.coordinate[0])})
    .attr("y", function(d){return y(d.coordinate.substring(1))})
    .attr('width', width / 14)
    .attr('height', width / 14)
    .attr('class', function(d){ return d.player + "Piece"})
    .attr('href', function(d){return "./img/" + d.player + "/" + d.piece + ".svg"})

    animateReplica = function(duration, delay){

        const finalRound = data[data.length-1]["round"];

        for (i=0; i<data.length; i++){
            
            // if this move delivers a checkmate, gray out the pieces of the targeted player. Then proceed with rest of loop.
            if (data[i].move.includes("#")){
                d3.selectAll("." + data[i].checkmate_target + "Piece").transition().delay(i*delay).style("filter", "url(#grayscale");
            }
            // some moves don't require moving (resigning, timing out, stalemating). Gray player out. Then skip rest of loop.
            else if (data[i].move == "R" | data[i].move == "T" | data[i].move == "S"){
                d3.selectAll("." + data[i].player + "Piece").transition().delay(i*delay).style("filter", "url(#grayscale");
                continue;
            }
            // skip the no-moves (also the non-moving player's pieces should have already been grayed out...)
            else if (data[i].move == ""){
                //d3.selectAll("." + data[i].player + "Piece").transition().delay(i*delay).style("filter", "url(#grayscale");
                continue;
            }

            // move piece to new square!!
            d3.select("#" + data[i].origin)
            .raise()
            .attr("id", data[i].destination) // overwrite id
            .transition()
            .duration(duration / 2)
            .delay(i * delay)
            .attr("x", x(data[i].destination[0]))
            .attr("y", y(data[i].destination.substring(1)))
            .ease(d3.easeLinear);

            // if they castled, we need to update rooks position as well
            if (data[i].move == "O-O"){ // king side castle
                if (data[i].player == "red"){
                    d3.select("#k1") // where the rook starts
                    .raise()
                    .attr("id", "i1") // where the rook lands after the castle
                    .transition()
                    .duration(duration)
                    .delay(i * delay)
                    .attr("x", x("i"))
                    .attr("y", y(1));
                }
                else if (data[i].player == "blue"){
                    d3.select("#a11")
                    .raise()
                    .attr("id", "a9")
                    .transition()
                    .duration(duration)
                    .delay(i * delay)
                    .attr("x", x("a"))
                    .attr("y", y(9));
                }
                if (data[i].player == "yellow"){
                    d3.select("#d14")
                    .raise()
                    .attr("id", "f14")
                    .transition()
                    .duration(duration)
                    .delay(i * delay)
                    .attr("x", x("f"))
                    .attr("y", y(14));
                }
                if (data[i].player == "green"){
                    d3.select("#n4")
                    .raise()
                    .attr("id", "n6")
                    .transition()
                    .duration(duration)
                    .delay(i * delay)
                    .attr("x", x("n"))
                    .attr("y", y(6));
                }
            }
            if (data[i].move == "O-O-O"){ // queen side castle
                if (data[i].player == "red"){
                    d3.select("#d1")
                    .raise()
                    .attr("id", "g1")
                    .transition()
                    .duration(duration)
                    .delay(i * delay)
                    .attr("x", x("g"))
                    .attr("y", y(1));
                }
                else if (data[i].player == "blue"){
                    d3.select("#a4")
                    .raise()
                    .attr("id", "a7")
                    .transition()
                    .duration(duration)
                    .delay(i * delay)
                    .attr("x", x("a"))
                    .attr("y", y(7));
                }
                if (data[i].player == "yellow"){
                    d3.select("#k14")
                    .raise()
                    .attr("id", "h14")
                    .transition()
                    .duration(duration)
                    .delay(i * delay)
                    .attr("x", x("h"))
                    .attr("y", y(14));
                }
                if (data[i].player == "green"){
                    d3.select("#n11")
                    .raise()
                    .attr("id", "n8")
                    .transition()
                    .duration(duration)
                    .delay(i * delay)
                    .attr("x", x("n"))
                    .attr("y", y(8));
                }
            }

            if (d3.selectAll("#" + data[i].destination)._groups[0].length > 1){
                
                // remove the first image given this id - it was the piece captured
                d3.select("#" + data[i].destination)
                .attr("id", "")
                .transition()
                .delay(i * delay + (delay / 2))
                .style("visibility", "hidden");
            };

            // if a pawn gets promoted to a queen, we need to change its image
            if (data[i].moveNote.includes("=D")){
                
                d3.select("#" + data[i].destination)
                .transition()
                .duration(duration / 2)
                .delay(i * delay + (delay / 2)) // needs to be a bit delayed so pawn moving squares transition is not interupted
                .attr('href', function(d){return "./img/" + data[i].player + "/" + "promoted_pawn" + ".svg"});
            }
            
        
        }; // close for loop
    }

    // reset positions and ID for every piece, remove any added grayfilters, switch promoted queens back to pawns, reshow hidden pieces
    resetReplica = function(){
        replica_svg.selectAll('image')
        // .transition()
        // .duration(500)
        // .data(startingPositions)
        // .enter()
        // .append('image')
        .attr("id", function(d){return d.coordinate})
        .attr("x", function(d){return x(d.coordinate[0])})
        .attr("y", function(d){return y(d.coordinate.substring(1))})
        .style("visibility", "visible")
        .style("filter", "none")
        .attr('href', function(d){return "./img/" + d.player + "/" + d.piece + ".svg"})
    }
}