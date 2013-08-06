$(function() {
  var nav = false;
  // Show or hide nav dropdown
  $('body').click(function(event) {
    if (nav) {
      $('nav').css({ overflow: 'hidden' });
      nav = false;
    } else if ($(event.target).hasClass('menu')) {
      $('nav').css({ overflow: 'visible' });
      nav = true;
    }
  });
});
