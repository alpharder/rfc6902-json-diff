import { diffObjects } from "./diff-objects";
import { diffArrays } from "./diff-arrays";
import type { RFC6902, CompareFunc } from "../types/index";

export function diffUnknownValues(
  leftVal: unknown,
  rightVal: unknown,
  compareFunc: CompareFunc,
  path = "",
  rightValExists = false,
  operations: RFC6902.Operation[] = [],
  detectMoveOperations = false
) {
  if (leftVal === rightVal) {
    return;
  }

  if (!rightValExists && leftVal !== undefined && rightVal === undefined) {
    operations.push({
      op: "remove",
      path,
    });
    return;
  }

  let ctor;

  if (
    leftVal &&
    rightVal &&
    (ctor = leftVal.constructor) === rightVal.constructor
  ) {
    if (ctor === Array) {
      diffArrays(
        leftVal as Array<unknown>,
        rightVal as Array<unknown>,
        compareFunc,
        path,
        operations,
        detectMoveOperations
      );
      return;
    }

    if (!ctor || typeof leftVal === "object") {
      diffObjects(
        leftVal as Record<number, unknown>,
        rightVal as Record<number, unknown>,
        compareFunc,
        path,
        operations
      );
      return;
    }
  }

  operations.push({
    op: "replace",
    path,
    value: rightVal,
  });
}
