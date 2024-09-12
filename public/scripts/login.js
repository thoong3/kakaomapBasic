document.addEventListener('DOMContentLoaded', function() {
  const loginButton = document.getElementById('loginButton');
  const logoutButton = document.getElementById('logoutButton');
  const profileImage = document.getElementById('profileImage');

  // 현재 페이지가 callback.html이면 로그인 처리를 위한 handleCallback만 실행
  if (window.location.pathname === '/callback.html') {
      handleCallback();
      return;  // 나머지 코드 실행하지 않도록 return
  }

  // 페이지에 loginButton이 있을 때만 이벤트를 등록
  if (loginButton) {
      loginButton.addEventListener('click', () => {
          const clientId = 'e8b18d033882132011039848cc8b0f58';  // 제공된 REST API 키
          const redirectUri = 'http://127.0.0.1:3000/callback.html';  // 설정한 리다이렉트 URI

          const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;

          window.location.href = kakaoAuthUrl;
      });
  }

  // 페이지에 logoutButton이 있을 때만 이벤트 등록
  if (logoutButton) {
      logoutButton.addEventListener('click', () => {
          // 로그아웃 처리 (로컬 스토리지에서 토큰 삭제)
          localStorage.removeItem('accessToken');
          // 로그인 상태 초기화 (UI 변경)
          loginButton.style.display = 'block';
          logoutButton.style.display = 'none';
          profileImage.style.display = 'none';  // 프로필 이미지 숨김
          console.log('로그아웃');
      });
  }

  // 카카오 토큰 요청 함수
  async function requestKakaoToken(code) {
      const tokenUrl = 'https://kauth.kakao.com/oauth/token';
      const clientId = 'e8b18d033882132011039848cc8b0f58';  // 제공된 REST API 키
      const redirectUri = 'http://127.0.0.1:3000/callback.html';

      const data = {
          grant_type: 'authorization_code',
          client_id: clientId,
          redirect_uri: redirectUri,
          code: code
      };

      const params = new URLSearchParams(data).toString();

      const response = await fetch(tokenUrl, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params
      });

      if (response.ok) {
          const tokenData = await response.json();
          console.log('토큰 데이터:', tokenData);  // 토큰 데이터 로그 확인
          return tokenData;
      } else {
          const errorText = await response.text();
          console.error('토큰 발급 실패:', errorText);  // 실패한 경우 오류 메시지 확인
          throw new Error('토큰 발급 실패');
      }
  }

  // 사용자 정보 요청 함수
  async function requestKakaoUserInfo(token) {
      const userInfoUrl = 'https://kapi.kakao.com/v2/user/me';

      const response = await fetch(userInfoUrl, {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${token}`
          }
      });

      if (response.ok) {
          const userInfo = await response.json();
          console.log('사용자 정보:', userInfo);  // 사용자 정보 확인
          // 프로필 이미지 설정 및 표시
          if (userInfo.properties && userInfo.properties.profile_image) {
              profileImage.src = userInfo.properties.profile_image;
              profileImage.style.display = 'inline-block';  // 프로필 이미지 표시
          }
          alert(`환영합니다, ${userInfo.properties.nickname}님!`);
      } else {
          const errorText = await response.text();
          console.error('사용자 정보 조회 실패:', errorText);  // 실패한 경우 오류 메시지 확인
          throw new Error('사용자 정보 조회 실패');
      }
  }

  // Callback 페이지에서 호출되는 코드
  function handleCallback() {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
          requestKakaoToken(code)
              .then(tokenData => {
                  // 토큰 데이터를 로컬 스토리지에 저장
                  localStorage.setItem('accessToken', tokenData.access_token);
                  
                  // 토큰 데이터가 저장된 후 index.html로 리다이렉트
                  window.location.href = 'index.html';
              })
              .catch(err => console.error(err));
      }
  }

  // 로그인 상태 확인 및 UI 처리
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
      // 로그인된 상태 (로그아웃 버튼 표시)
      loginButton.style.display = 'none';
      logoutButton.style.display = 'block';

      // 사용자 정보 요청
      requestKakaoUserInfo(accessToken);
  } else {
      // 로그인되지 않은 상태 (로그인 버튼 표시)
      loginButton.style.display = 'block';
      logoutButton.style.display = 'none';
      profileImage.style.display = 'none';  // 프로필 이미지 숨김
  }
});
