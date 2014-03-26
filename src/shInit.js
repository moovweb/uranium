$(function() {
  var d = SyntaxHighlighter.defaults;
  d["quick-code"] = d["toolbar"] = false;
  $("pre").each(function(_, c) {
    c.innerHTML = c.innerHTML.replace(/\u2003/g, " "); // get rid of &emsp;
    SyntaxHighlighter.highlight({ brush: $(c).attr("data-lang") }, c);
  });
  $(document).on("dblclick", ".syntaxhighlighter .container", function() {
    var range = document.createRange();
    range.selectNode(this);
    var sel = getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  });
});
