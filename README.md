# 4p-chess
Analyzing 4-player chess games played on chess.com

### Data collection and preparation
Chess_Data_Collection.ipynb: Python file which web scrapes chess.com game data (single game) and computes other variables: moves, points over time, piece moved, material strength over time, etc

### Data Visualization Folders

viz: Contains HTML, CSS, & JavaScript to create an interactive dashboard of charts

Most JavaScript files add and control one chart:

replica.js: Creates an animated replica of the game board and each of the game's pieces

heatmap.js: Creates an interactive heatmap showing density of move destinations (preview here)

points_timeplot.js: Creates an animated lineplot showing each players' score each move (preview here)

pieces_scatterplot.js: Creates an animated scatterplot showing number of pieces vs material strength value for each player each move (preview here

There is one JavaScript file which does not directly add any charts:

script.js: Defines constant variables - such as chart dimensions - which the other script files use; calls functions defined in other script files

