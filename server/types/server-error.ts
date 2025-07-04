export class ServerError extends Error {
  constructor(
    public readonly status: number,
    public readonly message: string = "<No message>",
  ) {
    super(message);
  }
}
