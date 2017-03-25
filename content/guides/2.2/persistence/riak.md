---
aliases:
  - /2.2/guides/persistence/riak.html
title: Riak
---

[Riak](http://riak.basho.org) is an open source, distributed database.  

There are multiple clients for Riak, with varying levels of complexity, Scala integration, and maturity.

* [Basho's official riak-java-client](https://github.com/basho/riak-java-client)
* [Scalapenos riak-scala-client](http://riak.scalapenos.com/)
* [Stackmob scaliak](https://github.com/stackmob/scaliak)

## Getting going with Basho's riak-java-client

Assuming you've got Riak installed already, getting it working with Scalatra is as follows.

<div class="alert alert-info">
  <span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
  See
  <a href="https://github.com/scalatra/scalatra-website-examples/tree/master/2.2/persistence/riak-example">riak-example</a>
  for a minimal and standalone project containing the example in this guide.
</div>

We'll use Basho's officially-supported riak-java-client library.

### Reference riak-client from your build file

First, add the library to `project/build.scala`:

```scala
libraryDependencies ++= Seq(
        "com.basho.riak" % "riak-client" % "1.1.0",
        "org.scalatra" %% "scalatra" % ScalatraVersion,
```

### Start a connection pool at application start

Next, we'll make a `RiakInit` trait which we can use to initialize a Riak bucket when our application starts:

```scala
package org.scalatra.example

import com.basho.riak.client.RiakFactory
import org.slf4j.LoggerFactory

/**
 * A trait we mix into Scalatra's initalization lifecycle to ensure we've got
 * a Riak client and a bucket set up after the application starts.
 */
trait RiakJavaClientInit {
  val logger = LoggerFactory.getLogger(getClass)

  // get access to a bucket using a binary connection and the riak-java-client
  val riakClient = RiakFactory.pbcClient

  def configureRiakJavaClient() {
    logger.info("Creating a Riak bucket")

    // make sure we've got a bucket to use
    riakClient.createBucket("myBucket").execute
  }


  def closeRiakJavaClient() {
    logger.info("Closing Riak client")

    riakClient.shutdown()
  }

}
```

With this trait in place, we can fire up a Riak client connection at application start (and shut it down when the application is destroyed), by using the `init` and `destroy` methods in `ScalatraBootstrap`:

```scala
import org.scalatra.example._
import org.scalatra._
import javax.servlet.ServletContext

class ScalatraBootstrap extends LifeCycle with RiakJavaClientInit {

  override def init(context: ServletContext) {
    configureRiakJavaClient()
    context.mount(new SimpleRiakController, "/*")
  }

  override def destroy(context: ServletContext) {
    closeRiakJavaClient()
  }
}
```

Next, we can add a `RiakSupport` trait to mix into our controllers:

```scala
/**
 * A trait we can use to get a handle on the Riak bucket we created at
 * application start.
 */
trait RiakSupport {

  def myBucket = {
    RiakFactory.pbcClient.fetchBucket("myBucket").execute
  }

}
```

The `RiakSupport` trait can now be mixed into any of your Scalatra controllers, like this:

```scala
package org.scalatra.example

import org.scalatra._

/**
 * This controller uses the Basho-supported riak-java-client, and the binary connection
 * defined in ScalatraBootstrap.
 * */
class SimpleRiakController extends RiakExampleStack with RiakSupport {

  /**
   * Insert a new object into the database. You can use the following from your console to try it out:
   * curl -i -X POST -d "key=super&value=duper" http://localhost:8080/insert
   */
  post("/insert") {
    val key = params("key")
    val value = params("value")
    myBucket.store(key, value).returnBody(true).execute
  }

  // Retrieve a previously stored object from Riak
  get("/by-key/:key") {
    val key = params("key")
    val myData = myBucket.fetch(key).execute
    myData.getValue
  }

}
```

This client is very Java-esque (e.g. `myData.getValue`), but the Java client is the one that's officially supported by Basho, the makers of Riak.

You may want to either write a wrapper for it, or overlook that.

## Scala clients

You've got multiple Scala alternatives, as well. The process of integrating the [Scalapenos riak-scala-client](http://riak.scalapenos.com/documentation.html) or Stackmob's [Scaliak](https://github.com/stackmob/scaliak) will be very similar to the Java client example provided here.

Both riak-scala-client and Scaliak allow you to define serializers. This means you can easily model your domain objects in Scala, and persist them to Riak in a somewhat more natural way. The Scala clients also allows for a more idiomatic approach to error handling. The trade-off is that they are relatively new projects.

### Notes on riak-scala-client

In the case of riak-scala-client, it's worth noting: if your application already uses an Akka `ActorSystem`, you can initialize riak-scala-client with it during application startup. `ActorSystem` instantiation is a heavyweight operation and should only happen once during application initialization; see the [Akka Guide](../../async/akka.html) to see how it's done. If you don't need your own `ActorSystem` for any other purpose, you can simply use the default one which riak-scala-client will provide.
