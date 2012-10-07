---
layout: default
title: Scalatra | Installation
---

<div class="page-header">
  <h1>Installation</h1>
</div>

Getting started with a new web framework can be a bit scary. Luckily, Scalatra
is easy to install, as it has relatively few dependencies.

It can run on Windows, Mac OS X, Linux, or BSD.

## 1. Install a JDK

Scalatra is web micro-framework written in Scala, so you'll need to have a
Java Development Kit (JDK) installed. Many systems will already include
a JDK.

Run `java -version` and `javac -version` in a terminal to find if yours
does. The output should look something like this:

```
$ java -version
java version "1.6.0_24"
OpenJDK Runtime Environment (IcedTea6 1.11.1) (6b24-1.11.1-3)
OpenJDK 64-Bit Server VM (build 20.0-b12, mixed mode)
```

```
$ javac -version
javac 1.7.0_03
```

You need at least version 1.6.

If you don't yet have Java installed, you can find out how to install
it for your system
<a href="http://docs.oracle.com/javase/7/docs/webnotes/install/index.html">
over at the Java 7 install page</a>. Make sure you've got OpenJDK or Sun's JDK,
as <code>gcj</code>, which is pre-installed on some Linux distros, won't work.

----

## 2. Install conscript and giter8

Once you're sure you've got Java installed, you will need to download a few other
utilities.

[Conscript](https://github.com/n8han/conscript) is a tool for installing and
updating Scala code. [Giter8](https://github.com/n8han/giter8/), which depends
on conscript, allows you to check out project templates directly from Github.
It's the recommended way to generate Scalatra project skeletons.

<h4>Install conscript and giterate</h4>

  <p>To install conscript, issue this command in your terminal:</p>

  <pre>curl https://raw.github.com/n8han/conscript/master/setup.sh | sh</pre>

  <p>This will create a _bin_ folder in your home directory.  Put that on your
  path, by adding the following to your shell's profile (e.g. <code>~/.bash_profile)</code>:</p>

<pre>
PATH=$PATH:~/bin
export path
</pre>

  <p>Make sure you reload your shell:</p>

  <pre>source ~/.bash_profile</pre>


  <p>Now you can use conscript to install Giter8:</p>

  <pre>cs n8han/giter8</pre>

  <p>Depending on your connection speed, this can take a bit of time, as `conscript`
  downloads quite a few Scala dependencies.</p>

  <h4>Install SBT</h4>

  <p>The last thing you'll need is `sbt`, the Simple Build Tool.</p>

  <p>You can download <code>sbt</code> at the
  <a href="http://www.scala-sbt.org/download.html">SBT website</a>.</p>

  </div>
</div>

----

That's it! You've now got everything you need.

You might want to set up your IDE. If you're using Eclipse, you can use the [sbt-eclipse](https://github.com/typesafehub/sbteclipse) plugin.
This gets sbt dependencies set up on the Eclipse classpath, so that your project works as expected in the IDE.
Similar functionality for IntelliJ IDEA is provided by the [sbt-idea](https://github.com/mpeltonen/sbt-idea) plugin.
Make sure the you run `sbt eclipse` or `sbt idea` every time you [add or update a dependency](understanding-scalatra.html) in `build.sbt`.

Head over to the "[first steps](first-steps.html)" page, which will tell you how to generate,
build, and run a Scalatra application.
