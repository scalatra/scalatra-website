---
title: Slick
---

[Slick](http://slick.typesafe.com/) is a database library for relational databases. In the following guide we will see how to integrate it in a Scalatra application.

<div class="alert alert-info">
  <span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
  This guide uses Scalatra 2.4.0.M2 (Milestone) Slick 3.0.0-RC1 (Release Candidate). You may want to check for a newer version.
</div>

<div class="alert alert-info">
  <span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
  See
  <a href="https://github.com/scalatra/scalatra-website-examples/tree/master/2.4/persistence/scalatra-slick">scalatra-slick</a>
  for a minimal and standalone project containing the example in this guide.
</div>


## Project Overview

The sample project contains a minimal setup. For this guide the following files are important:

  * `project/build.scala`: we configure the SBT build and the dependencies here.
  * `src/main/scala/slickexample/slick.scala`: the scalatra application.
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
        │   ├── slickexample
        │   │   └── slick.scala      // main code goes here
        │   └── ScalatraBootstrap.scala
        └── webapp
            └── WEB-INF
                └── web.xml

```

## SBT Configuration

Let us start with the SBT setup by editing `project/build.scala`. Slick officially supports Scala 2.10-2.11, so let's use Scala 2.11:

```scala
scalaVersion := "2.11.5"
```

Also you need to use an appropriate Scalatra version, for example `2.4.0.M2` which supports Scala 2.11:

```scala
libraryDependencies += "org.scalatra" %% "scalatra" % "2.4.0.M2"
```

For this guide we choose the [H2 Database](http://www.h2database.com/html/main.html), so we need to add a dependency to it too.

```scala

libraryDependencies ++= Seq(
  "com.typesafe.slick" %% "slick" % "3.0.2",
  "com.h2database" % "h2" % "1.4.181"
)
```

Since we want to use connection pooling, we also need to add [c3p0](http://www.mchange.com/projects/c3p0/):

```scala
libraryDependencies += "com.mchange" % "c3p0" % "0.9.5.1"
```

SBT is all set up. Lets proceed to the code.


## Slick Setup

We put the database initialization code into `ScalatraBootstrap`. This is the class which gets executed when the web application is started. We do the following here:

  * Setup a connection pool when the Scalatra application starts. The configuration is load from `src/main/resources/c3p0.properties`. c3p0 loads the .properties file by searching the classpath.
  * Stop the connection pool when the Scalatra application shuts down.
  * Create a `Database` object which represents the database. All database actions are run using that object.
  * Create and mount the application.

```scala
import com.mchange.v2.c3p0.ComboPooledDataSource
import org.slf4j.LoggerFactory
import slickexample._
import org.scalatra._
import javax.servlet.ServletContext
import slick.driver.JdbcDriver.api._

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
    val db = Database.forDataSource(cpds)   // create the Database object
    context.mount(new SlickApp(db), "/*")   // create and mount the Scalatra application
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

We create two Tables, one for the suppliers and another one for the coffees table:

```scala
import slick.driver.JdbcDriver.api._

object Tables {

  // Definition of the SUPPLIERS table
  class Suppliers(tag: Tag) extends Table[(Int, String, String, String, String, String)](tag, "SUPPLIERS") {
    def id = column[Int]("SUP_ID", O.PrimaryKey) // This is the primary key column
    def name = column[String]("SUP_NAME")
    def street = column[String]("STREET")
    def city = column[String]("CITY")
    def state = column[String]("STATE")
    def zip = column[String]("ZIP")

    // Every table needs a * projection with the same type as the table's type parameter
    def * = (id, name, street, city, state, zip)
  }

  // Definition of the COFFEES table
  class Coffees(tag: Tag) extends Table[(String, Int, Double, Int, Int)](tag, "COFFEES") {
    def name = column[String]("COF_NAME", O.PrimaryKey)
    def supID = column[Int]("SUP_ID")
    def price = column[Double]("PRICE")
    def sales = column[Int]("SALES")
    def total = column[Int]("TOTAL")
    def * = (name, supID, price, sales, total)

    // A reified foreign key relation that can be navigated to create a join
    def supplier = foreignKey("SUP_FK", supID, suppliers)(_.id)
  }

  // Table query for the SUPPLIERS table, represents all tuples of that table
  val suppliers = TableQuery[Suppliers]

  // Table query for the COFFEES table
  val coffees = TableQuery[Coffees]

  // Other queries and actions ...

}
```

Slick offers a query language to express database queries and Database I/O Actions (DBIOAction) which are basically composable database operations. A single Action can for example represent one or more queries. They can be composed using the `DBIO.seq` method

```scala
// Query, implicit inner join coffees and suppliers, return their names
val findCoffeesWithSuppliers = {
  for {
    c <- coffees
    s <- c.supplier
  } yield (c.name, s.name)
}

// DBIO Action which runs several queries inserting sample data
val insertSupplierAndCoffeeData = DBIO.seq(
  Tables.suppliers += (101, "Acme, Inc.", "99 Market Street", "Groundsville", "CA", "95199"),
  Tables.suppliers += (49, "Superior Coffee", "1 Party Place", "Mendocino", "CA", "95460"),
  Tables.suppliers += (150, "The High Ground", "100 Coffee Lane", "Meadows", "CA", "93966"),
  Tables.coffees ++= Seq(
    ("Colombian", 101, 7.99, 0, 0),
    ("French_Roast", 49, 8.99, 0, 0),
    ("Espresso", 150, 9.99, 0, 0),
    ("Colombian_Decaf", 101, 8.99, 0, 0),
    ("French_Roast_Decaf", 49, 9.99, 0, 0)
  )
)

// DBIO Action which creates the schema
val createSchemaAction = (suppliers.schema ++ coffees.schema).create

// DBIO Action which drops the schema
val dropSchemaAction = (suppliers.schema ++ coffees.schema).drop

// Create database, composing create schema and insert sample data actions
val createDatabase = DBIO.seq(createSchemaAction, insertSupplierAndCoffeeData)
```

Now we can create some routes:

  * `GET /db/create-db` creates the tables and inserts sample data
  * `GET /db/drop-db` drops the tables
  * `GET /coffees` queries the database

We put the routes in a `SlickRoutes` trait which we later add to the application. A DBIO Action is run through the Database object's `run` method. The operations are run asynchronously and a Future is returned. Since we are returning the Future directly from the routes, we teach Scalatra how to handle a Future as result by mixing in the FutureSupport trait. When a Future is returned, the HTTP request is put to asynchronous mode and parked until the result is available. For more details about handling asynchronous operations, see the async guides ([Akka](../guides/async/akka.html), [Atmosphere](../guides/async/akka.html)). The value `db` is later provided by the Scalatra application.


```scala
import org.scalatra.{ScalatraBase, FutureSupport, ScalatraServlet}

import slick.driver.JdbcDriver.api._

import scala.concurrent.ExecutionContext.Implicits.global

trait SlickRoutes extends ScalatraBase with FutureSupport {

  def db: Database

  get("/db/create-tables") {
    db.run(Tables.createSchemaAction)
  }

  get("/db/load-data") {
    db.run(Tables.insertSupplierAndCoffeeData)
  }

  get("/db/drop-tables") {
    db.run(Tables.dropSchemaAction)
  }

  get("/coffees") {
    // run the action and map the result to something more readable
    db.run(Tables.findCoffeesWithSuppliers.result) map { xs =>
      contentType = "text/plain"
      xs map { case (s1, s2) => f"  $s1 supplied by $s2" } mkString "\n"
    }
  }

}

```



Finally let's create the application:

```scala
class SlickApp(val db: Database) extends ScalatraServlet with FutureSupport with SlickRoutes {

  protected implicit def executor = scala.concurrent.ExecutionContext.Implicits.global

}
```

Congratulations, you have now a basic Slick integration working! Feel free to do your own modifications.
