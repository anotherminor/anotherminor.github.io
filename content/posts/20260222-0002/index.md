---
title: 소셜미디어 임베드 테스트
date: 2026-02-22T13:00:00+09:00
draft: true
slug: social-embed-test
categories:
  - tech
tags:
  - embed
  - social
  - ui-test
summary: shortcode 기반으로 YouTube, Shorts, TikTok, Instagram, X(Twitter), Threads, Facebook, Vimeo 임베드를 점검하는 테스트 포스트.
---

이 글은 소셜 임베드를 자주 넣을 때 본문 작성 부담을 줄이기 위해, 플랫폼별 Hugo shortcode가 실제로 잘 동작하는지 확인하는 테스트 포스트다. 예전처럼 긴 임베드 HTML을 붙이지 않고 한 줄 shortcode만으로 렌더링되도록 바꿨고, 플랫폼마다 현재 구현 방식이 달라진 부분도 이 글에서 함께 확인하려고 한다.

일반 가로형 영상과 세로형 영상이 같은 본문 폭 안에서 어떻게 보이는지도 함께 확인하려고 순서를 섞어 넣었다. 특히 `YouTube Shorts`와 `TikTok`은 shortcode 내부에서 세로 비율 래퍼를 사용하므로 별도 스타일을 본문에 직접 쓰지 않아도 된다. 반대로 X, Threads, Facebook처럼 서비스별 정책이나 렌더 방식 차이가 큰 쪽은 현재 어느 정도까지 자동 보정이 들어가 있는지도 같이 본다.

<!--more-->

## YouTube

가로형 YouTube 임베드는 가장 기본적인 케이스라서 기준점처럼 보기 좋다. 본문에서 폭이 줄어들 때 비율이 안정적으로 유지되는지만 보면 된다.

{{< youtube "https://www.youtube.com/watch?v=dQw4w9WgXcQ" >}}

## YouTube Shorts

세로형 YouTube는 `youtube-shorts` shortcode로 호출하면 자동으로 포트레이트 비율이 적용된다. 실제 Shorts URL을 쓰거나 영상 ID를 그대로 넣어도 레이아웃 테스트는 가능하다.

{{< youtube-shorts "https://www.youtube.com/shorts/dQw4w9WgXcQ" >}}

## TikTok

TikTok은 현재 플랫폼 스크립트에 기대지 않고, URL에서 `username`과 `video_id`를 추출해 바로 `embed/v2` iframe을 만드는 방식으로 정리돼 있다. 그래서 작성할 때는 예전처럼 긴 embed 코드를 붙이지 않고 원본 URL 한 줄만 넣으면 된다.

{{< tiktok "https://www.tiktok.com/@scout2015/video/6718335390845095173" >}}

## Instagram

Instagram 포스트나 릴스도 URL 한 줄만 넣으면 shortcode가 `captioned` iframe 주소를 만들어 바로 붙인다. 캐러셀 URL에 `index=`가 섞여 있으면 내부에서 `img_index=` 형태로 정리하고, 실제 높이는 iframe이 보내는 `MEASURE` 신호를 받아 본문 폭에 맞춰 다시 잡는다.

{{< instagram "https://www.instagram.com/p/CWA2UbCs6x_/" >}}

## X (Twitter)

X 임베드는 트윗 URL만 넘기면 shortcode가 직접 `platform.twitter.com/embed/Tweet.html` iframe을 만든다. 테마는 시스템 색상 모드에 맞춰 쿼리 파라미터로 넘기고, 높이도 트위터 쪽 resize 메시지를 받아 본문 안에서 다시 맞추는 쪽으로 정리돼 있다.

{{< twitter "https://twitter.com/jack/status/20" >}}

## Threads

Threads는 원본 URL만 넘기면 shortcode가 `blockquote.text-post-media`와 공식 `embed.js`를 붙이는 방식이다. 렌더는 Threads 스크립트가 맡고, 높이는 스크립트가 만든 iframe이 보내는 메시지를 받아 본문 흐름 안에서 다시 보정한다.

{{< threads "https://www.threads.net/@zuck/post/DOMD1yDj9M4" >}}

## Facebook

Facebook은 지금 기준으로 두 경로를 함께 시험하는 중이다. 우선 `fb-post + SDK` 쪽을 먼저 시도하고, 그 렌더가 기대대로 안 붙을 때를 대비해 같은 블록 안에 직접 iframe fallback도 준비해 두었다. 이 섹션은 그래서 단순히 보이느냐뿐 아니라, 실제로 어느 경로가 선택되는지도 같이 보는 용도다.

{{< facebook "https://www.facebook.com/PSPPortugal/posts/pfbid029WFvS9Wmm79gsmDfKxy7m3714A4bAHFo9mfrYn4mrDuMjePqEvME6omuSxqnpQZDl" >}}

## Apple Music

Apple Music은 일반 공유 링크를 그대로 변환하지 않고, Apple Music 웹의 `Copy Embed Code`에서 얻은 공식 embed `src`를 `applemusic` shortcode에 넣는 방식으로 맞췄다. 높이는 필요하면 별도 인자로 조정할 수 있지만, 기본값만으로도 가로 폭 안에서 어떻게 보이는지 확인하기에는 충분하다.

{{< applemusic "https://embed.music.apple.com/kr/playlist/%EC%95%85%EB%AE%A4-%EB%8C%80%ED%91%9C%EA%B3%A1/pl.e12faae7841049e5a5443c34f6178d41" >}}

## Vimeo

Vimeo도 YouTube와 마찬가지로 가로형 `iframe` 임베드라서 영상 URL 한 줄만 넘기면 충분하다. 이 블록까지 정상적으로 보이면 주요 임베드 플랫폼 테스트는 한 번에 끝난다.

{{< vimeo "https://vimeo.com/76979871" >}}

이제 실제 작성에서는 본문 맥락만 쓰고 필요한 플랫폼 shortcode를 끼워 넣으면 된다. 다만 플랫폼별로 내부 구현은 조금씩 다르다. 영상 서비스 쪽은 거의 전부 직접 iframe으로 안정화했고, 소셜 서비스 쪽은 공식 위젯 스크립트와 fallback 경로를 병행하는 경우가 있어 이 테스트 글을 기준점처럼 두고 계속 확인하는 편이 안전하다.
