
var terrainModels = Cesium.createDefaultTerrainProviderViewModels();

// Construct the viewer with just what we need for this base application
var viewer = new Cesium.Viewer('cesiumContainer', {
    timeline: false,  //时间线
    animation: false,//创建“动画”窗口小部件
    vrButton: true, //vr模式按钮
    sceneModePicker: false, ////视觉选择器
    infoBox: true, //提示框
    // scene3DOnly:true,
    // terrainProviderViewModels: terrainModels,
    // selectedTerrainProviderViewModel: terrainModels[1]  // Select STK high-res terrain
});

// No depth testing against the terrain to avoid z-fighting
viewer.scene.globe.depthTestAgainstTerrain = false;

// Bounding sphere
//var boundingSphere = new Cesium.BoundingSphere(Cesium.Cartesian3.fromDegrees(111.5652101, 38.70350851, 1297.500143), 143.6271004);
//具有中心和半径的边界球体
var boundingSphere = new Cesium.BoundingSphere(Cesium.Cartesian3.fromDegrees(111.5652101, 38.70350851, 100.500143), 143.6271004);

// Override behavior of home button
//主页按钮监听事件
viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function(commandInfo) {
    // Fly to custom position
    viewer.camera.flyToBoundingSphere(boundingSphere); //将摄像机飞到当前视图包含所提供的边界球的位置

    // Tell the home button not to do anything
    commandInfo.cancel = true;
});

// Set custom initial position
viewer.camera.flyToBoundingSphere(boundingSphere, { duration: 0 });

// Add tileset. Do not forget to reduce the default screen space error to 2
// var origin = Cesium.Cartesian3.fromDegrees(-95.0, 40.0, 200000.0);
// var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
var x = 360.0;
var y = -920.0;
var z = -820.0;
// var x = 0;
// var y = 0;
// var z = 0;
//从数组中的16个连续元素创建4x4矩阵
var m = Cesium.Matrix4.fromArray([
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    x, y, z, 1.0
]);

var tileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
    url: 'Scene/testm3DTiles.json',
    maximumScreenSpaceError: 2,  //提高细节化级别的最大屏幕空间错误
    maximumNumberOfLoadedTiles: 1000,  //最大加载瓦片个数
    modelMatrix: m  //方法一，动态修改modelMatrix
}));

var boundingSphere = null; // = new Cesium.BoundingSphere(Cesium.Cartesian3.fromDegrees(111.5652101, 38.70350851, 100.500143), 143.6271004);

function zoomToTileset() {
    boundingSphere = tileset.boundingSphere;
    //设置摄像机，使当前视图包含提供的边界球
    viewer.camera.viewBoundingSphere(boundingSphere, new Cesium.HeadingPitchRange(0, -2.0, 0));
    //使用变换矩阵设置摄像机的位置和方向
    viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);

    //changeHeight(10);
}

tileset.readyPromise.then(zoomToTileset);
// scene.morphComplete.addEventListener(zoomToTileset);
var step = 10;

function changeStep(stepin) {
    step = stepin;
}

function change(type) {
    switch (type) {
        case 0:
            x += step;
            break;
        case 1:
            x -= step;
            break;
        case 2:
            y += step;
            break;
        case 3:
            y -= step;
            break;
        case 4:
            z += step;
            break;
        case 5:
            z -= step;
            break;
    }

    //创建平移矩阵方法一
    // m = Cesium.Matrix4.fromArray([
    //     1.0, 0.0, 0.0, 0.0,
    //     0.0, 1.0, 0.0, 0.0,
    //     0.0, 0.0, 1.0, 0.0,
    //     x, y, z, 1.0
    // ]);

    //创建平移矩阵方法二
    var translation=Cesium.Cartesian3.fromArray([x, y, z]);
    m= Cesium.Matrix4.fromTranslation(translation);

    document.getElementById("result").innerText = "x:" + x + " y:" + y + " z:" + z;

    tileset.modelMatrix = m;
}

function changevisible() {
    tileset.show = !tileset.show;
}

//方法二，直接调用函数，调整高度,height表示物体离地面的高度
function changeHeight(height) {
    height = Number(height);
    if (isNaN(height)) {
        return;
    }
    
    var cartographic = Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center);
    var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height);
    var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude,height);
    var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
    tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
}
//监听鼠标左键点击事件
viewer.screenSpaceEventHandler.setInputAction(function(movement){
    //获取具有primitives属性的对象
    var feature = viewer.scene.pick(movement.position);
    if (feature && feature.content.url.indexOf('Tile_p000_p000_L17_00') >= 0) {
        alert(feature.content.url);
        document.getElementsByClassName('c')[0].style.display = 'block';
        document.getElementById('a').innerText = feature.content.url;
    }else {
        document.getElementsByClassName('c')[0].style.display = 'none';

    }
    console.log(feature)
},Cesium.ScreenSpaceEventType.LEFT_CLICK);
function closeDialog() {
    document.getElementsByClassName('c')[0].style.display = 'none';

}

var overlay = document.createElement('div')
viewer.container.appendChild(overlay)
overlay.style.width = '200px'
overlay.style.height = '200px'
overlay.style.wordBreak='break-all'
overlay.style.display = 'none'
overlay.style.position = 'absolute'
overlay.style.top = '0'
overlay.style.left = '0'
overlay.style.color = '#fff'
overlay.style['pointer-events'] = 'nome'
overlay.style.backgroundColor = 'black'

if(Cesium.PostProcessStageLibrary.isSilhouetteSupported(viewer.scene)){
    var blue = Cesium.PostProcessStageLibrary.createEdgeDetectionStage();
    blue.uniforms.color = Cesium.Color.RED;
    blue.uniforms.length = 2.12;
    blue.selected = [];
}

viewer.scene.postProcessStages.add(Cesium.PostProcessStageLibrary.createSilhouetteStage([blue]))
viewer.screenSpaceEventHandler.setInputAction(function(movement){
    //获取具有primitives属性的对象
    var feature = viewer.scene.pick(movement.endPosition);
    blue.selected = [];
if(Cesium.defined(feature)){
    overlay.style.display = 'block'
    overlay.style.top = movement.endPosition.y + 50 + 'px'
    overlay.style.left = movement.endPosition.x + 50 + 'px'
    var name = feature.content.url;
    overlay.textContent = name;
    blue.selected = [feature]
}else {
    overlay.style.display = 'none'

}
},Cesium.ScreenSpaceEventType.MOUSE_MOVE);
