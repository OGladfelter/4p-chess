var moveOrder = ["red", "blue", "yellow", "green"];
var pieces = ["Pawn", "Queen", "Knight", "Bishop", "King", "Rook"];

function dictValuesOrder(dict){
    var keys = Object.keys(dict);
    keys.sort(function(a,b){
      return dict[b] - dict[a];
    })
    return keys;
}

function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
}

function updatePointsText(){
    /////// who won the game? //////
    var dict_scores = {
        "red": data[data.length-1]["redPoints"],
        "blue": data[data.length-1]["bluePoints"],
        "yellow": data[data.length-1]["yellowPoints"],
        "green": data[data.length-1]["greenPoints"],
    }

    // order dictionary by value, save keys to array
    var playerRanks = dictValuesOrder(dict_scores);
    var winner = "<u style='text-decoration-color:" + playerRanks[0] + ";'>" + playerRanks[0] + "</u>";

    /////// blow out or close game? /////
    // if 2nd place was within 20 points of 1st place, we'll say it was close
    if ((dict_scores[playerRanks[0]] - 20) <= dict_scores[playerRanks[1]]){
        var winClause = ", but " + "<u style='text-decoration-color:" + playerRanks[1] + ";'>"  + playerRanks[1] + "</u>" + " was within striking distance! "
    }
    else{
        var winClause = " quite handidly. ";
    }

    // put it together for the first sentence
    var sentence1 = winner + " won" + winClause;

    ////// who held the lead for the majority of rounds? /////

    // group data by rounds, get max # of points for each player each round
    // var roundsData = d3.nest()
    // .key(function(d) { return d.round;})
    // .rollup(function(d) { 
    // return d3.max(d, function(g) {return [g.redPoints, g.bluePoints, g.yellowPoints, g.greenPoints]; });
    // }).entries(data);

    // a dictionary to hold # of moves each player was the leader in
    var dict_rounds_led = {"red": 0, "blue": 0, "yellow": 0, "green": 0};

    // loop over each move. See which player had the lead at that move. 
    for (i=0; i<data.length; i++){
        var array = [data[i].redPoints, data[i].bluePoints, data[i].yellowPoints, data[i].greenPoints];

        // skip rounds where there's a tie. This dodges the rounds before any points have been scored.
        if ((new Set(array)).size !== array.length)
        {
            continue;
        }
        
        // find index of max value in array, convert to player color, increment player colors value in dictionary
        dict_rounds_led[moveOrder[indexOfMax(array)]] = dict_rounds_led[moveOrder[indexOfMax(array)]] + 1;
    }
    
    // array ordered by who held lead longest
    var playerLeadRanks = dictValuesOrder(dict_rounds_led);
    
    if (playerLeadRanks[0] == playerRanks[0]){
        var howSurprising = "isn't a huge surprise";
        var whoLedMost = "they";
    }
    else{
        var howSurprising = "may seem surprising";
        var whoLedMost = "<u style='text-decoration-color:" + playerLeadRanks[0] + ";'>" + playerLeadRanks[0] + "</u>";
    }

    var sentence2 = "Judging by points alone, <u style='text-decoration-color:" + playerRanks[0] + ";'>" + playerRanks[0] + "</u>" + "'s win " + howSurprising + ", considering " + whoLedMost + " led the scoreboard for most of the game.";

    document.getElementById("points").innerHTML = sentence1 + sentence2;
}

function updateCapturingText(){

    // what % of moves included captures?
    var captures = data.filter(function(d){
        return d.capture == 1;
    });
    var capturePercentage = (captures.length / data.length) * 100;

    var sentence1 = capturePercentage.toFixed(0) + " percent of the moves this game included capturing a piece. "

    var sentence2 = "Of course, some players were more aggressive than others: "

    // loop over data to populate player move and capture count dictionaries
    player_move_counts = {"red": 0, "blue": 0, "yellow": 0, "green": 0}
    var player_capture_counts = {"red": 0, "blue": 0, "yellow": 0, "green": 0}

    for (i=0; i<data.length; i++){
        if (data[i].move != ""){
            player_move_counts[data[i].player] = player_move_counts[data[i].player] + 1
        }
        if (data[i].capture == 1){
            player_capture_counts[data[i].player] = player_capture_counts[data[i].player] + 1
        }
    }

    // now create a new dictionary, using a loop to dividing values from previous two dictionaries 
    var player_capture_percentages = {};
    for (i=0; i<moveOrder.length; i++){
        player_capture_percentages[moveOrder[i]] = (player_capture_counts[moveOrder[i]] / player_move_counts[moveOrder[i]]) * 100;
    }

    // who was the most aggressive player?
    var playerAggressionRanked = dictValuesOrder(player_capture_percentages);
    var sentence3 = "<u style='text-decoration-color:" + playerAggressionRanked[0] + ";'>" + playerAggressionRanked[0] + "</u>" + " managed to capture an enemy piece in " + player_capture_percentages[playerAggressionRanked[0]].toFixed(0) + " percent of their moves. ";

    // how aggressive/efficient were the other players?
    var sentence4 = "Meanwhile, " + "<u style='text-decoration-color:" + playerAggressionRanked[1] + ";'>" + playerAggressionRanked[1] + "</u>" 
    + ", " + "<u style='text-decoration-color:" + playerAggressionRanked[2] + ";'>" + playerAggressionRanked[2] + "</u>" + ", and " + 
    "<u style='text-decoration-color:" + playerAggressionRanked[3] + ";'>" + playerAggressionRanked[3] + "</u>" + " captured in " + 
    player_capture_percentages[playerAggressionRanked[1]].toFixed(0) + ", " + player_capture_percentages[playerAggressionRanked[2]].toFixed(0) + ", and " + player_capture_percentages[playerAggressionRanked[3]].toFixed(0)
    + " percent of their moves, respectively."

    document.getElementById("capturingPieces").innerHTML = sentence1 + sentence2 + sentence3 + sentence4;
}

function updateMovingText(){

    // which piece was moved the most often?

    // group and sum by 'piece' column
    var piecesCount = d3.nest()
    .key(function(d) { return d.piece; })
    .rollup(function(v) { return v.length; })
    .entries(data);

    // convert nested object (list of dicts) into one dict
    var piecesCount = piecesCount.reduce(function(p, c) { p[c["key"]] = c["value"]; return p; }, {});

    var piecesRank = dictValuesOrder(piecesCount);

    if (piecesRank[0]=="Pawn"){
        var sentence1 = "Pawns were moved more than any other piece, which is extremely common, considering pawns are by far the most common piece, they aren’t very mobile, and there’s a big incentive for getting one to the center. ";
        var sentence2 = "Still, it’s startling to think that " + (piecesCount["Pawn"] / data.length * 100).toFixed() + " percent of this game’s turns were spent moving pawns. ";
    }
    else{
        var sentence1 = piecesRank[0] + "s were moved " + (piecesCount[piecesRank[0]] / data.length * 100).toFixed() + " of the turns this game, more than other piece. ";
        var sentence2 = "I should note that this distinction almost always goes to the pawns, so this game was definitely unique.";
    }

    document.getElementById("movingPieces").innerHTML = sentence1 + sentence2;
}

function getPieceCountsByPlayer(){
    var piecesCountByPlayer = d3.nest()
    .key(function(d) { return d.player; })
    .key(function(d) { return d.piece; })
    .rollup(function(v) { return v.length; })
    .entries(data);

    var piecesCountByPlayer = piecesCountByPlayer.reduce(function(p, c) { p[c["key"]] = c["values"]; return p; }, {});
    
    for (i=0; i<moveOrder.length; i++){
        piecesCountByPlayer[moveOrder[i]] = piecesCountByPlayer[moveOrder[i]].reduce(function(p, c) { p[c["key"]] = c["value"]; return p; }, {});
    }

    return piecesCountByPlayer;
}

function updateMoveCountsTable(player){
    
    var piecesCountByPlayer = getPieceCountsByPlayer();

    // verify they actually moved all 6 pieces
    if (Object.keys(piecesCountByPlayer[player]).length < 6){
        // otherwise, we need to determine what's missing and add it
        for (i=0; i<pieces.length; i++){
            if (!(pieces[i] in piecesCountByPlayer[player])){
                piecesCountByPlayer[player][pieces[i]] = 0;
            }
        }
    };

    var piecesRank = dictValuesOrder(piecesCountByPlayer[player]);

     // loop over rows and update text
     const rows = document.getElementsByTagName("tr");
     for (i=0; i<rows.length; i++){
         var columns = rows[i].getElementsByTagName("td");
         columns[0].innerHTML = piecesRank[i];
         columns[1].innerHTML = piecesCountByPlayer[player][piecesRank[i]] // player_move_counts[player];
     }
}

function updateAllProse(){
    updatePointsText();
    updateCapturingText();
    updateMovingText();
    getPieceCountsByPlayer();
    updateMoveCountsTable(document.getElementById("piecesMovedSelect").value);
}