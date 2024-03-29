---
title: MongoDb
layout: guides-2.8
---

[MongoDb](http://mongodb.org) is an open-source document database, and one of the most widely deployed NoSQL databases. It is extremely easy to use with Scalatra.

There are multiple Scala clients for MongoDb, and they come with varying levels of complexity. Here are some of them, as listed in MongoDb's [Scala Language Center](http://docs.mongodb.org/ecosystem/drivers/scala/).

* [MongoDB Scala Driver](https://mongodb.github.io/mongo-scala-driver/)
* [Lift-mongodb](https://www.assembla.com/wiki/show/liftweb/MongoDB)
* [Rogue](https://github.com/foursquare/fsqio/tree/master/src/jvm/io/fsq/rogue)
* [Salat](https://github.com/salat/salat)

## Getting going with MongoDB Scala Driver

MongoDb requires very little setup. Assuming you've got Mongo installed already, getting it working with Scalatra is as follows.

<div class="alert alert-info">
  <span class="badge badge-info"><i class="glyphicon glyphicon-flag"></i></span>
  See
  <a href="https://github.com/scalatra/scalatra-website-examples/tree/master/{{<2-8-scalatra_short_version>}}/persistence/scalatra-mongo">scalatra-mongo</a>
  for a minimal and standalone project containing the example in this guide.
</div>

We'll use the officially-supported MongoDB Scala Driver library, but any of the others should work in basically the same way.

### Dependencies

To make the following example code work, add the following dependencies to your
`build.sbt`:

```sbt
libraryDependencies ++= Seq(
  "org.mongodb.scala" %% "mongo-scala-driver" % "2.8.0",
  "org.mongodb.scala" %% "mongo-scala-bson" % "2.8.0",
  "org.mongodb" % "bson" % "3.12.0",
  "org.mongodb" % "mongodb-driver-core" % "3.12.0",
  "org.mongodb" % "mongodb-driver-async" % "3.12.0"
)
```

### Setup in ScalatraBootstrap

First, make sure you start a connection to MongoDb when your application initializes. You do this by putting a bit of code in your `init` method in `src/main/scala/ScalatraBootstrap`:

```scala
import org.scalatra._
import javax.servlet.ServletContext
import org.mongodb.scala.MongoClient
import org.scalatra.example.MongoController

class ScalatraBootstrap extends LifeCycle {
  override def init(context: ServletContext) = {

     // As you can see, there's not much to do in order to get MongoDb working with Scalatra.
     // We're connecting with default settings - localhost on port 27017 -
     // by calling MongoClient() with no arguments.
    val mongoClient =  MongoClient()
    val mongoColl = mongoClient.getDatabase("mydb").getCollection("test_data")

    // pass a reference to the Mongo collection into your servlet when you mount it at application start:
    context.mount(new MongoController(mongoColl), "/*")

  }
}
```

The `mongoColl` parameter in `context.mount(new MongoController(mongoColl), "/*")` passes a reference to the MongoDb collection to your controller. At that point, you're more or less ready to start working with MongoDb in your application. A controller which does some very simple MongoDb operations might look like this:


```scala
package org.scalatra.example

import org.scalatra._

// MongoDb-specific imports
import com.mongodb.casbah.Imports._

class MongoController(mongoColl: MongoCollection) extends ScalatraMongoExample {

  /**
   * Insert a new object into the database. You can use the following from your console to try it out:
   * curl -i -H "Accept: application/json" -X POST -d "key=super&value=duper" http://localhost:8080/insert
   */
  post("/insert") {
    val key = params("key")
    val value = params("value")
    val newObj = Document(key -> value)
    collection.insertOne(newObj).results()
  }

  /**
   * Retrieve everything in the MongoDb collection we're currently using.
   */
  get("/") {
    collection.find().results().map(doc => doc.toJson)
  }

  /**
   * Query for the first object which matches the values given. If you copy/pasted the insert example above,
   * try http://localhost:8080/query/super/duper in your browser.
   */
  get("/query/:key/:value") {
    val q = Document(params("key") -> params("value"))
    collection.find(q).first().headResult().toJson()
  }

}
```

Once you've got the `MongoCollection` available inside your controller, you can use Mongo and Scalatra together seamlessly. If you would like to learn more about Casbah, proceed to the [MongoDB Scala Driver Tutorial](https://mongodb.github.io/mongo-scala-driver/2.8/getting-started/).

Alternately, you can apply the same basic techniques in order to get started with any of the Scala MongoDb libraries. Each library has its strengths and weaknesses, and the choice of which one to use will come down largely to your programming style.
