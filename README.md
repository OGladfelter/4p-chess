# 4p-chess
Analyzing 4-player chess games played on chess.com

### Data collection and preparation
Chess_Data_Collection.ipynb: Python file which web scrapes chess.com game data (single game) and computes other variables: moves, points over time, piece moved, material strength over time, etc

### JavaScript 
script.js: Defines constant variables - such as chart dimensions - which the other script files use; calls functions defined in other script files

prose.js: Updates results section with dynamic text describing key metrics found in the game data

Other script files add and control charts:

replica.js: Creates an animated replica of the game board and each of the game's pieces

heatmap.js: Creates an interactive heatmap showing density of move destinations (preview here)

points_timeplot.js: Creates an animated lineplot showing each players' score each move (preview here)

pieces_scatterplot.js: Creates an animated scatterplot showing number of pieces vs material strength value for each player each move (preview here
