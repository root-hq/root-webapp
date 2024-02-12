export const removeCommas = (value: string): string => {
  return value.replace(/,/g, "");
};

export const formatWithCommas = (value: string): string => {
  const withoutCommas = removeCommas(value);

  const parts = withoutCommas.split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const formattedValue =
    parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
  return formattedValue;
};

export const formatNumbersWithCommas = (
  val: string,
  setter: React.Dispatch<React.SetStateAction<string>>,
) => {
  if (val === "") {
    setter("");
  }

  if (val.match(/^[+]?[0-9]+(\.[0-9]*)?$/)) {
    const formattedAgain = formatWithCommas(val);
    setter(formattedAgain);
  }
};

export const justFormatNumbersWithCommas = (val: string) => {
  if (val === "") {
    return "";
  }

  if (val.match(/^[+]?[0-9]+(\.[0-9]*)?$/)) {
    const formattedAgain = formatWithCommas(val);
    return formattedAgain;
  }
};

export const delay = (time) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

export const decimalPlacesFromTickSize = (tickSize: string): number => {
  if (tickSize.includes("e")) {
    // Splitting the string into base and exponent parts
    const [base, exponent] = tickSize.split("e");
    // Removing leading zeros from the base
    const baseWithoutZeros = base.replace(/^0+/, "");
    // Calculating the number of decimal places
    return -1 * parseInt(exponent) + (baseWithoutZeros.length - 1);
  }

  // Find the position of the decimal point
  const decimalPointIndex: number = tickSize.indexOf(".");

  // If there is no decimal point, return 0
  if (decimalPointIndex === -1) {
    return 0;
  }

  // Calculate the number of decimal places
  const decimalPlaces: number = tickSize.length - decimalPointIndex - 1;

  return decimalPlaces;
};

export function toScientificNotation(num: number): string {
  const exponent = Math.floor(Math.log10(Math.abs(num)));
  const coefficient = num / Math.pow(10, exponent);
  return `${coefficient.toFixed(2)}e${exponent}`;
}
