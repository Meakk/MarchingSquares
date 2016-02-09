/*
The MIT License (MIT)
Copyright (c) 2016 Michael MIGLIORE
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

var MarchingSquares = (function() {

  var bounds = null,
      gridSize = null,
      weightReference = null,
      squareSize = null,
      getWeight = null,
      polylines;

  function interp(a, b) {
    var alpha = (weightReference - b.w)  /(a.w - b.w);
    return {x: alpha*a.x + (1-alpha)*b.x,
            y: alpha*a.y + (1-alpha)*b.y };
  }
  
  function doSquare(grid, i, j, currentPath) {
    var c = 0;
    var v0 = grid[i+1][j];
    var v1 = grid[i+1][j+1];
    var v2 = grid[i][j+1];
    var v3 = grid[i][j];
    
    if (v0.w > weightReference) c += 1;
    if (v1.w > weightReference) c += 2;
    if (v2.w > weightReference) c += 4;
    if (v3.w > weightReference) c += 8;
    
    if ((v3.count == 1 && c != 5 && c != 10) || v3.count == 2) {
      if (currentPath.length != 0) {
        polylines.push(currentPath);
      }
      return;
    }
    
    v3.count ++;
      
    switch(c) {
    case 0 : break;
    case 1 : currentPath.push(interp(v0,v3)); doSquare(grid,i+1,j,currentPath);
             break;
    case 2 : currentPath.push(interp(v1,v0)); doSquare(grid,i,j+1,currentPath);
             break;
    case 3 : currentPath.push(interp(v0,v3)); doSquare(grid,i,j+1,currentPath);
             break;
    case 4 : currentPath.push(interp(v1,v2)); doSquare(grid,i-1,j,currentPath);
             break;
    case 5 : if (v3.count == 1) { currentPath.push(interp(v0,v1)); doSquare(grid,i+1,j,currentPath); }
             else { currentPath.push(interp(v2,v3)); doSquare(grid,i-1,j,currentPath); }
             break;
    case 6 : currentPath.push(interp(v0,v1)); doSquare(grid,i-1,j,currentPath);
             break;
    case 7 : currentPath.push(interp(v0,v3)); doSquare(grid,i-1,j,currentPath);
             break;
    case 8 : currentPath.push(interp(v3,v2)); doSquare(grid,i,j-1,currentPath);
             break;
    case 9 : currentPath.push(interp(v3,v2)); doSquare(grid,i+1,j,currentPath);
             break;
    case 10: if (v3.count == 1) { currentPath.push(interp(v1,v2)); doSquare(grid,i,j+1,currentPath); }
             else { currentPath.push(interp(v0,v3)); doSquare(grid,i,j-1,currentPath); }
             break;
    case 11: currentPath.push(interp(v3,v2)); doSquare(grid,i,j+1,currentPath);
             break;
    case 12: currentPath.push(interp(v1,v2)); doSquare(grid,i,j-1,currentPath);
             break;
    case 13: currentPath.push(interp(v1,v2)); doSquare(grid,i+1,j,currentPath);
             break;
    case 14: currentPath.push(interp(v1,v0)); doSquare(grid,i,j-1,currentPath);
             break;
    case 15: break;
    default: break;
    }
  }

  var my = function() {

    this.setGrid = function(lowX, highX, lowY, highY, nbSquaresX, nbSquaresY) {
      if (lowX > highX || lowY > highY || nbSquaresX <= 0 || nbSquaresY <= 0) {
        console.warn("[MarchingSquares] Arguments are invalids in setGrid function.");
        return;
      }

      bounds = {
        bx: lowX,
        ex: highX,
        by: lowY,
        ey: highY
      };
      gridSize = {
        x: nbSquaresX,
        y: nbSquaresY
      };
      squareSize = {
        x: (highX - lowX) / nbSquaresX,
        y: (highY - lowY) / nbSquaresY
      };
    }

    this.setWeightFunction = function(weightLimit, weightFunction) {
      if (weightLimit <= 0 || typeof weightFunction != 'function') {
        console.warn("[MarchingSquares] Arguments are invalids in setWeightFunction function.");
        return;
      }

      weightReference = weightLimit;
      getWeight = weightFunction;
    }

    this.computeLines = function() {
      if (!(bounds && gridSize && weightReference && squareSize && getWeight)) {
        console.warn("[MarchingSquares] Can not compute lines. Call setGrid and setWeightFunction first.");
        return [];
      }

      //construct grid
      var grid = [];
      for (var i=0; i<gridSize.x+3; i++) {
        var row = [];
        for (var j=0; j<gridSize.y+3; j++) {
          var x = bounds.bx+(i-1)*squareSize.x;
          var y = bounds.by+(j-1)*squareSize.y;
          if (i == 0 || j == 0 || i == gridSize.x+2 || j == gridSize.y+2) {
            row.push({x: x,
                      y: y,
                      w: 0,
                      count: 0
                     });
          } else {
            row.push({x: x,
                      y: y,
                      w: getWeight(x,y),
                      count: 0
                     });
          }
        }
        grid.push(row);
      }
  
      //construct polylines
      polylines = [];
      
      for (var i=1; i<gridSize.x+1; i++) {
        for (var j=1; j<gridSize.y+1; j++) {
          doSquare(grid, i, j, []);
        }
      }

      return polylines;
    }

  };

  return my;

})();
