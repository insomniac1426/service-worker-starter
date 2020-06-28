"use strict"

// 1. setup version
const version = 7;

// states in service worker
var isOnline = true;

var CACHE_KEY = `sw-personal-v${version}`
var chachedUrls = [
  '/',
  '/static/css/app.css',
  '/static/js/index.js'
];


self.addEventListener("install", onInstall);
self.addEventListener("activate", onActivate);
self.addEventListener("message", onMessage);
self.addEventListener("fetch", onFetch);

main().catch(console.error);

async function main() {
  console.log(`service worker v${version} started ..`);
  await sendMessage({ requestStatusUpdate: true });
  await cachePages(/*forceReload= */false);
}

function onFetch(event) {
  console.log("onFetch event handleer called");
  event.respondWith(router(event.request)); 
}

async function router(req) {
  // 1. need to make actual fetcch call to server
  const url = new URL(req.url);
  const reqUrl = url.pathname;
  if(url.origin === location.origin) {
    try {
      const fetchOptions = {
        method: req.method,
        headers: req.headers,
        credentials: "omit",
        cache: "no-store"
      }
      const res = fetch(req.url, fetchOptions);
      if(res && res.ok) {
        cache.put(reqUrl, res.clone());
        return res;
      }
    } catch(err) {
      console.error(err);
    }

    const cache = await caches.open(CACHE_KEY);
    const res = await cache.match(reqUrl);
    if(res) {
      return res.clone();
    }
  }
}

async function cachePages(forcedReload = false) {
  const cache = await caches.open(CACHE_KEY);
  return Promise.all(chachedUrls.map(async function cacheUrl(url) {
    if(!forcedReload) {
      const res = await cache.match(url);
      if(res) {
        return res;
      }
    }

    const fetchOptions = {
      method: "GET",
      cache: "no-store", // browser sould not send cached version itself
      credentials: "omit" // omit cookies
    }
    const fetchRes = await fetch(url, fetchOptions);
    if(fetchRes.ok) {
      cache.put(url, fetchRes.clone()); 
    }
  }))
}

async function clearOldCache() {
  const allCaches = await caches.keys();
  const oldCaches = allCaches.filter(function matchUrl(url) {
    return /^sw-personal-v\d$/.test(url);
  });

  return Promise.all(oldCaches.map(async function deleteCache(cacheName) {
    const [,cacheVersion] = cacheName.match(/^sw-personal-v(\d)$/);
    if(Number(cacheVersion) !== version) {
      await caches.delete(cacheName);
    }
  }))
}

async function sendMessage(msg) {
  const allClients = await clients.matchAll({
    includeUncontrolled: true,
  })

  return Promise.all(allClients.map(function sendMessageTo(client) {
    // when we are communicating with clients the 
    // we need to open a message channel
    // port1: receives message on this
    // port2: sends message on this
    const channel = new MessageChannel();
    channel.port1.onmessage = onMessage;
    return client.postMessage(msg, [channel.port2]);
  }))
}

function onMessage({ data }) {
  if(data.statusUpdate) {
    ({ isOnline } = data.statusUpdate);
    console.log(`status update has been received, isOnline: ${isOnline}`);
  }
}

async function onInstall() {
  console.log(`service worker v${version} is installing ..`);
  // here we need to skip waaiting phase where
  // the browser waits for user to navigate to another page 
  // to load up the new service worker

  self.skipWaiting();
}

function onActivate(event) {
  // try to prevent the browser to close the service worker
  // if the site is closed.
  // eventually browser closes if the worker's callback takes too long
  event.waitUntil(handleActivation()); 
}

async function handleActivation() {
  await clearOldCache();
  await cachePages(/*forceReload= */true);
  await clients.claim();
  console.log(`service worker v${version} is activated ..`)
}