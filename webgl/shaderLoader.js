'use strict';

var ShaderLoader = function ShaderLoader(canvas) {
    this.canvas = canvas;
};

ShaderLoader.prototype.compile = function compile(gl, type, shaderSrc) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, shaderSrc);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader));
    }
    return shader;
};

ShaderLoader.prototype.link = function link(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program));
    }
    return program;
};

ShaderLoader.prototype.loadShaders = function loadShaders(vertexShaderUrl, fragmentShaderUrl, callback) {
    $.when($.get(vertexShaderUrl), $.get(fragmentShaderUrl)).done(function(vertexShaderRes, fragmentShaderRes) {
        var vertexShaderSrc = vertexShaderRes[0],
            fragmentShaderSrc = fragmentShaderRes[0];
        this.compileAndLinkProgram(vertexShaderSrc, fragmentShaderSrc, callback);
    }.bind(this));
};

ShaderLoader.prototype.compileAndLinkProgram = function compileAndLinkProgram(vertexShaderSrc, fragmentShaderSrc, callback) {
    var gl = this.initWebGL(),
        vertexShader = this.compile(gl, gl.VERTEX_SHADER, vertexShaderSrc),
        fragmentShader = this.compile(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc),
        program = this.link(gl, vertexShader, fragmentShader);
    callback(gl, program);
};

ShaderLoader.prototype.initWebGL = function initWebGL() {
    var gl = null;
    try {
        gl = this.canvas.getContext('webgl') || this.canvas.getContext('webgl-experimental');
    } catch (e) {
        console.log(e);
        gl = null;
    }
    if (!gl) {
        console.log('Failed to initialize WebGL');
    }
    return gl;
};