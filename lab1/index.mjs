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

const removeInput = (inputWrapper, inputElement) => {
  inputBoxElement.removeChild(inputWrapper);
  const index = inputElementRefs.indexOf(inputElement);
  if (index > -1) inputElementRefs.splice(index, 1);
  handleInputChange();
};

const addNewNumericInput = () => {
  const inputWrapper = document.createElement("div");
  const newInput = document.createElement("input");
  const removeButton = document.createElement("button");

  newInput.type = "number";
  newInput.value = 0;
  removeButton.innerText = "Remove";

  inputElementRefs.push(newInput);
  removeButton.addEventListener("click", () =>
    removeInput(inputWrapper, newInput)
  );

  inputWrapper.appendChild(newInput);
  inputWrapper.appendChild(removeButton);
  inputBoxElement.appendChild(inputWrapper);

  newInput.addEventListener("change", handleInputChange);
};

const initialize = () => {
  const addInputBoxButton = document.getElementById("add-math-input-box");
  addInputBoxButton.addEventListener("click", addNewNumericInput);

  for (let i = 0; i < 3; i++) {
    addNewNumericInput();
  }
};

initialize();
