---
aliases:
  - /2.3/guides/modules.html
title: Helpers
---

Scalatra has a wide range of helpers to take care of common web development
tasks. Some are built-in, and you can download a wide range of external helpers
as well - or implement your own.

Helpers in Scalatra are Scala traits that can applied to your controllers class.

The most bare-bones possible Scalatra controller looks something like this:

```scala
class FooController extends ScalatraServlet {

  get("/") {
    // do something
  }
}
```

To add a helper, you can mix in a trait:

```scala
class FooController extends ScalatraServlet with ScalateSupport {

  // now your class has access to Scalate helpers. Easy, yes?

}
```

Adding the `ScalateSupport` trait like this gives you the ability to do templating
(see the [views](views.html) guide for more on that).

Some helpers are built directly into Scalatra. Other helpers need to be added
as dependencies in the `project/build.scala` file and mixed into your servlet. See the
[understanding Scalatra projects](../getting-started/understanding-scalatra.html)
for more information on adding a new external dependency.

Why do it this way?

Scalatra is a micro-framework. At its very heart, it's nothing more than a
domain-specific language (DSL) for reading incoming HTTP requests and responding
to them using with actions. You can use helper traits like building blocks,
selecting the ones that match your exact problem set. This keeps your
application lean, mean, and fast, and reduces the number of external dependencies
that you need to worry about.

At the same time, this approach allows you to expand as necessary. Depending
on what traits you mix in, Scalatra can be anything from a tiny HTTP DSL all
the way up to a lightweight but full-stack MVC web framework.

This approach provides you with an easy way to build up exactly the code stack you
want, and makes it easy to write your own helper traits when you need to
do something that the Scalatra team hasn't thought of yet.

### DRYing up your helper traits

After a while, you may find that you've got a large
number of traits mixed into your servlets and things are starting to look a little
messy:

```scala
class FooServlet extends ScalatraServlet
      with ScalateSupport with FlashMapSupport
      with AkkaSupport with KitchenSinkSupport {

  get("/") {
    // do something
  }
}
```

The simplest way to clean this up is to make your own trait
which includes all the other standard traits you want to use throughout your
application:

```scala
trait MyStack extends ScalatraServlet
      with ScalateSupport with FlashMapSupport
      with AkkaSupport with KitchenSinkSupport {

  // the trait body can be empty, it's just being used
  // to collect all the other traits so you can extend your servlet.
}
```

Then you can mix that into your servlets. Nice and DRY:

```scala
class FooServlet extends MyStack {

  get("/") {
    // do something
  }
}
```


## External helpers

External helpers may be written by you and packaged for inclusion in your
application, or they may be written by other people. For external helpers,
you'll need to add a dependency line into your project's `project/build.scala` file.

## Built-in helpers

All of the built-in helpers can simply be mixed into your servlet without
adding any additional dependencies to `project/build.scala`. Some of the built-in helpers
(such as the `request`, `response`, and `session` helpers) are available to every
Scalatra application because they're part of `ScalatraBase`, which everything
else inherits from.

Other built-in helpers (such as `FlashMapSupport`) don't require any additional
`project/build.scala` lines, but are still optional. You'll need to mix them into your
servlet before they'll become available.

Much of Scalatra is actually implemented as traits. To see all of the built-in
helpers, you can just [browse the Scalatra core source][scalatracore] on
GitHub. Scalatra source code is meant to be simple and readable; don't be scared
to take a look at it if you need to understand how something works.

[scalatracore]: https://github.com/scalatra/scalatra/tree/develop/core/src/main/scala/org/scalatra
