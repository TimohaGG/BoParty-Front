export enum UnitType{
  grams="г",
  mililiters="мл",
  kilos="кг",
  liters="л",
  pieces="шт"
}

export function getAllUnits(){
  return Object.values(UnitType);
}
