document.addEventListener("DOMContentLoaded", function() {
    // 'edit' 클래스를 가진 p 요소 안의 모든 버튼을 선택합니다.
    var buttons = document.querySelectorAll('.edit button');

    // 각 버튼에 클릭 이벤트 리스너를 추가합니다.
    buttons.forEach(function(button) {
        button.addEventListener('click', function() {
            // 모든 버튼에서 'clicked' 클래스를 제거하여 다른 버튼들의 스타일을 초기화합니다.
            buttons.forEach(function(btn) {
                btn.classList.remove('clicked');
            });

            // 클릭된 버튼에 'clicked' 클래스를 추가하여 스타일을 변경합니다.
            this.classList.add('clicked');

            // 500ms 후에 클릭된 버튼의 스타일을 원래대로 되돌립니다.
            setTimeout(() => {
                this.classList.remove('clicked');
            }, 150); // 500ms 동안 클릭된 상태 유지
        });
    });
});
