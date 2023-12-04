{
// combined typed-array
var width=200 /* pixel */
var height=100 /* pixel */
var size=/* RGBA */4*width*height
var typed_array=new Float32Array(size) /* float array */
}

{
// parallel typed-arrays
var width=200 /* pixel */
var height=100 /* pixel */
var size=/* parallel RGBA */1*width*height
var r=new Float32Array(size) /* float array */
var g=new Float32Array(size) /* float array */
var b=new Float32Array(size) /* float array */
var a=new Float32Array(size) /* float array */
function color_get(x,y){ var i=x+y*width; return [
        r[i],g[i],b[i],a[i] /* to array */
    ] }
function color_set(x,y,color){ var i=x+y*width;
        [r[i],g[i],b[i],a[i]]=color /* from array */
    }
}

color_set(1,2,[1,0,1,1])
alert("color_get(1,2) is "+color_get(1,2))


