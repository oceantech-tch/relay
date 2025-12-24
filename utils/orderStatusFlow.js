export const isValidStatusTransition = (current, next) => {
    if (current === "NEW" && next === "PREPARING") return true;
    if (current === "PREPARING" && next === "READY") return true;
    if (current === "READY" && next === "DELIVERD") return true;

    return false;
};