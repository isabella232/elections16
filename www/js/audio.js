var AUDIO = (function() {
    var NO_AUDIO = (window.location.search.indexOf('noaudio') >= 0);
    var timedAnalytics = [
        {
            'seconds': 10,
            'unit': '10s',
            'measured': false
        },
        {
            'seconds': 20,
            'unit': '20s',
            'measured': false
        },
        {
            'seconds': 30,
            'unit': '30s',
            'measured': false
        },
        {
            'seconds': 60,
            'unit': '1m',
            'measured': false
        },
        {
            'seconds': 120,
            'unit': '2m',
            'measured': false
        },
        {
            'seconds': 180,
            'unit': '3m',
            'measured': false
        },
        {
            'seconds': 240,
            'unit': '4m',
            'measured': false
        },
        {
            'seconds': 300,
            'unit': '5m',
            'measured': false
        },
    ]
    var live = null;

    var setupAudio = function() {
        $audioPlayer.jPlayer({
            swfPath: 'js/lib',
            ended: onEnded,
            loop: false,
            supplied: 'mp3',
            timeupdate: onTimeupdate,
            volume: NO_AUDIO ? 0 : 1
        });
    }

    var setMedia = function(url) {
        $audioPlayer.jPlayer('setMedia', {
            'mp3': url
        });
        playAudio();

        for (var i = 0; i < timedAnalytics.length; i++) {
            timedAnalytics[i]['measured'] = false;
        }

        ANALYTICS.trackEvent('audio-started', url);
    }

    var setLive = function() {
        live = true;
    }

    var playAudio = function() {
        $audioPlayer.jPlayer('play');
        $playToggleBtn.removeClass('play').addClass('pause');
        $mute.removeClass('muted').addClass('playing');
    }

    var pauseAudio = function() {
        $audioPlayer.jPlayer('pause');
        $playToggleBtn.removeClass('pause').addClass('play');
        $mute.removeClass('playing').addClass('muted');
        ANALYTICS.trackEvent('audio-paused', $audioPlayer.data().jPlayer.status.src);
    }

    var stopAudio = function() {
        $audioPlayer
            .jPlayer('stop')
            .jPlayer('clearMedia');
        $mute.removeClass('playing').addClass('muted');
        ANALYTICS.trackEvent('audio-stopped', $audioPlayer.data().jPlayer.status.src);
    }

    var rewindAudio = function() {
        var currentTime = $audioPlayer.data('jPlayer')['status']['currentTime'];
        var seekTime =  currentTime > 15 ? currentTime - 15 : 0;
        $audioPlayer.jPlayer('play', seekTime);
        focusCardsWrapper();

        ANALYTICS.trackEvent('audio-rewind', $audioPlayer.data().jPlayer.status.src);
    }

    var forwardAudio = function() {
        var currentTime = $audioPlayer.data('jPlayer')['status']['currentTime'];
        var seekTime =  currentTime + 15;
        $audioPlayer.jPlayer('play', seekTime);
        focusCardsWrapper();

        ANALYTICS.trackEvent('audio-forward', $audioPlayer.data().jPlayer.status.src);
    };

    var toggleAudio = function() {
        if ($audioPlayer.data('jPlayer')['status']['paused']) {
            if (live) {
                setMedia(LIVE_AUDIO_URL);
            } else {
                playAudio();
            }
        } else {
            if (live) {
                stopAudio();
            } else {
                pauseAudio();
            }
        }

        focusCardsWrapper();
    }

    var onTimeupdate = function(e) {
        var totalTime = e.jPlayer.status.duration;
        var position = e.jPlayer.status.currentTime;
        var remainingTime = totalTime - position;

        for (var i = 0; i < timedAnalytics.length; i++) {
            var obj = timedAnalytics[i];

            if (position >= obj.seconds && !obj.measured) {
                ANALYTICS.trackEvent('audio-' + obj.unit, $audioPlayer.data().jPlayer.status.src);
                obj.measured = true;
            }
        }

        $duration.text($.jPlayer.convertTime(remainingTime));
    }

    var onEnded = function(e) {
        ANALYTICS.trackEvent('audio-ended', $audioPlayer.data().jPlayer.status.src);
    }

    return {
        'setupAudio': setupAudio,
        'setMedia': setMedia,
        'setLive': setLive,
        'rewindAudio': rewindAudio,
        'forwardAudio': forwardAudio,
        'toggleAudio': toggleAudio
    }
})();

