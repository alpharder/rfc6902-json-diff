import type { ComparableRecord, RFC6902, CompareFunc } from "../types";
import { diffUnknownValues } from "./diff-unknown-values";

export function diffObjects(
  leftObj: ComparableRecord,
  rightObj: ComparableRecord,
  compareFunc: CompareFunc,
  path = "",
  operations: RFC6902.Operation[] = []
): void {
  let key;

  const leftKeys = Object.keys(leftObj);
  for (key = leftKeys.length - 1; key >= 0; key--) {
    const leftKey = leftKeys[key];
    const leftVal = leftObj[leftKey];
    const rightVal = rightObj[leftKey];

    if (leftVal === rightVal) continue;

    diffUnknownValues(
      leftVal,
      rightVal,
      compareFunc,
      `${path}/${leftKey}`,
      leftKey in rightObj,
      operations
    );
  }

  for (key in rightObj) {
    if (!(key in leftObj) && rightObj[key] !== undefined) {
      operations.push({
        op: "add",
        path: `${path}/${key}`,
        value: rightObj[key],
      });
    }
  }
}
