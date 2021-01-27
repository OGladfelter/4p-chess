const game_id = "6579153";
const duration = 500;
const delay = 500;
const circle_radius = 12; // used by pieces_scatterplot.js

// set the dimensions and margins used by each graph
const m = 25;
var margin = {top: m, right: m, bottom: m, left: m},
width = ((window.innerWidth * .25)) - margin.left - margin.right,
//width = (document.getElementById("replica").offsetWidth) - margin.left - margin.right,
height = width,
padding = 5;

// switch for mobile screens
if (screen.width < 600){
    margin = {top: 30, right: 30, bottom: 70, left: 70},
    width = screen.width - 40 - margin.left - margin.right,
    height = screen.width - 40 - margin.top - margin.bottom,
    padding = 5;
}

// read destinations data, used only in heatmap.js
var squareCountsData;
d3.csv("data/" + game_id + "/destinations.csv", function(csv) {
    squareCountsData = csv;

});

// read pieces data, used only in replica.js
var startingPositions;
d3.csv("data/pieces.csv", function(csv) {
    startingPositions = csv;

});

// save moves.csv to variable 'data' for use in other functions
// reading and saving data here creates no delay between animation functions in the separate js files
var data;
d3.csv("data/" + game_id + "/moves.csv", function(csv) {
    data = csv;
    
    // draw each of the plots once D3 finishes reading csv
    setTimeout(() => {  
        drawTimeplot();
        drawHeatmap();
        drawScatterplot();
        drawReplica();
    }, 200); // 200 ms gap just makes sure this script doesn't jump the point at which other script files are read as sources
});

// call to trigger each graph's animation from the beginning
function animate(){
    animateTimeplot(duration, delay); // defined in points_timeplot.js
    animateHeatmap(duration, delay); // defined in heatmap.js
    animateScatterplot(duration, delay); // defined in pieces_scatterplot.js
    animateReplica(duration, delay); // defined in replica.js
};

// wait a second before calling animate(), since other js files are called after this one
setTimeout(() => {  
    console.log("Commence animation"); 
    animate(); 
}, 1000);