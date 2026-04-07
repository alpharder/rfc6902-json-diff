// @ts-nocheck

import { compare } from "../dist";
import {
  multiDimensionalArrayCases,
  objectCases,
  otherCasesInsideMultidimensionalArrays,
  realWorldLargeDocumentCases,
  singleDimensionalArrayOfPrimitivesCases,
} from "../src/tests/_diff-test-data";

import type { DiffTestCase } from "../src/tests/_diff-test-data";

import pkg from "fast-json-patch";
const { compare: fastJsonPatchCompare } = pkg;
import { createPatch } from "rfc6902";
import { create } from "jsondiffpatch";
import * as jsonpatchFormatter from "jsondiffpatch/formatters/jsonpatch";

// @ts-ignore
import Benchmark from "benchmark";
import * as process from "process";

const PRECISION = 2;

let i = 0;

const jsondiffpatchDiffer = create({
  arrays: { detectMove: false },
  objectHash: (obj) => JSON.stringify(obj),
});

const testSuites: DiffTestCase[] = [
  ...realWorldLargeDocumentCases,
  // ...otherCasesInsideMultidimensionalArrays,
  // ...singleDimensionalArrayOfPrimitivesCases,
];

for (const testSuite of testSuites) {
  const results: unknown[] = [];
  const suite = new Benchmark.Suite();
  suite
    // add tests
    .add("rfc6902-json-diff", () => {
      compare(testSuite.left, testSuite.right);
    })
    .add("fast-json-patch", () => {
      fastJsonPatchCompare(testSuite.left, testSuite.right);
    })
    .add("rfc6902", () => {
      createPatch(testSuite.left, testSuite.right);
    })
    .add("jsondiffpatch", () => {
      jsonpatchFormatter.format(
        jsondiffpatchDiffer.diff(testSuite.left, testSuite.right)
      );
    })

    // add listeners
    .on("start", () =>
      console.log(`Starting benchmarks set #${i} – ${testSuite.title}`)
    )
    .on("cycle", (event) =>
      results.push({
        name: event.target.name,
        hz: event.target.hz,
        "margin of error": `±${Number(event.target.stats.rme).toFixed(2)}%`,
        "runs sampled": event.target.stats.sample.length,
      })
    )
    .on("complete", function () {
      const lowestHz = results.slice().sort((a, b) => a.hz - b.hz)[0].hz;

      console.table(
        results
          .sort((a, b) => b.hz - a.hz)
          .map((result) => ({
            ...result,
            hz: Math.round(result.hz).toLocaleString(),
            numTimesFaster:
              Math.round((10 ** PRECISION * result.hz) / lowestHz) /
              10 ** PRECISION,
          }))
          .sort((a, b) => a.INPUT_SIZE - b.INPUT_SIZE)
          .reduce((acc, { name, ...cur }) => ({ ...acc, [name]: cur }), {})
      );
      console.log("Fastest is " + this.filter("fastest").map("name"));
    })

    .run({ async: false });

  i++;
}
