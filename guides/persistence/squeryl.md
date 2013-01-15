---
layout: guide
title: Squeryl | Models | Scalatra guides
---

<div class="page-header">
  <h1>Squeryl</h1>
</div>

[Squeryl](http://squeryl.org/) is a Scala object-relational mapper and
domain-specific language for talking to databases in a succinct and
typesafe way.

We'll use Squeryl with [C3P0](http://www.mchange.com/projects/c3p0/),
a "butt-simple" connection pooling library.

<div class="alert alert-info">
  <span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
  See
  <a href="https://github.com/futurechimp/ScalatraSqueryl/tree/2.2">scalatra-squeryl</a>
  for a minimal and standalone project containing the example in this guide.
</div>

## Dependencies

```scala
"org.squeryl" %% "squeryl" % "0.9.5-6", 
"mysql" % "mysql-connector-java" % "5.1.22",      // for MySQL, or use
"postgresql" % "postgresql" % "9.1-901-1.jdbc4",  // for Postgres
"c3p0" % "c3p0" % "0.9.1.2"
```

## Set up a C3P0 connection pool

Setting up C3P0 connection pool in Scalatra is just a matter of making
a trait which does your database initialization. The initialization
code itself can follow the 
[C3P0 init example](http://www.mchange.com/projects/c3p0/#quickstart)
pretty closely:

```scala
package com.futurechimps.squeryli.data // substitute your package here!

import com.mchange.v2.c3p0.ComboPooledDataSource
import org.squeryl.adapters.MySQLAdapter
import org.squeryl.Session
import org.squeryl.SessionFactory
import org.slf4j.LoggerFactory

trait DatabaseInit {
  val logger = LoggerFactory.getLogger(getClass)

  val databaseUsername = "root"
  val databasePassword = ""
  val databaseConnection = "jdbc:mysql://localhost:3306/squeryltryout"

  var cpds = new ComboPooledDataSource

  def configureDb() {
    cpds.setDriverClass("com.mysql.jdbc.Driver")
    cpds.setJdbcUrl(databaseConnection)
    cpds.setUser(databaseUsername)
    cpds.setPassword(databasePassword)

    cpds.setMinPoolSize(1)
    cpds.setAcquireIncrement(1)
    cpds.setMaxPoolSize(50)

    SessionFactory.concreteFactory = Some(() => connection)

    def connection = {
      logger.info("Creating connection with c3po connection pool")
      Session.create(cpds.getConnection, new MySQLAdapter)
    }
  }

  def closeDbConnection() {
    logger.info("Closing c3po connection pool")
    cpds.close()
  }
}


```

You'll likely want to load up your database creds by reading a config file,
but that's up to you. The `configureDb()` method will create a connection pool when it's called, and in this case it'll use the `MySQLAdapter`. 

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
class ScalatraBootstrap extends LifeCycle with DatabaseInit {

  override def init(context: ServletContext) {
    configureDb()
    context mount (new Articles, "/*")
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
package com.futurechimps.squeryli.data

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
class Articles extends ScalatraServlet with DatabaseSessionSupport
```

Any controller with this trait can now use Squeryl models.

For full documentation of Squeryl, see the project website at
[squeryl.org](http://squeryl.org).