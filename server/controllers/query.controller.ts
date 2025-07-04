import QueryRequest from "../models/QueryRequest";
import QueryResponse from "../models/QueryResponse";
import { declareController } from "../utils/declare-controller";

const queryController = declareController(
  QueryRequest,
  QueryResponse,
  async (req) => {
    return {
      data: [],
      length: 0,
    };
  },
);

export default queryController;
