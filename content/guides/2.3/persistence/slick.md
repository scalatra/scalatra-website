---
aliases:
  - /2.3/guides/persistence/slick.html
title: Slick
---

[Slick](http://slick.typesafe.com/) is a database library for relational databases. In the following guide we will see how to integrate it in a Scalatra application.

<div class="alert alert-info">
  <span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
  See
  <a href="https://github.com/scalatra/scalatra-website-examples/tree/master/2.2/persistence/scalatra-slick">scalatra-slick</a>
  for a minimal and standalone project containing the example in this guide.
</div>


## Project Overview

The sample project contains a minimal setup. For this guide the following files are important:

  * `project/build.scala`: we configure the SBT build and the dependencies here.
  * `src/main/scala/slicksupport/slick.scala`: the scalatra application.
  * `src/main/resources/c3p0.properties`: the connection pool is configured here.

```
.
├── project
│   ├── build.properties
│   ├── build.scala                  // sbt build configuration
│   └── plugins.sbt
└── src
    └── main
        ├── resources
        │   ├── c3p0.properties      // connection pool configuration
        │   └── logback.xml
        ├── scala
        │   ├── slicksupport
        │   │   └── slick.scala      // main code goes here
        │   └── ScalatraBootstrap.scala
        └── webapp
            └── WEB-INF
                └── web.xml

```

## SBT Configuration

Let us start with the SBT setup by editing `project/build.scala`. Slick officially supports Scala 2.10-2.11, so let's use Scala 2.11:

```scala
scalaVersion := "2.11.0"
```

Also you need to use an appropriate Scalatra version, for example `2.3.0` which supports Scala 2.11:

```scala
libraryDependencies += "org.scalatra" %% "scalatra" % "2.3.0"
```

For this guide we choose the [H2 Database](http://www.h2database.com/html/main.html), so we need to add a dependency to it too.

```scala

libraryDependencies ++= Seq(
  "com.typesafe.slick" %% "slick" % "2.1.0",
  "com.h2database" % "h2" % "1.3.166"
)
```

Since we want to use connection pooling, we also need to add [c3p0](http://www.mchange.com/projects/c3p0/):

```scala
libraryDependencies += "c3p0" % "c3p0" % "0.9.1.2"
```

SBT is all set up. Lets proceed to the code.


## Slick Setup

We put the database initialization code into `ScalatraBootstrap`. This is the class which gets executed when the web application is started. We do the following here:

  * Setup a connection pool when the Scalatra application starts. The configuration is load from `src/main/resources/c3p0.properties`. c3p0 loads the .properties file by searching the classpath.
  * Stop the connection pool when the Scalatra application shuts down.
  * Provide a `scala.slick.session.Database` instance in `db` which is a wrapper around the connection pool's `DataSource` and serves as source for database sessions.
  * Create and mount the application.

```scala
import app._
import org.scalatra._
import javax.servlet.ServletContext

import com.mchange.v2.c3p0.ComboPooledDataSource
import org.slf4j.LoggerFactory
import scala.slick.jdbc.JdbcBackend.Database

/**
 * This is the ScalatraBootstrap bootstrap file. You can use it to mount servlets or
 * filters. It's also a good place to put initialization code which needs to
 * run at application start (e.g. database configurations), and init params.
 */
class ScalatraBootstrap extends LifeCycle {

  val logger = LoggerFactory.getLogger(getClass)

  val cpds = new ComboPooledDataSource
  logger.info("Created c3p0 connection pool")

  override def init(context: ServletContext) {
    val db = Database.forDataSource(cpds)  // create a Database which uses the DataSource
    context.mount(SlickApp(db), "/*")      // mount the application and provide the Database
  }

  private def closeDbConnection() {
    logger.info("Closing c3po connection pool")
    cpds.close
  }

  override def destroy(context: ServletContext) {
    super.destroy(context)
    closeDbConnection
  }
}
```

The connection pool configuration `src/main/resources/c3p0.properties` looks like this:

```ini
c3p0.driverClass=org.h2.Driver
c3p0.jdbcUrl=jdbc:h2:mem:test
c3p0.user=root
c3p0.password=
c3p0.minPoolSize=1
c3p0.acquireIncrement=1
c3p0.maxPoolSize=50
```

## Usage

Now we are ready to start with the sample application. The code serves only as a proof of concept. For more detailed information about Slick's features take a look at the [documentation](http://slick.typesafe.com/docs/).

We create two tables, one for suppliers and another one for coffees:

```scala
import scala.slick.driver.H2Driver.simple._

object Tables {
  // Definition of the SUPPLIERS table
  class Suppliers(tag: Tag) extends Table[(Int, String, String, String, String, String)](tag, "SUPPLIERS") {
    def id      = column[Int]("SUP_ID", O.PrimaryKey) // This is the primary key column
    def name    = column[String]("SUP_NAME")
    def street  = column[String]("STREET")
    def city    = column[String]("CITY")
    def state   = column[String]("STATE")
    def zip     = column[String]("ZIP")

    // Every table needs a * projection with the same type as the table's type parameter
    def * = (id, name, street, city, state, zip)

  }
  val suppliers = TableQuery[Suppliers]

  // Definition of the COFFEES table
  class Coffees(tag: Tag) extends Table[(String, Int, Double, Int, Int)](tag, "COFFEES") {
    def name  = column[String]("COF_NAME", O.PrimaryKey)
    def supID = column[Int]("SUP_ID")
    def price = column[Double]("PRICE")
    def sales = column[Int]("SALES")
    def total = column[Int]("TOTAL")
    def *     = (name, supID, price, sales, total)

    // A reified foreign key relation that can be navigated to create a join
    def supplier = foreignKey("SUP_FK", supID, suppliers)(_.id)
  }
  val coffees = TableQuery[Coffees]
}
```

Now we can create some routes:

  * `GET /db/create-tables` creates the tables
  * `GET /db/drop-tables` drops the tables
  * `GET /db/load-data` loads sample data into the tables
  * `GET /coffees` queries the database

We put the routes in a trait which we later add to the application. Note that we wrap code which uses the database in a session with `db withDynSession { .. }`. The value `db` is later provided by the application.

```scala
import org.scalatra._

import Tables._
import scala.slick.driver.H2Driver.simple._
import scala.slick.jdbc.JdbcBackend.Database.dynamicSession

trait SlickRoutes extends ScalatraServlet {

  val db: Database

  get("/db/create-tables") {
    db withDynSession {
      (suppliers.ddl ++ coffees.ddl).create
    }
  }

  get("/db/load-data") {
    db withDynSession {
      // Insert some suppliers
      suppliers.insert(101, "Acme, Inc.", "99 Market Street", "Groundsville", "CA", "95199")
      suppliers.insert(49, "Superior Coffee", "1 Party Place", "Mendocino", "CA", "95460")
      suppliers.insert(150, "The High Ground", "100 Coffee Lane", "Meadows", "CA", "93966")

      // Insert some coffees (using JDBC's batch insert feature, if supported by the DB)
      coffees.insertAll(
        ("Colombian", 101, 7.99, 0, 0),
        ("French_Roast", 49, 8.99, 0, 0),
        ("Espresso", 150, 9.99, 0, 0),
        ("Colombian_Decaf", 101, 8.99, 0, 0),
        ("French_Roast_Decaf", 49, 9.99, 0, 0)
      )
    }
  }

  get("/db/drop-tables") {
    db withDynSession {
      (suppliers.ddl ++ coffees.ddl).drop
    }
  }

  get("/coffees") {
    db withDynSession {
      val q3 = for {
        c <- coffees
        s <- c.supplier
      } yield (c.name.asColumnOf[String], s.name.asColumnOf[String])

      contentType = "text/html"
      q3.list.map { case (s1, s2) => "  " + s1 + " supplied by " + s2 } mkString "<br />"
    }
  }

}
```

Finally let's create the application:

```scala
case class SlickApp(db: Database) extends ScalatraServlet with SlickRoutes
```

Congratulations, you have now a basic Slick integration working! Feel free to do your own modifications.
