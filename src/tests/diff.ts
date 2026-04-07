import test from "ava";

import { compare } from "../lib/index";
import { DiffTestCase, allCases } from "./_diff-test-data";
import { applyPatch as fastJsonPatchApplyPatch } from "fast-json-patch";
import { cloneDeep } from "lodash";

const diffMacro = test.macro(
  (t, { left, right, expected, detectMoveOperations }: DiffTestCase) => {
    const leftExpectedClone = cloneDeep(left);
    const leftActualClone = cloneDeep(left);
    const rightExpectedClone = cloneDeep(right);
    const rightActualClone = cloneDeep(right);
    const expectedDiff = cloneDeep(expected);

    const actualDiff = compare(left, right, {
      detectMoveOperations: Boolean(detectMoveOperations),
    });

    const { newDocument: expectedDiffDocument } = fastJsonPatchApplyPatch(
      leftExpectedClone,
      expectedDiff
    );

    const { newDocument: actualDiffDocument } = fastJsonPatchApplyPatch(
      leftActualClone,
      actualDiff
    );
    t.deepEqual(
      actualDiffDocument,
      rightActualClone,
      "Actual diff applying failure"
    );
    t.deepEqual(
      expectedDiffDocument,
      rightExpectedClone,
      "Expected diff applying failure"
    );

    t.deepEqual(actualDiff, expected, "Diff generation failure");
  }
);

for (const testCase of allCases) {
  if ("skip" in testCase && testCase.skip) {
    test.skip(testCase.title, diffMacro, testCase);
  } else if ("only" in testCase && testCase.only) {
    test.only(testCase.title, diffMacro, testCase);
  } else {
    test(testCase.title, diffMacro, testCase);
  }
}
