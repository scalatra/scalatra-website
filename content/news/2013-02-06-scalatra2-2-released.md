---
title: "Scalatra 2.2 released"
author: Dave Hrycyszyn
twitter: futurechimp
date: 2013-02-06
aliases:
    - /2013/02/06/scalatra2-2-released.html
---

The Scalatra team is excited to finally be able to say: we've just released Scalatra 2.2.0, 2.1.2 and 2.0.5.

<!--more-->

Let's talk about the old branches first.

We've published 2.0.5 for Scala 2.10 so you can safely upgrade on servlet 2.5 containers. This gives anyone stuck deploying on older servlet containers a path to Scala 2.10.

2.1.2 is mostly a bug fix release, and allows for overriding the asyncTimeout in AkkaSupport.

Scalatra 2.2 is the new stable release, and we think it's the most biggest and most exciting release in the history of the project. The changes in 2.2 are listed here: [http://notes.implicit.ly/post/42420935465/scalatra-2-2-0](http://notes.implicit.ly/post/42420935465/scalatra-2-2-0).

We are now also publishing Scalatra data to [ls.implicit.ly](http://ls.implicit.ly).

There are a few breaking changes in 2.2:

* AkkaSupport now uses an ExecutionContext instead of an ActorSystem
* LiftJsonSupport has been removed in favor of [Json4s](http://json4s.org), which is a drop-in replacement
* All the signatures of the methods that access values in the request or response now take an implicit request and/or response

This last one is particularly important if you are making heavy use of Akka Futures from your routes. Scalatra now stores the request and response in a thread-local and when you use Futures you can't access those anymore. This stops you from inadvertantly closing a Future (which should contain only immutable data) over the servlet request (which is unavoidably mutable), and should make your programming experience safer and more enjoyable.

If you had overrides your code won't compile until you add the necessary implicits to the signature.

When you want to use Futures and be able to safely access values in the request there is now an AsyncResult, like this:

```scala  
  get("/:name") {
   new AsyncResult { def is =
     (timeActor  ? "Get Current Time").mapTo[String].map("hello " + params("name") + " it's currently " + _)
   }
 }
```

When you have methods that access the request, and you use Futures in this way, you can also add an implicit request or response object so that it's safe to use this method from within Futures.
