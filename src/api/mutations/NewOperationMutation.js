//@flow
import Mutation from "restlay/Mutation";
import schema from "data/schema";
import type { Operation } from "data/types";
import { success, error } from "formatters/notification";

type Note = {
  title: string,
  content: string
};
// FIXME API : The API is not consistent between GET operation and POST operation
type OperationToPOST = {
  price_amount: number,
  fees_amount: number,
  tx_hash: string,
  note: Note
};

type Input = {
  accountId: number,
  operation: OperationToPOST,
  accountId: number
};

type Response = Operation; // the account that has been created

export default class NewOperationMutation extends Mutation<Input, Response> {
  uri = `/accounts/${this.props.accountId}/operations`;
  method = "POST";

  responseSchema = schema.Operation;

  getSuccessNotification() {
    return success("operation request", "created");
  }

  getErrorNotification(e: Error) {
    return error("operation request", "created", e);
  }

  getBody() {
    return this.props.operation;
  }
}