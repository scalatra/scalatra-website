---
title: Authentication | HTTP | Scalatra
---

*Scentry* is Scalatra's optional authentication system. It is a port of Ruby's
[Warden](https://github.com/hassox/warden) authentication framework for
Scalatra. You write auth strategies to meet your needs, and then use Scentry
to enforce security for your strategies.

There are a few moving parts here. In order to protect your application's actions
with Scentry, you need two things:

* a *strategy* to enforce security, let's call it `YourStrategy`. A strategy is
a piece of logic which determines whether a user should be authenticated.
* a trait that ties `YourStrategy` together with Scalatra's built-in
`ScentrySupport` class. You then mix this trait into your controllers in
order to secure them. By convention, this trait is often called
`AuthenticationSupport`, but you can call it whatever you want.

Multiple strategies can be registered with Scentry - for example, you could write
a `CookieStrategy`, a `UserPasswordStrategy`, and a `MyBasicAuthStrategy`.

Scentry will cascade through the strategies, attempting to log in a user with
each strategy, until either the user is authenticated or all available
strategies are exhausted.

You can register strategies in controller code, like so:

```scala
override protected def registerAuthStrategies = {
    scentry.registerStrategy('UserPassword, app => new UserPasswordStrategy(app))
    scentry.registerStrategy('RememberMe, app => new RememberMeStrategy(app))
  }
```

Alternately, you can register a strategy using init params in
`ScalatraBootstrap` or your application's `web.xml` file, using
`scentry.strategies` as the key and the class name of your strategy as a value:

`context.initParameters("scentry.strategies") = "UserPasswordStrategy"`

To write a Scentry Strategy, you'll need to implement the methods in
[ScentryStrategy](https://github.com/scalatra/scalatra/blob/develop/auth/src/main/scala/org/scalatra/auth/ScentryStrategy.scala).

See Scalatra's built-in [BasicAuthStrategy](https://github.com/scalatra/scalatra/blob/develop/auth/src/main/scala/org/scalatra/auth/strategy/BasicAuthStrategy.scala)
for an example.

## Dependency

```scala
// Put this in project/build.scala:
"org.scalatra" %% "scalatra-auth" % "{{< 2-5-scalatra_version >}}"
```

You'll need the scalatra-auth dependency in your `project/build.scala` for all subsequent
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
import org.scalatra.{ScalatraBase}

class OurBasicAuthStrategy(protected override val app: ScalatraBase, realm: String)
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
  self: ScalatraBase =>

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

You don't need to call this class `User`. It can be named anything you want.

### Mix in AuthenticationSupport

Next, we mix the `AuthenticationSupport` trait into a controller:

```scala
package org.scalatra.example

import org.scalatra._

class AuthDemo extends ScalatraServlet with AuthenticationSupport {


  get("/*") {
    basicAuth
    <html>
      <body>
        <h1>Hello from Scalatra</h1>
        <p>You are authenticated.</p>
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

When a browser hits the protected servlet for the first time, the `basicAuth`
method is called.

The user hasn't yet authenticated, so the `unauthenticated` method of Scentry's
BasicAuthStrategy is run. It presents a basic auth challenge to the user:

```scala
 override def unauthenticated() {
    app.response.setHeader("WWW-Authenticate", challenge)
    app.halt(401, "Unauthenticated")
  }
```

The user enters credentials, or cancels to close the basic auth box.

When good credentials are entered, the input is sent to Scentry's `validate`
method, which we've overridden in `OurBasicAuthStrategy`:

```scala
  protected def validate(userName: String, password: String): Option[User] = {
    if(userName == "scalatra" && password == "scalatra") Some(User("scalatra"))
    else None
  }
```


If the `validate` method returns something other than a `None`, then Scentry
considers the returned class as its `User` class, and decides that authentication has
taken place; if it returns `None`, authentication has failed.

If authentication is granted, the `BasicAuthStrategy` sets up HTTP basic auth
in the user's browser. `halt` is called if the user is unauthenticated or not
using basic auth.

### What to protect

You might choose to run the `basicAuth` method in a `before()` filter in your
controller, rather than hitting it in each action, to secure every method in
`MyController`.

You might even set it up as a `before()` filter in the
`AuthenticationSupport` trait, which would automatically secure any controller
which mixed in the trait.

As with most things in Scalatra, it's up to you.

## Cookie example

We still need to write this up and finish the guide, but there's now working
example code for a
[UserPasswordStrategy and RememberMe strategy](https://github.com/scalatra/scalatra-website-examples/tree/master/2.4/http/scentry-auth-demo)
with fallback.

If you're trying to secure an API rather than a user's browser session,
Jos Dirksen's [tutorial](http://www.smartjava.org/content/tutorial-getting-started-scala-and-scalatra-part-iii) on the subject may help.
