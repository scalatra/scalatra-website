---
aliases:
  - /2.3/guides/http/reverse-routes.html
title: Reverse Routes
---

### URL support and reverse routes

`ScalatraBase` provides two instances that provide you with relative URLs.
The `url` method will return a string that can be used in your output or a
redirect statement.

<div class="alert alert-info">
  <span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
  The
  <a href="{{site.examples}}http/scalatra-http-demo">scalatra-http-demo</a>
  is a good place to start if you'd like to see working url-related examples.
</div>


In Scalatra 2.0.x, you used to need to extend the `UrlSupport` trait, but
that's now been moved into `ScalatraBase`, so all you need is:

```scala
class MyApp extends ScalatraServlet {

}
```


#### Page relative url:

```scala
get("/"){
  // This will redirect to http://<host>/page-relative
  redirect(url("page-relative"))
}
```

#### Context relative url:

```scala
get("/"){
  // This will redirect to http://<host>/<context>/context-relative
  redirect(url("/context-relative"))
}
```

#### Mapped params:

```scala
get("/") {
  // This will redirect to http://<host>/<context>/en-to-es?one=uno&two=dos
  redirect( url("/en-to-es", Map("one" -> "uno", "two" -> "dos")) )
}
```

#### Reverse routes:

It is possible to save your routes as variables so that they have convenient
handles:

```scala
class MyApp extends ScalatraServlet with UrlGeneratorSupport {
  // When you create a route, you can save it as a variable
  val viewUser = get("/user/:id") {
     // your user action would go here
   }

  post("/user/new") {
    // url method provided by UrlGeneratorSupport.  Pass it the route
    // and the params.
    redirect(url(viewUser, "id" -> newUser.id))
  }
}
```

There's also a `ScalateUrlGeneratorSupport`.  It reflectively finds all
members of your app of type Route (e.g., viewUser above) and makes them
available in your templates.  You should then be able to do something like this
right in your templates:

```scala
url(viewUser, "id" -> 1)
```
