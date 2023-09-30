const inputBoxElement = document.getElementById("math-input-box");

const inputElementRefs = [];

const getMathFunctions = () => {
  const getInputValues = () => {
    return inputElementRefs.map((input) => Number(input.value));
  };

  const calculateSum = () => {
    const inputValues = getInputValues();
    const sum = inputValues.reduce((acc, value) => acc + value, 0);
    const sumElement = document.getElementById("sum");

    sumElement.innerText = sum;
  };

  const calculateMin = () => {
    const inputValues = getInputValues();
    const min = Math.min(...inputValues);
    const minElement = document.getElementById("min");

    minElement.innerText = min;
  };

  const calculateMax = () => {
    const inputValues = getInputValues();
    const max = Math.max(...inputValues);
    const maxElement = document.getElementById("max");

    maxElement.innerText = max;
  };

  const calculateAverage = () => {
    const inputValues = getInputValues();
    const average =
      inputValues.reduce((acc, value) => acc + value, 0) / inputValues.length;
    const averageElement = document.getElementById("avg");

    averageElement.innerText = average;
  };

  const mathFunctions = [
    calculateSum,
    calculateMin,
    calculateMax,
    calculateAverage,
  ];

  return mathFunctions;
};

const mathFunctions = getMathFunctions();

const handleInputChange = () => {
  mathFunctions.forEach((mathFunction) => mathFunction());
};

const createAddInputListener = () => {
  const addInputBoxButton = document.getElementById("add-math-input-box");

  const addNewNumericInput = () => {
    const newInput = document.createElement("input");
    newInput.type = "number";
    newInput.value = 0;

    inputElementRefs.push(newInput);

    inputBoxElement.appendChild(newInput);
    newInput.addEventListener("change", handleInputChange);
  };

  addInputBoxButton.addEventListener("click", addNewNumericInput);
};

createAddInputListener();
