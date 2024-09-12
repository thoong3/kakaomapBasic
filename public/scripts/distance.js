// styles.css 파일을 불러옵니다.
var link = document.createElement('link'); // 새로운 링크 요소를 만듭니다.
link.rel = 'stylesheet'; // 이 링크 요소가 스타일시트임을 지정합니다.
link.href = 'styles.css'; // 불러올 CSS 파일의 경로를 설정합니다.
document.head.appendChild(link); // 생성한 링크 요소를 문서의 head에 추가하여 스타일시트를 적용합니다.

// 거리 계산 기능을 활성화하는 함수입니다.
// styles.css 파일을 불러옵니다.
var link = document.createElement('link'); // 새로운 링크 요소를 만듭니다.
link.rel = 'stylesheet'; // 이 링크 요소가 스타일시트임을 지정합니다.
link.href = 'styles.css'; // 불러올 CSS 파일의 경로를 설정합니다.
document.head.appendChild(link); // 생성한 링크 요소를 문서의 head에 추가하여 스타일시트를 적용합니다.

// 거리 계산 기능을 활성화하는 함수입니다.
function activateLineTool() {
    // Geocoder 기능 비활성화
    isGeocoderActive = false;

    // 거리 계산 기능 활성화 코드 시작
    var drawingFlag = false; // 선이 그려지고 있는 상태를 저장하는 변수입니다.
    var moveLine; // 마우스 움직임에 따라 그려질 임시 선 객체입니다.
    var clickLine; // 클릭으로 그려진 선 객체입니다.
    var distanceOverlay; // 거리 정보를 표시할 커스텀 오버레이 객체입니다.
    var dots = []; // 클릭 지점과 거리를 표시할 커스텀 오버레이 객체 배열입니다.

    var clickListener, mouseMoveListener, rightClickListener; // 이벤트 리스너를 저장할 변수들입니다.

    // 지도에 클릭 이벤트를 등록합니다.
    clickListener = kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
        if (!drawingFlag) return; // drawingFlag가 false이면 함수 종료

        var clickPosition = mouseEvent.latLng; // 클릭한 위치의 좌표를 가져옵니다.

        if (!clickLine) {
            // 클릭한 지점부터 새로운 선을 그리기 시작합니다.
            clickLine = new kakao.maps.Polyline({
                map: map, // 선을 그릴 지도를 설정합니다.
                path: [clickPosition], // 선의 시작점(첫 번째 클릭 위치)을 설정합니다.
                strokeWeight: 3, // 선의 두께를 설정합니다.
                strokeColor: '#db4040', // 선의 색상을 설정합니다.
                strokeOpacity: 1, // 선의 불투명도를 설정합니다.
                strokeStyle: 'solid' // 선의 스타일을 설정합니다(실선).
            });

            // 마우스 움직임에 따라 그려질 임시 선 객체를 생성합니다.
            moveLine = new kakao.maps.Polyline({
                strokeWeight: 3, // 임시 선의 두께를 설정합니다.
                strokeColor: '#db4040', // 임시 선의 색상을 설정합니다.
                strokeOpacity: 0.5, // 임시 선의 불투명도를 설정합니다.
                strokeStyle: 'solid' // 임시 선의 스타일을 설정합니다(실선).
            });

            // 클릭한 지점에 동그라미 표시 (거리 오버레이는 생략)
            displayCircleDot(clickPosition);

        } else {
            // 이미 선을 그리는 중에 추가 클릭이 발생한 경우
            var path = clickLine.getPath(); // 현재 그려지고 있는 선의 좌표 배열을 가져옵니다.
            path.push(clickPosition); // 새로운 클릭 위치를 좌표 배열에 추가합니다.
            clickLine.setPath(path); // 업데이트된 좌표 배열로 선을 다시 그립니다.
        }
    });

    // 마우스가 움직일 때 임시 선을 업데이트하는 이벤트를 등록합니다.
    mouseMoveListener = kakao.maps.event.addListener(map, 'mousemove', function(mouseEvent) {
        if (!drawingFlag || !clickLine) return; // drawingFlag가 false이거나 clickLine이 없으면 함수 종료

        var mousePosition = mouseEvent.latLng; // 마우스의 현재 위치를 가져옵니다.
        var path = clickLine.getPath(); // 현재 그려지고 있는 선의 좌표 배열을 가져옵니다.
        var movepath = [path[path.length - 1], mousePosition]; // 마지막 클릭 위치와 현재 마우스 위치를 연결하는 임시 선의 경로를 만듭니다.
        moveLine.setPath(movepath); // 임시 선의 경로를 설정합니다.
        moveLine.setMap(map); // 임시 선을 지도에 표시합니다.

        var distance = Math.round(clickLine.getLength() + moveLine.getLength()); // 클릭된 선과 임시 선의 총 길이를 계산합니다.
        var content = '<div class="dotOverlay distanceInfo">총거리 <span class="number">' + distance + '</span>m</div>'; // 총 거리 정보를 표시할 내용을 HTML로 작성합니다.
        showDistance(content, mousePosition); // 거리 정보를 지도에 표시합니다.
    });

    // 마우스 오른쪽 클릭으로 선 그리기를 종료하고 거리 계산 기능을 비활성화하는 이벤트를 등록합니다.
    rightClickListener = kakao.maps.event.addListener(map, 'rightclick', function(mouseEvent) {
        if (!drawingFlag) return; // drawingFlag가 false이면 함수 종료

        if (moveLine) {
            moveLine.setMap(null); // 임시 선을 지도에서 제거합니다.
            moveLine = null; // 임시 선 객체를 초기화합니다.
        }

        var path = clickLine.getPath(); // 최종 선의 좌표 배열을 가져옵니다.
        if (path.length > 1) {
            var distance = Math.round(clickLine.getLength()); // 선의 총 거리를 계산합니다.
            var content = getTimeHTML(distance); // 총 거리 정보를 표시할 내용을 HTML로 생성합니다.
            showDistance(content, path[path.length - 1]); // 최종 거리 정보를 지도에 표시합니다.
        }

        drawingFlag = false; // 선 그리기 상태를 종료합니다.

        // 거리 계산 기능 비활성화
        deactivateLineTool(); // 거리 계산 도구를 비활성화합니다.
    });

    // 거리 계산 기능을 비활성화하는 함수입니다.
    function deactivateLineTool() {
        // 거리 계산 도구 비활성화 후 Geocoder 기능 다시 활성화
        isGeocoderActive = true;

        // 이벤트 리스너 제거
        kakao.maps.event.removeListener(clickListener);
        kakao.maps.event.removeListener(mouseMoveListener);
        kakao.maps.event.removeListener(rightClickListener);

        // 상태 초기화
        drawingFlag = false;
        clickLine = null;
        moveLine = null;
        distanceOverlay = null;
    }

    // 커스텀 오버레이로 거리 정보를 지도에 표시하는 함수입니다.
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
        };

        // 오버레이 내용에 x 버튼을 추가합니다.
        var distanceContent = document.createElement('div');
        distanceContent.innerHTML = content;
        distanceContent.appendChild(deleteButton); // x 버튼 추가

        if (distanceOverlay) {
            distanceOverlay.setPosition(position); // 기존 오버레이의 위치를 업데이트합니다.
            distanceOverlay.setContent(distanceContent); // 기존 오버레이의 내용을 업데이트합니다.
        } else {
            distanceOverlay = new kakao.maps.CustomOverlay({
                map: map, // 표시할 지도 객체
                content: distanceContent, // 표시할 HTML 내용
                position: position, // 오버레이를 표시할 위치
                xAnchor: 0.8, // 오버레이의 x축 앵커를 설정합니다.
                yAnchor: 0.8, // 오버레이의 y축 앵커를 설정합니다.
                zIndex: 3 // 오버레이의 z-index(쌓임 순서)를 설정합니다.
            });
        }
    }

    // 클릭한 지점에 동그라미와 거리 정보를 표시하는 함수입니다.
    function displayCircleDot(position, distance) {
        var circleOverlay = new kakao.maps.CustomOverlay({
            content: '<span class="dot"></span>', // 동그라미를 나타내는 HTML 내용을 설정합니다.
            position: position, // 오버레이를 표시할 위치
            zIndex: 1 // 오버레이의 z-index를 설정합니다.
        });

        circleOverlay.setMap(map); // 동그라미 오버레이를 지도에 표시합니다.

        if (distance > 0) {
            var distanceOverlay = new kakao.maps.CustomOverlay({
                content: '<div class="dotOverlay">거리 <span class="number">' + distance + '</span>m</div>', // 거리 정보를 표시하는 HTML 내용을 설정합니다.
                position: position, // 오버레이를 표시할 위치
                yAnchor: 1, // y축 앵커를 설정합니다.
                zIndex: 2 // 오버레이의 z-index를 설정합니다.
            });

            distanceOverlay.setMap(map); // 거리 오버레이를 지도에 표시합니다.
        }

        dots.push({ circle: circleOverlay, distance: distanceOverlay }); // 동그라미와 거리 오버레이 객체를 dots 배열에 저장합니다.
    }

    // 총 거리와 도보/자전거 시간을 표시할 HTML 콘텐츠를 생성하는 함수입니다.
    function getTimeHTML(distance) {
        var walkkTime = distance / 67 | 0; // 도보로 이동할 시간을 계산합니다.
        var walkHour = '', walkMin = '';

        if (walkkTime > 60) {
            walkHour = '<span class="number">' + Math.floor(walkkTime / 60) + '</span>시간 '; // 시간이 60분 이상일 경우 시간으로 표시합니다.
        }
        walkMin = '<span class="number">' + walkkTime % 60 + '</span>분'; // 나머지 시간을 분으로 표시합니다.

        var bycicleTime = distance / 227 | 0; // 자전거로 이동할 시간을 계산합니다.
        var bycicleHour = '', bycicleMin = '';

        if (bycicleTime > 60) {
            bycicleHour = '<span class="number">' + Math.floor(bycicleTime / 60) + '</span>시간 '; // 시간이 60분 이상일 경우 시간으로 표시합니다.
        }
        bycicleMin = '<span class="number">' + bycicleTime % 60 + '</span>분'; // 나머지 시간을 분으로 표시합니다.

        var content = '<ul class="dotOverlay distanceInfo">';
        content += '    <li>';
        content += '        <span class="label">총거리</span><span class="number">' + distance + '</span>m'; // 총 거리를 표시합니다.
        content += '    </li>';
        content += '    <li>';
        content += '        <span class="label">도보</span>' + walkHour + walkMin; // 도보로 걸리는 시간을 표시합니다.
        content += '    </li>';
        content += '    <li>';
        content += '        <span class="label">자전거</span>' + bycicleHour + bycicleMin; // 자전거로 걸리는 시간을 표시합니다.
        content += '</ul>';

        return content; // 생성한 HTML 콘텐츠를 반환합니다.
    }

    // 거리 계산 기능을 활성화할 때 drawingFlag를 true로 설정
    drawingFlag = true; // 선 그리기 상태를 true로 변경하여 선을 그리기 시작할 수 있도록 합니다.
}



// 다각형 면적 계산 기능을 활성화하는 함수입니다. ----------------------------------------------------------------------------------------
function activatePolygonTool() {
    isGeocoderActive = false;
    var drawingFlag = false; // 다각형이 그려지고 있는 상태를 저장하는 변수입니다.
    var drawingPolygon; // 마우스 클릭으로 그려질 다각형 객체입니다.
    var polygon; // 다각형 그리기 완료 후 표시할 객체입니다.
    var areaOverlay; // 다각형의 면적 정보를 표시할 커스텀 오버레이 객체입니다.
    var polygons = []; // 그려진 다각형과 오버레이들을 저장할 배열입니다.

    var clickListener, mouseMoveListener, rightClickListener; // 이벤트 리스너를 저장할 변수들입니다.

    // 지도에 클릭 이벤트를 등록하여 다각형 그리기를 시작합니다.
    clickListener = function(mouseEvent) {
        var clickPosition = mouseEvent.latLng; // 클릭한 위치의 좌표를 가져옵니다.

        if (!drawingFlag) {
            // 다각형 그리기 시작
            drawingFlag = true; // 다각형 그리기 상태로 변경

            // 클릭한 위치를 기준으로 새로운 다각형을 그리기 시작합니다.
            drawingPolygon = new kakao.maps.Polygon({
                map: map, // 다각형을 그릴 지도를 설정합니다.
                path: [clickPosition], // 다각형의 첫 번째 점을 설정합니다.
                strokeWeight: 2, // 다각형의 선 두께를 설정합니다.
                strokeColor: '#00a0e9', // 다각형의 선 색상을 설정합니다.
                strokeOpacity: 0.5, // 다각형의 선 불투명도를 설정합니다.
                strokeStyle: 'solid', // 다각형의 선 스타일을 설정합니다(실선).
                fillColor: '#00a0e9', // 다각형 내부의 색상을 설정합니다.
                fillOpacity: 0.2 // 다각형 내부의 불투명도를 설정합니다.
            });

        } else {
            // 이미 다각형을 그리는 중에 추가 클릭이 발생한 경우
            var drawingPath = drawingPolygon.getPath(); // 현재 그려지고 있는 다각형의 경로를 가져옵니다.
            drawingPath.push(clickPosition); // 새로운 클릭 위치를 경로에 추가합니다.
            drawingPolygon.setPath(drawingPath); // 업데이트된 경로로 다각형을 다시 그립니다.
        }
    };

    // 마우스가 움직일 때 그려지고 있는 다각형의 경로를 업데이트하는 이벤트를 등록합니다.
    mouseMoveListener = function(mouseEvent) {
        if (drawingFlag && drawingPolygon) {
            var mousePosition = mouseEvent.latLng; // 마우스의 현재 위치를 가져옵니다.
            var path = drawingPolygon.getPath(); // 그려지고 있는 다각형의 경로를 가져옵니다.

            if (path.length > 1) {
                path.pop(); // 마지막 경로를 제거합니다.
            }

            path.push(mousePosition); // 마우스 위치를 경로에 추가합니다.
            drawingPolygon.setPath(path); // 다각형 경로를 업데이트합니다.
        }
    };

    // 마우스 오른쪽 클릭으로 다각형 그리기를 종료하는 이벤트를 등록합니다.
    rightClickListener = function(mouseEvent) {
        if (drawingFlag && drawingPolygon) {
            drawingPolygon.setMap(null); // 그려지고 있는 다각형을 지도에서 제거합니다.

            var path = drawingPolygon.getPath(); // 다각형의 최종 경로를 가져옵니다.

            if (path.length > 2) { // 다각형의 경로가 3개 이상이어야 실제 면적을 가지므로
                polygon = new kakao.maps.Polygon({
                    map: map, // 다각형을 표시할 지도를 설정합니다.
                    path: path, // 다각형의 최종 경로를 설정합니다.
                    strokeWeight: 2, // 다각형의 선 두께를 설정합니다.
                    strokeColor: '#00a0e9', // 다각형의 선 색상을 설정합니다.
                    strokeOpacity: 0.5, // 다각형의 선 불투명도를 설정합니다.
                    strokeStyle: 'solid', // 다각형의 선 스타일을 설정합니다(실선).
                    fillColor: '#00a0e9', // 다각형 내부의 색상을 설정합니다.
                    fillOpacity: 0.2 // 다각형 내부의 불투명도를 설정합니다.
                });

                var area = Math.round(polygon.getArea()); // 다각형의 면적을 계산합니다.
                var content = '<div class="info">총면적 <span class="number"> ' + area + '</span> m<sup>2</sup></div>'; // 면적 정보를 표시할 HTML 콘텐츠를 작성합니다.

                // x 버튼을 포함한 면적 오버레이 표시
                showArea(content, path[path.length - 1], polygon);

            } else {
                polygon = null; // 다각형의 경로가 2개 이하인 경우, 다각형을 표시하지 않습니다.
            }

            drawingFlag = false; // 다각형 그리기 상태를 종료합니다.

            // 면적 계산 기능을 비활성화
            deactivatePolyTool(); // 면적 계산 도구를 비활성화합니다.
        }
    };

    // 커스텀 오버레이로 면적 정보를 지도에 표시하고 x 버튼을 추가하여 삭제할 수 있도록 수정합니다.
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
            // 다각형과 오버레이 삭제
            polygon.setMap(null); // 다각형 삭제
            if (areaOverlay) {
                areaOverlay.setMap(null); // 오버레이 삭제
            }
        };

        // 오버레이 내용에 x 버튼을 추가합니다.
        var areaContent = document.createElement('div');
        areaContent.innerHTML = content;
        areaContent.appendChild(deleteButton); // x 버튼 추가

        areaOverlay = new kakao.maps.CustomOverlay({
            map: map, // 표시할 지도 객체
            content: areaContent, // 표시할 HTML 내용
            position: position, // 오버레이를 표시할 위치
            xAnchor: 0.5, // 오버레이의 x축 앵커를 설정합니다.
            yAnchor: 1.5, // 오버레이의 y축 앵커를 설정합니다.
            zIndex: 3 // 오버레이의 z-index(쌓임 순서)를 설정합니다.
        });
    }

    // 이벤트 리스너 등록
    kakao.maps.event.addListener(map, 'click', clickListener); // 클릭 이벤트 리스너 등록
    kakao.maps.event.addListener(map, 'mousemove', mouseMoveListener); // 마우스 움직임 이벤트 리스너 등록
    kakao.maps.event.addListener(map, 'rightclick', rightClickListener); // 오른쪽 클릭 이벤트 리스너 등록

    // 면적 계산 기능을 비활성화하는 함수입니다.
    function deactivatePolyTool(){
        isGeocoderActive = true;
        // 이벤트 리스너 제거
        kakao.maps.event.removeListener(map, 'click', clickListener); // 클릭 이벤트 리스너 제거
        kakao.maps.event.removeListener(map, 'mousemove', mouseMoveListener); // 마우스 움직임 이벤트 리스너 제거
        kakao.maps.event.removeListener(map, 'rightclick', rightClickListener); // 오른쪽 클릭 이벤트 리스너 제거

        // 상태 초기화
        drawingFlag = false; // 다각형 그리기 상태 초기화
        drawingPolygon = null; // 그려지고 있는 다각형 객체 초기화
        polygon = null; // 최종 다각형 객체 초기화
        areaOverlay = null; // 면적 정보를 표시할 오버레이 객체 초기화
    }
}



// 원의 면적 계산 기능을 활성화하는 함수입니다. -------------------------------------------------------------------------------------------------------
function activateCircleTool() {
    isGeocoderActive = false;
    var drawingFlag = false; // 원이 그려지고 있는 상태를 저장하는 변수입니다.
    var centerPosition; // 원의 중심 좌표입니다.
    var drawingCircle; // 마우스 클릭으로 그려질 원 객체입니다.
    var drawingLine; // 마우스 움직임에 따라 그려질 반지름을 표시할 선 객체입니다.
    var drawingOverlay; // 반경 정보를 표시할 커스텀 오버레이 객체입니다.
    var circles = []; // 그려진 원과 관련 객체를 저장할 배열입니다.

    var clickListener, mouseMoveListener, rightClickListener; // 이벤트 리스너를 저장할 변수들입니다.

    // 지도에 클릭 이벤트를 등록하여 원 그리기를 시작합니다.
    clickListener = function(mouseEvent) {
        if (!drawingFlag) {
            drawingFlag = true; // 원 그리기 상태로 변경
            centerPosition = mouseEvent.latLng; // 원의 중심 좌표 설정

            if (!drawingLine) {
                drawingLine = new kakao.maps.Polyline({
                    strokeWeight: 2, // 선의 두께 설정
                    strokeColor: '#00a0e9', // 선의 색상 설정
                    strokeOpacity: 0.5, // 선의 불투명도 설정
                    strokeStyle: 'solid' // 선의 스타일 설정(실선)
                });
            }

            if (!drawingCircle) {
                drawingCircle = new kakao.maps.Circle({
                    strokeWeight: 2, // 원의 테두리 두께 설정
                    strokeColor: '#00a0e9', // 원의 테두리 색상 설정
                    strokeOpacity: 0.5, // 원의 테두리 불투명도 설정
                    strokeStyle: 'solid', // 원의 테두리 스타일 설정(실선)
                    fillColor: '#00a0e9', // 원의 내부 색상 설정
                    fillOpacity: 0.2 // 원의 내부 불투명도 설정
                });
            }

            if (!drawingOverlay) {
                drawingOverlay = new kakao.maps.CustomOverlay({
                    xAnchor: 0, // 오버레이의 x축 앵커 설정
                    yAnchor: 0, // 오버레이의 y축 앵커 설정
                    zIndex: 1 // 오버레이의 z-index 설정
                });
            }
        }
    };

    // 마우스 움직임에 따라 원과 반경 정보를 동적으로 업데이트합니다.
    mouseMoveListener = function(mouseEvent) {
        if (drawingFlag) {
            var mousePosition = mouseEvent.latLng; // 마우스의 현재 위치를 가져옵니다.
            var linePath = [centerPosition, mousePosition]; // 중심점과 마우스 위치를 연결하는 선의 경로를 설정합니다.

            drawingLine.setPath(linePath); // 선의 경로를 업데이트합니다.

            var radius = drawingLine.getLength(); // 선의 길이(즉, 반경)를 계산합니다.

            if (radius > 0) {
                drawingCircle.setOptions({
                    center: centerPosition, // 원의 중심점 설정
                    radius: radius // 원의 반경 설정
                });

                var content = '<div class="info">반경 <span class="number">' + Math.round(radius) + '</span>m</div>'; // 반경 정보를 표시할 HTML 콘텐츠를 생성합니다.
                drawingOverlay.setPosition(mousePosition); // 오버레이의 위치를 마우스 위치로 설정합니다.
                drawingOverlay.setContent(content); // 오버레이에 표시할 내용을 설정합니다.

                drawingCircle.setMap(map); // 원을 지도에 표시합니다.
                drawingLine.setMap(map); // 선을 지도에 표시합니다.
                drawingOverlay.setMap(map); // 오버레이를 지도에 표시합니다.
            } else {
                drawingCircle.setMap(null); // 반경이 0이면 원을 지도에서 제거합니다.
                drawingLine.setMap(null); // 선을 지도에서 제거합니다.
                drawingOverlay.setMap(null); // 오버레이를 지도에서 제거합니다.
            }
        }
    };

    // 마우스 오른쪽 클릭으로 원 그리기를 종료하고 결과를 표시합니다.
    rightClickListener = function(mouseEvent) {
        if (drawingFlag) {
            var rClickPosition = mouseEvent.latLng; // 마우스 오른쪽 클릭 위치를 가져옵니다.

            var polyline = new kakao.maps.Polyline({
                path: [centerPosition, rClickPosition], // 중심점과 오른쪽 클릭 위치를 연결하는 선의 경로 설정
                strokeWeight: 2, // 선의 두께 설정
                strokeColor: '#00a0e9', // 선의 색상 설정
                strokeOpacity: 0.5, // 선의 불투명도 설정
                strokeStyle: 'solid' // 선의 스타일 설정(실선)
            });

            var circle = new kakao.maps.Circle({
                center: centerPosition, // 원의 중심점 설정
                radius: polyline.getLength(), // 선의 길이(반경)를 계산하여 원의 반경으로 설정
                strokeWeight: 2, // 원의 테두리 두께 설정
                strokeColor: '#00a0e9', // 원의 테두리 색상 설정
                strokeOpacity: 0.5, // 원의 테두리 불투명도 설정
                strokeStyle: 'solid', // 원의 테두리 스타일 설정(실선)
                fillColor: '#00a0e9', // 원의 내부 색상 설정
                fillOpacity: 0.2 // 원의 내부 불투명도 설정
            });

            var radius = Math.round(circle.getRadius()); // 원의 반경을 반올림하여 계산합니다.
            var content = getRadiusHTML(radius); // 반경 정보만을 표시하는 HTML 콘텐츠를 생성합니다.

            var radiusOverlay = new kakao.maps.CustomOverlay({
                content: content, // 오버레이에 표시할 HTML 콘텐츠 설정
                position: rClickPosition, // 오버레이의 위치를 오른쪽 클릭 위치로 설정
                xAnchor: 0, // 오버레이의 x축 앵커 설정
                yAnchor: 0, // 오버레이의 y축 앵커 설정
                zIndex: 1 // 오버레이의 z-index 설정
            });

            circle.setMap(map); // 원을 지도에 표시합니다.
            polyline.setMap(map); // 선을 지도에 표시합니다.
            radiusOverlay.setMap(map); // 오버레이를 지도에 표시합니다.

            circles.push({
                polyline: polyline, // 생성한 선 객체를 저장
                circle: circle, // 생성한 원 객체를 저장
                overlay: radiusOverlay // 생성한 오버레이 객체를 저장
            });

            drawingFlag = false; // 원 그리기 상태를 종료합니다.
            centerPosition = null; // 중심점 좌표를 초기화합니다.
            drawingCircle.setMap(null); // 그리던 원을 지도에서 제거합니다.
            drawingLine.setMap(null); // 그리던 선을 지도에서 제거합니다.
            drawingOverlay.setMap(null); // 그리던 오버레이를 지도에서 제거합니다.

            // 원 그리기 기능 비활성화
            deactivateCircleTool(); // 원 그리기 도구를 비활성화합니다.
        }
    };

    // 이벤트 리스너 등록
    kakao.maps.event.addListener(map, 'click', clickListener); // 클릭 이벤트 리스너 등록
    kakao.maps.event.addListener(map, 'mousemove', mouseMoveListener); // 마우스 움직임 이벤트 리스너 등록
    kakao.maps.event.addListener(map, 'rightclick', rightClickListener); // 오른쪽 클릭 이벤트 리스너 등록

    // 원 그리기 기능을 비활성화하는 함수입니다.
    function deactivateCircleTool() {
        isGeocoderActive = true;
        // 이벤트 리스너 제거
        kakao.maps.event.removeListener(map, 'click', clickListener); // 클릭 이벤트 리스너 제거
        kakao.maps.event.removeListener(map, 'mousemove', mouseMoveListener); // 마우스 움직임 이벤트 리스너 제거
        kakao.maps.event.removeListener(map, 'rightclick', rightClickListener); // 오른쪽 클릭 이벤트 리스너 제거

        // 상태 초기화
        drawingFlag = false; // 원 그리기 상태 초기화
        centerPosition = null; // 중심점 좌표 초기화
        drawingCircle = null; // 원 객체 초기화
        drawingLine = null; // 선 객체 초기화
        drawingOverlay = null; // 오버레이 객체 초기화
    }

    // 지도에 표시된 모든 원을 제거하는 함수입니다.
    function removeCircles() {
        for (var i = 0; i < circles.length; i++) {
            circles[i].circle.setMap(null); // 원을 지도에서 제거
            circles[i].polyline.setMap(null); // 선을 지도에서 제거
            circles[i].overlay.setMap(null); // 오버레이를 지도에서 제거
        }
        circles = []; // 원 객체 배열 초기화
    }

    // 마우스 우클릭으로 원 그리기가 종료되었을 때 호출하는 함수입니다.
    function getRadiusHTML(radius) {
        var content = '<ul class="info">';
        content += '    <li>';
        content += '        <span class="label">반경</span><span class="number">' + radius + '</span>m'; // 반경 정보만 표시
        content += '    </li>';
        content += '</ul>';

        return content; // HTML 콘텐츠 반환
    }
}
