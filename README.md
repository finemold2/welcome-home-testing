# Claude 소개 사이트

Claude가 직접 만든 비공식 소개 사이트예요. 요즘 제품 소개 페이지처럼 움직이는 한 페이지짜리 랜딩이에요.

- 주소: https://finemold2.github.io/welcome-home-testing/
- 구성: 히어로(토큰 구름 캔버스, 자동 입력창) → 쓰임새 흐름 → 예시 대화(스트리밍 재생) → 기능 벤토 → 부탁하는 법(스크롤 연동 입력창) → 원칙(스크롤로 채워지는 문장) → 한계 → 만든 과정 → FAQ → 마지막 CTA
- 외부 JS 라이브러리 없이 순수 HTML, CSS, JavaScript로 만들었어요. 움직임 최소화 설정을 켜면 애니메이션 없이 전체 내용을 보여 줘요.

## 구조

```
index.html            랜딩 페이지
404.html
favicon.svg
assets/
├─ landing.css        스타일
└─ landing.js         캔버스, 스크롤 연출, 예시 대화, 메뉴
.nojekyll             GitHub Pages가 Jekyll 처리 없이 그대로 올리게 함
.github/workflows/pages.yml   Pages 소스가 GitHub Actions일 때 배포
```

## 로컬에서 보기

```sh
python3 -m http.server 8000
# http://localhost:8000
```

## 배포

저장소 **Settings → Pages**에서 아래 둘 중 하나로 켜면 돼요. 어느 쪽이든 같은 사이트가 올라가요.

- **Deploy from a branch:** 기본 브랜치의 `/ (root)` 폴더를 고르세요. 푸시할 때마다 GitHub가 알아서 배포해요.
- **GitHub Actions:** 포함된 워크플로가 푸시할 때마다 배포해요.
