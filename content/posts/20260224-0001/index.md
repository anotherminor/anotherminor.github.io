---
title: "이미지 엑스박스와 임베드 로드 실패 폴백 테스트"
date: 2026-02-24T14:05:00+09:00
draft: false
slug: "image-xbox-social-embed-fallback-test"
categories: ["tech"]
tags: ["ui-test", "image", "embed", "fallback"]
summary: "이미지 엑스박스와 지버리시 URL 기반 소셜 임베드 로드 실패/로딩 중 폴백 상태를 점검하는 테스트 포스트."
---

이 글은 본문에서 자주 확인해야 하는 실패 상태 두 가지만 빠르게 점검하기 위한 테스트 포스트다. 실제 콘텐츠 대신 의도적으로 잘못된 경로와 지버리시 URL을 넣어, 화면에서 보이는 실패 상태와 폴백 상태만 확인할 수 있게 구성했다.

첫 번째는 이미지가 로드되지 않을 때 브라우저가 기본으로 보여주는 깨진 이미지 표시(통칭 엑스박스)다. 아래 이미지는 존재하지 않는 경로를 가리키므로, 정상적인 사진 대신 실패 상태가 노출되어야 한다.

![이미지 로드 실패 테스트용 엑스박스](/__ui-test__/image-load-fail-xbox.png)

두 번째는 소셜 임베드의 프레임 또는 플랫폼 스크립트가 정상적으로 콘텐츠를 만들지 못할 때 보이는 로딩 중/폴백 상태다. 여기서는 실제 작성할 때 쓰는 shortcode 문법을 그대로 사용하되, 플랫폼 형식만 맞춘 지버리시 URL을 넣어서 사용자 시점의 폴백 링크와 대기 상태를 보려는 목적에 맞췄다.

YouTube와 Vimeo 계열은 `iframe` 자체가 오류 화면을 띄우는지, 스크립트 기반 플랫폼은 shortcode 내부의 기본 블록(로딩 중 상태)이 어떻게 남는지를 확인하면 된다.

{{< youtube "https://www.youtube.com/watch?v=___GIBBERISH___" >}}

{{< youtube-shorts "https://www.youtube.com/shorts/___SHORTS_FAIL___" >}}

{{< tiktok "https://www.tiktok.com/@gibberish_user_xxx/video/0000000000000000000" >}}

{{< instagram "https://www.instagram.com/p/___GIBBERISH_POST___/" >}}

{{< twitter "https://twitter.com/gibberish_account_xxx/status/not-a-real-status-id" >}}

{{< threads "https://www.threads.net/@gibberish_account_xxx/post/___GIBBERISH_POST___" >}}

{{< facebook "https://www.facebook.com/gibberish.page.xxx/posts/___GIBBERISH_POST___" >}}

{{< vimeo "https://vimeo.com/000000000" >}}

이 포스트가 의도대로 보이면, 이후에는 본문 작성 중 임베드가 안 뜰 때 본문 문법 문제인지 플랫폼 로딩 문제인지 더 빠르게 구분할 수 있다.
