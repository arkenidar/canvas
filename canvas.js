
// sizing
canvas_element.width=canvas_element.parentElement.clientWidth
canvas_element.height=canvas_element.parentElement.clientHeight

// drawing APIs
var canvas_context=canvas_element.getContext('2d')
function draw_pixel(x,y){
    canvas_context.fillRect(x,y,1,1)
}
function draw_rectangle(xywh){
    canvas_context.fillRect(...xywh)
}
function canvas_clear(){
    canvas_context.clearRect(0,0,canvas_element.width,canvas_element.height)
}

// input from mouse
var pointer_position=[NaN,NaN]
function canvas_element_onmousemove(event){
    //console.log("on-mouse-move")
    var canvas_element=event.target
    var rectangle=canvas_element.getBoundingClientRect()
    pointer_position[0]=event.clientX-rectangle.left
    pointer_position[1]=event.clientY-rectangle.top
}
function canvas_element_onmouseleave(event){
    pointer_position[0]=pointer_position[1]=NaN
}

// draw functions

function draw_centered_square(position,color="red",size=4){
    var previous_fill_style=canvas_context.fillStyle
    canvas_context.fillStyle=color
    draw_rectangle([...point_add(position,[-size/2,-size/2]),size,size])
    canvas_context.fillStyle=previous_fill_style
}

function draw_pointer(){
    //console.log("draw-pointer")
    draw_centered_square(pointer_position) // draw pointer
}

// input from HTML GUI
var transform=transform1 // initial
var thickness=0 // initial

// display loop
function display(){
    canvas_clear()

    var rectangle=[10,10,60,100]
    var radiuses=[30,30,10,10]

    // color if pointer is inside
    var corners = compute_corners(rectangle, radiuses)

    var point = transform.inverse(...pointer_position,rectangle)

    var inside=boundary_check(rectangle, corners, point)
    var color=inside?"red":"black" // color if pointer inside
    canvas_context.fillStyle=color

    draw_rectangle_corners(rectangle,corners, transform)

    // inner rectangle for borders
    ///var thickness=parseInt(slider_thickness.value) // 2
    canvas_context.fillStyle="green"
    var rectangle_inner=[rectangle[0]+thickness,rectangle[1]+thickness,rectangle[2]-2*thickness,rectangle[3]-2*thickness]
    var radiuses_inner=[radiuses[0]-thickness,radiuses[1]-thickness,radiuses[2]-thickness,radiuses[3]-thickness]
    draw_rectangle_corners(rectangle_inner,compute_corners(rectangle_inner, radiuses_inner),transform)

    draw_pointer()
}

onload=function(){
    //alert("on-load")

    // mouse event-listeners
    canvas_element.addEventListener("mousemove",canvas_element_onmousemove)
    canvas_element.addEventListener("mouseleave",canvas_element_onmouseleave)
    
    setInterval(display,0) // loop for display loop
}

// compute

function point_add(p1,p2){
    return [p1[0]+p2[0], p1[1]+p2[1]]
}

var booleans=[
    [0,0],
    [1,0],
    [0,1],
    [1,1]
]

function rectangle_point_vertex(xywh,i){
    var [x,y,w,h] = xywh
    var boolean = booleans[i]
    return [x+boolean[0]*w,y+boolean[1]*h]
}

function rectangle_point_inner_vertex_corner_box(point_vertex, radius, i){
    var boolean_pairs = [
        [0,0],
        [-radius,0],
        [0,-radius],
        [-radius,-radius]
    ]
    var translate = boolean_pairs[i]
    var point_returned = point_add(point_vertex, translate)
    return point_returned
}
function rectangle_point_inner_vertex_center(point_vertex, radius, i){
    var boolean_pairs = [
        [radius,radius],
        [-radius,radius],
        [radius,-radius],
        [-radius,-radius]
    ]
    var translate = boolean_pairs[i]
    var point_returned = point_add(point_vertex, translate)
    return point_returned
}

function main_test1(rectangle,radiuses){
    //var rectangle=[10,10,60,100]
    ///draw_rectangle(rectangle) // test

    //var radiuses=[30,30,10,10]
    ///draw_corners(rectangle, radiuses) // test

    var corners = compute_corners(rectangle, radiuses)
    ///draw_computed_corners(corners) // test

    // test (main test)
    draw_rectangle_corners(rectangle,corners)
}

function draw_rectangle_corners(rectangle,corners,transform){
    var [x,y,w,h] = rectangle
    for(var px = x; px < x+w; px++)for(var py = y; py < y+h; py++){
        var inside = boundary_check(rectangle, corners, [px,py])
        if(inside) draw_pixel(...transform(px,py,rectangle))
    }
}

// transforms

transform1.inverse=transform1_inverse
function transform1(ix,iy,rectangle){
    return [ix+200,iy]
}

function transform1_inverse(ix,iy,rectangle){
    return [ix-200,iy]
}

transform2.inverse=transform2_inverse
function transform2(ix,iy,rectangle){

    var [x,y,w,h] = rectangle

    // pre-translate
    var center = [(x+(x+w))/2,(y+(y+h))/2]

    ix -= center[0]
    iy -= center[1]

    // rotation (transformation)
    var pi=Math.PI, cos=Math.cos, sin=Math.sin
    var angle=pi/3

    var x_rotated = cos(angle)*ix - sin(angle)*iy
    var y_rotated = sin(angle)*ix + cos(angle)*iy

    ix = x_rotated ; iy = y_rotated

    // translate back
    ix += center[0]
    iy += center[1]

    // translate further
    ix += 200

    return [ix,iy]
}

function transform2_inverse(ix,iy,rectangle){

    var [x,y,w,h] = rectangle

    // INVERSE of "translate further"
    ix -= 200

    // pre-translate
    var center = [(x+(x+w))/2,(y+(y+h))/2]

    ix -= center[0]
    iy -= center[1]

    // rotation (transformation)
    var pi=Math.PI, cos=Math.cos, sin=Math.sin
    var angle=-pi/3 // INVERSE ROTATION

    var x_rotated = cos(angle)*ix - sin(angle)*iy
    var y_rotated = sin(angle)*ix + cos(angle)*iy

    ix = x_rotated ; iy = y_rotated

    // translate back
    ix += center[0]
    iy += center[1]

    return [ix,iy]
}

// the central part of this exercise

function boundary_check(rectangle, corners, point){
    if(false==point_inside_rectangle(point, rectangle)) return false // outside
    for(var i=0; i<4; i++){
        var corner=corners[i]
        var outside
        outside = point_inside_rectangle(point, corner.box)
            && (distance(corner.center,point) > corner.radius)
        if(outside){
            return false // outside
        }
    }
    return true // inside
}

// corners

function draw_corners(rectangle, radiuses){
    for(var i=0; i<4; i++){
        var radius = radiuses[i]
        var point_vertex = rectangle_point_vertex(rectangle,i)

        canvas_context.fillStyle="orange"
        var point_corner_box = rectangle_point_inner_vertex_corner_box(point_vertex, radius, i)
        draw_rectangle([...point_corner_box,radius,radius])
        
        canvas_context.fillStyle="red"
        var point_center = rectangle_point_inner_vertex_center(point_vertex, radius, i)
        draw_rectangle([...point_add(point_center,[-2,-2]),4,4])
    }
}

function compute_corners(rectangle, radiuses){
    var corners = []
    for(var i=0; i<4; i++){
        var radius = radiuses[i]
        var point_vertex = rectangle_point_vertex(rectangle,i)
        var point_corner_box = rectangle_point_inner_vertex_corner_box(point_vertex, radius, i)
        var point_corner_center = rectangle_point_inner_vertex_center(point_vertex, radius, i)
        var corner = {center: point_corner_center, box: [...point_corner_box,radius,radius], radius }
        corners.push(corner)
    }
    return corners
}

function draw_computed_corners(corners){
    for(var i=0; i<4; i++){
        var corner = corners[i]

        canvas_context.fillStyle="orange"
        draw_rectangle(corner.box)
        
        canvas_context.fillStyle="red"
        draw_rectangle([...point_add(corner.center,[-2,-2]),4,4])
    }
}

// mathematic utilities

function point_inside_rectangle(point, rectangle){
  return (
    point[0]>=rectangle[0] &&
    point[0]<=(rectangle[0]+rectangle[2]) &&
    point[1]>=rectangle[1] &&
    point[1]<=(rectangle[1]+rectangle[3])
  )
}

function distance(p1,p2){
    return Math.sqrt( (p1[0]-p2[0])**2 + (p1[1]-p2[1])**2 )
}
