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
        items.push('<li><a href="#' + e.id + '">' + e.title + "</a></li>");
      }
    })
    return "<ul>" + items.join("") + "</ul>";
  }

  var headers = $(':header').filter(function(i, e) {
    return /toc_/.test($(e).attr("id"));
  }).map(function(i, e) {
    return { title: $(e).html(), id: $(e).attr("id"), level: tag2level(e.tagName) };
  }).toArray();

  $('#toc').append(toUl(nest(headers)));

});