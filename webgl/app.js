'use strict';

var HelloWebGL = {};

HelloWebGL.start = function start() {

    var canvas = document.getElementById('webgl_canvas');
    HelloWebGL.canvasSize = {
        width: canvas.width,
        height: canvas.height
    };

    (new ShaderLoader(canvas)).loadShaders('shaders/vertexShader.glsl', 'shaders/fragmentShader.glsl', function(gl, program) {

        gl.useProgram(program);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        HelloWebGL.drawScene(gl, program);
    });
};

HelloWebGL.drawScene = function drawScene(gl, program) {

    var attributes = HelloWebGL.getAttributes(gl, program);
    var uniforms = HelloWebGL.getUniforms(gl, program);
    var n = HelloWebGL.initBuffers(gl, attributes);

    console.log('attributes', attributes);
    console.log('uniforms', uniforms);

    // world space -> camera space
    var viewMatrix = HelloWebGL.getViewMatrix();
    gl.uniformMatrix4fv(uniforms.uViewMatrix, false, viewMatrix);

    // camera space -> screen
    var projMatrix = HelloWebGL.getProjectionMatrix();
    gl.uniformMatrix4fv(uniforms.uProjMatrix, false, projMatrix);

    // gouraud shading
    gl.uniform3f(uniforms.uLightPos, 100.0, 100.0, 100.0);
    gl.uniform3f(uniforms.uDiffuseAlbedo, 0.9, 0.2, 0.5);
    gl.uniform3f(uniforms.uSpecularAlbedo, 0.7, 0.7, 0.7);
    gl.uniform3f(uniforms.uAmbient, 0.1, 0.1, 0.1);
    gl.uniform1f(uniforms.uSpecularPower, 128.0);

    requestAnimationFrame(HelloWebGL.createAnimate(gl, uniforms.uModelMatrix, n));
};

HelloWebGL.createAnimate = function (gl, modelUniform, n) {

    var modelMatrix = mat4.create();
    return function animate() {
        // update
        mat4.rotateY(modelMatrix, modelMatrix, Math.PI / 180);
        gl.uniformMatrix4fv(modelUniform, false, modelMatrix);
        // render
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, n);
        requestAnimationFrame(animate);
    };
};

HelloWebGL.initBuffers = function initBuffers(gl, attributes) {

    var model = new Model().subdivide(3),
    bufferData = model.getTriangles()
        .map(HelloWebGL.encodeTriangle)
        .reduce(HelloWebGL.flattenArray);

    var data = new Float32Array(bufferData),
        bytes = data.BYTES_PER_ELEMENT,
        buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    gl.vertexAttribPointer(attributes.aPosition, 3, gl.FLOAT, false, 6 * bytes, 0);
    gl.enableVertexAttribArray(attributes.aPosition);

    gl.vertexAttribPointer(attributes.aNormal, 3, gl.FLOAT, false, 6 * bytes, 3 * bytes);
    gl.enableVertexAttribArray(attributes.aNormal);

    return model.triangleIndices.length * 3;
};

HelloWebGL.encodeTriangle = function encodeTriangle(t) {
    var normal = HelloWebGL.calculateNormal(t.v1, t.v2, t.v3),
        encoded = [];
    [t.v1, t.v2, t.v3].forEach(function(vertex) {
        Array.prototype.push.apply(encoded, vertex);
        Array.prototype.push.apply(encoded, normal);
    });
    return encoded;
};

HelloWebGL.flattenArray = function flattenArray(prevValue, currentValue) {
    return Array.prototype.concat(prevValue, currentValue);
};

HelloWebGL.calculateNormal = function calculateNormal(v1, v2, v3) {
    var va = vec3.sub(vec3.create(), v1, v2);
    var vb = vec3.sub(vec3.create(), v3, v1);
    var n = vec3.cross(vec3.create(), va, vb);
    return vec3.normalize(vec3.create(), n);
};

HelloWebGL.getAttributes = function getAttributes(gl, program) {
    var attributes = {};
    var numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (var i = 0; i < numAttributes; i++) {
        var name = gl.getActiveAttrib(program, i).name;
        attributes[name] = gl.getAttribLocation(program, name);
    }
    return attributes;
};

HelloWebGL.getUniforms = function getUniforms(gl, program) {
    var uniforms = {};
    var numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < numUniforms; i++) {
        var name = gl.getActiveUniform(program, i).name;
        uniforms[name] = gl.getUniformLocation(program, name);
    }
    return uniforms;
};

HelloWebGL.getProjectionMatrix = function getProjectionMatrix() {
    var projMatrix = mat4.create();
    mat4.perspective(projMatrix, 30 * Math.PI / 180,
        HelloWebGL.canvasSize.width / HelloWebGL.canvasSize.height, 1, 10);
    return projMatrix;
};

HelloWebGL.getViewMatrix = function getViewMatrix() {
    var eye = vec3.fromValues(0,3,3);
    var lookAt = vec3.fromValues(0,0,0);
    var up = vec3.fromValues(0,1,0);
    var viewMatrix = mat4.create();
    mat4.lookAt(viewMatrix, eye, lookAt, up);
    return viewMatrix;
};