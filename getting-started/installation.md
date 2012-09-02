---
layout: default
title: Scalatra | Installation
---

<div class="page-header">
  <h1>Installation</h1>
</div>

Getting started with a new web framework can be a bit scary. Luckily, Scalatra
is easy to install, as it has relatively few dependencies.

## Install a JDK

Scalatra is web microframework written in Scala, so you'll need to have a
Java Development Kit (JDK) installed. Many systems will already include
a JDK (do `java -version` and `javac -version` in a terminal to find if yours
does). 

<div class="alert alert-info">
<span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
If you don't yet have Java installed, you can find out how to install
it for your system 
<a href="http://docs.oracle.com/javase/7/docs/webnotes/install/index.html">
over at the Java 7 install page</a>. Make sure you've got Open JDK or Sun JDK,
as <code>gcj</code>, which is pre-installed on some Linux distros, won't work.
</div>

### The Typesafe Stack

TypeSafe is a Scala consulting company which maintains both the Scala language itself
and quite a few of its associated tools. They offer easy-to-install packages for
most types of system: Windows, Mac OS X (via homebrew), Debian/Ubuntu, and Red Hat Linux.

The easiest way to get everything installed is to download the 
Typesafe Stack, from 
[http://typesafe.com/stack/download](http://typesafe.com/stack/download)

Once that's done, head over to the "[first steps](first-steps.html)" page, 
which will tell you how to generate, build, and run a Scalatra application.

## Manual install on Linux or Mac OS X

If you'd rather install things yourself, it's still a very easy process. 

### Install SBT

The next thing you'll need is `sbt`, the Simple Build Tool. This is a Scala
program which will automatically download everything your Scalatra project
needs, and build it.

You can download `sbt` at the [SBT website](http://www.scala-sbt.org/download.html).

### Install conscript and giterate

[Conscript](https://github.com/n8han/conscript) is a tool for installing and
updating Scala code. [Giter8](https://github.com/n8han/giter8/), which depends
on conscript, allows you to check out project templates directly from Github.
It's the recommended way of getting started with Scalatra.

To install conscript, issue this command in your terminal:

{% highlight bash %}

  curl https://raw.github.com/n8han/conscript/master/setup.sh | sh

{% endhighlight %}

This will create a _bin_ folder in your home directory.  Put that on your
path, by adding the following to your shell's profile (e.g. ~/.bash_profile):

{% highlight bash %}

  PATH=$PATH:~/bin
  export path

{% endhighlight %}

Make sure you reload your shell:

{% highlight bash %}

  source ~/.bash_profile

{% endhighlight %}


Now you can use conscript to install Giter8:

{% highlight bash %}

  cs n8han/giter8

{% endhighlight %}

Depending on your connection speed, this can take a bit of time, as `conscript` 
downloads quite a few Scala dependencies.

<div class="alert alert-info">
<span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
That's it! You've now got everything you need.
</div>

Head over to the "[first steps](first-steps.html)" page, which will tell you how to generate,
build, and run a Scalatra application.

