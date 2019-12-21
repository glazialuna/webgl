var canvas;
var gl;
var program;

//相机位移
var dy = 20.0;
var dz = -80.0;
var dx = 0.0;
//相机镜头位移
var currentAngle = [0.0, 0.0];

//场景缩放
var scaleRatio = 1.0;

//鼠标控制相关参数
var dragging = false;
var lastX = -1,
  lastY = -1;
//投影矩阵
var matProj;
//模视矩阵
//var modelMatrix_each = new Matrix4();
//modelMatrix_each.type = 'mat4';

// shader中变量的索引
var attribIndex = new AttribIndex(); // shader中attribute变量索引
var mtlIndex = new MTLIndex(); // shader中材质变量索引
var u_ModelView; // shader中uniform变量"u_ModelView"的索引
var u_Sampler; // shader中uniform变量"u_Sampler"的索引

//光源定义
var lightPosition = vec4(0, 0, 20, 1); // 光源位置(观察.o坐标系)
var ambientLight = vec3(0.3, 0.3, 0.3); // 环境光
var diffuseLight = vec3(0.5, 0.5, 0.5); // 漫反射光
var specularLight = vec3(0.8, 0.8, 0.8); // 镜面反射光

window.onload = function main() {
  canvas = document.getElementById('webgl');
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  /*设置WebGL相关属性*/
  // 清颜色缓存和深度缓存
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE); //开启面剔除，默认剔除背面
  // 设置视口，占满整个canvas
  gl.viewport(0, 0, canvas.width, canvas.height);
  // 设置投影矩阵：透视投影，根据视口宽高比指定视域体
  matProj = perspective(45.0, // 垂直方向视角
    canvas.width / canvas.height, // 视域体宽高比
    1.0, // 相机到近裁剪面距离
    1000.0); // 相机到远裁剪面距离

  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program); // 启用该shader程序对象 

  initMouseEvent();
  initEventHandlers(canvas, currentAngle);
  renderall();
}

function renderall() {
  // 进行绘制
  var tick = function() {
    if (!prepare()) 
      {
        requestAnimFrame(tick);
      } 
    else {
     	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		drawscene();
    }
  }
  tick();
}
//-----画模型于指定坐标--------------------------------------------------------------------
function loadmodel(obj, position) {

  // 获取shader attribute变量的位置
  var a_Position = gl.getAttribLocation(program, "a_Position");
  var a_Normal = gl.getAttribLocation(program, "a_Normal");
  var a_TexCoord = gl.getAttribLocation(program, "a_TexCoord");
  if (a_Position < 0 || a_Normal < 0 || a_TexCoord < 0) { // getAttribLocation获取失败则返回-1
    alert("获取attribute变量失败！");
    return;
  }

  // 初始化attribIndex
  // 注意顺序不要错，分别为顶点坐标、法向和纹理坐标的索引
  // 如果shader中没有相关变量则传-1
  attribIndex.init(a_Position, a_Normal, a_TexCoord);

  u_ModelView = gl.getUniformLocation(program, "u_ModelView");
  var u_Projection = gl.getUniformLocation(program, "u_Projection");
  var u_LightPosition = gl.getUniformLocation(program, "u_LightPosition");
  if (!u_ModelView || !u_Projection || !u_LightPosition) {
    alert("获取uniform变量失败！")
    return;
  }

  gl.uniformMatrix4fv(u_Projection, false, flatten(matProj));
  gl.uniform4fv(u_LightPosition, flatten(lightPosition));

  var u_AmbientLight = gl.getUniformLocation(program, "u_AmbientLight");
  var u_DiffuseLight = gl.getUniformLocation(program, "u_DiffuseLight");
  var u_SpecularLight = gl.getUniformLocation(program, "u_SpecularLight");
  if (!u_AmbientLight || !u_DiffuseLight || !u_SpecularLight) {
    alert("获取光相关uniform变量失败！")
    return;
  }

  // 给光源的三种光颜色传值
  gl.uniform3fv(u_AmbientLight, flatten(ambientLight));
  gl.uniform3fv(u_DiffuseLight, flatten(diffuseLight));
  gl.uniform3fv(u_SpecularLight, flatten(specularLight));

  // 获取shader中uniform材质变量索引
  var u_Kd = gl.getUniformLocation(program, "u_Kd");
  var u_Ks = gl.getUniformLocation(program, "u_Ks");
  var u_Ka = gl.getUniformLocation(program, "u_Ka");
  var u_Ke = gl.getUniformLocation(program, "u_Ke");
  var u_Ns = gl.getUniformLocation(program, "u_Ns");
  var u_d = gl.getUniformLocation(program, "u_d");
  if (!u_Kd || !u_Ks || !u_Ka || !u_Ke || !u_Ns || !u_d) {
    alert("获取uniform材质变量失败！")
    return;
  }

  // 初始化mtlIndex，参数顺序不要错！
  // 依次为漫反射系数索引、镜面反射系数索引、环境反射系数索引、
  // 发射系数索引、高光系数、不透明度
  // 如果shader中没有相关变量则传0
  mtlIndex.init(u_Kd, u_Ks, u_Ka, u_Ke, u_Ns, u_d);

  // 获取名称为"u_Sampler"的shader uniform变量位置
  u_Sampler = gl.getUniformLocation(program, "u_Sampler");
  if (!u_Sampler) {
    alert("获取uniform变量u_Sampler失败！")
    return;
  }

  render(obj, position);
};


// 绘制函数
function render(obj, position) {
  // 创建变换矩阵
  matModelView =
  mult(translate(dx, dy, dz),
    mult(rotateX(currentAngle[0]),
      mult(rotateY(currentAngle[1]),
          mult(scale(scaleRatio,scaleRatio,scaleRatio),
             translate(position[0], position[1], position[2])
        ))))
  ;

  // 传值给shader中的u_ModelView
  gl.uniformMatrix4fv(u_ModelView, false, flatten(matModelView));

  // 绘制obj模型
  obj.draw(gl, attribIndex, mtlIndex, u_Sampler);
}


var g_matrixStack = []; // Array for storing a matrix
function pushMatrix(m) { // Store the specified matrix to the array
  var m2 = new Matrix4(m);
  g_matrixStack.push(m2);
}

function popMatrix() { // Retrieve the matrix from the array
  return g_matrixStack.pop();
}

//注册鼠标事件
function initMouseEvent() {
  canvas.addEventListener('DOMMouseScroll', wheelHandler, false);
  canvas.addEventListener('mousewheel', wheelHandler, false);
}

function wheelHandler(ev){
  if(ev.wheelDelta> 0){
      scaleRatio += ev.wheelDelta/120/20;
  }
  else if(scaleRatio + ev.wheelDelta/120/20 > 0){
    scaleRatio += ev.wheelDelta/120/20;
  }
  requestAnimFrame(renderall()); // 请求重绘
}

function initEventHandlers(canvas, currentAngle) {
  var dragging = false;
  var lastX = -1,
    lastY = -1;
  canvas.onmousedown = function(ev) {
    var x = ev.clientX,
      y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      lastX = x;
      lastY = y;
      dragging = true;
    }
  };

  canvas.onmouseup = function(ev) {
    dragging = false;
  };

  canvas.onmousemove = function(ev) { // Mouse is moved
    var x = ev.clientX,
      y = ev.clientY;
    if (dragging) {
      var factor = 60 / canvas.height; // The rotation ratio
      var dx = factor * (x - lastX);
      var dy = factor * (y - lastY);
      // Limit x-axis rotation angle to -90 to 90 degrees
      currentAngle[0] = Math.max(Math.min(currentAngle[0] + dy, 90.0), -90.0);
      currentAngle[1] = currentAngle[1] + dx;
    }
    lastX = x, lastY = y;
    requestAnimFrame(renderall()); // 请求重绘
  };
}

// 按键响应
// 用于控制视角
window.onkeydown = function() {
  switch (event.keyCode) {
    case 65: // 按键A left
      dx += 1.0;
      break;
    case 87: // 按键W straightword
      dz += 1.0;
      break;
    case 68: // 按键D right
      dx += -1.0;
      break;
    case 83: // 按键S backword
      dz += -1.0;
      break;
    case 81: //按键Q up
      dy += -1.0;
      break;
    case 69: //按键E down
      dy += 1.0;
      break;
    default:
      return;
  }
  requestAnimFrame(renderall()); // 请求重绘
}