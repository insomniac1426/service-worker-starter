"use strict"

// 1. setup version
const version = 3;

// states in service worker
var isOnline = true;

self.addEventListener("install", onInstall);
self.addEventListener("activate", onActivate);
self.addEventListener("message", onMessage);

main().catch(console.error);

async function main() {
  console.log(`service worker v${version} started ..`);
  await sendMessage({ requestStatusUpdate: true });
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
  console.log("data: ", { data });
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
  await clients.claim();
  console.log(`service worker v${version} is activated ..`)
}