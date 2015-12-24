'use strict';

var Ball = function Ball() {

    // Adapted from the first edition of the
    // OpenGL programming book.
    // These values ensure that distance from
    // origin is to all vertices equals to 1.
    var one = 0.525731112119133606;
    var two = 0.850650808352039932;

    this.vertexPositions = [
        vec3.fromValues(-one, 0.0, two  ),
        vec3.fromValues(one, 0.0,  two  ),
        vec3.fromValues(-one, 0.0, -two ),
        vec3.fromValues(one, 0.0, -two  ),
        vec3.fromValues(0.0, two, one   ),
        vec3.fromValues(0.0, two, -one  ),
        vec3.fromValues(0.0, -two, one  ),
        vec3.fromValues(0.0, -two, -one ),
        vec3.fromValues(two, one,  0.0  ),
        vec3.fromValues(-two, one,  0.0 ),
        vec3.fromValues(two,  -one, 0.0 ),
        vec3.fromValues(-two, -one, 0.0 )
    ];

    this.triangleIndices = [
        { v1: 0,  v2: 4,  v3: 1  },
        { v1: 0,  v2: 9,  v3: 4  },
        { v1: 9,  v2: 5,  v3: 4  },
        { v1: 4,  v2: 5,  v3: 8  },
        { v1: 4,  v2: 8,  v3: 1  },
        { v1: 8,  v2: 10, v3: 1  },
        { v1: 8,  v2: 3,  v3: 10 },
        { v1: 5,  v2: 3,  v3: 8  },
        { v1: 5,  v2: 2,  v3: 3  },
        { v1: 2,  v2: 7,  v3: 3  },
        { v1: 7,  v2: 10, v3: 3  },
        { v1: 7,  v2: 6,  v3: 10 },
        { v1: 7,  v2: 11, v3: 6  },
        { v1: 11, v2: 0,  v3: 6  },
        { v1: 0,  v2: 1,  v3: 6  },
        { v1: 6,  v2: 1,  v3: 10 },
        { v1: 9,  v2: 0,  v3: 11 },
        { v1: 9,  v2: 11, v3: 2  },
        { v1: 9,  v2: 2,  v3: 5  },
        { v1: 7,  v2: 2,  v3: 11 }
    ];

    this.translation = vec3.fromValues(0.0, 0.0, 0.0);
    this.programId = 0;
    this.color = {
        r: 0.9, g: 0.2, b: 0.5
    };
};

Ball.prototype.subdivide = function subdivide(depth) {
    var newPositions = this.vertexPositions.slice(),
        newIndices = [];

    depth = depth || 0;

    if (depth == 0) {
        return this;
    }

    for (var i = 0; i < this.triangleIndices.length; i++) {

        var idx1 = this.triangleIndices[i].v1;
        var idx2 = this.triangleIndices[i].v2;
        var idx3 = this.triangleIndices[i].v3;

        var v1 = this.vertexPositions[idx1];
        var v2 = this.vertexPositions[idx2];
        var v3 = this.vertexPositions[idx3];

        var v12 = vec3.normalize(vec3.create(), vec3.add(vec3.create(), v1, v2));
        var v23 = vec3.normalize(vec3.create(), vec3.add(vec3.create(), v2, v3));
        var v31 = vec3.normalize(vec3.create(), vec3.add(vec3.create(), v3, v1));

        var idx12 = newPositions.push(v12) - 1;
        var idx23 = newPositions.push(v23) - 1;
        var idx31 = newPositions.push(v31) - 1;

        newIndices.push({ v1: idx1,  v2: idx12, v3: idx31 });
        newIndices.push({ v1: idx2,  v2: idx23, v3: idx12 });
        newIndices.push({ v1: idx3,  v2: idx31, v3: idx23 });
        newIndices.push({ v1: idx12, v2: idx23, v3: idx31 });
    }

    var result = new Ball();
    result.vertexPositions = newPositions;
    result.triangleIndices = newIndices;
    return result.subdivide(depth - 1);
};

Ball.prototype.getTriangles = function getTriangles(index) {
    return this.triangleIndices.map(function(index) {
        return {
            v1: this.vertexPositions[index.v1],
            v2: this.vertexPositions[index.v2],
            v3: this.vertexPositions[index.v3]
        };
    }.bind(this));
};

Ball.prototype.translate = function translate(x, y, z) {
    this.translation = vec3.fromValues(x, y, z);
    return this;
};

Ball.prototype.setProgramId = function setProgramId(programId) {
    this.programId = programId;
    return this;
};

Ball.prototype.setColor = function setColor(r, g, b) {
    this.color = { r: r, g: g, b: b };
    return this;
};