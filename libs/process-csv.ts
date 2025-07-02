import MultiStream from "multistream";
import { ZodType } from "zod";
import fs from "node:fs";
import { Options, parse } from "csv-parse";
import { transform } from "stream-transform";
import { logError, mergeError } from "./error";
import { tick } from "./tick-tock";

export type ProcessRowFn<T, PrintOut = T> = (
  parsed: T,
  raw: any,
) => Promise<PrintOut | null>; // null depicts item has been omitted
export type OnFinishedFn = () => Promise<void>;

export default async function processCsv<T>(
  csvFiles: string[],
  csvParseOptions: Options,
  rowSchema: ZodType<T>,
  processRowFn: ProcessRowFn<T>,
  onFinishedFn: OnFinishedFn,
) {
  /**
   * initialise the input stream:
   * for each CSV file, create read stream with own CSV parser
   */
  const streamer = new MultiStream(
    csvFiles.map(
      (csvFile) => () =>
        fs
          .createReadStream(csvFile)
          .on("error", (error) => processError(error, "FileStreamerError"))
          .pipe(parse(csvParseOptions))
          .on("error", (error) => processError(error, "CsvFileParserError")),
    ),
    { objectMode: true },
  );
  /**
   * initialise the processing pipeline
   */
  const pipeline = streamer
    .pipe(rowProcessor(rowSchema, processRowFn))
    .on("error", (error) => processError(error, "RowProcessorError"));
  /**
   * read out from the stream till end reached
   */
  let rowCount = 0n;
  const tock = tick();
  for await (const n of pipeline) {
    console.debug(n);
    rowCount++;
  }
  const duration = tock();
  /**
   * execute `onFinishedFn` callback function
   */
  await onFinishedFn();
  console.log(
    "Finished!",
    `\n${rowCount.toLocaleString()} row(s) processed in ${duration.seconds.toLocaleString()} seconds.`,
  );
}

function processError(error: unknown, mergeErrorName?: string) {
  logError(
    mergeErrorName && error instanceof Error
      ? mergeError(error, { name: mergeErrorName })
      : error,
  );
  process.exit(1);
}

const rowProcessor = <T>(schema: ZodType<T>, processRowFn: ProcessRowFn<T>) =>
  transform(
    {
      parallel: 100,
    },
    async (rawObj) => {
      const parsedRow = schema.parse(rawObj);
      return await processRowFn(parsedRow, rawObj);
    },
  );
