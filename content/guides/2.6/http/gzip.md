---
title: Gzip
layout: guides-2.6
---

Bandwidth can be wasted when using verbose plaintext formats such as XML, leading
to a poor user experience for your apps.
Fortunately, many clients can accept compressed content and Scalatra lets you
compress server responses without any change to your business logic.
Just mix in `ContentEncodingSupport`.

<div class="alert alert-info">
  <span class="badge badge-info"><i class="glyphicon glyphicon-flag"></i></span>
  See
  <a href="https://github.com/scalatra/scalatra-website-examples/tree/master/2.6/http/scalatra-gzip">scalatra-gzip</a>
  for a minimal and standalone project containing the example in this guide.
</div>

---

## Example

This servlet will reply with compressed content if and only if the client provides
an `Accept-Header` indicating it understands gzip.

```scala
class GZipApp extends ScalatraServlet with ContentEncodingSupport {

  get("/") {
    <html>
      <body>
        <h1>This is
          <a href="http://scalatra.org/guides/2.6/http/gzip.html">
            http/gzip
          </a>!
        </h1>
      </body>
    </html>
  }
}
```

You can get gzip file using the `curl` command as follows.

```bash
$  curl -H "Accept-Encoding:gzip,deflate" -o gzip_example.html.gz http://localhost:8080
```
