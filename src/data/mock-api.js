//@flow
import URL from "url";
import findIndex from "lodash/findIndex";
import { denormalize } from "normalizr-gre";
import mockEntities, { genBalance } from "./mock-entities.js";
import schema from "./schema";
import type { Operation, Account } from "data/types";

const keywordsMatchesOperation = (
  keywords: string,
  op: Operation,
  acc: Account
): boolean =>
  !keywords || keywords.split(/\s+/).every(w => acc.name.includes(w));

const mockSync = (uri: string, method: string, body: ?Object) => {
  const q = URL.parse(uri, true);
  if (method === "POST") {
    let m;
    m = /^\/accounts\/([^/]+)\/settings$/.exec(uri);
    if (m) {
      const account = mockEntities.accounts[m[1]];
      if (!body) throw new Error("invalid body");
      if (account) {
        const accountObj: Account = denormalize(
          account.id,
          schema.Account,
          mockEntities
        );
        account.name = body.name;
        account.settings = body.settings;
        return accountObj;
      } else {
        throw new Error("Account Not Found");
      }
    }
    switch (uri) {
      case "/organization/account":
        return denormalize(
          Object.keys(mockEntities.accounts["0"]),
          [schema.Account],
          mockEntities
        );
      default:
    }
  }

  if (method === "DELETE") {
    return {};
  }

  if (method === "PUT") {
    let m;
    m = /^\/operations\/([^/]+)$/.exec(uri);
    if (m) {
      return {};
    }

    m = /^\/accounts\/([^/]+)$/.exec(uri);
    if (m) {
      return {};
    }
  }

  if (method === "POST" && uri === "/authenticate") {
    return {
      token: "3aQhFCsHhG0Bc4ohkbWa0_6exrT8UZCGDzgEkGRn7Pg"
    };
  }
  if (method === "POST" && uri === "/provisioning/seed/open_shards_channel") {
    return {
      shards_channel: {
        pub_key: "shard_pub_key",
        certificate: "shard_certificate"
      }
    };
  }
  if (method === "POST" && uri === "/provisioning/seed/shards") {
    return {
      success: true
    };
  }
  if (method === "POST" && uri === "/provisioning/administrators/register") {
    return {
      token: "3aQhFCsHhG0Bc4ohkbWa0_6exrT8UZCGDzgEkGRn7Pg"
    };
  }
  if (method === "POST" && uri === "/provisioning/administrators/commit") {
    return {
      success: "true"
    };
  }

  if (method === "GET") {
    let m;
    m = /^\/accounts\/([^/]+)$/.exec(uri);
    if (m) {
      const account = mockEntities.accounts[m[1]];
      if (account) {
        return denormalize(account.id, schema.Account, mockEntities);
      } else {
        throw new Error("Account Not Found");
      }
    }
    m = /^\/operations\/([^/]+)\/with-account/.exec(uri);
    if (m) {
      const operationEntity = mockEntities.operations[m[1]];
      if (operationEntity) {
        const operation = denormalize(
          operationEntity.uuid,
          schema.Operation,
          mockEntities
        );
        const account = denormalize(
          operation.account_id,
          schema.Account,
          mockEntities
        );
        return { operation, account };
      } else {
        throw new Error("Operation Not Found");
      }
    }

    m = q && q.pathname && /^\/valid-address\/(.+)/.exec(q.pathname);
    if (m) {
      const { address } = q.query || {};
      if (address) {
        // fake mock address validation
        const valid = address.length > 10;
        return { valid };
      } else {
        throw new Error("missing address in query param");
      }
    }

    m = q && q.pathname && /^\/search\/operations$/.exec(q.pathname);
    if (m) {
      const operations = Object.keys(mockEntities.operations);
      let { keywords, currencyName, accountId, first, after } = {
        first: 50,
        after: null,
        ...q.query
      };
      first = Math.min(first, 100); // server is free to maximize the count number
      const cursorPrefixToNodeId = "C_"; // the cursor can be arbitrary and not necessarily === node.id
      let start = 0;
      const opKeys = operations.filter(key => {
        const op = denormalize(key, schema.Operation, mockEntities);
        const acc = denormalize(op.account_id, schema.Account, mockEntities);
        return (
          (!accountId || op.account_id === accountId) &&
          (!currencyName || op.currency_name === currencyName) &&
          keywordsMatchesOperation(keywords, op, acc)
        );
      });
      if (after !== null) {
        const i = findIndex(opKeys, k => "C_" + k === after);
        if (i === -1) {
          throw new Error("after cursor not found '" + after + "'");
        }
        start = i + 1;
      }
      const edges = opKeys.slice(start, start + first).map(key => ({
        node: denormalize(key, schema.Operation, mockEntities),
        cursor: cursorPrefixToNodeId + key
      }));
      const hasNextPage = opKeys.length > start + first;
      return { edges, pageInfo: { hasNextPage } };
    }

    m = q && q.pathname && /^\/accounts\/([^/]+)\/operations$/.exec(q.pathname);
    if (m) {
      const account = mockEntities.accounts[m[1]];
      if (account) {
        let { first, after } = { first: 50, after: null, ...q.query };
        first = Math.min(first, 100); // server is free to maximize the count number
        const cursorPrefixToNodeId = "C_"; // the cursor can be arbitrary and not necessarily === node.id
        let start = 0;
        const opKeys = Object.keys(mockEntities.operations).filter(
          key => mockEntities.operations[key].account_id === account.id
        );
        if (after !== null) {
          const i = findIndex(opKeys, k => "C_" + k === after);
          if (i === -1) {
            throw new Error("after cursor not found '" + after + "'");
          }
          start = i + 1;
        }
        const edges = opKeys.slice(start, start + first).map(key => ({
          node: denormalize(key, schema.Operation, mockEntities),
          cursor: cursorPrefixToNodeId + key
        }));
        const hasNextPage = opKeys.length > start + first;
        return { edges, pageInfo: { hasNextPage } };
      } else {
        throw new Error("Account Not Found");
      }
    }

    m = /^\/calculate-fee\/([^/]+)\/([^/]+)$/.exec(uri);
    if (m) {
      const currency = mockEntities.currencies[m[1]];
      if (!currency) {
        throw new Error("currency not found");
      }
      const speed = m[2];
      const mockValuePerSpeed = {
        slow: 3000,
        medium: 6000,
        fast: 12000
      };
      if (!(speed in mockValuePerSpeed)) {
        throw new Error("calculate-fee: invalid speed");
      }
      return { value: mockValuePerSpeed[speed] };
    }

    m = /^\/accounts\/([^/]+)\/(balance\?range=)([^/]+)$/.exec(uri);
    // FIXME ^ use `q` instead
    if (m) {
      return genBalance(parseInt(m[1], 10), m[3]);
    }

    switch (uri) {
      case "/onboarding_status":
        return {
          status: 0
        };
      case "/provisioning/administrators/register":
        return {
          challenge: "challenge_register"
        };
      case "/provisioning/administrators/commit_challenge":
        return {
          challenge: "challenge_commit"
        };
      case "/provisioning/seed/shards_channel_challenge":
        return {
          challenge:
            "fd4262bdc6f348832785920252b2e47df85dd1abb90882ae74460c16be7948bb"
        };
      case "/authentication_challenge":
        return {
          challenge:
            "fd4262bdc6f348832785920252b2e47df85dd1abb90882ae74460c16be7948bb",
          handles: [
            "654f16d2cd3ca82a52dd40b402fbb2c3d981c154abd4e16bcd56362e38db6c2e",
            "16ebae3897572bd156add68ff048d4180f9d0cd89e7159f1eda42c5521683756"
          ],
          id: "64696675-350d-43b0-a2de-0cdc5882ba6c"
        };

      case "/currencies":
        return denormalize(
          Object.keys(mockEntities.currencies),
          [schema.Currency],
          mockEntities
        );
      case "/organization/members/me":
        return denormalize(
          Object.keys(mockEntities.members)[0],
          schema.Member,
          mockEntities
        );
      case "/organization/members":
        return denormalize(
          Object.keys(mockEntities.members),
          [schema.Member],
          mockEntities
        );
      case "/organization/approvers":
        return denormalize(
          Object.keys(mockEntities.members).slice(0, 2),
          [schema.Member],
          mockEntities
        );
      case "/accounts":
        return denormalize(
          Object.keys(mockEntities.accounts),
          [schema.Account],
          mockEntities
        );
      case "/pendings":
        return denormalize(
          {
            approveOperations: Object.keys(mockEntities.operations).slice(0, 3),
            watchOperations: Object.keys(mockEntities.operations).slice(4, 7),
            approveAccounts: Object.keys(mockEntities.accounts).slice(0, 2),
            watchAccounts: Object.keys(mockEntities.accounts).slice(2, 4)
          },
          {
            approveOperations: [schema.Operation],
            watchOperations: [schema.Operation],
            approveAccounts: [schema.Account],
            watchAccounts: [schema.Account]
          },
          mockEntities
        );
      case "/dashboard/total-balance":
        return {
          currencyName: "EUR",
          date: new Date().toISOString(),
          value: 1589049,
          valueHistory: {
            yesterday: 1543125,
            week: 1031250,
            month: 2043125
          },
          accountsCount: 5,
          currenciesCount: 4,
          membersCount: 8
        };
      case "/dashboard/last-operations":
        return denormalize(
          Object.keys(mockEntities.operations).slice(0, 6),
          [schema.Operation],
          mockEntities
        );
      case "/settings-data":
        return {
          blockchainExplorers: [
            {
              id: "blockchain.info"
            }
          ],
          countervalueSources: [
            {
              id: "kraken",
              fiats: ["EUR", "USD"]
            },
            {
              id: "btcchina",
              fiats: ["CNY"]
            }
          ]
        };
      default:
    }
  }
};

const delay = ms => new Promise(success => setTimeout(success, ms));

export default (uri: string, init: *): ?Promise<*> => {
  const method = typeof init.method === "string" ? init.method : "GET";
  const body = typeof init.body === "string" ? JSON.parse(init.body) : null;
  const mockRes = mockSync(uri, method, body);
  if (mockRes) {
    return delay(300 + 800 * Math.random())
      .then(() => {
        console.warn(
          "mock: " + method + " " + uri,
          body || "",
          "\n=>",
          mockRes
        );
        // if (Math.random() < 0.3) throw new Error("MOCK_HTTP_FAILURE");
        return {
          status: 200,
          json: () => Promise.resolve(mockRes)
        };
      })
      .catch(e => {
        console.warn("mock: " + method + " " + uri + " FAILED", e);
        throw e;
      });
  } else {
    return null;
  }
};
