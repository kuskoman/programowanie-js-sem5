const inputBoxElement = document.getElementById("math-input-box");

const inputElementRefs = [];

const getInputValues = () =>
  inputElementRefs.map((input) => Number(input.value));

const calculateAndDisplay = (operation, elementId) => {
  const result = operation(getInputValues());
  document.getElementById(elementId).innerText = result;
};

const sum = (numbers) => numbers.reduce((acc, num) => acc + num, 0);
const min = (numbers) => Math.min(...numbers);
const max = (numbers) => Math.max(...numbers);
const avg = (numbers) => sum(numbers) / (numbers.length || 1); // Prevent division by zero

const handleInputChange = () => {
  calculateAndDisplay(sum, "sum");
  calculateAndDisplay(min, "min");
  calculateAndDisplay(max, "max");
  calculateAndDisplay(avg, "avg");
};

const addNewNumericInput = () => {
  const newInput = document.createElement("input");
  newInput.type = "number";
  newInput.value = 0;

  inputElementRefs.push(newInput);

  inputBoxElement.appendChild(newInput);
  newInput.addEventListener("change", handleInputChange);
  handleInputChange();
};

const initialize = () => {
  const addInputBoxButton = document.getElementById("add-math-input-box");
  addInputBoxButton.addEventListener("click", addNewNumericInput);
};

initialize();
