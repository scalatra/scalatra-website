---
title: CORS
layout: guides-2.7
---

### Cross origin resource sharing

Scalatra has CORS support enabled by default. CORS is a security feature from browsers. If a page in a browser wants to 
do a request to another domain, it will first send an OPTIONS request (called a pre-flight) and depending on the response headers the browser
will block or execute the actual request. See the [wikipedia page on cross-origin resource sharing](http://en.wikipedia.org/wiki/Cross-origin_resource_sharing) 
for more information.
 
You can configure your application to be more restrictive by using the following init params.

```scala
// List the hosts and ports which will be allowed to make cross-origin requests, 
// separated by commas (* by default).
context.setInitParameter("org.scalatra.cors.allowedOrigins", "http://example.com:8080,http://foo.example.com")

// List what HTTP methods will be accepted. 
// Available options are GET, POST, PUT, DELETE, HEAD, OPTIONS, and PATCH. 
// All methods are accepted by default.
context.setInitParameter("org.scalatra.cors.allowedMethods", "GET")

// Set a list of allowed HTTP headers, most headers are supported.
context.setInitParameter("org.scalatra.cors.allowedHeaders", "Content-Type")

// Set the number of seconds that preflight requests can be cached by the client.
// Default value is 0 seconds.
context.setInitParameter("org.scalatra.cors.preflightMaxAge", "1800")

// By default, cookies are not included in CORS requests. Set this to `true` to allow cookies.
context.setInitParameter("org.scalatra.cors.allowCredentials", "true")

// If CorsSupport needs to be disabled, set to false. Default: CorsSupport is enabled.
context.setInitParameter("org.scalatra.cors.enable", "false")
```

If you are configuring your application using web.xml, the corresponding xml configuration would be.

 ```xml
<web-app>
   <context-param>
    <param-name>org.scalatra.cors.allowedOrigins</param-name>
    <param-value>*</param-value>
  </context-param>
  <context-param>
    <param-name>org.scalatra.cors.allowCredentials</param-name>
    <param-value>false</param-value>
  </context-param>
   <context-param>
    <param-name>{cors-param-name}</param-name>
    <param-value>{cors-param-value}</param-value>
  </context-param>
  ...
</web-app>
```

Where `{cors-param-name}` and `{cors-param-value}` above represents the supported cors parameters and values respectively.

### Special care when allowedOrigins = "*" (which is the default!)
If your init param **org.scalatra.cors.allowedOrigins** is equal to "*", which is the default, then you must set 
**org.scalatra.cors.allowCredentials** to false. Otherwise the browser will block the request because
it could leak credentials to any domain. 

Recommended configuration:

```scala
// Optional because * is the default
context.setInitParameter("org.scalatra.cors.allowedOrigins", "*")
// Disables cookies, but required because browsers will not allow passing credentials to wildcard domains  
context.setInitParameter("org.scalatra.cors.allowCredentials", "false")
```

If you need allowedCredentials to be true, then you have to implement an options route and set the allowed domain:

```scala
import org.scalatra.CorsSupport

class YourServlet extends ScalatraBase with CorsSupport {

  options("/*"){
    response.setHeader("Access-Control-Allow-Origin", request.getHeader("Origin"))
  }

}
```


If you're not familiar with CORS, you may want to find out a bit more about
[preflightMaxAge][preflight] and [allowCredentials][allowCredentials] or
[read the whole spec][corsSpec] at the W3C. A good tutorial is also available
at [HTML5Rocks][html5rocks].

[preflight]: http://www.w3.org/TR/cors/#resource-preflight-requests
[allowCredentials]: http://www.w3.org/TR/cors/#supports-credentials
[corsSpec]: http://www.w3.org/TR/cors
[html5rocks]: http://www.html5rocks.com/en/tutorials/cors/
