---
aliases:
  - /2.2/guides/persistence/squeryl.html
title: Squeryl
---

[Squeryl](http://squeryl.org/) is a Scala object-relational mapper and
domain-specific language for talking to databases in a succinct and
typesafe way.

We'll use Squeryl with [C3P0](http://www.mchange.com/projects/c3p0/),
a "butt-simple" connection pooling library.

<div class="alert alert-info">
  <span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
  See
  <a href="https://github.com/scalatra/scalatra-website-examples/tree/master/2.2/persistence/scalatra-squeryl">scalatra-squeryl</a>
  for an example project which expands on the concepts explained in this guide.
</div>

## Dependencies

```scala
"org.squeryl" %% "squeryl" % "0.9.5-6",
"com.h2database" % "h2" % "1.3.166",
"c3p0" % "c3p0" % "0.9.1.2"
```

## Set up a C3P0 connection pool

Setting up C3P0 connection pool in Scalatra is just a matter of making
a trait which does your database initialization. The initialization
code itself can follow the
[C3P0 init example](http://www.mchange.com/projects/c3p0/#quickstart)
pretty closely:

```scala
package org.scalatra.example.data

import com.mchange.v2.c3p0.ComboPooledDataSource
import org.squeryl.adapters.{H2Adapter, MySQLAdapter}
import org.squeryl.Session
import org.squeryl.SessionFactory
import org.slf4j.LoggerFactory

trait DatabaseInit {
  val logger = LoggerFactory.getLogger(getClass)

  val databaseUsername = "root"
  val databasePassword = ""
  val databaseConnection = "jdbc:h2:mem:squeryltryout"

  var cpds = new ComboPooledDataSource

  def configureDb() {
    cpds.setDriverClass("org.h2.Driver")
    cpds.setJdbcUrl(databaseConnection)
    cpds.setUser(databaseUsername)
    cpds.setPassword(databasePassword)

    cpds.setMinPoolSize(1)
    cpds.setAcquireIncrement(1)
    cpds.setMaxPoolSize(50)

    SessionFactory.concreteFactory = Some(() => connection)

    def connection = {
      logger.info("Creating connection with c3po connection pool")
      Session.create(cpds.getConnection, new H2Adapter)
    }
  }

  def closeDbConnection() {
    logger.info("Closing c3po connection pool")
    cpds.close()
  }
}
```

You'll likely want to load up your database creds by reading a config file,
but that's up to you. The `configureDb()` method will create a connection pool when it's called, and in this case it'll use an in-memory H2 database with the `H2Adapter`, so that we don't have any dependencies on an external database server. Replace the connection string, driver, and adapter in this file if you're using MySQL, PostgreSQL, or something else. Info is available on the

Inside the `configureDb` method, Squeryl's `SessionFactory` gets wired together
with C3P0's `ComboPooledDataSource`.

## Initialize the session pool

Now that the session pool is defined, it'll need to be initialized. The best
place to do this initialization work is in your application's ScalatraBootstrap
init method.

Open up `src/main/scala/ScalatraBootstrap.scala`, and import your `DatabaseInit`
trait. In the case of this example, we'll need
`import com.futurechimps.squeryli.data.DatabaseInit`.

Then mix the `DatabaseInit` trait into `ScalatraBootstrap`, so it looks like this:

```scala
import org.scalatra.LifeCycle
import javax.servlet.ServletContext
import org.scalatra.example.ArticlesController
import org.scalatra.example.data.DatabaseInit

class ScalatraBootstrap extends LifeCycle with DatabaseInit {

  override def init(context: ServletContext) {
    configureDb()
    context mount (new ArticlesController, "/*")
  }

  override def destroy(context:ServletContext) {
    closeDbConnection()
  }
}
```

The `configureDb` method is called when your application starts, and during the
`destroy` phase of your application, the database connections are closed down
again.

## Setting up database session support

Let's make a database session support trait which can be used in your
controllers. A complete one with imports can look like this:

```scala
package org.scalatra.example.data

import org.squeryl.Session
import org.squeryl.SessionFactory
import org.scalatra._

object DatabaseSessionSupport {
  val key = {
    val n = getClass.getName
    if (n.endsWith("$")) n.dropRight(1) else n
  }
}

trait DatabaseSessionSupport { this: ScalatraBase =>
  import DatabaseSessionSupport._

  def dbSession = request.get(key).orNull.asInstanceOf[Session]

  before() {
    request(key) = SessionFactory.newSession
    dbSession.bindToCurrentThread
  }

  after() {
    dbSession.close
    dbSession.unbindFromCurrentThread
  }

}
```

The key things here are the `before` and `after` filters which open a new database
session on each request and close it after the request is finished.

## Mixing database session support into your servlet

Now that it's defined, you can mix your new DatabaseSessionSupport trait into
any of your controllers, e.g.

```scala
class ArticlesController extends ScalatraServlet with DatabaseSessionSupport
```

Any controller with this trait can now use Squeryl models.

For full documentation of Squeryl, see the project website at
[squeryl.org](http://squeryl.org).
