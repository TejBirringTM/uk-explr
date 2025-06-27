export function logError<ErrorType = unknown>(error: ErrorType) {
  if (error instanceof Error) {
    console.error({
      name: error.name,
      message: error.message,
      cause: error.cause,
      stack: error.stack,
    });
  } else if (
    error &&
    typeof error === "object" &&
    "toString" in error &&
    typeof error.toString === "function"
  ) {
    console.error("Unknown Error", error.toString());
  } else {
    console.error("Unknown Error");
  }
}

export function mergeError(error: Error, merge: { name?: string }) {
  if (error instanceof Error) {
    error.name = merge.name ?? error.name;
  }
  return error;
}
