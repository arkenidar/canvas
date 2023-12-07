// canvas
var width = canvas_element.width /* pixel */
var height = canvas_element.height /* pixel */

{ // display buffer

    // parallel typed-arrays
    var size =/* parallel RGBA */ width * height
    var typed_array_kind = Float32Array /* float array kind of typed arrays */
    var r = new typed_array_kind(size) /* typed array */
    var g = new typed_array_kind(size) /* typed array */
    var b = new typed_array_kind(size) /* typed array */
    var a = new typed_array_kind(size) /* typed array */

    function color_get(x, y) {
        var i = x + y * width; return [
            r[i], g[i], b[i], a[i] /* to array */
        ]
    }
    function color_set(x, y, color) {
        var i = x + y * width;
        [r[i], g[i], b[i], a[i]] = color /* from array */
    }
}

// drawing APIs (using "canvas_context")

var canvas_context = canvas_element.getContext('2d')
function canvas_draw_pixel(x, y, color) {
    canvas_draw_color(color)
    canvas_context.fillRect(x, y, 1, 1)
}

function canvas_draw_color(color) {
    var [r, g, b, a] = color
    canvas_context.fillStyle = "rgba(" + percent(r) + "," + percent(g) + "," + percent(b) + "," + a + ")"
    function percent(n) {
        return (n * 100) + "%"
    }
}

function canvas_clear() {
    canvas_context.clearRect(0, 0, width, height)
}

// === buffer operations ===

function canvas_draw_buffer() { // buffer to canvas
    canvas_clear()
    for (var x = 0; x < width; x++) for (var y = 0; y < height; y++) {
        canvas_draw_pixel(x, y, color_get(x, y))
    }
}

// draw into buffer (replacing) (...then "buffer to canvas")
function draw_rectangle_replace(xywh, color) {
    var [x, y, width, height] = xywh
    for (var dx = x; dx < (x + width); dx++) for (var dy = y; dy < (y + height); dy++) {
        color_set(dx, dy, color)
    }
}

// draw into buffer (blending) (...then "buffer to canvas")
function draw_rectangle_blend(xywh, color) {
    var [x, y, width, height] = xywh
    for (var dx = x; dx < (x + width); dx++) for (var dy = y; dy < (y + height); dy++) {
        var under = color_get(dx, dy)
        var alpha = color[3]
        function blend(i) { // color|under
            return alpha * color[i] + (1 - alpha) * under[i]
        }
        var result = [blend(0), blend(1), blend(2), under[3]]
        color_set(dx, dy, result)
    }
}

// function for "display loop"
function display() {

    // clear surface (before draw contents)
    draw_rectangle_replace([0, 0, width, height], [1, 1, 1, 0.8]) // semi-transparent (0.5) also

    // draw contents (main part, middle)
    // (all opaque only work, current limitation, otherwise errors)

    { // rectangle 1
        var color = [1, 1, 0, 1] // 0.5 also
        var xywh = [50, 50, 100, 80]
        draw_rectangle_blend(xywh, color)
    }

    { // rectangle 2
        var color = [0, 0, 1, 0.5] // 0.5 is semi-transparent (errors here, indeed)
        var xywh = [120, 60, 100, 20]
        draw_rectangle_blend(xywh, color)
    }

    { // rectangle 3
        var color = [0, 0, 1, 1] // 1 is opaque
        var xywh = [120, 90, 100, 20]
        draw_rectangle_blend(xywh, color)
    }

    // present contents (after draw contents)
    canvas_draw_buffer()
}

// display loop
setInterval(display, 0)
