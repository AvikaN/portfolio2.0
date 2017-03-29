
//////////////////////////////////////////////////////////////////////////////
// M is an object containing methods that let you manipulate 4x4 matrices.
//////////////////////////////////////////////////////////////////////////////

var M = {};
M._stack = [];


M.translate = function(m, v) {
   M.matrixMultiply(m, M.translationMatrix(v), m);
}

M.translationMatrix = function(v) {
   return [ 1,0,0,0, 0,1,0,0, 0,0,1,0, v[0],v[1],v[2],1 ];
}

M.matrixMultiply = function(a, b, dst) {
   var n, tmp = []; 

   // PUT THE RESULT OF a x b INTO TEMPORARY MATRIX tmp.

   for (n = 0 ; n < 16 ; n++)
      tmp.push( a[n&3     ] * b[    n&12] +
                a[n&3 |  4] * b[1 | n&12] +
                a[n&3 |  8] * b[2 | n&12] +
                a[n&3 | 12] * b[3 | n&12] );

   // COPY tmp VALUES INTO DESTINATION MATRIX dst.

   for (n = 0 ; n < 16 ; n++)
      dst[n] = tmp[n];
}

M.transform = function(m, v)  {

    // IF v[3] IS UNDEFINED, SET IT TO 1 (THAT IS, ASSUME v IS A POINT).

    var x = v[0], y = v[1], z = v[2], w = v[3] === undefined ? 1 : v[3];

    // RETURN RESULT OF TRANSFORMING v BY MATRIX m.

    return [ x * m[0] + y * m[4] + z * m[ 8] + w * m[12],
             x * m[1] + y * m[5] + z * m[ 9] + w * m[13],
             x * m[2] + y * m[6] + z * m[10] + w * m[14],
             x * m[3] + y * m[7] + z * m[11] + w * m[15] ];
}

M.save = function(m) {
   var i, _m = [];
   for (i = 0 ; i < m.length ; i++)
      _m.push(m[i]);                 // MAKE A COPY OF MATRIX
   M._stack.push(_m);                // PUSH IT ONTO THE STACK
}

M.restore = function(m) {
   var i, _m = M._stack.pop();       // POP THE COPY OFF THE STACK
   for (i = 0 ; i < m.length ; i++)  // COPY ITS VALUES INTO MATRIX
      m[i] = _m[i];
}


M.identity  = function(m){     
   for(var i = 0; i < 16; i++){
     if(i === 0 || i === 5 || i === 10 || i == 15){
        m[i] = 1; 
     }
     else{
        m[i] = 0;
     }
   }
} 

M.rotateX  = function(m, radians) {         
    var rotationMatrix = [1,0,0,0,
                          0, Math.cos(radians), -Math.sin(radians), 0,
                          0, Math.sin(radians), Math.cos(radians), 0,
                          0,0,0,1]
    M.matrixMultiply(m , rotationMatrix, m);
  } 

M.rotateY = function(m, radians){
    var rotationMatrix = [Math.cos(radians),0,Math.sin(radians),0,
                          0, 1, 0, 0,
                          -Math.sin(radians), 0, Math.cos(radians), 0,
                          0,0,0,1]
    M.matrixMultiply(m , rotationMatrix, m);
}

M.rotateZ   = function(m, radians) {      
    var rotationMatrix = [Math.cos(radians), -Math.sin(radians),0,0,
                          Math.sin(radians), Math.cos(radians), 0, 0,
                          0, 0, 1, 0,
                          0,0,0,1]

    M.matrixMultiply(m , rotationMatrix, m);
} 


M.scale  = function(m, v)       {  

    console.log(v);         

    var scaleMatrix = [v,0,0,0, 
                       0,v,0,0,
                       0,0,v,0,
                       0,0,0,1
                      ];

    M.matrixMultiply(m, scaleMatrix, m);    

} // Modify m, scaling by v[0],v[1],v[2].



