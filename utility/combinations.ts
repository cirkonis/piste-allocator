import {factorial} from "@/utility/factorial";

export const combinations = (n: number, r: number): number => {
    return factorial(n) / (factorial(r) * factorial(n - r));
};