# Blog Workflow

## Drafts and WIP
- Work-in-progress posts live in `_drafts/wip/`.
- Each draft has `draft: true` in front matter.
- When ready to publish, move the file to `_posts/<category>/` and remove `draft: true`.

## Publishing a Post
1) Create or move the file into `_posts/<category>/`.
2) Ensure front matter includes `title`, `date`, and `categories` (tags optional).
3) Run local preview (see below) and check rendering.

## Local Preview
```bash
cd /Users/heejoon/Desktop/WORK/PROJECT/BLOG/anotherminor.github.io
bundle install
bundle exec jekyll serve
```
Then open http://localhost:4000

## Embeds
- Twitter/X: `{% include twitter.html url="https://x.com/..." %}`
- Instagram: `{% include instagram.html url="https://www.instagram.com/p/.../" %}`
- YouTube: `{% include youtube.html id="VIDEO_ID" %}`
- TikTok: `{% include tiktok.html url="https://www.tiktok.com/..." id="VIDEO_ID" %}`

## Comments (Disqus)
- Set `comments.provider: disqus` in `_config.yml`.
- Set `comments.disqus.shortname` to your shortname.
- Ensure `comments: true` in the post front matter.
