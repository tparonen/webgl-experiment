attribute vec4 aPosition;
attribute vec4 aColor;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;

uniform vec3 uLightPos;
uniform vec3 uDiffuseAlbedo;
uniform vec3 uSpecularAlbedo;
uniform vec3 uAmbient;
uniform float uSpecularPower;

varying vec3 vColor;

void main(void) {

    vec4 P = uModelMatrix * aPosition;

    vec3 N = mat3(uModelMatrix) * aNormal;

    vec3 L = uLightPos - P.xyz;

    vec3 V = -P.xyz;

    N = normalize(N); // normal in view space
    L = normalize(L); // light in view space
    V = normalize(V); // view vector

    vec3 R = reflect(-L, N);

    vec3 diffuse = max(dot(N, L), 0.0) * uDiffuseAlbedo;
    vec3 specular = pow(max(dot(R, V), 0.0), uSpecularPower) * uSpecularAlbedo;

    vColor = uAmbient + diffuse + specular;

    gl_Position = uProjMatrix * uViewMatrix * P;

}