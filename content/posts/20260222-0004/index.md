---
title: "소셜미디어 임베드 테스트"
date: 2026-02-22T13:00:00+09:00
draft: false
slug: "social-embed-test"
categories: ["tech"]
tags: ["embed", "social", "ui-test"]
summary: "shortcode 기반으로 YouTube, Shorts, TikTok, Instagram, X(Twitter), Threads, Facebook, Vimeo 임베드를 점검하는 테스트 포스트."
---

이 글은 소셜 임베드를 자주 넣을 때 본문 작성 부담을 줄이기 위해, 플랫폼별 Hugo shortcode가 실제로 잘 동작하는지 확인하는 테스트 포스트다. 예전처럼 긴 임베드 HTML을 붙이지 않고 한 줄 shortcode만으로 렌더링되도록 바꿨고, 스크립트가 필요한 플랫폼은 각 shortcode가 알아서 필요한 자바스크립트를 한 번만 불러오게 했다.

일반 가로형 영상과 세로형 영상이 같은 본문 폭 안에서 어떻게 보이는지도 함께 확인하려고 순서를 섞어 넣었다. 특히 `YouTube Shorts`와 `TikTok`은 shortcode 내부에서 세로 비율 래퍼를 사용하므로 별도 스타일을 본문에 직접 쓰지 않아도 된다.

## YouTube

가로형 YouTube 임베드는 가장 기본적인 케이스라서 기준점처럼 보기 좋다. 본문에서 폭이 줄어들 때 비율이 안정적으로 유지되는지만 보면 된다.

{{< youtube "https://www.youtube.com/watch?v=dQw4w9WgXcQ" >}}

## YouTube Shorts

세로형 YouTube는 `youtube-shorts` shortcode로 호출하면 자동으로 포트레이트 비율이 적용된다. 실제 Shorts URL을 쓰거나 영상 ID를 그대로 넣어도 레이아웃 테스트는 가능하다.

{{< youtube-shorts "https://www.youtube.com/shorts/dQw4w9WgXcQ" >}}

## TikTok

TikTok은 플랫폼 스크립트가 blockquote를 카드로 바꾸는 구조라서 작성할 때 원본 URL만 넣는 방식이 가장 편하다. shortcode가 `username`과 `video_id`를 URL에서 추출해 임베드 마크업을 생성한다.

{{< tiktok "https://www.tiktok.com/@scout2015/video/6718335390845095173" >}}

## Instagram

Instagram 포스트나 릴스도 URL 한 줄만 넣으면 본문에서 임베드 카드로 바뀌게 만들었다. 링크 폴백도 남아서 스크립트 로딩 실패 시에도 클릭은 가능하다.

{{< instagram "https://www.instagram.com/p/CWA2UbCs6x_/" >}}

## X (Twitter)

X 임베드는 트윗 URL만 넘기면 된다. 여러 트윗을 같은 글에 넣어도 스크립트는 첫 호출에서만 붙도록 처리했다.

{{< twitter "https://twitter.com/jack/status/20" >}}

## Threads

Threads도 동일한 흐름으로 URL 기반 shortcode를 사용한다. 본문 작성할 때는 URL 외에 별도 `blockquote` 속성을 기억할 필요가 없도록 정리했다.

{{< threads "https://www.threads.net/@zuck/post/DOMD1yDj9M4" >}}

## Facebook

Facebook은 플러그인 iframe 방식을 shortcode로 감쌌다. 요청하신 PSPPortugal 게시물 URL을 기준으로 테스트하도록 바꿔두었다.

{{< facebook "https://www.facebook.com/PSPPortugal/posts/pfbid029WFvS9Wmm79gsmDfKxy7m3714A4bAHFo9mfrYn4mrDuMjePqEvME6omuSxqnpQZDl" >}}

## Vimeo

Vimeo도 YouTube와 마찬가지로 가로형 `iframe` 임베드라서 영상 URL 한 줄만 넘기면 충분하다. 이 블록까지 정상적으로 보이면 주요 임베드 플랫폼 테스트는 한 번에 끝난다.

{{< vimeo "https://vimeo.com/76979871" >}}

이제 실제 작성에서는 본문 맥락만 쓰고 필요한 플랫폼 shortcode를 끼워 넣으면 된다. 플랫폼별 공식 임베드 HTML을 매번 복사해 붙이는 작업이 사라져서 작성 속도와 수정 편의성이 많이 좋아질 것이다.
