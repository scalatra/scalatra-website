---
aliases:
  - /2.4/guides/http/flash.html
layout: oldguide
title: Flash | HTTP | Scalatra guides
---

Flash support, allowing you to store information across requests and expire
it immediately after a redirect, is included within Scalatra by default.

<div class="alert alert-info">
  <span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
  The
  <a href="{{site.examples}}http/scalatra-http-demo">scalatra-http-demo</a>
  has a working example of flash support.
</div>

### Basic usage

Flash entries are not normally available within the current request scope.
The exception is adding new flash entries into `flash.now`.

In order to enable flash support, you'll need to extend your servlet class
with `FlashMapSupport`. You can set the flash like this:

```scala
class FooServlet extends ScalatraServlet with FlashMapSupport {
 post("/articles/create") {
    // watch out: this creates a session!
    flash("notice") = "article created succesfully"
    redirect("/home")
  }

  get("/home") {
    ssp("/home", "flash" -> flash)
  }
}
```

and then you can use it in your view, to let the user know what happened.
`home.ssp` might look like this:

```scala
<%@ import val flash:org.scalatra.FlashMap %>
<html>
  <body>
    <p>Here is the flash: <%= flash.get("notice") %></p>
  </body>
</html>
```

### Adding multiple entries

You can add more than one entry to the `FlashMap`, using `+=`:

```scala
flash = ("notice" -> "Hello from your application")
flash += ("error" -> "An error occurred")
flash.now += ("info" -> "redirect to see the error")
```

`flash.now` operates pretty much in the same way as `flash` does, except that
it sets a value for the current request only.  It will be removed before the
next request unless explicitly kept.

### FlashMapSupport and sessions

Please note: extending your `ScalatraServlet` with `FlashMapSupport` triggers
a session, which is why it's an optional mixin.
