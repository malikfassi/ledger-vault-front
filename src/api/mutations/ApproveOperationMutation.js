//@flow
import Mutation from "restlay/Mutation";
import schema from "data/schema";
import type { Operation } from "data/types";
import { success, error } from "formatters/notification";

type In = {
  operationId: string
};

type Res = Operation;

export default class ApproveOperationMutation extends Mutation<In, Res> {
  uri = `/operations/${this.props.operationId}/approve`;
  method = "POST";
  responseSchema = schema.Operation;

  getSuccessNotification() {
    return success("operation request", "approved");
  }

  getErrorNotification(e: Error) {
    return error("operation request", "approved", e);
  }
}
