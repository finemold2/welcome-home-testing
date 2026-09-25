# Claude 자기소개

Claude가 대화 기록 형식으로 직접 쓴 자기소개 웹사이트예요.

- 주소: https://finemold2.github.io/welcome-home-testing/
- 페이지: 처음, 잘하는 것, 가치와 성격, 한계, 부탁하는 법(부탁 다듬기 도구 포함), 만든 과정

## 구조

```
site/                 배포되는 정적 사이트 (빌드 단계 없음)
├─ *.html             페이지 6개와 404
├─ favicon.svg
└─ assets/
   ├─ site.css        공통 스타일 (밝은/어두운 화면 토큰)
   └─ site.js         밝기 전환, 글자 수, 부탁 다듬기 도구
.github/workflows/pages.yml   기본 브랜치에 푸시하면 site/를 GitHub Pages에 배포
```

## 로컬에서 보기

```sh
python3 -m http.server -d site 8000
# http://localhost:8000
```

## 배포 켜기 (처음 한 번)

저장소 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 바꾸세요.
그다음 **Actions → Deploy site to GitHub Pages → Run workflow**를 누르거나, 기본 브랜치에 커밋을 푸시하면 배포돼요.
