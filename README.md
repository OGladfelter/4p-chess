# 4p-chess
Analyzing 4-player chess games played on chess.com

### Data collection and preparation
Chess_Data_Collection.ipynb: Python file which web scrapes chess.com game data (single game) and computes other variables: moves, points over time, piece moved, material strength over time, etc

### Data Visualization Folders

viz: Contains HTML, CSS, & JavaScript to create an interactive dashboard of charts

Each JavaScript file adds one chart:
heatmap.js: Creates an interactive heatmap showing density of move destinations (preview here)
points_timeplot.js: Creates an animated lineplot showing each players' score each move (preview here)
pieces_scatterplot.js: Creates an animated scatterplot showing number of pieces vs material strength value for each player each move (preview here
