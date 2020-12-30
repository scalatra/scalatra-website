---
title: Installation
---

Getting started with a new web framework can be a bit scary.
Luckily, Scalatra is easy to install, as it has relatively few dependencies.

It can run on Windows, Mac OS X, Linux, or BSD.

---

## 1. Install a JDK

Scalatra is web micro-framework written in Scala, so you'll need to have a
Java Development Kit (JDK) installed.

Many systems come with a JDK pre-loaded.

Run `java -version` and `javac -version` in a terminal to find if yours
does. The output should look something like this:

```bash
$ java -version
java version "1.8.0_131"
Java(TM) SE Runtime Environment (build 1.8.0_131-b11)
Java HotSpot(TM) 64-Bit Server VM (build 25.131-b11, mixed mode)
```

```bash
$ javac -version
javac 1.8.0_131
```

You need Java 8 or above (Oracle's JDK, OpenJDK, AdoptOpenJDK and various other distributions exist), which will show up as version 1.8. Java 7 is no longer supported in Scalatra 2.5.

If you don't yet have Java installed, you can find out how to install it for your system over at
[the Oracle's Java 8 download page](https://www.oracle.com/java/technologies/javase/javase-jdk8-downloads.html)
or [the OpenJDK installation page](http://openjdk.java.net/install/index.html) or [AdoptOpenJDK download page](https://adoptopenjdk.net/).

## 2. Install sbt

Once you're sure you've got Java installed, you will need to install the _sbt_.

[sbt](https://www.scala-sbt.org/) is a build tool for Scala, Java, and more.
It can create a new project from the template repository.

In order to create a new project of Scalatra from the template, _sbt 0.13.13_ or later needs to be installed.
To install sbt, refer to [the Installing sbt page](https://www.scala-sbt.org/1.x/docs/Setup.html).

For example, if it is macOS, you can install it by brew command as follows.

```Bash
$ brew install sbt
$ sbt
...
...
> sbtVersion
[info] 1.4.6
```

---

With installation out of the way, head over to the "[first project](first-project.html)"
page, which will show you how to generate, build, and run a Scalatra application.
