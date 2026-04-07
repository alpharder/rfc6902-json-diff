import type {
  ComparableValue,
  CompareFunc,
  CompareOptions,
  RFC6902,
} from "../types/index";
import { diffUnknownValues } from "./diff-unknown-values";
import { deepEqual } from "./util/deep-equal";

function createCompareFunc(doCaching: boolean): CompareFunc {
  if (!doCaching) {
    return deepEqual;
  }

  const equalityCache = new WeakMap<object, unknown[]>();

  return (left, right) => {
    if (
      typeof left === "object" &&
      left !== null &&
      typeof right === "object" &&
      right !== null
    ) {
      if (equalityCache.has(left) && equalityCache.get(left)?.includes(right)) {
        return true;
      }

      if (
        equalityCache.has(right) &&
        equalityCache.get(right)?.includes(left)
      ) {
        return true;
      }

      const areEqual = deepEqual(left, right);

      if (areEqual) {
        if (equalityCache.has(left)) {
          equalityCache.get(left)?.push(right);
        } else {
          equalityCache.set(left, [right]);
        }

        if (equalityCache.has(right)) {
          equalityCache.get(right)?.push(left);
        } else {
          equalityCache.set(right, [left]);
        }
      }

      return areEqual;
    } else {
      return deepEqual(left, right);
    }
  };
}

export function compare(
  left: ComparableValue,
  right: ComparableValue,
  options: CompareOptions = {}
): RFC6902.Operation[] {
  const compareFunc = createCompareFunc(Boolean(options.doCaching));

  const operations: RFC6902.Operation[] = [];

  diffUnknownValues(
    left,
    right,
    compareFunc,
    "",
    false,
    operations,
    Boolean(options.detectMoveOperations)
  );

  return operations;
}
