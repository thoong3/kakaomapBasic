// circleDistance.js

// 원 그리기 도구 활성화 상태를 나타내는 변수
var isCircleToolActive = false;

function activateCircleTool() {
    // 원 그리기 상태를 확인하고 이미 활성화되어 있으면 종료
    if (isCircleToolActive) return;
    isCircleToolActive = true;
    isGeocoderActive = false;

    var centerPosition; // 원의 중심 위치
    var drawingCircle; // 마우스 움직임으로 그려지는 원 객체
    var radiusOverlay; // 반지름 정보를 표시할 커스텀 오버레이 객체
    var circles = []; // 그려진 원과 오버레이 객체를 저장하는 배열

    var clickListener;
    var mouseMoveListener;
    var rightClickListener;
    var drawingFlag = false; // 추가: 이 플래그를 활성화 도구 함수 안에 넣어 스코프를 지정

    // 마우스 왼쪽 클릭 이벤트 리스너 (원의 중심 설정)
    clickListener = function(mouseEvent) {
        if (!drawingFlag) {
            // 첫 번째 클릭: 원의 중심 설정
            drawingFlag = true;
            centerPosition = mouseEvent.latLng;

            drawingCircle = new kakao.maps.Circle({
                center: centerPosition,
                radius: 0, // 초기 반지름은 0
                strokeWeight: 2,
                strokeColor: '#00a0e9',
                strokeOpacity: 0.5,
                strokeStyle: 'solid',
                fillColor: '#00a0e9',
                fillOpacity: 0.2
            });

            drawingCircle.setMap(map);

            // 마우스 움직임 이벤트 리스너 등록
            mouseMoveListener = kakao.maps.event.addListener(map, 'mousemove', mouseMoveHandler);
        }
    };

    // 마우스 움직임 이벤트 핸들러 (반지름 그리기)
    function mouseMoveHandler(mouseEvent) {
        if (drawingFlag) {
            var mousePosition = mouseEvent.latLng;

            // 두 지점 간의 거리 계산 (수동으로 거리 계산)
            var distance = computeDistance(centerPosition, mousePosition);

            if (distance > 0) {
                drawingCircle.setRadius(distance);

                // 반지름 정보를 표시하는 오버레이 생성
                var content = '<div class="info">반경 <span class="number">' + Math.round(distance) + '</span>m</div>';
                if (!radiusOverlay) {
                    radiusOverlay = new kakao.maps.CustomOverlay({
                        content: content,
                        position: mousePosition,
                        xAnchor: 0,
                        yAnchor: 0,
                        zIndex: 1
                    });
                    radiusOverlay.setMap(map);
                } else {
                    radiusOverlay.setContent(content);
                    radiusOverlay.setPosition(mousePosition);
                }
            } else {
                drawingCircle.setMap(null);
                radiusOverlay.setMap(null);
            }
        }
    }

    // 마우스 오른쪽 클릭 이벤트 리스너 (원 그리기 완료)
    rightClickListener = function(mouseEvent) {
        if (drawingFlag) {
            var rClickPosition = mouseEvent.latLng;
            var distance = computeDistance(centerPosition, rClickPosition);

            if (distance > 0) {
                // 실제 그릴 원 객체 생성
                var circle = new kakao.maps.Circle({
                    center: centerPosition,
                    radius: distance,
                    strokeWeight: 2,
                    strokeColor: '#00a0e9',
                    strokeOpacity: 0.5,
                    strokeStyle: 'solid',
                    fillColor: '#00a0e9',
                    fillOpacity: 0.2
                });
                circle.setMap(map);

                // 반경 오버레이 생성 및 추가
                var finalRadiusOverlay = createRadiusOverlay(Math.round(distance), circle, rClickPosition);
                finalRadiusOverlay.setMap(map);

                circles.push({
                    circle: circle,
                    overlay: finalRadiusOverlay
                });
            }

            // 그리기 완료 후 임시 객체 제거
            if (drawingCircle) {
                drawingCircle.setMap(null);
                drawingCircle = null;
            }
            if (radiusOverlay) {
                radiusOverlay.setMap(null);
                radiusOverlay = null;
            }

            drawingFlag = false;
            centerPosition = null;

            // 마우스 움직임 이벤트 리스너 제거
            kakao.maps.event.removeListener(map, 'mousemove', mouseMoveListener);

            // 원 그리기 도구 비활성화
            deactivateCircleTool(); // 수정: 원을 그린 후 비활성화
        }
    };

    // 원 그리기 도구 비활성화 함수
    function deactivateCircleTool() {
        isGeocoderActive = true;
        isCircleToolActive = false;

        // 이벤트 리스너 제거
        kakao.maps.event.removeListener(map, 'click', clickListener);
        kakao.maps.event.removeListener(map, 'rightclick', rightClickListener);
        if (mouseMoveListener) {
            kakao.maps.event.removeListener(map, 'mousemove', mouseMoveListener);
        }

        drawingFlag = false; // 추가: 그리기 플래그 초기화
        centerPosition = null;
        if (drawingCircle) {
            drawingCircle.setMap(null);
            drawingCircle = null;
        }
        if (radiusOverlay) {
            radiusOverlay.setMap(null);
            radiusOverlay = null;
        }
    }

    // 이벤트 리스너 등록
    kakao.maps.event.addListener(map, 'click', clickListener);
    kakao.maps.event.addListener(map, 'rightclick', rightClickListener);

    // 두 지점 간의 거리를 계산하는 함수
    function computeDistance(pos1, pos2) {
        var R = 6371e3; // 지구의 반지름 (미터 단위)
        var radLat1 = pos1.getLat() * (Math.PI / 180);
        var radLat2 = pos2.getLat() * (Math.PI / 180);
        var deltaLat = (pos2.getLat() - pos1.getLat()) * (Math.PI / 180);
        var deltaLng = (pos2.getLng() - pos1.getLng()) * (Math.PI / 180);

        var a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                Math.cos(radLat1) * Math.cos(radLat2) *
                Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // 미터 단위의 거리 반환
    }

    // 반지름 정보를 표시하는 오버레이를 생성하는 함수
    function createRadiusOverlay(radius, circle, position) {
        var deleteButton = document.createElement('button');
        deleteButton.innerText = 'X';
        deleteButton.style.backgroundColor = '#ff5f5f';
        deleteButton.style.border = 'none';
        deleteButton.style.color = '#fff';
        deleteButton.style.padding = '2px 5px';
        deleteButton.style.borderRadius = '50%';
        deleteButton.style.cursor = 'pointer';
        deleteButton.onclick = function() {
            // 원과 오버레이 삭제
            circle.setMap(null);
            overlay.setMap(null);
        };

        var content = document.createElement('div');
        content.className = 'info';
        content.innerHTML = '<span class="label">반경</span><span class="number">' + radius + '</span>m';
        content.appendChild(deleteButton);

        var overlay = new kakao.maps.CustomOverlay({
            content: content,
            position: position,
            xAnchor: 0,
            yAnchor: 0,
            zIndex: 1
        });

        return overlay;
    }
}
