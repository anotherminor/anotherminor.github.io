# anotherminor.github.io

Scratch-built Jekyll blog for `anotherminor.github.io`.

## Local Development

```bash
export PATH="/opt/homebrew/opt/ruby/bin:$PATH"
cd /Users/heejoon/Desktop/WORK/PROJECT/BLOG/anotherminor.github.io
bundle install
bundle exec jekyll serve
```

Open [http://localhost:4000](http://localhost:4000).

## Content Workflow

- Posts: `_posts/<category>/YYYY-MM-DD-slug.md`
- Pages: `_pages/*.md`
- Layouts: `_layouts/*.html`
- Includes: `_includes/*.html`
- Styles: `assets/css/main.scss`

## Comments

Disqus is enabled through `_config.yml` with shortname `anotherminor`.
