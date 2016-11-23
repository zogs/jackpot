function get2dDistance(x1,y1,x2,y2){

		return Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
}

function get1dDistance(x1,x2){

		return Math.sqrt(Math.pow(x2-x1,2));
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function proxy(method, scope, args) { 
	if(args == undefined ) return function() { return method.apply(scope, arguments); } 
	else return function() { return method.apply(scope, args); } 
}

function findPointFromAngle(x, y, angle, distance) {
    var result = {};

    result.x = Math.round(Math.cos(angle * Math.PI / 180) * distance + x);
    result.y = Math.round(Math.sin(angle * Math.PI / 180) * distance + y);

    return result;
}

function calculAngle(cx, cy, ex, ey) {
  var dy = ey - cy;
  var dx = ex - cx;
  var theta = Math.atan2(dy, dx); // range (-PI, PI]
  theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
  if (theta < 0) theta = 360 + theta; // range [0, 360)
  return theta;
}

function extend(obj, src) {
      for (var key in src) {
          if (src.hasOwnProperty(key)) obj[key] = src[key];
      }
      return obj;
}

// Converts from degrees to radians.
Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};
 
// Converts from radians to degrees.
Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};

//Calcul the intersection between to line
//line 1 [p0x,p0y] [p1x,p1y]
//line 2 [p2x,p2y] [p3x,p3y]
//return {x: , y:} or null
function intersection(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {

    var d1x = p1x - p0x,
        d1y = p1y - p0y,
        d2x = p3x - p2x,
        d2y = p3y - p2y,

        // determinator
        d = d1x * d2y - d2x * d1y,
        px, py, s, t;

    // continue if intersecting/is not parallel
    if (d) {

      px = p0x - p2x;
      py = p0y - p2y;

      s = (d1x * py - d1y * px) / d;
      if (s >= 0 && s <= 1) {

        // if s was in range, calc t
        t = (d2x * py - d2y * px) / d;
        if (t >= 0 && t <= 1) {
          return {x: p0x + (t * d1x),
                  y: p0y + (t * d1y)}
        }
      }
    }
    return null
}
//Clone object
function cloneObject(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
 
    var temp = new obj.constructor(); // give temp the original obj's constructor
    for (var key in obj) {
        temp[key] = cloneObject(obj[key]);
    }
 
    return temp;
}

//Count similar element in an array
function countElements(ary, classifier) {
    return ary.reduce(function(counter, item) {
        var p = (classifier || String)(item);
        counter[p] = counter.hasOwnProperty(p) ? counter[p] + 1 : 1;
        return counter;
    }, {})
}