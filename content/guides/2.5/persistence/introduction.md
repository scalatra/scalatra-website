---
title: Introduction
---

Scalatra's philosophy is to keep things simple and solid. At its heart, Scalatra is basically a domain-specific language (DSL) for easily making HTTP requests, and a way of extending the core HTTP router with whatever libraries you want. We think we've got a great DSL for HTTP - the Sinatra style strikes us as perhaps the simplest, most natural way to express HTTP routes.

Data is different. Every application has its own needs for persistence, and there's certainly no one-size-fits-all answer to the question of how to store data. Some applications may work well with a NoSQL key-value data store; others may require a relational database with full ACID compliance. There's also the question of ORMs vs bare-metal access to data - again, opinions and programming styles vary widely.

In light of this, Scalatra has no built-in integrations with specific persistence frameworks. Instead, we've made it easy for you to write your own integrations, by exposing hooks for running code at application startup and shutdown. You can hook Scalatra up to your chosen persistence framework with only a small amount of work.

This guide will show you how.

### Integrating a persistence library

Although the details depend on the library, the general steps for getting your chosen persistence library working with Scalatra are pretty similar across libraries.

1. Add a reference to your library in `project/build.scala`
1. Start a connection pool at application start
1. Clean up the connection pool when your application stops
1. Provide a way for your controllers to access the connection pool
1. Write your application!

If you look at the existing Scalatra guides on persistence, you'll notice that pretty much all of them follow this common pattern.

Let's see it in action.

### Reference the persistence library in your build file

Not too much to do here. Open up `project/build.scala` and add a reference to your chosen persistence library in the `libraryDependencies` section.

### Start a connection pool at application start

This one is quite specific to each framework, but generally involves doing two things. Assuming your chosen persistence library is called `FooBar`, the first thing you'll want to do is read the FooBar docs to see how connection handling works. Then you'll generally want to do the following:

1. Make a `FooBarInit` trait which initializes anything the application needs to do at startup. Typically, this means setting up a connection pooling mechanism.
1. Run the init code when your application starts up. Scalatra makes this extremely easy to do - just add the `FooBarInit` trait to `ScalatraBootstrap` and call your initialization code in the `init` method.

Let's see the Riak setup code as an example.

Here's the `RiakJavaClientInit` trait:

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

This gets mixed into `ScalatraBootstrap` and `configureRiakJavaClient` gets run at application start:

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

### Clean up the connection pool at application shutdown.

If you've opened a resource like a connection pool, it's always a good idea to shut it down when your application terminates. As you can see from the code in the preceding section, this is pretty easy to do. The `closeRiakJavaClient` method shuts down the persistent Riak connection, and it gets called from the `destroy` method in `ScalatraBootstrap`.

### Provide a way for your application to access the connection pool

Once again, the details of this are specific to each library, but typically it involves making a `FooBarSupport` trait which can be mixed into your controllers. The trait provides a handle to the connection for your datastore. Let's take a look at the Squeryl guide's integration as an example:

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

Obviously this one is pretty specific to Squeryl, but the basic idea is to use Scalatra's `before()` and `after()` filters to open a database connection on each request, and close it after the request finishes. This is a very common pattern, and is used even in the case of persistence frameworks which don't use connection pooling.

This trait can now be mixed into any controller to give you a `dbSession` which you can use to do persistence tasks. In the case of Squeryl, you then define an Object which acts as a combination of a schema and a data access object - other frameworks do things differently, but the basic idea is the same. You need your application to be able to get a handle on its datastore connection so that it can shoot data at your datastore, retrieve it, and clean up after itself after every request.

### Write your application!

Once you've got a handle on your datastore, you're off to the races.

There are dozens of persistence libraries which you can use with Scalatra - we make no assumptions about which one you'll want to use, because we think that's up to you.

### Help us out by writing a guide

If you've integrated Scalatra with a persistence framework which doesn't yet have a guide written up, please consider helping us out by writing one.
