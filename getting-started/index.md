---
layout: home
title: Scalatra | Getting started
---

<div class="page-header">
  <h1>Getting started</h1>
</div>

<div class="row">
  <div class="span4">
    <h2>Installation</h2>
    <p><a href="installation.html">Install</a> Scalatra in 3 easy steps. You may
      already have a lot of what you need.</p>
    <p><a href="installation.html" class="btn btn-primary">Go »</a></p>
 </div>
  <div class="span4">
    <h2>First steps</h2>
    <p>The first steps you take when learning something new are usually the
      most difficult. Our code generators and step-by-step instructions
      can help ease you into Scalatra development.</p>
   <a href="first-steps.html" class="btn btn-primary">Go »</a> </div>
  <div class="span4">
    <h2>How does it work?</h2>
    <p>Understanding a Scalatra project isn't difficult, but it can save you
    a lot of time if you understand a bit about what's happening under the hood.
    Here are the basics.</p>
    <a href="understanding-scalatra.html" class="btn btn-primary">Go »</a>
  </div>
</div>


You will need to install a few things before you can get started, but first,
here's a Scalatra app:

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

 * It's small - a full web application in 7 lines of code.
 * It uses a [Sinatra](http://sinatrarb.com)-style DSL.
 * It defines a single method, an HTTP GET to the path "/".
 * It renders a response, in this case the text _Hello world!_

This is the essence of Scalatra - small, easy to understand systems which
embrace HTTP's stateless nature. You can build anything you want with Scalatra,
but one of the things it's been most successful at is the construction of
RESTful APIs.


