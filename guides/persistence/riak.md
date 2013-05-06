---
layout: guide
title: Riak | Persistence | Scalatra guides
---

<div class="page-header">
  <h1>Riak</h1>
</div>

Riak is an open source, distributed database.  

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

First, we'll make a `RiakInit` trait which we can use to initialize a Riak bucket at appliation start:

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
 *
 * The big questions here: does this need to be clustered? What are the implications
 * for thread-safety - do we need to be prefixing operations with a clientId?
 */
trait RiakSupport {

  def myBucket = {
    RiakFactory.pbcClient.fetchBucket("myBucket").execute
  }

}
```

The `RiakSupport` trait can now be mixed into any of your Scalatra controllers.

```scala
package org.scalatra.example

import org.scalatra._

/**
 * This controller uses the Basho-supported riak-java-client, and the binary connection
 * defined in ScalatraBootstrap. It's very Java-esque (e.g. myData.getValue), but
 * the Java client is the supported one so you may want to either write a wrapper for it
 * or overlook that.
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

{% include _under_construction.html %}

