// distance.js
// styles.css 파일을 불러옵니다.
var link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'styles.css';
document.head.appendChild(link);

// 거리 계산 기능 변수들
var isLineToolActive = false;
var isPolygonToolActive = false;

// 공통 변수들
var drawingFlag = false; // 그리기 상태를 저장하는 변수

// 거리 계산 기능을 활성화하는 함수입니다.
function activateLineTool() {
    if (isLineToolActive) return; // 이미 활성화되어 있으면 종료
    isLineToolActive = true;
    isGeocoderActive = false;

    var moveLine; // 마우스 움직임에 따라 그려질 임시 선 객체입니다.
    var clickLine; // 클릭으로 그려진 선 객체입니다.
    var distanceOverlay; // 거리 정보를 표시할 커스텀 오버레이 객체입니다.
    var dots = []; // 클릭 지점과 거리를 표시할 커스텀 오버레이 객체 배열입니다.

    var clickListener;
    var mouseMoveListener;
    var rightClickListener;

    // 지도에 클릭 이벤트를 등록합니다.
    clickListener = function(mouseEvent) {
        var clickPosition = mouseEvent.latLng;

        if (!drawingFlag) {
            drawingFlag = true;
            clickLine = new kakao.maps.Polyline({
                map: map,
                path: [clickPosition],
                strokeWeight: 3,
                strokeColor: '#db4040',
                strokeOpacity: 1,
                strokeStyle: 'solid'
            });

            moveLine = new kakao.maps.Polyline({
                strokeWeight: 3,
                strokeColor: '#db4040',
                strokeOpacity: 0.5,
                strokeStyle: 'solid'
            });

            displayCircleDot(clickPosition);

        } else {
            var path = clickLine.getPath();
            path.push(clickPosition);
            clickLine.setPath(path);

            // 클릭 지점에 동그라미 표시
            displayCircleDot(clickPosition, clickLine.getLength());
        }
    };

    // 마우스 움직임 이벤트 등록
    mouseMoveListener = function(mouseEvent) {
        if (!drawingFlag) return;

        var mousePosition = mouseEvent.latLng;
        var path = clickLine.getPath();
        var movepath = [path[path.length - 1], mousePosition];
        moveLine.setPath(movepath);
        moveLine.setMap(map);

        var distance = Math.round(clickLine.getLength() + moveLine.getLength());
        var content = '<div class="dotOverlay distanceInfo">총거리 <span class="number">' + distance + '</span>m</div>';
        showDistance(content, mousePosition);
    };

    // 마우스 오른쪽 클릭 이벤트 등록
    rightClickListener = function(mouseEvent) {
        if (!drawingFlag) return;

        if (moveLine) {
            moveLine.setMap(null);
            moveLine = null;
        }

        var path = clickLine.getPath();
        if (path.length > 1) {
            var distance = Math.round(clickLine.getLength());
            var content = getTimeHTML(distance);
            showDistance(content, path[path.length - 1]);
        }

        drawingFlag = false;
        deactivateLineTool();
    };

    // 이벤트 리스너 등록
    kakao.maps.event.addListener(map, 'click', clickListener);
    kakao.maps.event.addListener(map, 'mousemove', mouseMoveListener);
    kakao.maps.event.addListener(map, 'rightclick', rightClickListener);

    function deactivateLineTool() {
        isGeocoderActive = true;
        isLineToolActive = false;

        // 이벤트 리스너 제거
        kakao.maps.event.removeListener(map, 'click', clickListener);
        kakao.maps.event.removeListener(map, 'mousemove', mouseMoveListener);
        kakao.maps.event.removeListener(map, 'rightclick', rightClickListener);

        // 상태 초기화
        drawingFlag = false;
        if (moveLine) {
            moveLine.setMap(null);
            moveLine = null;
        }
        // clickLine과 distanceOverlay는 제거하지 않습니다.
    }

    function showDistance(content, position) {
        var deleteButton = document.createElement('button');
        deleteButton.innerText = 'X';
        deleteButton.style.backgroundColor = '#ff5f5f';
        deleteButton.style.border = 'none';
        deleteButton.style.color = '#fff';
        deleteButton.style.padding = '2px 5px';
        deleteButton.style.borderRadius = '50%';
        deleteButton.style.cursor = 'pointer';
        deleteButton.onclick = function() {
            // 선과 오버레이 삭제
            if (clickLine) {
                clickLine.setMap(null);
                clickLine = null;
            }
            if (distanceOverlay) {
                distanceOverlay.setMap(null);
                distanceOverlay = null;
            }
            // 클릭된 점들도 삭제
            for (var i = 0; i < dots.length; i++) {
                if (dots[i].circle) {
                    dots[i].circle.setMap(null);
                }
                if (dots[i].distance) {
                    dots[i].distance.setMap(null);
                }
            }
            dots = [];
        };

        var distanceContent = document.createElement('div');
        distanceContent.innerHTML = content;
        distanceContent.appendChild(deleteButton);

        if (distanceOverlay) {
            distanceOverlay.setPosition(position);
            distanceOverlay.setContent(distanceContent);
        } else {
            distanceOverlay = new kakao.maps.CustomOverlay({
                map: map,
                content: distanceContent,
                position: position,
                xAnchor: 0.5,
                yAnchor: 0.5,
                zIndex: 3
            });
        }
    }

    function displayCircleDot(position, distance) {
        var circleOverlay = new kakao.maps.CustomOverlay({
            content: '<span class="dot"></span>',
            position: position,
            zIndex: 1
        });

        circleOverlay.setMap(map);

        var distanceOverlay;
        if (distance && distance > 0) {
            distanceOverlay = new kakao.maps.CustomOverlay({
                content: '<div class="dotOverlay">거리 <span class="number">' + Math.round(distance) + '</span>m</div>',
                position: position,
                yAnchor: 1,
                zIndex: 2
            });

            distanceOverlay.setMap(map);
        }

        dots.push({ circle: circleOverlay, distance: distanceOverlay });
    }

    function getTimeHTML(distance) {
        var walkkTime = Math.floor(distance / 67);
        var walkHour = '', walkMin = '';

        if (walkkTime > 60) {
            walkHour = '<span class="number">' + Math.floor(walkkTime / 60) + '</span>시간 ';
        }
        walkMin = '<span class="number">' + (walkkTime % 60) + '</span>분';

        var bycicleTime = Math.floor(distance / 227);
        var bycicleHour = '', bycicleMin = '';

        if (bycicleTime > 60) {
            bycicleHour = '<span class="number">' + Math.floor(bycicleTime / 60) + '</span>시간 ';
        }
        bycicleMin = '<span class="number">' + (bycicleTime % 60) + '</span>분';

        var content = '<ul class="dotOverlay distanceInfo">';
        content += '    <li>';
        content += '        <span class="label">총거리</span><span class="number">' + distance + '</span>m';
        content += '    </li>';
        content += '    <li>';
        content += '        <span class="label">도보</span>' + walkHour + walkMin;
        content += '    </li>';
        content += '    <li>';
        content += '        <span class="label">자전거</span>' + bycicleHour + bycicleMin;
        content += '</ul>';

        return content;
    }
}

// 다각형 면적 계산 기능을 활성화하는 함수입니다.
function activatePolygonTool() {
    if (isPolygonToolActive) return;
    isPolygonToolActive = true;
    isGeocoderActive = false;

    var drawingPolygon; // 마우스 클릭으로 그려질 다각형 객체입니다.
    var polygon; // 다각형 그리기 완료 후 표시할 객체입니다.
    var areaOverlay; // 다각형의 면적 정보를 표시할 커스텀 오버레이 객체입니다.
    var dots = []; // 클릭 지점 표시를 위한 배열

    var clickListener;
    var mouseMoveListener;
    var rightClickListener;

    clickListener = function(mouseEvent) {
        var clickPosition = mouseEvent.latLng;

        if (!drawingFlag) {
            drawingFlag = true;

            drawingPolygon = new kakao.maps.Polygon({
                map: map,
                path: [clickPosition],
                strokeWeight: 2,
                strokeColor: '#00a0e9',
                strokeOpacity: 0.5,
                strokeStyle: 'solid',
                fillColor: '#00a0e9',
                fillOpacity: 0.2
            });

            displayDot(clickPosition);

        } else {
            var drawingPath = drawingPolygon.getPath();
            drawingPath.push(clickPosition);
            drawingPolygon.setPath(drawingPath);

            displayDot(clickPosition);
        }
    };

    mouseMoveListener = function(mouseEvent) {
        if (drawingFlag && drawingPolygon) {
            var mousePosition = mouseEvent.latLng;
            var path = drawingPolygon.getPath();

            if (path.length > 1) {
                path.pop();
            }

            path.push(mousePosition);
            drawingPolygon.setPath(path);
        }
    };

    rightClickListener = function(mouseEvent) {
        if (drawingFlag && drawingPolygon) {
            var path = drawingPolygon.getPath();
            if (path.length > 2) {
                polygon = new kakao.maps.Polygon({
                    map: map,
                    path: path,
                    strokeWeight: 2,
                    strokeColor: '#00a0e9',
                    strokeOpacity: 0.5,
                    strokeStyle: 'solid',
                    fillColor: '#00a0e9',
                    fillOpacity: 0.2
                });

                var area = Math.round(polygon.getArea()).toLocaleString(); // 면적에 천 단위 쉼표 추가
                var pyongArea = (polygon.getArea() / 3.3).toFixed(1); // 평으로 환산하고 소수점 2자리까지
                pyongArea = parseFloat(pyongArea).toLocaleString(); // 천 단위 쉼표 추가
                
                var content = '<div class="info">총면적 <span class="number">' + pyongArea + '</span> 평 (' + area + ' m<sup>2</sup>)</div>';
                
                

                showArea(content, path[path.length - 1], polygon);

                // 임시로 그리던 다각형 제거
                drawingPolygon.setMap(null);
                drawingPolygon = null;
                // 클릭된 점들도 제거
                for (var i = 0; i < dots.length; i++) {
                    dots[i].setMap(null);
                }
                dots = [];
            } else {
                // 경로가 부족하면 그리던 다각형 제거
                drawingPolygon.setMap(null);
                drawingPolygon = null;
                // 클릭된 점들도 제거
                for (var i = 0; i < dots.length; i++) {
                    dots[i].setMap(null);
                }
                dots = [];
            }

            drawingFlag = false;
            deactivatePolyTool();
        }
    };

    // 이벤트 리스너 등록
    kakao.maps.event.addListener(map, 'click', clickListener);
    kakao.maps.event.addListener(map, 'mousemove', mouseMoveListener);
    kakao.maps.event.addListener(map, 'rightclick', rightClickListener);

    function deactivatePolyTool() {
        isGeocoderActive = true;
        isPolygonToolActive = false;

        kakao.maps.event.removeListener(map, 'click', clickListener);
        kakao.maps.event.removeListener(map, 'mousemove', mouseMoveListener);
        kakao.maps.event.removeListener(map, 'rightclick', rightClickListener);

        drawingFlag = false;
        if (drawingPolygon) {
            drawingPolygon.setMap(null);
            drawingPolygon = null;
        }
        // polygon과 areaOverlay는 제거하지 않습니다.
    }

    function showArea(content, position, polygon) {
        var deleteButton = document.createElement('button');
        deleteButton.innerText = 'X';
        deleteButton.style.backgroundColor = '#ff5f5f';
        deleteButton.style.border = 'none';
        deleteButton.style.color = '#fff';
        deleteButton.style.padding = '2px 5px';
        deleteButton.style.borderRadius = '50%';
        deleteButton.style.cursor = 'pointer';
        deleteButton.onclick = function() {
            polygon.setMap(null);
            if (areaOverlay) {
                areaOverlay.setMap(null);
                areaOverlay = null;
            }
        };

        var areaContent = document.createElement('div');
        areaContent.innerHTML = content;
        areaContent.appendChild(deleteButton);

        areaOverlay = new kakao.maps.CustomOverlay({
            map: map,
            content: areaContent,
            position: position,
            xAnchor: 0.5,
            yAnchor: 1.5,
            zIndex: 3
        });
    }

    function displayDot(position) {
        var dotOverlay = new kakao.maps.CustomOverlay({
            content: '<span class="dot"></span>',
            position: position,
            zIndex: 1
        });

        dotOverlay.setMap(map);
        dots.push(dotOverlay);
    }
}
