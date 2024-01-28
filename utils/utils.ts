export const removeCommas = (value) => {
    return value.replace(/,/g, "");
  };

export const formatWithCommas = (value) => {
    const withoutCommas = removeCommas(value);

    const parts = withoutCommas.split(".");
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const formattedValue =
        parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
    return formattedValue;
};

export const formatNumbersWithCommas = (val: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    if (val === "") {
        setter("");
    }

    if (val.match(/^[+]?[0-9]+(\.[0-9]*)?$/)) {
        const formattedAgain = formatWithCommas(val);
        setter(formattedAgain);
    }
};

export const delay = (time) => {
    return new Promise((resolve) => setTimeout(resolve, time));
  };
  