import MultiStream from "multistream";
import { ZodType } from "zod";
import fs from "node:fs";
import { Options, parse } from "csv-parse";
import { transform } from "stream-transform";
import { logError, mergeError } from "./error";
import { tick } from "./tick-tock";

export default function processCsv<T>(
  csvFiles: string[],
  csvParseOptions: Options,
  rowSchema: ZodType<T>,
  onRowParsed: (parsed: T, raw: any) => Promise<void>,
  onStreamEnd: () => Promise<void>,
) {
  // create input streamer with own CSV parser
  const streamer = new MultiStream(
    csvFiles.map(
      (csvFile) => () =>
        fs
          .createReadStream(csvFile)
          .on("error", (error) => {
            logError(mergeError(error, { name: "StreamerError" }));
            process.exit(1);
          })
          .pipe(parse(csvParseOptions))
          .on("error", (error) => {
            logError(mergeError(error, { name: "ParserError" }));
            process.exit(1);
          }),
    ),
    { objectMode: true },
  );
  // create object transformer (parallelised)
  let count = 0n;
  const transformer = transform(async (rawObj) => {
    // parse the row object
    const parsedRow = rowSchema.parse(rawObj);
    // run the handler on the parsed row object
    const transformedOutput = await onRowParsed(parsedRow, rawObj);
    // increment count to show row has been processed
    count++;
    // return for (any/future) next stage in the pipeline
    return transformedOutput;
  }).on("error", (error) => {
    logError(mergeError(error, { name: "TransformerError" }));
    process.exit(1);
  });
  // start processing
  const tock = tick();
  streamer.pipe(transformer).on("finish", () => {
    onStreamEnd().then(() => {
      const duration = tock();
      console.log(
        "Finished!",
        `\n${count.toLocaleString()} row(s) processed in ${duration.seconds.toLocaleString()} seconds.`,
      );
    });
  });
}
