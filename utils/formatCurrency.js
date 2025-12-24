const NAIRA = "\u20A6";

export const formatCurrency = (amount) => {
    return `${NAIRA}${Number(amount).toLocaleString("en-NG")}`;
};