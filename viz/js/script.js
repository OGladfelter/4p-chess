// check for URL parameter
if (window.location.search == ""){
    var game_id = "6593805"; // for users coming without a param
}
else{
    var game_id = window.location.search.replace("?g=",""); // if there's a param in the URL

    // update select to match URL param
    var select = document.getElementById('gameSelect');
    var opts = select.options;
    for (var opt, j = 0; opt = opts[j]; j++) {
        if (opt.value == game_id) {
            select.selectedIndex = j;
            break;
        }
    }
}

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
    var plots_margin = {top: 20, right: 30, bottom: 20, left: 40},
    width = ((document.querySelector(".box").offsetWidth)) - plots_margin.left - plots_margin.right,
    //width = (document.getElementById("replica").offsetWidth) - margin.left - margin.right,
    height = width,
    padding = 5;
}

// read destinations data, used only in heatmap.js
var squareCountsData;
d3.csv("data/" + game_id + "/destinations.csv", function(error, csv) {
    if (error){ // likely would be caused by an invalid URL param. So replace URL param with our default and refresh the page
        var url = new URL(location.href);
        url.searchParams.set('g', "6593805");
        var modifiedUrl = url.toString();
        window.history.pushState({}, '', modifiedUrl);
        location.reload();
    };
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
        updateAllProse();
        
    }, 500); // 200 ms gap just makes sure this script doesn't jump the point at which other script files are read as sources
});

// wait a second before calling animate(), since other js files are called after this one
setTimeout(() => {  
    console.log("Commence animation"); 
    animate(500, 500); 
}, 1000);

// after 2 seconds from page load, close nav menu
setTimeout(() => {  
    closeNav(); 
}, 2000);

///////////////// functions ///////////////////////////////////////

// call to trigger each graph's animation from the beginning
function animate(duration, delay){
    animateTimeplot(duration, delay); // defined in points_timeplot.js
    animateHeatmap(duration, delay); // defined in heatmap.js
    animateScatterplot(duration, delay); // defined in pieces_scatterplot.js
    animateReplica(duration, delay); // defined in replica.js

    if (screen.width >= 600){
       // the divs in the 'Who Captured Whom?' chart may grow. This keeps them equal:
        var maxHeight = getMaxHeight('.capturedSection');
        setHeight('.capturedSection', maxHeight); 
    }

    setTimeout(() => {  
        openNav();
    }, 500 * data.length);
};

// this param is optional. if replay() is run without parameter, it will use slider value.
function replay(speed){

    // cancel all current transitions
    d3.selectAll("*").interrupt();

    // close nav menu after a second
    setTimeout(() => {  
        closeNav();
    }, 3000);

    // if no param, then use slider value. Otherwise, use what's given.
    if (arguments.length == 0){
            // calc speed at which to play, determined by slider and a formula
            var sliderValue = document.getElementById("slider").value;
            var speed = (-100 * sliderValue) + 2100;
    }
            
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

function newGame(game_id){

    // cancel all current transitions
    d3.selectAll("*").interrupt();

    // overwrite destinations data
    d3.csv("data/" + game_id + "/destinations.csv", function(csv) {
        squareCountsData = csv;
    });

    // overwrite moves data
    d3.csv("data/" + game_id + "/moves.csv", function(csv) {
        data = csv;

        // remove timeplot, redraw with new data
        timeplot_svg.selectAll("*").remove();
        drawTimeplot();

        // same process with scatterplot
        scatter_svg.selectAll("*").remove();
        drawScatterplot();

        // update prose section
        updateAllProse();

        // start new animation
        replay();

        // update the url, but without refreshing the page - so users can share specific games
        var url = new URL(location.href);
        url.searchParams.set('g', game_id);
        var modifiedUrl = url.toString();
        window.history.pushState({}, '', modifiedUrl);
    });
}


// functions for the side bar //////////////////////////
function openNav() {
    if (screen.width < 600){
        document.getElementById("mySidebar").style.width = "65%";
    }
    else{
       document.getElementById("mySidebar").style.width = "15%"; 
    }
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
