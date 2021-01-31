const game_id = "6579153";

const circle_radius = 12; // used by pieces_scatterplot.js

const captured_img_size = 40; // used by replica.js for 'Who Captured Whom" chart

// set the dimensions and margins used by each graph
var plots_margin = {top: 10, right: 30, bottom: 20, left: 30},
board_margin  = {top: 10, right: 10, bottom: 10, left: 10},
width = ((document.querySelector(".box").offsetWidth)) - plots_margin.left - plots_margin.right,
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
function animate(duration, delay){
    animateTimeplot(duration, delay); // defined in points_timeplot.js
    animateHeatmap(duration, delay); // defined in heatmap.js
    animateScatterplot(duration, delay); // defined in pieces_scatterplot.js
    animateReplica(duration, delay); // defined in replica.js

    // the divs in the 'Who Captured Whom?' chart may grow. This keeps them equal:
    var maxHeight = getMaxHeight('.capturedSection');
    setHeight('.capturedSection', maxHeight);

    setTimeout(() => {  
        console.log("Open left-side menu");
        openNav();
    }, 500 * data.length);
};

// wait a second before calling animate(), since other js files are called after this one
setTimeout(() => {  
    console.log("Commence animation"); 
    //animate(500, 500); 
}, 1000);

function replay(){

    // close nav menu after a second
    setTimeout(() => {  
        closeNav();
    }, 1000);

    // calc speed at which to play, determined by slider and a formula
    var sliderValue = document.getElementById("slider").value;
    var speed = (-100 * sliderValue) + 2100;

    //  kill the current animate() function somehow, incase it's in the middle of running

    // before calling the animate() function, we need to 'reset the board' for 2 of the graphs
    // (the timeplot and heatmap animation functions already redrawn the curtain and white out the squares, respectively)
    
    // scatter: remove lines, reset circle position, reset circle color
    resetScatterplot();

    // replica: reset positions and ID for every piece, remove any added grayfilters
    resetReplica();
    
    // now we can animate!
    animate(speed, speed);

    // reopen nav menu
    setTimeout(() => {  
        openNav();
    }, speed * data.length);
}

// functions for the side bar //////////////////////////
function openNav() {
    document.getElementById("mySidebar").style.width = "15%";
}
  
  function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
}

// messing with height in 'Who Captured Whom?' chart
function getMaxHeight(className) {
    var max = 0;
    document.querySelectorAll(className).forEach(
      function(el) {
        if (el.scrollHeight > max) {
          max = el.scrollHeight;
        }
      }
    );
    
    return max;
}
  
function setHeight(className, height) {
    document.querySelectorAll(className).forEach(
      function(el) {
        el.style.height = height+'px';
      }
    );
}
