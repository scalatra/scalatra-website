---
aliases:
  - /2.3/guides/views/inline-html.html
title: Inline HTML
---

## Inline HTML

The simplest method of rendering a view is by using inline HTML.

Unlike frameworks in most other languages, Scalatra can use Scala's built-in
XML literals to output XML directly as a return value from an action:

```scala
def get("/") {
  contentType="text/html"

  <html>
  <head><title>Test</title></head>
  <body>Test Body for {uri("/")}</body>
  </html>
}
```

Note the use of the curly braces on the `{uri("/")}` part of the inlined view.
This tells Scalatra to render Scala code.

This would be a very poor way to structure complex views for a large application, but it might
be useful if your templating needs are quite simple (or you're just cranking out a quick prototype).

Normally you'll want more structure than inline HTML can provide, so that you can separate
your views from your controller actions and routing.
