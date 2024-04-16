import { SorobanRpc } from "@stellar/stellar-sdk";

export const SendTxStatus: {
    [index: string]: SorobanRpc.Api.SendTransactionStatus;
  } = {
    Pending: "PENDING",
    Duplicate: "DUPLICATE",
    Retry: "TRY_AGAIN_LATER",
    Error: "ERROR",
};


export const ERRORS = {
    UNSUPPORTED_NETWORK:
      "Unsupported network selected, please use Futurenet in Freighter",
    FREIGHTER_NOT_AVAILABLE: "Please install Freighter to connect your wallet",
    UNABLE_TO_SUBMIT_TX: "Unable to submit transaction",
    UNABLE_TO_SIGN_TX: "Unable to sign transaction",
    WALLET_CONNECTION_REJECTED: "Wallet connection rejected",
  };