---
title: Sessions
---

### Session handling

Scalatra has session handling built into the framework by default. There are
no modules or traits that you need to include.

<span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
Sessions are *off* until the `session` method is called.
Once `session` is called, a cookie-based session will be created.

Then you will be able to use the default cookie based session handler in your
application:

```scala
get("/") {
  if(session.contains("counter")) session("counter") = 0
  session("counter") = session("counter").toInt + 1
  "You've hit this page %s times!" format session("counter").toInt
}
```

The `session` implicitly implements `scala.collection.mutable.Map` backed by
`session` attributes.

<span class="badge badge-success"><i class="icon-thumbs-up icon-white"></i></span>
There's also a `sessionOption` method, which returns a `session` if one already
exists, and `None` if it doesn't. This is a good way to avoid creating a
`session`. If you don't need a `session` in your application, e.g. if you're
building out a stateless RESTFul API, never call the `session` method, and
don't mix in `FlashMapSupport` (which also creates a session).

<span class="badge badge-warning"><i class="icon-warning-sign icon-white"></i></span>
The default session in Scalatra is cookie-based, but the cookie is used only
as a session identifier (session data is stored server-side). If you are
building out a shared-nothing architecture, this is something to be aware of.

{% include _under_construction.html %}
