---
layout: guide
title: Flash | HTTP | Scalatra guides
---

<div class="page-header">
  <h1>Flash</h1>
</div>

## Flash map

Flash support, allowing you to store information across requests and expire
it immediately after a redirect, is included within Scalatra by default.

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
    ssp("/home")
  }
}
```

and then you can use it in your view, to let the user know what happened.
`home.ssp` might look like this:

```scala
<html>
  <body>
    <p>Here is the flash: <%= flash.get("notice") %></p>
  </body>
</html>
```

You can add more than one entry to the `FlashMap`, using `+=`:

```scala
flash = ("notice" -> "Hello from your application")
flash += ("error" -> "An error occurred")
flash.now += ("info" -> "redirect to see the error")
```

`flash.now` operates pretty much in the same way as `flash` does, except that
it sets a value for the current request only.  It will be removed before the
next request unless explicitly kept.

Please note: extending your `ScalatraServlet` with `FlashMapSupport` triggers
a session, which is why it's an optional mixin.
