self.onmessage = function(event) {
  console.log(event.data)
  let curIdx = 0;
  function getFib() {
    const fib = calculateFib(curIdx);
    self.postMessage({ idx: curIdx, fib });
    curIdx++;
    /**
    * we can test that the dev tools work on the instance's thread
    */
    setTimeout(getFib, 0);
  }
  getFib();
}


function calculateFib(n) {
  if(n <= 1) return 0;
  if(n === 2) return 1;
  else return(calculateFib(n - 1) + calculateFib(n - 2));
}