---
layout: guide
title: Authentication | HTTP | Scalatra
---

<div class="page-header">
  <h1>Authentication</h1>
</div>


Scentry is Scalatra's optional authentication system. It is a port of Ruby's
[Warden](https://github.com/hassox/warden) authentication framework for
Scalatra.

Combining `ScentrySupport` and `BasicAuthSupport` traits allow you to quickly tie a
`User` class to the session and Basic Authentication methods.

---

## Dependency

```scala
// Put this in build.sbt:
"org.scalatra" % "scalatra-auth" % "{{ site.scalatra_version }}"
```

There is a new authentication middleware in the auth directory, to be
documented soon.

See an example at [usage example](http://gist.github.com/660701).

Here's another [example](https://gist.github.com/732347) for basic authentication.

Until we get this guide finished properly, you may wish to look at Jared
Armstrong's blog posts about Scalatra authentication:

* [Scalatra, an example authentication app](http://www.jaredarmstrong.name/2011/08/scalatra-an-example-authentication-app/)
* [Scalatra form authentication with remember me](http://www.jaredarmstrong.name/2011/08/scalatra-form-authentication-with-remember-me/)

If you're trying to secure an API rather than a user's browser session,
Jos Dirksen's [tutorial](http://www.smartjava.org/content/tutorial-getting-started-scala-and-scalatra-part-iii) on the subject may help.

### Example codes

* [Basic Auth example](https://github.com/scalatra/scalatra/blob/develop/example/src/main/scala/org/scalatra/BasicAuthExample.scala)
* [Scalatra auth form](https://github.com/jlarmstrong/scalatra-auth-form)
* [Scalatra auth email](https://github.com/jasonjackson/scalatra-auth-email)

{% include _under_construction.html %}
