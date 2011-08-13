package scalate

import org.fusesource.scalate._
import org.fusesource.scalate.TemplateEngine
import org.fusesource.scalamd.{MacroDefinition, Markdown}
import java.util.regex.Matcher
import org.fusesource.scalate.wikitext.Pygmentize

class Boot(engine: TemplateEngine) {
  def run: Unit = {
    def pygmentize(m:Matcher):String = Pygmentize.pygmentize(m.group(2), m.group(1))

    // add some macros to markdown.
    Markdown.macros :::= List(
      MacroDefinition("""\{pygmentize::(.*?)\}(.*?)\{pygmentize\}""", "s", pygmentize, true),
      MacroDefinition("""\{pygmentize\_and\_compare::(.*?)\}(.*?)\{pygmentize\_and\_compare\}""", "s", pygmentize, true)
   )
	
    for (ssp <- engine.filter("ssp"); md <- engine.filter("markdown")) {
      engine.pipelines += "ssp.md"-> List(ssp, md)
      engine.pipelines += "ssp.makdown"-> List(ssp, md)
    }


  }
}