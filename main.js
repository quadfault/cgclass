/* main.js - Make triangles.
 * Written by quadfault
 * 1/21/23
 */

/* Vertex shader */
const VS_SRC = `
attribute vec4 a_Position;

void main() {
    gl_Position = a_Position;
}
`

/* Fragment shader */
const FS_SRC = `
void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`

/* Mutable vertex buffer. Will be converted to Float32Array before passing to WebGL. */
let vertices = []

/* BEGIN main */

const button = document.querySelector('button')
button.addEventListener('click', reset)

const canvas = document.querySelector('canvas')
canvas.addEventListener('click', addPoint)

const gl = canvas.getContext('webgl')

const program = loadShaders(gl, VS_SRC, FS_SRC)
gl.useProgram(program)

const vertexBuffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)

const a_Position = gl.getAttribLocation(program, 'a_Position')

gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0)
gl.enableVertexAttribArray(a_Position)

gl.clearColor(0.0, 0.0, 0.0, 1.0)
draw()

/* END main */

function reset(ev) {
    vertices = []

    draw()
}

function addPoint(ev) {
    const rect = ev.target.getBoundingClientRect();
    const mx = ev.clientX;    // x mouse
    const my = ev.clientY;    // y mouse
    const cx = rect.left;     // canvas position x
    const cy = rect.top;      // canvas position y
    const wx = canvas.width;  // canvas width x
    const wy = canvas.height; // canvas width y

    // transform in matrix-vector notation
    //
    // ┏ 1  0 ┓   ┏ 2/w_x       0 ┓ ┏ m_x - c_x ┓   ┏ - 1.0 ┓
    // ┗ 0 -1 ┛ ( ┗      0  2/w_y ┛ ┗ m_y - c_y ┛ + ┗ - 1.0 ┛ )
    //
    const x_premul =  2.0 / wx;
    const y_premul = -2.0 / wy;
    const screen_x = x_premul*(mx-cx) - 1.0;
    const screen_y = y_premul*(my-cy) + 1.0;

    vertices.push(screen_x, screen_y)
    if (vertices.length % 3 == 0)
        draw()
}

function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT)

    /* Do nothing if we have the wrong number of vertices. */
    if (vertices.length == 0 || vertices.length % 3 != 0)
        return

    const verticesF32 = new Float32Array(vertices)
    gl.bufferData(gl.ARRAY_BUFFER, verticesF32, gl.STATIC_DRAW)

    gl.drawArrays(gl.TRIANGLES, 0, verticesF32.length / 2)
}

/* Load the vertex and fragment shaders from the strings 'vsSrc' and 'fsSrc', respectively. */
function loadShaders(gl, vsSrc, fsSrc) {
    const vs = compileShader(gl, gl.VERTEX_SHADER, vsSrc)
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSrc)

    const program = gl.createProgram()
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert(`ERROR: ${gl.getProgramInfoLog(program)}`)
        return null
    }

    return program
}

/* Compile and return a shader of type 'type' from source code 'src'. */
function compileShader(gl, type, src) {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, src)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(`ERROR: ${gl.getShaderInfoLog(shader)}`)
        gl.deleteShader(shader)
        return null
    }

    return shader
}
