export enum Size {
    XS = 0,
    S = 1,
    M = 2,
    L = 3,
    XL = 4,
    XXL = 5,
}

export const QualityControlTypeEnumLabelMapping: Record<Size, string> = {
    [Size.XS]: "X Small",
    [Size.S]: "Small",
    [Size.M]: "Medium",
    [Size.L]: "Large",
    [Size.XL]: "X Large",
    [Size.XXL]: "XX Large",

}