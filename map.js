// 지도 컨테이너를 가져옵니다. 이곳에 실제 지도가 표시됩니다.
console.log("map.js loaded");
var overlayOn = false, // 지도 위에 로드뷰 오버레이가 추가된 상태를 가지고 있을 변수
    container = document.getElementById('container'), // 지도와 로드뷰를 감싸고 있는 div 입니다
    mapWrapper = document.getElementById('mapWrapper'), // 지도를 감싸고 있는 div 입니다
    rvWrapper = document.getElementById('rvWrapper'), // 로드뷰를 표시할 div 입니다
    rvContainer = document.getElementById('roadview'); // 로드뷰를 표시할 div 입니다

var mapContainer = document.getElementById('map');
var manager;  // manager 변수를 전역 범위로 선언합니다.
var toolboxElement; // toolboxElement 변수도 전역 범위로 선언합니다.

console.log("mapContainer:", mapContainer);

// 지도의 중심 좌표 설정
var mapCenter = new kakao.maps.LatLng(37.566826, 126.9786567); 

var mapOption = {
    center: mapCenter, // 지도의 중심을 설정합니다.
    level: 3 // 지도의 확대 수준을 설정합니다.
};

// 설정한 옵션으로 지도를 생성합니다.
var map = new kakao.maps.Map(mapContainer, mapOption);
console.log("Map created:", map);

// 로드뷰 객체를 생성합니다
var rv = new kakao.maps.Roadview(rvContainer); 

// 좌표로부터 로드뷰 파노라마 ID를 가져올 로드뷰 클라이언트 객체를 생성합니다 
var rvClient = new kakao.maps.RoadviewClient(); 

// 로드뷰에 좌표가 바뀌었을 때 발생하는 이벤트를 등록합니다 
kakao.maps.event.addListener(rv, 'position_changed', function() {

    // 현재 로드뷰의 위치 좌표를 얻어옵니다 
    var rvPosition = rv.getPosition();

    // 지도의 중심을 현재 로드뷰의 위치로 설정합니다
    map.setCenter(rvPosition);

    // 지도 위에 로드뷰 도로 오버레이가 추가된 상태이면
    if(overlayOn) {
        // 마커의 위치를 현재 로드뷰의 위치로 설정합니다
        marker.setPosition(rvPosition);
    }
});

// 마커 이미지를 생성합니다
var markImage = new kakao.maps.MarkerImage(
    'https://t1.daumcdn.net/localimg/localimages/07/2018/pc/roadview_minimap_wk_2018.png',
    new kakao.maps.Size(26, 46),
    {
        // 스프라이트 이미지를 사용합니다.
        // 스프라이트 이미지 전체의 크기를 지정하고
        spriteSize: new kakao.maps.Size(1666, 168),
        // 사용하고 싶은 영역의 좌상단 좌표를 입력합니다.
        // background-position으로 지정하는 값이며 부호는 반대입니다.
        spriteOrigin: new kakao.maps.Point(705, 114),
        offset: new kakao.maps.Point(13, 46)
    }
);

// 드래그가 가능한 마커를 생성합니다
var marker = new kakao.maps.Marker({
    image : markImage,
    position: mapCenter,
    draggable: true
});

// 마커에 dragend 이벤트를 등록합니다
kakao.maps.event.addListener(marker, 'dragend', function(mouseEvent) {

    // 현재 마커가 놓인 자리의 좌표입니다 
    var position = marker.getPosition();

    // 마커가 놓인 위치를 기준으로 로드뷰를 설정합니다
    toggleRoadview(position);
});

function initializeDrawingManager() {
    // Geocoder 기능 비활성화
    isGeocoderActive = false;

    // 기존 DrawingManager가 존재하면 제거합니다.
    if (manager) {
        manager.dispose();
    }
    // 기존 Toolbox 요소가 존재하면 제거합니다.
    if (toolboxElement) {
        toolboxElement.parentNode.removeChild(toolboxElement);
    }

    var options = {
        map: map,
        drawingMode: [
            kakao.maps.Drawing.OverlayType.MARKER,
            kakao.maps.Drawing.OverlayType.ARROW,
            kakao.maps.Drawing.OverlayType.POLYLINE,
            kakao.maps.Drawing.OverlayType.RECTANGLE,
            kakao.maps.Drawing.OverlayType.CIRCLE,
            kakao.maps.Drawing.OverlayType.POLYGON
        ],
        markerOptions: {
            draggable: true,
            removable: true,
        },
        arrowOptions: {
            draggable: true,
            removable: true,
            strokeColor: '#800080', // 보라색
            fillColor: '#800080', // 보라색
            fillOpacity: 0.1 // 투명도 설정
        },
        polylineOptions: {
            draggable: true,
            removable: true,
            strokeColor: '#ff0000', // 파란색
        },
        rectangleOptions: {
            draggable: true,
            removable: true,
            strokeColor: '#0000ff', // 빨간색
            fillColor: '#0000ff', // 빨간색
            fillOpacity: 0.1 // 투명도 설정
        },
        circleOptions: {
            draggable: true,
            removable: true,
            strokeColor: '#0000FF', // 파란색
            fillColor: '#0000FF', // 파란색
            fillOpacity: 0.1 // 투명도 설정
        },
        polygonOptions: {
            draggable: true,
            removable: true,
            strokeColor: '#008000', // 초록색
            fillColor: '#008000', // 초록색
            fillOpacity: 0.1 // 투명도 설정
        }
    };
    

    manager = new kakao.maps.Drawing.DrawingManager(options);
    
    var toolbox = new kakao.maps.Drawing.Toolbox({drawingManager: manager});
    toolboxElement = toolbox.getElement();

    // Toolbox를 지도에 추가한 후 강제로 top으로 이동
    map.addControl(toolboxElement, kakao.maps.ControlPosition.TOP);

    // Toolbox를 맨 위로 이동시키는 작업
    setTimeout(() => {
        toolboxElement.style.top = '10px';
    }, 0);  // 추가된 후 바로 top으로 이동

    // DrawingManager의 도구가 선택될 때 Geocoder 기능 비활성화
    kakao.maps.event.addListener(manager, 'select', function() {
        isGeocoderActive = false; // drawingMode가 선택되면 geocoder 비활성화
    });

    // Drawing 작업이 끝난 후 Geocoder 기능 다시 활성화
    kakao.maps.event.addListener(manager, 'drawend', function() {
        isGeocoderActive = true; // drawingMode가 종료되면 geocoder 다시 활성화
    });
}

// 초기화 함수 실행 (최초 실행 시 한 번만 호출)
initializeDrawingManager();

// 지도 클릭 이벤트
kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
    if (!overlayOn) return;

    var position = mouseEvent.latLng;
    marker.setPosition(position);
    toggleRoadview(position);
});

// 전달받은 좌표(position)에 가까운 로드뷰의 파노라마 ID를 추출하여
// 로드뷰를 설정하는 함수입니다
function toggleRoadview(position) {
    rvClient.getNearestPanoId(position, 50, function(panoId) {
        if (panoId === null) {
            toggleMapWrapper(true, position); // 파노라마가 없으면 로드뷰를 숨김
        } else {
            toggleMapWrapper(false, position); // 파노라마가 있으면 로드뷰 표시
            rv.setPanoId(panoId, position);
        }
    });
}

// 지도를 감싸고 있는 div의 크기를 조정하는 함수입니다
function toggleMapWrapper(active, position) {
    if (active) {
        container.classList.remove('view_roadview');
        rvWrapper.style.display = 'none';  // 로드뷰 숨김
        map.relayout(); // 크기 변경 후 지도 재배치
        map.setCenter(position);
    } else {
        if (!container.classList.contains('view_roadview')) {
            container.classList.add('view_roadview');
            rvWrapper.style.display = 'block';  // 로드뷰 표시
            map.relayout();
            map.setCenter(position);
        }
    }
}

var isGeocoderActive = true;  // Geocoder 활성 상태를 나타내는 변수

// 지도 위의 로드뷰 도로 오버레이를 추가, 제거하는 함수입니다
function toggleOverlay(active) {
    if (active) {
        overlayOn = true;
        map.addOverlayMapTypeId(kakao.maps.MapTypeId.ROADVIEW);
        marker.setMap(map);
        marker.setPosition(map.getCenter());
        toggleRoadview(map.getCenter());
        isGeocoderActive = false; // 로드뷰 활성화 시 geocoder 비활성화
    } else {
        overlayOn = false;
        map.removeOverlayMapTypeId(kakao.maps.MapTypeId.ROADVIEW);
        marker.setMap(null);
        isGeocoderActive = true;  // 로드뷰 종료 시 geocoder 다시 활성화
    }
}

// 지도 위의 로드뷰 버튼을 눌렀을 때 호출되는 함수입니다
function setRoadviewRoad() {
    var control = document.getElementById('roadviewControl');
    if (!control.classList.contains('active')) {
        control.classList.add('active');
        toggleOverlay(true); // 로드뷰를 켜고
    } else {
        control.classList.remove('active');
        toggleOverlay(false); // 로드뷰를 끄고
        toggleMapWrapper(true, map.getCenter()); // 현재 지도의 중심으로 복구
        isGeocoderActive = true;  // 로드뷰 종료 시 geocoder 다시 활성화
    }
}

// 로드뷰에서 X 버튼을 눌렀을 때 로드뷰를 지도 뒤로 숨기고 로드뷰 상태도 종료하는 함수입니다
function closeRoadview() {
    toggleMapWrapper(true, map.getCenter()); // 로드뷰가 꺼지면 지도 크기 복구
    toggleOverlay(false); // 로드뷰 상태도 종료 (오버레이 제거, 마커 숨김)

    // 로드뷰 토글 버튼의 활성화 상태 해제
    var roadviewControl = document.getElementById('roadviewControl');
    roadviewControl.classList.remove('active'); // 활성화 클래스 제거

    isGeocoderActive = true;  // 로드뷰 종료 시 geocoder 다시 활성화
}

