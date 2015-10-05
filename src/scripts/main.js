var curNav = function() { return location.hash.substring(1).split('/')[0] || false; },
    curPage = curNav() || 'home',
    lastPage = '',
    layzr,
    layzrs = 0,
    animEnd = 'webkitAnimationEnd mozAnimationEnd' +
                  'MSAnimationEnd oanimationend',
    _starttime = new Date().getTime(),
    _ts = function() { return '[' + (new Date().getTime() - _starttime) / 1000 + ']' },
    _dbg = function(tag) { return _DEBUG.indexOf(tag) >= 0; },
    _DEBUG = [
      'showLoading',
      'hideLoading',
      'navTo',
      'scrollTo',
      'changePage',
      'startExit',
      'endExit',
      'startEnter',
      'endEnter',
      'setBackground',
      'goBackOrHome',
      'load',
      'loaded',
      'done',
      'curPage',
      'hover',
      'nav',
      'clockReset'
    ];

function _navTo(target, push) {
  _dbg('navTo') && console.log(_ts(), 'navTo', history, location);
  if(push)
    if(history)
      history.pushState(undefined, undefined, target);
    else
      location.assign(target);
  else
    if(history)
      history.replaceState(undefined, undefined, target);
    else
      location.replace(target);
}

/**
 * Transitions between pages
 *
 * @param {string} target   The hash of the desired page.
 * @param {int} orientation Slide pages from/to this direction.
 *                          (0 = North, ..., 3 = West)
 */
function changePage(target, orientation) {
  var dirMap = ['Up', 'Right', 'Down', 'Left'];

  // Route or die
  if($('.page#' + target).length <= 0) {
    changePage(404, 0);
    return false;
  }

  // For sanity
  orientation = orientation ? orientation % 4 : 1;

  _dbg('scrollTo') && console.log(_ts(), 'scrollTo', 0);
  $('.slidez .viewport').animate({ scrollTop: 0 }, 300, function() {
    _dbg('changePage') && console.log(_ts(), 'changePage', curPage + ' -> ' + target);

    target != curPage && (
      _dbg('showLoading') && console.log(_ts(), 'showLoading'),
      $('#loading-overlay')
          .removeClass('fadeOut')
          .appendTo('body'),
      $('#loading-overlay .loading')
          .removeClass('fadeOutUp'),
      _dbg('startExit') && console.log(_ts(), 'startExit', curPage + ' (' + target + ')'),
      $('.viewport .page#' + curPage)
          .css('position', 'absolute')
          .css('marginTop', '0')
          .removeClass('fadeIn' + dirMap[(orientation + 2) % 4])
          .removeClass('zoomIn')
          .addClass('fadeOut' + dirMap[(orientation + 2) % 4])
          .one(animEnd, function() {
            _dbg('endExit') && console.log(_ts(), 'endExit', curPage + ' (' + target + ')');
            setBackground(target);
            $(this)
              .css('position', '')
              .css('marginTop', '')
              .prependTo('.page-stack');
          })
    );

    (target != curPage || curPage != lastPage) && (
      _dbg('startEnter') && console.log(_ts(), 'startEnter', target + ' (' + curPage + ')'),
      $('.page#' + target)
          .toggleClass('zoomIn')
          .appendTo('#content-wrapper')
          .one(animEnd, function() {
            _dbg('endEnter') && console.log(_ts(), 'endEnter', target + ' (' + curPage + ')');
            layzr.updateSelector();
            layzr.update();
            setTimeout(function() {
              _dbg('hideLoading') && console.log(_ts(), 'hideLoading');
              $('#loading-overlay')
                  .addClass('fadeOut')
                  .one(animEnd, function() {
                    $(this).appendTo('.page-stack');
                  });
              $('#loading-overlay .loading')
                  .addClass('fadeOutUp');
            }, 1); // prevent racing
          })
    );
    lastPage = curPage;
    curPage = target;
  });
}

function setBackground(page) {
  // Determine image based on page
  var url = (page && page != 'home') ?'img/bg/' + page + '.jpg' : 'img/blank.png';

  _dbg('setBackground') && console.log(_ts(), 'setBackground', page || 'home', url);

  $('body').css('background-image', 'url(\'' + url + '\')');
}

// Let's begin
$(document).ready(function() {
  location.hash || _navTo('#home', true);

  // One-shot home tile animations
  $('#home .tile').one(animEnd, function() {
    $(this).removeClass('animated');
  });

  // Set up Layzr and register callbacks
  layzr = new Layzr({
        threshold: 500,
        callback: function() {
          var page = curNav() || 'home',
              $page = $('.page#' + page);

          (this.src || this.style.backgroundImage) && (
            this.src && layzrs++,
            _dbg('load') && console.log(_ts(), 'load ele', this, layzr._getOffset(this)),
            // Check overall status after each load
            $(this).one('load', function() {
              _dbg('loaded') && console.log(_ts(), 'loaded ele', this);
              (--layzrs <= 1) && (
                _dbg('done') && console.log(_ts(), 'done', page),
                $('#viewport-header')
                  .css('visibility', 'visible')
                  .addClass('fadeIn'),
                $('#viewport-footer')
                  .css('visibility', 'visible')
                  .addClass('fadeIn'),
                $page
                  .removeClass('fadeInLeft')
                  .removeClass('fadeInRight')
              );
            })
          );
        }
      });

  _dbg('curPage') && console.log(_ts(), 'curPage', curPage);
  changePage(curPage);
  setBackground(curPage);

  // Background hovers
  $('.navlink:not([href=\'#home\'])').hover(function() {
    _dbg('hover') && console.log(_ts(), 'hover', location.hash, this.hash);
    setBackground(this.hash.substring(1));
  }, function() {
    (location.hash == '' || location.hash == '#' || location.hash.indexOf('#home') == 0 ||
      // Map hover is a special case
      (location.hash != '#map' && this.hash == '#map')
    ) && setBackground();
  });

  // Navigation handling
  $(window).on('hashchange', function(e) {
    var newPage = curNav() || 'home';
    _dbg('nav') && console.log(_ts(), 'nav', curPage + ' -> ' + newPage)

    if(curPage != newPage) {
      _starttime = new Date().getTime();
      _dbg('clockReset') && console.log(_ts(), 'clockReset');

      // Home exits right instead of left
      changePage(newPage, newPage == 'home' ? 1 : 3);

      // Prevent jump
      setTimeout(function() { window.scrollTo(0, 0); }, 1);
    }
  });

  // Inter-page nav
  $('.back-button').click(function(e) {
    e.preventDefault();

    _dbg('goBackOrHome') && console.log(_ts(), 'goBackOrHome', '[ ' + curPage + ' != ' + lastPage + ' ]');
    if(curPage != lastPage)
      history.back(1);
    else {
      _navTo('#home', true);
      changePage('home');
    }
  });

  // No carousels in history
  $('.gallery .controls a').click(function(e) {
    _navTo(e.target.hash);
  });
});
