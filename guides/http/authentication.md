---
layout: guide
title: Authentication | HTTP | Scalatra
---

<div class="page-header">
  <h1>Authentication</h1>
</div>

{% include _in_progress.html %}


Scentry is Scalatra's optional authentication system. It is a port of Ruby's
[Warden](https://github.com/hassox/warden) authentication framework for
Scalatra. You write auth strategies to meet your needs, and then use Scentry
to enforce security for your strategies.

There are a few moving parts here. In order to protect your application's actions
with Scentry, you need two things:

* a *Strategy* to enforce security, let's call it `YourStrategy`. A strategy is
a piece of logic which determines whether a user should be authenticated.
* a trait that ties `YourStrategy` together with Scalatra's built-in
`ScentrySupport` class. You then mix this trait into your controllers in
order to secure them. By convention, this trait is often called
`AuthenticationSupport`, but you can call it whatever you want.

Multiple strategies can be registered with Scentry - for example, you could write
a `CookieStrategy`, a `UserPasswordStrategy`, and a `MyBasicAuthStrategy`.

Scentry will cascade, attempting to log in a user with each strategy, until
either the user is authenticated or all available strategies are exhausted.

You can either register strategies in controller code, like so:

```scala
override protected def registerAuthStrategies = {
    scentry.registerStrategy('UserPassword, app => new UserPasswordStrategy(app))
    scentry.registerStrategy('RememberMe, app => new RememberMeStrategy(app))
  }
```

or you can register a strategy using init params in `ScalatraBootstrap` or
your application's `web.xml` file, using `scentry.strategies` as the key and
the class name of your strategy as a value:

`context.initParameters("scentry.strategies") = "UserPasswordStrategy"`

To write a Scentry Strategy, you'll need to implement the methods in
[ScentryStrategy](https://github.com/scalatra/scalatra/blob/develop/auth/src/main/scala/org/scalatra/auth/ScentryStrategy.scala).

See Scalatra's built-in [BasicAuthStrategy](https://github.com/scalatra/scalatra/blob/develop/auth/src/main/scala/org/scalatra/auth/strategy/BasicAuthStrategy.scala)
for an example.

## Dependency

```scala
// Put this in build.sbt:
"org.scalatra" % "scalatra-auth" % "{{ site.scalatra_version }}"
```

You'll need the scalatra-auth dependency in your built.sbt for all subsequent
examples. `scalatra-auth` handles both cookie-based auth and HTTP basic auth.

## HTTP Basic Auth example

First things first. Let's try the simplest possible example: HTTP basic auth.

<div class="alert alert-info">
  <span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
  See
  <a href="{{site.examples}}http/authentication-demo">authentication-demo</a>
  for a minimal and standalone project containing the example in this guide.
</div>

### Write the strategy

The class `OurBasicAuthStrategy` will implement Scalatra's built-in `BasicAuthStrategy`
trait, which itself extends `ScentryStrategy`. Normally, you'll want to extend
`ScentryStrategy` when writing your own authentication logic, but let's see the
simple case first.

```scala
package org.scalatra.example

import org.scalatra.auth.strategy.{BasicAuthStrategy, BasicAuthSupport}
import org.scalatra.auth.{ScentrySupport, ScentryConfig}
import org.scalatra.{ScalatraSyntax}

class OurBasicAuthStrategy(protected override val app: ScalatraSyntax, realm: String)
  extends BasicAuthStrategy[User](app, realm) {

  protected def validate(userName: String, password: String): Option[User] = {
    if(userName == "scalatra" && password == "scalatra") Some(User("scalatra"))
    else None
  }

  protected def getUserId(user: User): String = user.id
}
```
The key thing here is the `validate` method, which attempts to log a user in
using methods on a User model. This might be used in a `login` action on one
of your controllers, to figure out whether a user should be granted a session.

### An AuthenticationSupport trait

The next thing you'll need is the trait that ties together `OurBasicAuthStrategy`
with `ScentrySupport`. It might look like this:

```scala
trait AuthenticationSupport extends ScentrySupport[User] with BasicAuthSupport[User] {
  self: ScalatraSyntax =>

  val realm = "Scalatra Basic Auth Example"

  protected def fromSession = { case id: String => User(id)  }
  protected def toSession   = { case usr: User => usr.id }

  protected val scentryConfig = (new ScentryConfig {}).asInstanceOf[ScentryConfiguration]


  override protected def configureScentry = {
    scentry.unauthenticated {
      scentry.strategies("Basic").unauthenticated()
    }
  }

  override protected def registerAuthStrategies = {
    scentry.register("Basic", app => new OurBasicAuthStrategy(app, realm))
  }

}
```

The `AuthenticationSupport` trait has an extremely basic way of getting a User
object from the session, and of pushing the user's id into the session. It also
takes care of registering our single available strategy with Scentry.

You'll also need a User class. Let's use a simple case class:

```scala
case class User(id: String)
```

### Mix in AuthenticationSupport

Next, we mix the `AuthenticationSupport` trait into a controller:

```scala
import org.scalatra.ScalatraServlet
import org.scalatra.auth.AuthenticationSupport


class MyController extends ScalatraServlet with AuthenticationSupport {

  get("/?") {
    basicAuth
    <html>
      <body>
        <h1>Hello from Scalatra</h1>
        <p><a href="/auth-demo/linked" >click</a></p>
      </body>
    </html>
  }

  get("/linked") {
    basicAuth
    <html>
      <body>
        <h1>Hello again from Scalatra</h1>
        <p><a href="/" >back</a></p>
      </body>
    </html>
  }
}
```

Users who hit either of these routes when not logged in will be presented
with the browswer's HTTP basic auth login prompt.

A few things are worth mentioning here. The `basicAuth` method comes from the
pre-built `BasicAuthStrategy` included in Scalatra. If you're defining your own
authentication logic, you'll need to implement a similar method yourself.

Here's what `basicAuth` does:

```scala
protected def basicAuth() = {
  val baReq = new BasicAuthStrategy.BasicAuthRequest(request)
  if(!baReq.providesAuth) {
    response.setHeader("WWW-Authenticate", "Basic realm=\"%s\"" format realm)
    halt(401, "Unauthenticated")
  }
  if(!baReq.isBasicAuth) {
    halt(400, "Bad Request")
  }
  scentry.authenticate("Basic")
}
```

Calling `basicAuth` checks whether the user's browser has a basic auth session,
and sets HTTP headers and status codes depending on what Scentry finds. `halt`
is called if the user is unauthenticated or not using basic auth.

If you were implementing cookie-based auth instead, you could check for
the presence of a session identifier token, and redirect the user to a login
page if it was not found.

### What to protect

You might choose to run the `basicAuth` method in a `before()` filter in your
controller, rather than hitting it in each action, to secure every method in
`MyController`.

You might even set it up as a `before()` filter in the
`AuthenticationSupport` trait, which would automatically secure any controller
which mixed in the trait.

As with most things in Scalatra, it's up to you.

## Cookie example

Still to do, but will be drawn from [Cookie-based auth gist](http://gist.github.com/660701).

----

Until we get this guide finished properly, you may wish to look at Jared
Armstrong's blog posts about Scalatra authentication:

* [Scalatra, an example authentication app](http://www.jaredarmstrong.name/2011/08/scalatra-an-example-authentication-app/)
* [Scalatra form authentication with remember me](http://www.jaredarmstrong.name/2011/08/scalatra-form-authentication-with-remember-me/)

If you're trying to secure an API rather than a user's browser session,
Jos Dirksen's [tutorial](http://www.smartjava.org/content/tutorial-getting-started-scala-and-scalatra-part-iii) on the subject may help.

### Example codes

* [Cookie-based auth gist](http://gist.github.com/660701)
* [Basic auth gist](https://gist.github.com/732347)
* [Basic Auth example from the Scalatra codebase](https://github.com/scalatra/scalatra/blob/develop/example/src/main/scala/org/scalatra/BasicAuthExample.scala)
* [Scalatra auth form](https://github.com/jlarmstrong/scalatra-auth-form)
* [Scalatra auth email](https://github.com/jasonjackson/scalatra-auth-email)

{% include _under_construction.html %}
