jest.mock("network", () => jest.fn());
import network from "network";
import reducer, {
  GOT_SHARDS_CHANNEL,
  ADD_SIGNEDIN,
  COMMIT_ADMINISTRATORS,
  GOT_CHALLENGE_REGISTRATION,
  EDIT_MEMBER,
  GO_TO_STEP,
  NEXT_STEP,
  TOGGLE_GENERATE_SEED,
  ADD_MEMBER,
  VIEW_ROUTE,
  TOGGLE_SIGNIN,
  TOGGLE_MODAL_PROFILE,
  GOT_COMMIT_CHALLENGE,
  GOT_BOOTSTRAP_CHALLENGE,
  GOT_BOOTSTRAP_TOKEN,
  SUCCESS_SEED_SHARDS,
  CHANGE_NB_REQUIRED,
  ADD_SEED_SHARD,
  PREV_STEP,
  SET_ONBOARDING_STATUS,
  previousStep,
  setAdminScheme,
  nextStep,
  goToStep,
  gotShardsChannel,
  addMember,
  gotCommitChallenge,
  toggleModalProfile,
  openShardsChannel,
  changeNbRequired,
  gotBootstrapChallenge,
  toggleSignin,
  toggleGenerateSeed,
  addSeedShard,
  viewRoute,
  setOnboardingStatus,
  gotBootstrapToken,
  getCommitChallenge,
  provisioningShards
} from "redux/modules/onboarding";

test("goToStep should send GO_TO_STEP and the step label", () => {
  expect(goToStep("label")).toEqual({
    type: GO_TO_STEP,
    step: "label"
  });
});

test("gotShardsChannel should send GOT_SHARDS_CHANNEL and channels", () => {
  expect(gotShardsChannel("channel")).toEqual({
    type: GOT_SHARDS_CHANNEL,
    shards_channel: "channel"
  });
});

test("nextStep should send NEXT_STEP", () => {
  expect(nextStep()).toEqual({
    type: NEXT_STEP
  });
});

test("previousStep should send PREV_STEP", () => {
  expect(previousStep()).toEqual({
    type: PREV_STEP
  });
});

test("toggleSinin should send TOGGLE_SIGNIN", () => {
  expect(toggleSignin()).toEqual({
    type: TOGGLE_SIGNIN
  });
});

test("toggleGenerateSeed should send TOGGLE_GENERATE_SEED", () => {
  expect(toggleGenerateSeed()).toEqual({
    type: TOGGLE_GENERATE_SEED
  });
});

test("addSeedShard should send ADD_SEED_SHARD and the data", () => {
  expect(addSeedShard({ data: true })).toEqual({
    type: ADD_SEED_SHARD,
    data: { data: true }
  });
});

test("toggleModalProfile should send TOGGLE_MODAL_PROFILE and the member", () => {
  expect(toggleModalProfile({ data: true })).toEqual({
    type: TOGGLE_MODAL_PROFILE,
    member: { data: true }
  });
});

test("addMember should send ADD_MEMBER and the member", () => {
  expect(addMember({ data: true })).toEqual({
    type: ADD_MEMBER,
    member: { data: true }
  });
});

test("gotBootstrapChallenge should send GOT_BOOTSTRAP_CHALLENGE and the challenge", () => {
  expect(gotBootstrapChallenge({ data: true })).toEqual({
    type: GOT_BOOTSTRAP_CHALLENGE,
    challenge: { data: true }
  });
});
test("changeNbRequired should send CHANGE_NB_REQUIRED and the number", () => {
  expect(changeNbRequired(2)).toEqual({
    type: CHANGE_NB_REQUIRED,
    nb: 2
  });
});

test("viewRoute should send VIEW_ROUTE and the route", () => {
  expect(viewRoute({ data: true })).toEqual({
    type: VIEW_ROUTE,
    route: { data: true }
  });
});

test("setOnboardingStatus should send SET_ONBOARDING_STATUS and the status", () => {
  expect(setOnboardingStatus(2)).toEqual({
    type: SET_ONBOARDING_STATUS,
    status: 2
  });
});

test("gotCommitChallenge should send GOT_COMMIT_CHALLENGE and the challenge", () => {
  expect(gotCommitChallenge({ data: true })).toEqual({
    type: GOT_COMMIT_CHALLENGE,
    challenge: { data: true }
  });
});

test("getCommitChallenge should call the API then GOT_COMMIT_CHALLENGE", async () => {
  network.mockImplementation(() => "challenge");
  const dispatch = jest.fn();
  const thunk = getCommitChallenge();
  await thunk(dispatch);
  expect(network).toHaveBeenCalledWith(
    "/provisioning/administrators/commit_challenge",
    "GET"
  );

  expect(dispatch).toHaveBeenCalledWith({
    type: GOT_COMMIT_CHALLENGE,
    challenge: "challenge"
  });
});

test("setAdminScheme should call the API with right paremets", async () => {
  const dispatch = jest.fn();
  const thunk = setAdminScheme();
  const getState = () => ({ onboarding: { nbRequired: 3 } });
  await thunk(dispatch, getState);
  expect(network).toHaveBeenCalledWith(
    "/provisioning/administrators/rules",
    "POST",
    { quorum: 3 }
  );
});

test("provisioningShards should call the API with right parameters and dispatch SUCCESS_SEED_SHARDS", async () => {
  const dispatch = jest.fn();
  const thunk = provisioningShards({ data: true });
  await thunk(dispatch);
  expect(network).toHaveBeenCalledWith("/provisioning/seed/shards", "POST", {
    data: true
  });

  expect(dispatch).toHaveBeenCalledWith({ type: SUCCESS_SEED_SHARDS });
});

test("openShardsChannel should call the API and dispatch GOT_SHARDS_CHANNEL", async () => {
  network.mockImplementation(() => {
    return new Promise(resolve => resolve({ shards_channel: "shards" }));
  });
  const dispatch = jest.fn();
  const thunk = openShardsChannel();
  const getState = () => ({ onboarding: { signed: ["1"] } });
  await thunk(dispatch, getState);
  expect(network).toHaveBeenCalledWith(
    "/provisioning/seed/open_shards_channel",
    "POST",
    {
      signed: ["1"]
    }
  );

  expect(dispatch).toHaveBeenCalledWith({
    type: GOT_SHARDS_CHANNEL,
    shards_channel: "shards"
  });
});

test("gotBootstrapToken should store in localStorage and dispatch GOT_BOOTSTRAP_TOKEN", () => {
  global.window = {
    localStorage: {
      setItem: jest.fn()
    }
  };
  const dispatch = jest.fn();
  const thunk = gotBootstrapToken("token");

  thunk(dispatch);
  expect(global.window.localStorage.setItem).toHaveBeenCalledWith(
    "token",
    "token"
  );

  expect(dispatch).toHaveBeenCalledWith({
    type: GOT_BOOTSTRAP_TOKEN,
    token: "token"
  });
});

// testing the reducer
test("when SUCCESS_SEED_SHARDS reducer should set successSeedShards to true", () => {
  const state = { successSeedShards: false };
  expect(reducer(state, { type: SUCCESS_SEED_SHARDS })).toEqual({
    successSeedShards: true
  });
});

test("when SUCCESS_SEED_SHARDS reducer should set successSeedShards to true", () => {
  const state = { successSeedShards: false };
  expect(reducer(state, { type: SUCCESS_SEED_SHARDS })).toEqual({
    successSeedShards: true
  });
});

test("when COMMIT_ADMINISTRATORS reducer should set commited_administrators to true", () => {
  const state = { committed_administrators: false };
  expect(reducer(state, { type: COMMIT_ADMINISTRATORS })).toEqual({
    committed_administrators: true
  });
});
test("when CHANGE_NB_REQUIRED reducer should set nbRequired", () => {
  const state = { nbRequired: 0, members: ["1", "2", "3"] };
  expect(reducer(state, { type: CHANGE_NB_REQUIRED, nb: 2 })).toEqual({
    nbRequired: 2,
    members: ["1", "2", "3"]
  });
});
test("when CHANGE_NB_REQUIRED reducer should not set nbRequired if it's sup to members.length", () => {
  const state = { nbRequired: 3, members: ["1", "2", "3"] };
  expect(reducer(state, { type: CHANGE_NB_REQUIRED, nb: 4 })).toEqual({
    nbRequired: 3,
    members: ["1", "2", "3"]
  });
});

test("when CHANGE_NB_REQUIRED reducer should not set nbRequired if it's 0", () => {
  const state = { nbRequired: 1, members: ["1", "2", "3"] };
  expect(reducer(state, { type: CHANGE_NB_REQUIRED, nb: 0 })).toEqual({
    nbRequired: 1,
    members: ["1", "2", "3"]
  });
});

test("when TOGGLE_MODAL_PROFILE reducer should set modalProfile and editMember", () => {
  const state = { modalProfile: false };
  expect(
    reducer(state, { type: TOGGLE_MODAL_PROFILE, member: { data: true } })
  ).toEqual({
    modalProfile: true,
    editMember: { data: true }
  });
});

test("when ADD_SIGNEDIN reducer should add the signed", () => {
  const state = { signed: [] };
  expect(
    reducer(state, {
      type: ADD_SIGNEDIN,
      data: { pub_key: "e", name: "edit" }
    })
  ).toEqual({
    signed: [{ pub_key: "e", name: "edit" }]
  });
});

test("when ADD_SIGNEDIN reducer should not add to signed if already", () => {
  const state = { signed: [{ pub_key: { pubKey: "a" } }] };
  expect(
    reducer(state, {
      type: ADD_SIGNEDIN,
      data: { pub_key: { pubKey: "a" } }
    })
  ).toEqual({
    signed: [{ pub_key: { pubKey: "a" } }]
  });
});

test("when GOT_BOOTSTRAP_CHALLENGE reducer should set bootstrapChallenge", () => {
  const state = { bootstrapChallenge: null };
  expect(
    reducer(state, { type: GOT_BOOTSTRAP_CHALLENGE, challenge: "chal" })
  ).toEqual({
    bootstrapChallenge: "chal"
  });
});

test("when GOT_BOOTSTRAP_TOKEN reducer should set bootstrapAuthToken", () => {
  const state = { bootstrapAuthToken: null };
  expect(
    reducer(state, { type: GOT_BOOTSTRAP_TOKEN, token: "token" })
  ).toEqual({
    bootstrapAuthToken: "token"
  });
});

test("when GOT_CHALLENGE_REGISTRATION reducer sould set the challenge_registration", () => {
  const state = { challenge_registration: null };
  expect(
    reducer(state, { type: GOT_CHALLENGE_REGISTRATION, challenge: "cha" })
  ).toEqual({
    challenge_registration: "cha",
    isLoadingChallengeRegistration: false
  });
});

test("when TOGGLE_GENERATE_SEED reducer should set generateSeedModal to true", () => {
  const state = { generateSeedModal: false };
  expect(reducer(state, { type: TOGGLE_GENERATE_SEED })).toEqual({
    generateSeedModal: true
  });
});
test("when EDIT_MEMBER reducer should edit the correct member in state.members", () => {
  const state = { members: [{ pub_key: "e" }, { pub_key: "d" }] };
  expect(
    reducer(state, {
      type: EDIT_MEMBER,
      member: { pub_key: "e", name: "edit" }
    })
  ).toEqual({
    members: [{ pub_key: "e", name: "edit" }, { pub_key: "d" }]
  });
});

test("when ADD_SEED_SHARD reducer should add the seed the shards", () => {
  const state = { shards: ["shard1"] };
  expect(reducer(state, { type: ADD_SEED_SHARD, data: "shard2" })).toEqual({
    shards: ["shard1", "shard2"]
  });
});
