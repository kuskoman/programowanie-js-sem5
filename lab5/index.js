class Logger {
  static log(data) {
    console.log(data);
  }
}

const saveCToSessionStorage = (data) => {
  const storageData = { data };
  sessionStorage.setItem("C", JSON.stringify(storageData));
};

const saveAndLog = (data) => {
  Logger.log("[reader C]", data);
  saveCToSessionStorage(data);
  Logger.log(`[log from C] ${data}`);
};

const discoverPowerBallNumber = (data) => {
  const number = Math.floor(Math.random() * data * 100);
  console.log("[powerball number]", number);
};

const getIntervalTrigger = (fnArray, intervalTime = 1000) => {
  let timer = 1;
  setInterval(() => {
    fnArray.forEach((fn) => fn(timer));
    timer++;
  }, intervalTime);
};

getIntervalTrigger([saveAndLog, discoverPowerBallNumber])();

const executeFunctionsSequentially = (fnArray) => {
  return (data) => {
    fnArray.reduce((acc, fn) => fn(acc), data);
  };
};

const pipe =
  (...fns) =>
  (x) =>
    fns.reduce((v, f) => f(v), x);

const subscribe = (fn) => {
  return (data) => {
    fn(data);
  };
};

const fn1 = (data) => {
  console.log("fn1", data);
  return data;
};

const fn2 = (data) => {
  console.log("fn2", data);
  return data + 1;
};

const toObservable = (data) => {
  return {
    pipe: (...fns) => toObservable(pipe(...fns)(data)),
    subscribe: (fn) => toObservable(subscribe(fn)(data)),
  };
};

const number$ = toObservable(1);
number$.pipe(fn1, fn2).subscribe((data) => console.log("fn3", data));
