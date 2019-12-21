//drawscene.js
/*Load all the model and define their locations*/
var tree = loadOBJ(".\\model\\tree\\tree.obj");
var tree2 = loadOBJ(".\\model\\tree2\\tree2.obj");
var Saber = loadOBJ(".\\model\\Saber\\Saber.obj");
var mountain = loadOBJ(".\\model\\mountain\\mountain.obj");
var building2 = loadOBJ(".\\model\\building2\\building2.obj");
var building3 = loadOBJ(".\\model\\building3\\building3.obj");
var qingke = loadOBJ(".\\model\\qingKe0\\qingKe0.obj");
var lan = loadOBJ(".\\model\\lan\\lan.obj");
var road0 = loadOBJ(".\\model\\road0\\road0.obj");
var ren = loadOBJ(".\\model\\ren\\ren.obj");
var objects = [tree,tree2,Saber,mountain,building2,building3,
			   qingke,lan,road0,ren];
/*Load all the model and define their locations*/
function drawscene(){
    //plants           x      z      y
    loadmodel(tree, [-60.0, -53.0, 130.0]);//the small one
    //plants           x      z      y
    loadmodel(tree, [-60.0, -53.0, 130.0]);//the small one
    loadmodel(tree, [-60.0, -53.0, 170.0]);//the small one
    loadmodel(tree, [50.0, -53.0, 130.0]);//the small one
    loadmodel(tree, [50.0, -53.0, 170.0]);//the small one
    //buildings
    loadmodel(mountain, [0.0, 0.0, 0.0]);
    loadmodel(building2, [0.0, -53.0, 65.0]);  //the longer one
    loadmodel(building2, [0.0, -53.0, -65.0]);  //the longer one
    loadmodel(building3, [-60.0, -56.0, 0.0]);
 
	 //房子前面的路
    for(var i=-30+1;i<=30.0+1;i+=20.0)
      for(var j=-8.0+1.2;j<=8.0+1.2;j+=16)
      loadmodel(tree2, [i, -56.0, j]);//the large green
    for(var i=-30+1;i<=30.0+1;i+=10.0)
      for(var j=-6.0+1.2;j<=6.0+1.2;j+=3){
        loadmodel(road0,[i,-54.8,j]);
      }
    loadmodel(Saber, [29.0, -55.0, 0.0]);
    
	//房子右边的篱笆和草和稻草人
    loadmodel(lan, [-60.0, -53.0, -155.0]);//栏杆
    loadmodel(lan, [-20.0, -53.0, -155.0]);
    loadmodel(lan, [-45.0, -53.0, -155.0]);
    loadmodel(lan, [20.0, -53.0, -155.0]);
    loadmodel(lan, [45.0, -53.0, -155.0]);
    loadmodel(lan, [60.0, -53.0, -155.0]);
      for(var i=0;i<28+28;i+=4)
        for(var j=0;j<70;j+=7)
         for(var z=0;z<=0.5;z+=0.2)
            for(var c=0;c<=0.5;c+=0.3)
             loadmodel(qingke,[i-75, -47.0, j-220]);
	//稻草人
    loadmodel(ren, [-20.0, -50.0, -170.0]);
    loadmodel(ren, [0.0, -50.0, -180.0]);
};
//加载所有模型后,绘制
function prepare() {     
  var len=objects.length;
  for (var i=0 ;i<len ;i++ )
  {
    if(!objects[i].isAllReady(gl))
      return 0;
  }
  return 1;
};