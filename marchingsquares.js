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
      points = [],
      squareSize,
      getWeight = null;

  function interp(a, b) {
    var alpha = (weightReference - b.w)  /(a.w - b.w);
    return {x: alpha*a.x + (1-alpha)*b.x,
            y: alpha*a.y + (1-alpha)*b.y };
  }

  var my = function() {

    this.setGrid = function(lowX, highX, lowY, highY, nbSquaresX, nbSquaresY) {
      //todo : check values
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
      //todo : check values
      weightReference = weightLimit;
      getWeight = weightFunction;
    }

    this.computeLines = function() {
      //construct grid
      var grid = [];
      for (var i=0; i<gridSize.x+1; i++) {
        var row = [];
        for (var j=0; j<gridSize.y+1; j++) {
          var x = bounds.bx+i*squareSize.x;
          var y = bounds.by+j*squareSize.y;
          row.push({x: x,
                    y: y,
                    w: getWeight(x,y)
                   });
        }
        grid.push(row);
      }
  
      var lines = [];
  
      //construct lines
      for (var i=0; i<gridSize.x; i++) {
        for (var j=0; j<gridSize.y; j++) {
          var c = 0;
          var v0 = grid[i+1][j];
          var v1 = grid[i+1][j+1];
          var v2 = grid[i][j+1];
          var v3 = grid[i][j];
          if (v0.w > weightReference) c += 1;
          if (v1.w > weightReference) c += 2;
          if (v2.w > weightReference) c += 4;
          if (v3.w > weightReference) c += 8;
      
          switch(c) {
          case 0 : break;
          case 1 : lines.push([interp(v0,v3), interp(v0,v1)]);
                   break;
          case 2 : lines.push([interp(v1,v0), interp(v1,v2)]);
                   break;
          case 3 : lines.push([interp(v0,v3), interp(v1,v2)]);
                   break;
          case 4 : lines.push([interp(v2,v3), interp(v2,v1)]);
                   break;
          case 5 : lines.push([interp(v0,v3), interp(v2,v3)]);
                   lines.push([interp(v0,v1), interp(v2,v1)]);
                   break;
          case 6 : lines.push([interp(v2,v3), interp(v1,v0)]);
                   break;
          case 7 : lines.push([interp(v0,v3), interp(v2,v3)]);
                   break;
          case 8 : lines.push([interp(v3,v0), interp(v3,v2)]);
                   break;
          case 9 : lines.push([interp(v3,v2), interp(v0,v1)]);
                   break;
          case 10: lines.push([interp(v3,v0), interp(v1,v0)]);
                   lines.push([interp(v3,v2), interp(v1,v2)]);
                   break;
          case 11: lines.push([interp(v3,v2), interp(v1,v2)]);
                   break;
          case 12: lines.push([interp(v3,v0), interp(v2,v1)]);
                   break;
          case 13: lines.push([interp(v0,v1), interp(v2,v1)]);
                   break;
          case 14: lines.push([interp(v3,v0), interp(v1,v0)]);
                   break;
          case 15: break;
          default: break;
          }
        }
      }

      return lines;
    }

  };

  return my;

})();
