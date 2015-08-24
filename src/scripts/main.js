var curNav = function() { return location.hash.substring(1).split('/')[0] || false; },
    curPage = curNav() || 'home',
    lastPage = '',
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

  // route or die
  if($('.page#' + target).length <= 0) {
    changePage(404, 0);
    return false;
  }

  // for sanity
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
              // $(this).remove();
            }, 1); // prevent racing
          })
    );
    lastPage = curPage;
    curPage = target;
  });
}

function setBackground(page) {
  var url = (page && page != 'home') ?'img/bg/' + page + '.jpg' : 'img/blank.png';

  _dbg('setBackground') && console.log(_ts(), 'setBackground', page || 'home', url);

  $('body').css('background-image', 'url(\'' + url + '\')');
}

var layzr;

// let's begin
$(document).ready(function() {
  location.hash || _navTo('#home', true);

  $('#home .tile').one(animEnd, function() {
    $(this).removeClass('animated');
  });

  layzr = new Layzr({
        threshold: 0,
        callback: function() {
          var page = curNav() || 'home',
              $page = $('.page#' + page),
              _eletype = $page.find(this).length >= 1 ? 'Page' : 'Misc';

          (this.src || this.style.backgroundImage) && (
            this.src && layzrs++,
            _dbg('load') && console.log(_ts(), 'load' + _eletype + 'Ele', this, layzr._getOffset(this)),
            $(this).one('load', function() {
              _dbg('loaded') && console.log(_ts(), 'loaded' + _eletype + 'Ele', this);
              console.log(layzrs, $('[data-layzr]'));
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

  // background hovers
  $('.navlink:not([href=\'#home\'])').hover(function() {
    _dbg('hover') && console.log(_ts(), 'hover', location.hash, this.hash);
    setBackground(this.hash.substring(1));
  }, function() {
    (location.hash == '' || location.hash == '#' || location.hash == '#home' ||
      // map hover is a special case
      (location.hash != '#map' && this.hash == '#map')
    ) && setBackground();
  });

  $(window).on('hashchange', function(e) {
    var newPage = curNav() || 'home';

    _dbg('nav') && console.log(_ts(), 'nav', curPage + ' -> ' + newPage);
    _starttime = new Date().getTime();
    _dbg('clockReset') && console.log(_ts(), 'clockReset');

    // home exits left instead of right
    changePage(newPage, newPage == 'home' ? 3 : 1);

    // prevent jump
    setTimeout(function() { window.scrollTo(0, 0); }, 1);
  });

  // inter-page nav
  $('.backbtn').click(function(e) {
    e.preventDefault();

    _dbg('goBackOrHome') && console.log(_ts(), 'goBackOrHome', '[ ' + curPage + ' != ' + lastPage + ' ]');
    if(curPage != lastPage)
      history.back(1);
    else {
      _navTo('#home', true);
      changePage('home');
    }
  });

  // no carousels in history
  $('.gallery .controls a').click(function(e) {
    _navTo(e.target.hash);
  });
});