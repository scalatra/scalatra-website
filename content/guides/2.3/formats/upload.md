---
aliases:
  - /2.3/guides/formats/upload.html
title: File upload
---

## Uploading files

File upload support is included within Scalatra by default by leveraging
the Servlet 3.0 API's built-in support for `multipart/form-data` requests.
For a working example, see
[FileUploadExample.scala](https://github.com/scalatra/scalatra/blob/develop/example/src/main/scala/org/scalatra/FileUploadExample.scala).

To enable file upload support, extend your application with `FileUploadSupport`
and set the upload configuration with a call to `configureMultipartHandling`:

```scala
import org.scalatra.ScalatraServlet
import org.scalatra.servlet.{FileUploadSupport, MultipartConfig, SizeConstraintExceededException}

class MyApp extends ScalatraServlet with FileUploadSupport {
  configureMultipartHandling(MultipartConfig(maxFileSize = Some(3*1024*1024)))
  // ...
}
```

If you prefer using your `web.xml` over `MultipartConfig`, you can also place
`<multipart-config>` in your `<servlet>`:

```xml
<servlet>
  <servlet-name>myapp</servlet-name>
  <servlet-class>com.me.MyApp</servlet-class>

  <multipart-config>
    <max-file-size>3145728</max-file-size>
  </multipart-config>
</servlet>
```

See the
[javax.servlet.annotation.MultipartConfig Javadoc](http://docs.oracle.com/javaee/6/api/javax/servlet/annotation/MultipartConfig.html)
for more details on configurable attributes.

<span class="badge badge-warning"><i class="icon-flag icon-white"></i></span>
Note for Jetty users: `MultipartConfig` and the `<multipart-config>` tag in `web.xml`
do not work correctly in Jetty prior to version 8.1.3.

If you are [embedding Jetty](../deployment/standalone.html), you must either mount the servlet in your
[ScalatraBootstrap](../deployment/configuration.html), or you must configure it via the ServletHolder:

```scala
  import org.scalatra.servlet.MultipartConfig
  // ...
  val holder = context.addServlet(classOf[YourScalatraServlet], "/*")
  holder.getRegistration.setMultipartConfig(
    MultipartConfig(
      maxFileSize = Some(3*1024*1024),
      fileSizeThreshold = Some(1*1024*1024)
    ).toMultipartConfigElement
  )
  // ...
}
```

Be sure that your form is of type `multipart/form-data`:

```scala
get("/") {
  <form method="post" enctype="multipart/form-data">
    <input type="file" name="thefile" />
    <input type="submit" />
  </form>
}
```

Your files are available through the `fileParams` or `fileMultiParams` maps:

```scala
post("/") {
  processFile(fileParams("thefile"))
}
```

To handle the case where the user uploads too large a file, you can define an error handler:

```scala
error {
  case e: SizeConstraintExceededException => RequestEntityTooLarge("too much!")
}
```

Scalatra wraps `IllegalStateException` thrown by `HttpServletRequest#getParts()` inside
`SizeConstraintExceededException` for convenience of use. If the container for some
reason throws an exception other than `IllegalStateException` when it detects
a file upload that's too large (or a request body that's too large),
 or you are getting false positives, you can configure the wrapping by
overriding the `isSizeConstraintException` method.

For example, Jetty 8.1.3 incorrectly throws `ServletException` instead of `IllegalStateException`.
You can configure that to be wrapped inside `SizeConstraintExceededException`s
by including the following snippet in your servlet:

```scala
override def isSizeConstraintException(e: Exception) = e match {
  case se: ServletException if se.getMessage.contains("exceeds max filesize") ||
                               se.getMessage.startsWith("Request exceeds maxRequestSize") => true
  case _ => false
}
```
