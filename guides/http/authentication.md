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

There are a few moving parts here, but in general you need two things:

* a Strategy to enforce security, let's call it `YourStrategy`. A strategy is
a piece of logic which determines whether a user should be authenticated.
* a trait that ties `YourStrategy` together with `ScentrySupport`. You then
mix this trait into your controllers in order to secure them.

Multiple strategies can be registered, and Scentry will cascade, attempting
to log in a user with each strategy, until all available strategies are
exhausted.

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
for an example of how to do this. Keep in mind that the `BasicAuthStrategy`
is itself abstract, so you'll need to implement your own concrete strategy.

## Dependency

```scala
// Put this in build.sbt:
"org.scalatra" % "scalatra-auth" % "{{ site.scalatra_version }}"
```

You'll need the scalatra-auth dependency in your built.sbt for all subsequent
examples. `scalatra-auth` handles both cookie-based auth and HTTP basic auth.

## HTTP Basic Auth example

First things first. Let's try the simplest possible example: HTTP basic auth.


### Write the strategy

The class `OurBasicAuthStrategy` implements Scalatra's built-in `BasicAuthStrategy`
trait, which itself extends `ScentryStrategy`. Ultimately, you'll want to extend
`ScentryStrategy` when writing your own authentication logic, but let's see the
simple case first.

```scala
package org.scalatra
package auth

import OurImplicits._
import com.mongodb.casbah.Imports._
import javax.servlet.http.{HttpServletResponse, HttpServletRequest}
import net.iharder.Base64
import org.scalatra.{ScalatraKernel}
import com.mojolly.backchat.model.User
import akka.util.Logging
import org.scalatra.auth.{ScentrySupport, ScalatraKernelProxy, ScentryStrategy}


class OurBasicAuthStrategy[DBObject](protected val app: ScalatraKernelProxy, realm: String)
  extends BasicAuthStrategy(app, realm) {

  protected def validate(userName: String, password: String): Option[UserType] = {
    User.login(userName, password)
  }

  protected def getUserId(user: DBObject) = user.id.toString
}
```
The key thing here is the `validate` method, which attempts to log a user in
using methods on a User model. This might be used in a `login` action on one
of your controllers, to figure out whether a user should be granted a session.

### An AuthenticationSupport trait

The next thing you'll need is the trait that ties together `OurBasicAuthStrategy`
with `ScentrySupport`. It might look like this:

```scala
package org.scalatra.auth

import OurImplicits._
import com.mongodb.casbah.Imports._
import org.scalatra.auth.{ScentryConfig, ScentrySupport}
import org.scalatra.ScalatraKernel

trait AuthenticationSupport extends ScentrySupport[DBObject] with BasicAuthSupport { self: ScalatraKernel =>

  val realm = Config.serviceName
  protected def contextPath = request.getContextPath

  protected def fromSession = { case id: String => User.findById(id) getOrElse null  }
  protected def toSession   = { case usr: DBObject => usr.id.toString }

  protected val scentryConfig = (new ScentryConfig {}).asInstanceOf[ScentryConfiguration]

  override protected def registerAuthStrategies = {
    scentry.registerStrategy('Basic, app => new OurBasicAuthStrategy(app, realm))
  }

}
```

The `AuthenticationSupport` trait has an extremely basic way of getting a User
object from the session, and of pushing the user's id into the session. It also
takes care of registering our single available strategy with Scentry.

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
        <p><a href="/myapi/linked" >click</a></p>
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

A few things are worth mentioning here. The `basicAuth` method comes from the
pre-built `BasicAuthStrategy` included in Scalatra. If you're defining your own
authentication logic, you'll need to implement a similar method yourself.

Here's what `basicAuth` actually does:

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

Some pretty simple setting of HTTP headers and status codes. If you were
implementing cookie-based auth instead, you might be checking for the presence
of a session identifier token.

You might choose to run the `basicAuth` method in a `before()` filter in your
controller, rather than hitting it in each action, to secure every method in
`MyController`. You might even set it up as a `before()` filter in the
`AuthenticationSupport` trait, which would automatically secure any controller
which mixed in the trait. As with most things in Scalatra, it's up to you.

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
