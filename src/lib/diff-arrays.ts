import { diffArraysUsingLcs } from "./diff-arrays-using-lcs";
import { diffUnknownValues } from "./diff-unknown-values";
import type { RFC6902, CompareFunc } from "../types/index";

export function diffArrays(
  leftArr: Array<unknown>,
  rightArr: Array<unknown>,
  compareFunc: CompareFunc,
  path = "",
  operations: RFC6902.Operation[] = [],
  detectMoveOperations = false
): void {
  const leftLen = leftArr.length;
  const rightLen = rightArr.length;

  if (leftLen === 0) {
    for (let i = 0; i < rightLen; i++) {
      operations.push({ op: "add", path: `${path}/${i}`, value: rightArr[i] });
    }
  } else if (rightLen === 0) {
    operations.push({ op: "replace", path, value: rightArr });
  } else if (leftLen === 1 && rightLen === 1) {
    diffUnknownValues(
      leftArr[0],
      rightArr[0],
      compareFunc,
      `${path}/0`,
      true,
      operations
    );
  } else {
    diffArraysUsingLcs(
      leftArr,
      rightArr,
      compareFunc,
      path,
      operations,
      detectMoveOperations
    );
  }
}
