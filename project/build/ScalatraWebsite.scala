import sbt._

import scala.xml._
import java.io.File
import org.fusesource.scalate.sbt._

class ScalatraWebsite(info: ProjectInfo) extends DefaultWebProject(info) 
    with SiteGenWebProject {

  // defined versions
  val jettyGroupId = "org.eclipse.jetty"
  val jettyVersion = "7.2.2.v20101205"
  val slf4jVersion = "1.6.1"
  val scalateVersion = "1.5.1"
  val description = "Runs www.scalatra.org"
  def projectUrl = "http://www.scalatra.org/"

    // jetty overrides
  val p = path("target") / "scala_2.9.0-1" / "sitegen"
  override def jettyWebappPath = p  
  override def scanDirectories = Nil
  override val jettyPort = 8081

  // required packages
  val scalatePage = "org.fusesource.scalate" % "scalate-page" % "1.5.1"
  val jetty7 = jettyGroupId % "jetty-webapp" % jettyVersion % "test"
  val logback = "org.slf4j" % "slf4j-nop" % slf4jVersion % "runtime"
  val markdown = "org.fusesource.scalamd" % "scalamd" % "1.5" % "runtime"


  // site generator
  override lazy val generateSite = super.generateSiteAction
  
  // repos
  val fuseSourceSnapshots = "FuseSource Snapshot Repository" at "http://repo.fusesource.com/nexus/content/repositories/snapshots"
  val scalaToolsSnapshots = "Scala-Tools Maven2 Snapshots Repository" at "http://scala-tools.org/repo-snapshots"
  
  def licenses =
      <licenses>
        <license>
          <name>BSD</name>
          <url>http://github.com/scalatra/scalatra/raw/HEAD/LICENSE</url>
          <distribution>repo</distribution>
        </license>
      </licenses>

  def developers = 
      <developers>
          <developer>
            <id>riffraff</id>
            <name>Gabriele Renzi</name>
            <url>http://www.riffraff.info</url>
          </developer>
          <developer>
            <id>alandipert</id>
            <name>Alan Dipert</name>
            <url>http://alan.dipert.org</url>
          </developer>
          <developer>
            <id>rossabaker</id>
            <name>Ross A. Baker</name>
            <url>http://www.rossabaker.com/</url>
          </developer>
          <developer>
            <id>chirino</id>
            <name>Hiram Chirino</name>
            <url>http://hiramchirino.com/blog/</url>
          </developer>
          <developer>
            <id>casualjim</id>
            <name>Ivan Porto Carrero</name>
            <url>http://flanders.co.nz/</url>
          </developer>
          <developer>
            <id>jlarmstrong</id>
            <name>Jared Armstrong</name>
            <url>http://www.jaredarmstrong.name/</url>
          </developer>
        </developers>


 }