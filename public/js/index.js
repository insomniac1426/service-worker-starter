// Setting up a web worker
(function webWorkerSetup() {
  const startWorkerBtn = document.getElementById('start_worker');
  const chalkBoard = document.getElementById('chalk_board');

  startWorkerBtn.addEventListener('click', startWorker, false);

  var worker = null;

  function startWorker() {
    startWorkerBtn.innerText = "stop";
    startWorkerBtn.removeEventListener('click', startWorker, false);
    startWorkerBtn.addEventListener('click', stopWorker, false);

    worker = new Worker('./static/js/worker.js')
    worker.addEventListener('message', onMessage);
    worker.postMessage({ start: true });

    function onMessage(e) {
      const { idx, fib } = e.data;
      if (idx !== undefined && fib !== undefined) {
        chalkBoard.innerText = `idx: ${idx}, fib: ${fib}\n${chalkBoard.innerText}`;
      }
    }
  }

  function stopWorker() {
    startWorkerBtn.innerText = "start";
    startWorkerBtn.removeEventListener('click', stopWorker, false);
    startWorkerBtn.addEventListener('click', startWorker, false);

    worker.terminate();
  }
})();


// **** Setting up SW ************************ 
(function ServiceWorkerSetup() {
  var isOnline = ("onLine" in navigator) ? navigator.onLine : true;
  
  document.addEventListener('DOMContentLoaded', ready, false);

  var svcworker;

  initSvcWorker().catch(console.error);

  function ready() {
    const offlineTab = document.getElementById('connectivity-status');

    if(!isOnline) {
      offlineTab.classList.add('hidden');
    }

    window.addEventListener('online', userOnlineHandler);
    window.addEventListener('offline', userOfflineHandler);

    function userOfflineHandler() {
      offlineTab.classList.remove('hidden');
      isOnline = false;
      sendStatusUpdate();
    }

    function userOnlineHandler() {
      offlineTab.classList.add('hidden');
      isOnline = true;
      sendStatusUpdate();
    }
  }

  async function initSvcWorker() {
    const svcWorkerRegistration = await navigator.serviceWorker.register("/sw.js", {
      updateViaCache: "none",
    })

    svcworker = svcWorkerRegistration.installing
    || svcWorkerRegistration.waiting
    || svcWorkerRegistration.active;

    // not exactly sure when this is called
    navigator.serviceWorker.addEventListener(
      'controllerchange', 
      function onControllerChange() {
        svcworker = navigator.serviceWorker.controller;
        console.log("controller change happened, sending status ..");
        sendStatusUpdate(svcworker);
      }
    );

    navigator.serviceWorker.addEventListener('message', onMessage);
  }

  function onMessage(event) {
    const { data } = event;
    if(data.requestStatusUpdate) {
      // we have to message on a port
      console.log("received a status update request ..");
      sendStatusUpdate(event.ports && event.ports[0]);
    }
  }

  function sendStatusUpdate(target) {
    console.log(" send status update called", { target })
    swSendMessage({ statusUpdate: { isOnline }}, target);
  }

  function swSendMessage(msg, target) {
    if(target) {
      target.postMessage(msg);
    } else if(svcworker) {
      svcworker.postMessage(msg);
    } else {
      navigator.serviceWorker.controller.postMessage(msg);
    }
  }
})();