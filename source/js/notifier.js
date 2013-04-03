$(function() {

  var stopped = false,
    interval = RBN.Settings.pollInterval;

  var Notifier = {};

  Notifier.start = function() {
    var interval = RBN.Settings.pollInterval,
      previousIds = null;

    stopped = false;

    function poll() {

      pollTimer = setTimeout(function() {

        if (stopped) {
          clearTimeout(pollTimer);
          pollTimer = null;
          return;
        }

        RBN.DAL.getAllRBs()
          .done(function(items) {

            if (stopped) {
              return;
            }

            var ids = _.map(items, function(item) {
              return item.id;
            });

            if (previousIds) {
              var newIds = _.difference(ids, previousIds);
              if (newIds.length > 0) {
                if (RBN.DAL.canShowNotifications()) {
                  var notification = webkitNotifications.createNotification('icon.png', 'New RB', newIds.length);
                  notification.show();
                }
                chrome.browserAction.setBadgeText({text: "" + newIds.length});
              }
            }

            previousIds = ids;

          })
          .done(poll);

      }, interval);
    }

    poll();
  }

  Notifier.stop = function() {
    stopped = true;
  };

  Notifier.start();

  window.Notifier = Notifier;
});