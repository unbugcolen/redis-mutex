export function sleep(time = 0) {
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}

export function safeFloatPremiumCalc(value: number, fractionDigits = 0) {
    return Number(value.toFixed(fractionDigits));
}
