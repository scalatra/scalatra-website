/*
|--------------------------------------------------------------------------
| UItoTop jQuery Plugin 1.2 by Matt Varone
| http://www.mattvarone.com/web-design/uitotop-jquery-plugin/
|--------------------------------------------------------------------------
*/
(function($){
  $.fn.UItoTop = function(options) {

     var defaults = {
          text: 'To Top',
          min: 200,
          inDelay:600,
          outDelay:400,
            containerID: 'toTop',
          containerHoverID: 'toTopHover',
          scrollSpeed: 1200,
          easingType: 'linear'
         },
            settings = $.extend(defaults, options),
            containerIDhash = '#' + settings.containerID,
            containerHoverIDHash = '#'+settings.containerHoverID;
    
    $('body').append('<a href="#" id="'+settings.containerID+'">'+settings.text+'</a>');
    $(containerIDhash).hide().on('click.UItoTop',function(){
      $('html, body').animate({scrollTop:0}, settings.scrollSpeed, settings.easingType);
      $('#'+settings.containerHoverID, this).stop().animate({'opacity': 0 }, settings.inDelay, settings.easingType);
      return false;
    })
    .prepend('<span id="'+settings.containerHoverID+'"></span>')
    .hover(function() {
        $(containerHoverIDHash, this).stop().animate({
          'opacity': 1
        }, 600, 'linear');
      }, function() { 
        $(containerHoverIDHash, this).stop().animate({
          'opacity': 0
        }, 700, 'linear');
      });
          
    $(window).scroll(function() {
      var sd = $(window).scrollTop();
      if(typeof document.body.style.maxHeight === "undefined") {
        $(containerIDhash).css({
          'position': 'absolute',
          'top': sd + $(window).height() - 50
        });
      }
      if ( sd > settings.min ) 
        $(containerIDhash).fadeIn(settings.inDelay);
      else 
        $(containerIDhash).fadeOut(settings.Outdelay);
    });
};
})(jQuery);

$(function() {
  var tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

  function tag2level(t) {
    return tags.indexOf(t.toLowerCase());
  }

  function nest0(lst, tree, l) {
    if (lst.length == 0) return [tree, lst];
    else {
      var x = lst[0];
      var xs = lst.slice(1);
      if (x.level == l) {
        tree.push(x);
        return nest0(xs, tree, l);
      } else if (x.level > l) {
        var [y, ys] = nest0(xs, [x], x.level);
        tree.push(y);
        return nest0(ys, tree, l);
      } else if (x.level < l) {
        return [tree, lst];
      }
    }
  }
  
  function nest(lst) {
    if (lst.length == 0) return [];
    else {
      var [x, xs] = nest0(lst, [], lst[0].level);
      return x;
    }
  }

  function toUl(lst) {
    var items = [];
    $(lst).each(function(i, e) {
      if ($.isArray(e)) {
        items.push(toUl(e));
      } else {
        var offset = $('#'+e.id).offset().top - 50;
        items.push('<li><a href="#' + e.id + '" onclick="$(\'html,body\').animate({scrollTop: ' + offset + '}, 1000);">' + e.title + "</a></li>");
      }
    })
    return "<ul>" + items.join("") + "</ul>";
  }

  var headers = $(':header').filter(function(i, e) {
    return /toc_/.test($(e).attr("id"));
  }).map(function(i, e) {
    return { title: $(e).html(), id: $(e).attr("id"), level: tag2level(e.tagName) };
  }).toArray();

  if (headers.length > 0) {
    $('#toc').append("<h4>Overview</h4>" + toUl(nest(headers)));
  }

  $().UItoTop();
});