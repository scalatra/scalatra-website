---
layout: guide
title: Slick | Models | Scalatra guides
---

<div class="page-header">
  <h1>Slick</h1>
</div>


[Slick](http://slick.typesafe.com/) is a database library for relational databases. In the following guide we will see how to integrate it in a Scalatra application.

<div class="alert alert-info">
  <span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
  See
  <a href="https://github.com/scalatra/scalatra-website-examples/tree/master/2.2">scalatra-slick</a>
  for a minimal and standalone project containing the example in this guide.
</div>


## Project Overview

The sample project contains a minimal setup. For this guide the following files are important:

  * `build.sbt`: we configure the SBT build and the dependencies here.
  * `src/main/scala/slicksupport/slick.scala`: the scalatra application and the support trait.
  * `src/main/resources/c3p0.properties`: the connection pool is configured here.

```
.
├── build.sbt                        // sbt build configuration
├── project
│   ├── build.properties
│   └── plugins.sbt
└── src
    └── main
        ├── resources
        │   ├── c3p0.properties      // connection pool configuration
        │   └── logback.xml
        ├── scala
        │   ├── slicksupport
        │   │   └── slick.scala      // main code goes here
        │   └── Scalatra.scala
        └── webapp
            └── WEB-INF
                └── web.xml

```

## SBT Configuration

Let us start with the SBT setup by editing `build.sbt`. Slick targets Scala 2.10, so the SBT build needs to use it:

```scala
scalaVersion := "2.10.0"
```

Also you need to use an appropriate Scalatra version, for example `2.2-RC3` which supports Scala 2.10:

```scala
libraryDependencies += "org.scalatra" %% "scalatra" % "2.2.0-RC3"
```

For Slick we need to add the `Sonatype releases` repository and dependencies to Slick itself. For this guide we choose the [H2 Database](http://www.h2database.com/html/main.html), so we need to add a dependency to it too.

```scala
resolvers += "Sonatype Releases"  at "http://oss.sonatype.org/content/repositories/releases")


libraryDependencies ++= Seq(
  "com.typesafe" % "slick_2.10" % "1.0.0-RC1",
  "com.h2database" % "h2" % "1.3.166"
)
```

Since we want to use connection pooling, we also need to add [c3p0](http://www.mchange.com/projects/c3p0/):

```scala
libraryDependencies += "c3p0" % "c3p0" % "0.9.1.2"
```

SBT is all set up. Lets proceed to the code.


## Slick Setup

The following listing shows `SlickSupport` from `src/main/scala/slicksupport/slick.scala`. This trait adds the following features:

  * Setup a connection pool when the Scalatra application starts. The configuration is load from `src/main/resources/c3p0.properties`
  * Stop the connection pool when the Scalatra application shuts down.
  * Provides a `scala.slick.session.Database` instance in `db` which is a wrapper around the connection pool's `DataSource` and serves as source for database sessions.

```scala
import org.scalatra.ScalatraServlet
import org.slf4j.LoggerFactory

import com.mchange.v2.c3p0.ComboPooledDataSource
import java.util.Properties

import scala.slick.driver.H2Driver.simple._
import Database.threadLocalSession

trait SlickSupport extends ScalatraServlet {

  val logger = LoggerFactory.getLogger(getClass)

  val cpds = {
    val props = new Properties
    props.load(getClass.getResourceAsStream("/c3p0.properties"))
    val cpds = new ComboPooledDataSource
    cpds.setProperties(props)
    logger.info("Created c3p0 connection pool")
    cpds
  }

  def closeDbConnection() {
    logger.info("Closing c3po connection pool")
    cpds.close
  }

  val db = Database.forDataSource(cpds)

  override def destroy() {
    super.destroy()
    closeDbConnection
  }
}
```

The connection pool configuration `src/main/resource/c3p0.properties` looks like this:

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
// Definition of the SUPPLIERS table
object Suppliers extends Table[(Int, String, String, String, String, String)]("SUPPLIERS") {
  def id = column[Int]("SUP_ID", O.PrimaryKey) // This is the primary key column
  def name = column[String]("SUP_NAME")
  def street = column[String]("STREET")
  def city = column[String]("CITY")
  def state = column[String]("STATE")
  def zip = column[String]("ZIP")

  // Every table needs a * projection with the same type as the table's type parameter
  def * = id ~ name ~ street ~ city ~ state ~ zip
}

// Definition of the COFFEES table
object Coffees extends Table[(String, Int, Double, Int, Int)]("COFFEES") {
  def name = column[String]("COF_NAME", O.PrimaryKey)
  def supID = column[Int]("SUP_ID")
  def price = column[Double]("PRICE")
  def sales = column[Int]("SALES")
  def total = column[Int]("TOTAL")
  def * = name ~ supID ~ price ~ sales ~ total

  // A reified foreign key relation that can be navigated to create a join
  def supplier = foreignKey("SUP_FK", supID, Suppliers)(_.id)
}
```

Now we can create some routes:

  * `GET /db/create-tables` creates the tables
  * `GET /db/drop-tables` drops the tables
  * `GET /db/load-data` loads sample data into the tables
  * `GET /coffees` queries the database

Note that we wrap code which uses the database in a session with `db withSession { .. }`. The value `db` is the one from the `SlickSupport` trait which the applications mixes in.

```scala
class SlickRoutes extends ScalatraServlet with SlickSupport {

  get("/db/create-tables") {
    db withSession {
      (Suppliers.ddl ++ Coffees.ddl).create
    }
  }

  get("/db/load-data") {
    db withSession {
      // Insert some suppliers
      Suppliers.insert(101, "Acme, Inc.", "99 Market Street", "Groundsville", "CA", "95199")
      Suppliers.insert(49, "Superior Coffee", "1 Party Place", "Mendocino", "CA", "95460")
      Suppliers.insert(150, "The High Ground", "100 Coffee Lane", "Meadows", "CA", "93966")

      // Insert some coffees (using JDBC's batch insert feature, if supported by the DB)
      Coffees.insertAll(
        ("Colombian", 101, 7.99, 0, 0),
        ("French_Roast", 49, 8.99, 0, 0),
        ("Espresso", 150, 9.99, 0, 0),
        ("Colombian_Decaf", 101, 8.99, 0, 0),
        ("French_Roast_Decaf", 49, 9.99, 0, 0)
      )
    }
  }

  get("/db/drop-tables") {
    db withSession {
      (Suppliers.ddl ++ Coffees.ddl).drop
    }
  }

  get("/coffees") {
    db withSession {
      val q3 = for {
        c <- Coffees
        s <- c.supplier
      } yield (c.name.asColumnOf[String], s.name.asColumnOf[String])

      q3.list.map { case (s1, s2) => "  " + s1 + " supplied by " + s2 } mkString "<br />"
    }
  }
}
```

Congratulations, you have now a basic Slick integration working! Feel free to do your own modifications.
