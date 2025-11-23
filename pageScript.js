(() => {
  const GRAPHQL_ENDPOINT = 'https://x.com/i/api/graphql/XRqGa7EeokUU5kppkh13EA/AboutAccountQuery';
  const MESSAGE_SOURCE = 'xglobe-content';
  const RESPONSE_TYPE = 'xglobe:location-response';
  const REQUEST_TYPE = 'xglobe:fetch-location';
  const BEARER = 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUIf4jXW7yVH%2BdgacntJ%2Bus%3D1Zv7ttfk8LF81IUq16ZsTADh2etz8W6q3a2B8oqz2M';
  let capturedHeaders = null;
  let hooksActive = false;
  let headersPromiseResolve = null;

  activateHeaderCapture();

  window.addEventListener('message', async (event) => {
    if (event.source !== window) return;
    const data = event.data;
    if (!data || data.source !== MESSAGE_SOURCE || data.type !== REQUEST_TYPE) return;

    const { username, requestId } = data;
    if (!username || !requestId) return;

    try {
      const entry = await fetchLocation(username);
      window.postMessage({ type: RESPONSE_TYPE, requestId, ok: true, entry }, '*');
    } catch (error) {
      window.postMessage({ type: RESPONSE_TYPE, requestId, ok: false, error: error?.message || 'fetch-failed' }, '*');
    }
  });

  async function fetchLocation(screenName) {
    await waitForHeaders();
    const variables = encodeURIComponent(JSON.stringify({ screenName }));
    const response = await fetch(`${GRAPHQL_ENDPOINT}?variables=${variables}`, {
      method: 'GET',
      credentials: 'include',
      headers: buildHeaders(),
      referrer: document.location.href,
      referrerPolicy: 'origin-when-cross-origin',
    });

    if (response.status === 429) {
      const resetSeconds = Number(response.headers.get('x-rate-limit-reset')) || null;
      const retryAfterHeader = Number(response.headers.get('retry-after')) || null;
      const retryAfterMs = retryAfterHeader
        ? retryAfterHeader * 1000
        : resetSeconds
        ? Math.max(0, resetSeconds * 1000 - Date.now())
        : 60_000;
      const err = new Error('rate-limit');
      err.rateLimited = true;
      err.retryAfterMs = retryAfterMs;
      throw err;
    }

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`status-${response.status}:${text.slice(0, 120)}`);
    }

    const data = await response.json();
    const aboutProfile =
      data?.data?.user_result_by_screen_name?.result?.about_profile ||
      data?.data?.user_result_by_screen_name?.result?.legacy?.about_profile ||
      null;

    return {
      location: aboutProfile?.account_based_in || null,
      accountCountryCode: aboutProfile?.account_country_code || null,
      vpnLikely: Boolean(aboutProfile?.use_vpn),
    };
  }

  function buildHeaders() {
    if (capturedHeaders) return capturedHeaders;
    const csrf = readCookie('ct0');
    const guest = readCookie('gt');
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: BEARER,
      'x-twitter-active-user': 'yes',
      'x-twitter-client-language': navigator.language || 'en',
    };
    if (csrf) {
      headers['x-csrf-token'] = csrf;
      headers['x-twitter-auth-type'] = 'OAuth2Session';
    }
    if (guest) headers['x-guest-token'] = guest;
    headers['x-twitter-client-version'] = headers['x-twitter-client-version'] || '2685be8f51f3';
    return headers;
  }

  function readCookie(name) {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function activateHeaderCapture() {
    if (hooksActive) return;
    hooksActive = true;
    const originalFetch = window.fetch;
    window.fetch = function (...args) {
      sniffHeaders(args[0], args[1]?.headers);
      return originalFetch.apply(this, args);
    };

    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;
    const originalSet = XMLHttpRequest.prototype.setRequestHeader;

    XMLHttpRequest.prototype.open = function (...args) {
      this._xglobeHeaders = {};
      return originalOpen.apply(this, args);
    };

    XMLHttpRequest.prototype.setRequestHeader = function (key, value) {
      if (this._xglobeHeaders) this._xglobeHeaders[key] = value;
      return originalSet.apply(this, [key, value]);
    };

    XMLHttpRequest.prototype.send = function (...args) {
      sniffHeaders(null, this._xglobeHeaders);
      return originalSend.apply(this, args);
    };
  }

  function sniffHeaders(request, headers) {
    if (capturedHeaders) return;
    const normalized = normalizeHeaders(request, headers);
    if (normalized && normalized.Authorization) {
      capturedHeaders = normalized;
      headersPromiseResolve?.();
      headersPromiseResolve = null;
    }
  }

  function normalizeHeaders(request, headers) {
    let source = headers;
    if (!source && request instanceof Request) {
      source = request.headers;
    }

    if (!source) return null;
    const result = {};
    if (source instanceof Headers) {
      source.forEach((value, key) => {
      result[key] = value;
      });
    } else {
      for (const [key, value] of Object.entries(source)) {
        result[key] = value;
      }
    }

    if (!result.Authorization && result.authorization) {
      result.Authorization = result.authorization;
      delete result.authorization;
    }
    if (!result.Authorization) result.Authorization = BEARER;
    if (!result['x-csrf-token']) {
      const csrf = readCookie('ct0');
      if (csrf) result['x-csrf-token'] = csrf;
    }
    result['x-twitter-active-user'] = result['x-twitter-active-user'] || 'yes';
    result['x-twitter-client-language'] = result['x-twitter-client-language'] || navigator.language || 'en';
    if (result['x-csrf-token']) {
      result['x-twitter-auth-type'] = result['x-twitter-auth-type'] || 'OAuth2Session';
    }
    if (!result['x-guest-token']) {
      const guest = readCookie('gt');
      if (guest) result['x-guest-token'] = guest;
    }
    result['x-twitter-client-version'] = result['x-twitter-client-version'] || '2685be8f51f3';
    return result;
  }

  function waitForHeaders() {
    if (capturedHeaders) return Promise.resolve();
    return new Promise((resolve) => {
      headersPromiseResolve = resolve;
      setTimeout(resolve, 2000); // fallback quickly if nothing captured
    });
  }
})();
