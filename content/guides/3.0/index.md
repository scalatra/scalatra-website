---
title: Scalatra 3.0 / 3.1 Guides
---

## Outlook
- [Scalatra's philosophy](scalatra-philosophy.html)

## Supported Versions


Scalatra 3.0 / 3.1 supports Scala 2.12, 2.13 and 3.

Also, Scalatra 3.0/3.1 supports Servlet 4.0.1 but Scalatra 3.0 supports 5.0.0 while Scalatra 3.1 supports 6.0.0. Note that the artifact names have suffix depending on Servlet version as follows:

```scala
// for javax (Servlet 4.0.1)
"org.scalatra" %% "scalatra-javax" % "{{< 3-0-scalatra_version >}}",
"org.scalatra" %% "scalatra-json-javax" % "{{< 3-0-scalatra_version >}}",
"org.scalatra" %% "scalatra-forms-javax" % "{{< 3-0-scalatra_version >}}",
...

// for jakarta (Servlet 5.0.0/6.0.0)
"org.scalatra" %% "scalatra-jakarta" % "{{< 3-0-scalatra_version >}}",
"org.scalatra" %% "scalatra-json-jakarta" % "{{< 3-0-scalatra_version >}}",
"org.scalatra" %% "scalatra-forms-jakarta" % "{{< 3-0-scalatra_version >}}",
...
```


## Development

We've documented most aspects of working with Scalatra in a series of guides covering common development tasks.

### HTTP
- [Routes](http/routes.html)
- [Actions](http/actions.html)
- [Reverse Routes](http/reverse-routes.html)
- [Requests & Responses](http/requests-and-responses.html)
- [GZip](http/gzip.html)
- [Flash](http/flash.html)
- [Authentication](http/authentication.html)
- [CORS](web-services/cors.html)

### Async
- [Pekko](async/pekko.html)

### Views
- [Inline HTML](views/inline-html.html)
- [Twirl](views/twirl.html)

### Formats
- [File Upload](formats/upload.html)
- [JSON](formats/json.html)
- [Forms](formats/forms.html)

### Persistence
- [Slick](persistence/slick.html)
- [Squeryl](persistence/squeryl.html)

### Internationalization
- [i18n](internationalization.html)

### Testing
- [ScalaTest](testing/scalatest.html)
- [Specs2](testing/specs2.html)

### API Design & Documentation
- [Swagger](swagger.html)

## After Development

### Monitoring
- [Logging](monitoring/logging.html)
- [Metrics](monitoring/metrics.html)

### Deployment
- [Configuration](deployment/configuration.html)
- [Servlet container](deployment/servlet-container.html)
- [Standalone](deployment/standalone.html)
