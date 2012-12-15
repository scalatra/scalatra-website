---
layout: default
title: Scalatra | Installation
---

<div class="page-header">
  <h1>Installation</h1>
</div>

Getting started with a new web framework can be a bit scary.
Luckily, Scalatra is easy to install, as it has relatively few dependencies.

It can run on Windows, Mac OS X, Linux, or BSD.

## 1. Install a JDK

Scalatra is web micro-framework written in Scala, so you'll need to have a
Java Development Kit (JDK) installed.
Many systems come with a JDK pre-loaded.

Run `java -version` and `javac -version` in a terminal to find if yours
does. The output should look something like this:

```bash
$ java -version
java version "1.6.0_24"
OpenJDK Runtime Environment (IcedTea6 1.11.1) (6b24-1.11.1-3)
OpenJDK 64-Bit Server VM (build 20.0-b12, mixed mode)
```

```bash
$ javac -version
javac 1.7.0_03
```

You need version 1.6 or higher.

If you don't yet have Java installed, you can find out how to install
it for your system
<a href="http://docs.oracle.com/javase/7/docs/webnotes/install/index.html">
over at the Java 7 install page</a>.
Make sure you're using OpenJDK or Sun's JDK.
Some Linux distros pre-install `gcj`, which won't work.

----

## 2. Install conscript and giter8

Once you're sure you've got Java installed, you will need to download a few
other utilities.

[Conscript](https://github.com/n8han/conscript) is a tool for installing and
updating Scala code.
[giter8](https://github.com/n8han/giter8/), which depends on conscript, allows you to check out project templates directly from Github.
It's the recommended way to generate Scalatra project skeletons.

<h4>Install conscript</h4>
  <pre>curl https://raw.github.com/n8han/conscript/master/setup.sh | sh</pre>

  <p>
    This will create a `bin` folder in your home directory.
    Make sure it's in your `PATH` by adding the following to your shell's
    profile (often `~/.bash_profile` on Mac and `~/.bashrc` on Linux):
  </p>

<pre>
PATH=$PATH:~/bin
export PATH
source ~/.bash_profile # (Mac)
source ~/.bashrc       # (Linux)
</pre>

<h4>Install giter8</h4>
  <pre>cs n8han/giter8</pre>

  <p>Depending on your connection speed, this can take a bit of time, as
  `conscript` downloads quite a few Scala dependencies.</p>

----

## 3. IDE Setup (optional)

That's it! You now have everything you need.

You may want to set up your IDE. If you're using Eclipse, you can use the [sbt-eclipse](https://github.com/typesafehub/sbteclipse) plugin.
It generates Eclipse classpath and configuration files to ensure the project will work as expected in the IDE.
Similar functionality for IntelliJ IDEA is provided by the [sbt-idea](https://github.com/mpeltonen/sbt-idea) plugin.
Be sure to run `./sbt eclipse` or `./sbt idea` every time you [add or update a dependency](understanding-scalatra.html) in `build.sbt`.

Head over to the "[first steps](first-steps.html)" page, which will show you how to generate, build, and run a Scalatra application.
