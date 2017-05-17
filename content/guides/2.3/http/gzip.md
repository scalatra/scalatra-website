---
aliases:
  - /2.3/guides/http/gzip.html
title: Gzip
layout: guides-2.3
---

Bandwidth can be wasted when using verbose plaintext formats such as XML, leading
to a poor user experience for your apps.
Fortunately, many clients can accept compressed content and Scalatra lets you
compress server responses without any change to your business logic.
Just mix in `GZipSupport`.

<div class="alert alert-info">
  <span class="badge badge-info"><i class="glyphicon glyphicon-flag"></i></span>
  See
  <a href="https://github.com/scalatra/scalatra-website-examples/tree/master/2.3/http/scalatra-gzip">scalatra-gzip</a>
  for a minimal and standalone project containing the example in this guide.
</div>

---

## Example

This servlet will reply with compressed content if and only if the client provides
an `Accept-Header` indicating it understands gzip.

```scala
class GZipApp extends ScalatraServlet with GZipSupport {

  get("/") {
    <html>
      <body>
        <h1>This is
          <a href="http://scalatra.org/2.2/guides/http/gzip.html">
            http/gzip
          </a>!
        </h1>
      </body>
    </html>
  }
}
```
