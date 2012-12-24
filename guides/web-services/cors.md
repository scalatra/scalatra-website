### Cross origin resource sharing

Scalatra allows you to mix in the `CorsSupport` trait if you need to do
[cross-origin resource sharing](http://en.wikipedia.org/wiki/Cross-origin_resource_sharing).

Adding `CorsSupport` allows all requests from anywhere, by default.

```scala
import org.scalatra.CorsSupport

class YourServlet extends ScalatraBase with CorsSupport {

}
```

You can configure your application to be more restrictive by using the following init
params.

`org.scalatra.cors.allowedOrigins = "http://example.com:8080 http://foo.example.com"`
- List the hosts and ports which will be allowed to make cross-origin requests,
separated by spaces (* by default).


`org.scalatra.cors.allowedMethods = "GET"` - List what HTTP methods will be
accepted. Available options are GET, POST, PUT, DELETE, HEAD, OPTIONS, and
PATCH. All hosts are accepted by default.


`org.scalatra.cors.allowedHeaders = "Content-Type"` - Set a list of allowed
HTTP headers, most headers are supported.

`org.scalatra.cors.preflightMaxAge = 1800` - Set the number of seconds that
preflight requests can be cached by the client. Default value is 0 seconds.


`org.scalatra.cors.allowCredentials = true` - By default, cookies are not
included in CORS requests. Set this to `true` to allow cookies.

If you're not familiar with CORS, you may want to find out a bit more about
[preflightMaxAge][preflight] and [allowCredentials][allowCredentials] or
[read the whole spec][corsSpec] at the W3C. A good tutorial is also available
at [HTML5Rocks][html5rocks].

[preflight]: http://www.w3.org/TR/cors/#resource-preflight-requests
[allowCredentials]: http://www.w3.org/TR/cors/#supports-credentials
[corsSpec]: http://www.w3.org/TR/cors
[html5rocks]: http://www.html5rocks.com/en/tutorials/cors/
