'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "index.html": "51839f812a32cce7ac40ca488295da30",
"/": "51839f812a32cce7ac40ca488295da30",
"main.dart.js": "7dcd6a5ddecd7a7de53b0ff90c8f3ef7",
"assets/AssetManifest.json": "9a9dc0fcf13a169b21599ded2002d794",
"assets/NOTICES": "b48591b7114c518432ec540d16de5120",
"assets/FontManifest.json": "3c5f459c429d13fe7072fe429f68b654",
"assets/fonts/Arkipelago.otf": "8d60d9104579c47ed7aed99f61cba541",
"assets/fonts/MaterialIcons-Regular.ttf": "56d3ffdef7a25659eab6a68a3fbfaf16",
"assets/fonts/OpenSans-Bold.ttf": "50145685042b4df07a1fd19957275b81",
"assets/fonts/OpenSans-Regular.ttf": "629a55a7e793da068dc580d184cc0e31",
"assets/assets/oil.png": "0d0d373d4d01c625809d1f28ecbb4427",
"assets/assets/red_bell.png": "9eb6f83655c89a7fdfd2ff521a0c2b3c",
"assets/assets/chili.png": "3689788fe53095366db2f6bcf02a8791",
"assets/assets/preview.png": "17dae9b3d7e78b11f7fe8c2ff68b4004",
"assets/assets/bokchoy.png": "5ce55ccae844b9074474a136aa073011",
"assets/assets/green_bell.png": "373df11b149ea523ffd22053664db8b8",
"assets/assets/beef_caldereta.jpg": "7c7bf11d9297b54d4930d0bf1892dcc6",
"assets/assets/potato.png": "8154441acf8b33a637b14178c776cf24",
"assets/assets/salt.png": "a3c2e4bd56222c9bd190b388bedfd3bd",
"assets/assets/ground_pork.png": "85bac44629befe56359b0c6775e92ea8",
"assets/assets/carrot.png": "4401bb5805931f67f168681b82782fbe",
"assets/assets/squid.png": "e10b66dc85c03323c0550d1c5fd579bd",
"assets/assets/flour.png": "2918647aa676caaece47a7d9d8b7d944",
"assets/assets/onion.png": "347f96bf58f6ffcd8321276e9db8f24e",
"assets/assets/butter.png": "771ff83bef2090b44ca2bf960542636b",
"assets/assets/tomato.png": "0eb21f102cddac27e2e7ba53228bd69a",
"assets/assets/beef.png": "c52cc4e2054ad0b54ae66d13e0118dc4",
"assets/assets/pork_sisig.jpg": "1104ee422e330de6e6ad42c253a7e0cd",
"assets/assets/raisins.png": "4dc449290a8a6bb80a5acfda1e02845a",
"assets/assets/cheese.png": "a410babc50699ba0cfeff849b828906c",
"assets/assets/garlic.png": "dfa782c4a86d7b79807dd65c645239cf",
"assets/assets/sausage.png": "07d1eea2cd3fc8852c97a59112f418a1",
"assets/assets/calamares.jpg": "5dbbd5626d6ca8ab998cbe6b4a7da2ca",
"assets/assets/pochero.jpg": "861c8e05010307c1ac8280d6098d5802",
"assets/assets/red_pepper.png": "b0813ceb27e056351c1164d848e903a8",
"assets/assets/yellow_onion.png": "e93b2543131d2eb5e88edb8b22c4b67f",
"assets/assets/lemon.png": "e5133b9f04dd894d8b20b52087f0f370",
"assets/assets/banana.png": "37747de3b5e65eb5450a5c37529bbd71",
"assets/assets/pork.png": "efd8cc008658263b23213e9fc77d5f49",
"assets/assets/cabbage.png": "d5d7e5a9fd435a974944388ddfbd30ef",
"assets/assets/egg.png": "7a7460c39df5d9c58335c76f5d3b2fc9",
"assets/assets/black_pepper.png": "4d889fc5e27ad63d6b97106eae698370",
"assets/assets/green_beans.png": "15f736eec27ee44bd14173cd37078895",
"assets/assets/embutido.jpg": "65f78137fd53c4c5009426bf590f0d03"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/LICENSE",
"assets/AssetManifest.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      // Provide a no-cache param to ensure the latest version is downloaded.
      return cache.addAll(CORE.map((value) => new Request(value, {'cache': 'no-cache'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');

      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }

      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#')) {
    key = '/';
  }
  // If the URL is not the the RESOURCE list, skip the cache.
  if (!RESOURCES[key]) {
    return event.respondWith(fetch(event.request));
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache. Ensure the resources are not cached
        // by the browser for longer than the service worker expects.
        var modifiedRequest = new Request(event.request, {'cache': 'no-cache'});
        return response || fetch(modifiedRequest).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.message == 'skipWaiting') {
    return self.skipWaiting();
  }

  if (event.message = 'downloadOffline') {
    downloadOffline();
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey in Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.add(resourceKey);
    }
  }
  return Cache.addAll(resources);
}
