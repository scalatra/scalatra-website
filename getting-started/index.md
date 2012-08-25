---
layout: default
title: Scalatra | Getting started
---

<div class="page-header">
  <h1>Getting started</h1>
</div>


You will need to install a few things before you can get started, but first,
here's a very simple Scalatra app:

{% highlight scala %}

  package com.example.app
  import org.scalatra._

  class HelloWorldApp extends ScalatraFilter {
    get("/") {
      "Hello world!"
    }
  }

{% endhighlight %}

Notice a few things about it:

* It's small.
* It uses a [Sinatra](http://sinatrarb.com/)-style DSL.
* It defines a single method, an HTTP GET to the path "/".
* It renders a response, in this case the text _Hello World!_.

This is the essence of Scalatra - small, easy to understand systems which
embrace HTTP's stateless nature. You can build anything you want with Scalatra,
but one of the things it's been most successful at is the construction of
RESTful APIs.

 * [Installation](installation.html)
 * [First Steps](first-steps.html)
 * [Understanding A Scalatra Project](understanding-scalatra.html)