(() => {

  const CONSTANTS = {
    API_KEY: window.API_KEY,
    COOKIE_NAME: 'location',
    COOKIE_EXPIRY: 7,
    FIXED_LOCATION: {
      LAT: 51.50,
      LNG: -0.13
    }
  };

  const CLASSES = {
    VIEWPORT_ACTIVE: 'viewport--active',
    SHOW_NOTE: 'd-block',
    BODY_RAIN: 'rain',
    BODY_NO_RAIN: 'no-rain'
  };

  /**
   *
   * CURRENT LOCATION (overwritten later)
   *
   */

  let latLng = null;

  /**
   *
   * DOM READY
   *
   */

  $(() => {

    const $body = $('body');

    /**
     *
     * SCREENS
     *
     */

    const screens = {
      $loading: $('#screen-loading'),
      $getLocation: $('#screen-get-location'),
      $noLocation: $('#screen-no-location'),
      $result: $('#screen-result'),
      $credits: $('#screen-credits'),
    };

    const $btnChangeLocation = $('#btn-change-location');
    const $panelChangeLocation = $('#panel-change-location');

    /**
     *
     * NAVIGATE TO ANOTHER SCREEN
     *
     */

    const goToScreen = ($screen) => {

      // Hide all screens
      screens.$loading.removeClass(CLASSES.VIEWPORT_ACTIVE);
      screens.$getLocation.removeClass(CLASSES.VIEWPORT_ACTIVE);
      screens.$noLocation.removeClass(CLASSES.VIEWPORT_ACTIVE);
      screens.$result.removeClass(CLASSES.VIEWPORT_ACTIVE);

      // Show this screen
      $screen.addClass(CLASSES.VIEWPORT_ACTIVE);

    };

    /**
     *
     * ZERO PAD
     *
     */

    const zeroPad = (value) => {
      const str = String(value);
      const width = 2;

      return str.length >= width
        ? str
        : new Array(width - str.length + 1).join('0') + value;
    };

    /**
     *
     * SCREEN: RESULT
     *
     */

    const $resultName = $('#result-name');
    const $resultYes = $('#result-yes');
    const $resultNo = $('#result-no');
    const $resultAmount = $('#result-amount');
    const $resultStart = $('#result-start');

    const getUrl = (location) => {
      const url = 'https://api.openweathermap.org/data/2.5/forecast';
      const queryLocation = `lat=${location.lat}&lon=${location.lng}`;
      const queryKey = `appid=${CONSTANTS.API_KEY}`;

      return `${url}?${queryKey}&${queryLocation}`;
    };

    const fetchResult = () => {

      if (!latLng) {
        goToScreen(screens.$getLocation);

        return;
      }

      // Show loading screen
      goToScreen(screens.$loading);

      // Hide stale warning
      hideStale();

      const url = getUrl(latLng);

      fetch(url)
        .then((response) => {

          if (!response.ok) {
            throw response;
          }

          return response.json();
        })
        .then((data) => {

          // Extract information from response
          const {
            city,
            list
          } = data;

          const {
            name
          } = city;

          const startOfTomorrow = new Date();

          // Move date to 00:00:00 tomorrow
          startOfTomorrow.setHours(24);
          startOfTomorrow.setMinutes(0);
          startOfTomorrow.setSeconds(0);
          startOfTomorrow.setMilliseconds(0);

          const tomorrow = startOfTomorrow.getTime();
          const now = new Date();

          // Convert server's dt value into epoch format
          const listDated = list
            .map((item) => {
              // Convert to epoch
              item._date = item.dt * 1000;

              return item;
            });

          // Find index of first date from tomorrow
          const firstTomorrowItem = listDated.findIndex((item) => {
            return item._date >= tomorrow;
          });

          // Filter results so we only have the items with correct dates
          const inDateItems = listDated
            .filter((item) => {
              // If the first item is for tomorrow it must be late night.
              // Therefore include all.
              // Otherwise ignore dates from tommorrow and the past.
              return firstTomorrowItem === 0 ||
                (item._date >= now.getTime() && item._date < tomorrow);
            });

          // Ensure we actually have relevant data points
          if (inDateItems.length) {

            // Filter items that only have rain
            const rainItems = inDateItems
              .filter(() => {
                // Ignore all rain when first item is tomorrow (fudge continues)
                return firstTomorrowItem !== 0;
              })
              .filter((item) => {
                // Only include items with a rain value
                return item.rain && item.rain['3h'];
              });

            // Calculate how much rain is forecast to fall
            const rainAmount = rainItems
              .reduce((accumulator, item) => {
                return accumulator + item.rain['3h'];
              }, 0);

            // Identify the start date of the rain
            const rainStart = rainItems.length
              ? new Date(rainItems[0]._date)
              : new Date();

            // Update DOM
            $resultName.text(name);

            if (rainAmount > 0) {

              const hours = zeroPad(rainStart.getHours());
              const minutes = zeroPad(rainStart.getMinutes());
              const rain = Math.round(rainAmount);

              $body.addClass(CLASSES.BODY_RAIN);
              $body.removeClass(CLASSES.BODY_NO_RAIN);
              $resultYes.show();
              $resultNo.hide();
              $resultAmount.show().text(`How much? ${rain} mm`);
              $resultStart.show().text(`When? ${hours}:${minutes}`);

            } else {

              $body.addClass(CLASSES.BODY_NO_RAIN);
              $body.removeClass(CLASSES.BODY_RAIN);
              $resultNo.show();
              $resultYes.hide();
              $resultAmount.hide().text('');
              $resultStart.hide().text('');

            }

            // Show result screen
            goToScreen(screens.$result);

            $panelChangeLocation.show();

          } else {

            handleFetchError('Data is out-of-date');

          }

        })
        .catch((err) => {

          if (typeof err === 'string') {
            handleFetchError(err);
          } else if (err instanceof Error) {
            handleFetchError(err.message);
          } else {
            err.text().then(handleFetchError);
          }

          console.error(err);

        });

    };

    const handleFetchError = (errMessage) => {

        alert(errMessage);

        // Return to get location screen
        goToScreen(screens.$getLocation);

        $panelChangeLocation.hide();

    };

    /**
     *
     * SCREEN: GET LOCATION
     *
     */

    const $btnGetLocation = $('#btn-get-location');
    const $btnFixedLocation = $('#btn-fixed-location');
    const $noteLoadingLocation = $('#note-loading-location');

    // Toggle buttons based on browser support
    if ('geolocation' in navigator) {
      $btnGetLocation.show();
      $btnFixedLocation.hide();
    } else {
      $btnGetLocation.hide();
      $btnFixedLocation.show();
    }

    $btnGetLocation.on('click', () => {

      $btnGetLocation.attr('disabled', true);
      $noteLoadingLocation.addClass(CLASSES.SHOW_NOTE);

      navigator.geolocation.getCurrentPosition((position) => {

        // Convert to string and modify precision
        const lat = position.coords.latitude.toFixed(2);
        const lng = position.coords.longitude.toFixed(2);

        // Set location
        latLng = {
          lat,
          lng
        };

        // Save in cookie
        Cookies.set(CONSTANTS.COOKIE_NAME, JSON.stringify(latLng), {
          expires: CONSTANTS.COOKIE_EXPIRY
        });

        // Fetch the result from the server
        fetchResult();

        $btnGetLocation.removeAttr('disabled');
        $noteLoadingLocation.removeClass(CLASSES.SHOW_NOTE);

      }, (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            alert('User denied the request for Geolocation');
            break;
          case err.POSITION_UNAVAILABLE:
            alert('Location information unavailable');
            break;
          case err.TIMEOUT:
            alert('Location lookup timed out');
            break;
          default:
            alert('Unknown error');
        }
        $btnGetLocation.removeAttr('disabled');
        $noteLoadingLocation.removeClass(CLASSES.SHOW_NOTE);
      });
    });

    // Handler for fixed location (i.e. no geolocation support)
    $btnFixedLocation.on('click', () => {

        // Convert to string and modify precision
        const lat = CONSTANTS.FIXED_LOCATION.LAT;
        const lng = CONSTANTS.FIXED_LOCATION.LNG;

        // Set location
        latLng = {
          lat,
          lng
        };

        // Save in cookie
        Cookies.set(CONSTANTS.COOKIE_NAME, JSON.stringify(latLng), {
          expires: CONSTANTS.COOKIE_EXPIRY
        });

        // Fetch the result from the server
        fetchResult();

    });

    /**
     *
     * STALE DATA
     *
     */

    const $stale = $('#stale');
    const $btnStale = $('#btn-stale-refresh');
    const $staleConnection = $('#stale-connection');

    const showStale = () => {
      $stale.show();
    };

    const hideStale = () => {
      $stale.hide();
    };

    // Reload the data
    $btnStale.on('click', () => {
      // Cache deletion logic goes here
    });

    const networkOnline = () => {
      $btnStale.removeAttr('disabled');
      $staleConnection.hide();
    };

    const networkOffline = () => {
      $btnStale.attr('disabled', true);
      $staleConnection.show();
    };

    // Network has come online
    $(window).on('online', () => {
      networkOnline();
    });

    // Network has been lost
    $(window).on('offline', () => {
      networkOffline();
    });

    // Initial status - import because we could be loaded by SW when offline
    if (navigator.onLine) {
      networkOnline();
    } else {
      networkOffline();
    }

    /**
     *
     * CHANGE LOCATION
     *
     */

    $btnChangeLocation.on('click', () => {

      // Clear cookie
      Cookies.remove(CONSTANTS.COOKIE_NAME);

      goToScreen(screens.$getLocation);

      $panelChangeLocation.hide();

      $body.removeClass(CLASSES.BODY_NO_RAIN);
      $body.removeClass(CLASSES.BODY_RAIN);

    });

    /**
     *
     * CREDITS LINK
     *
     */

    const $btnCredits = $('#btn-credits');
    const $btnCreditsClose = $('#btn-credits-close');

    $btnCredits.on('click', () => {
      screens.$credits.addClass(CLASSES.VIEWPORT_ACTIVE);
    });

    $btnCreditsClose.on('click', () => {
      screens.$credits.removeClass(CLASSES.VIEWPORT_ACTIVE);
    });

    /**
     *
     * BOOT
     *
     */

    // Check for existing location in the cookies
    const savedLocation = Cookies.get(CONSTANTS.COOKIE_NAME);

    if (savedLocation) {
      // Parse the location
      latLng = JSON.parse(savedLocation);
      // Show change panel message
      $panelChangeLocation.show();
      // If it exists, load result immediately
      fetchResult();
    } else {
      $panelChangeLocation.hide();
      // If not, go to get location screen
      goToScreen(screens.$getLocation);
    }

  });

})();
