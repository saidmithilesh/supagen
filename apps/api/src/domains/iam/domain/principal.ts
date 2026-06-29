export type ExternalIdentityRef = {
  provider: "clerk" | string;
  subject: string;
};

export type HumanUserPrincipal = {
  kind: "human-user";
  credential: {
    type: "clerk-session";
    provider: "clerk";
    providerSubject: string;
    sessionId: string | null;
  };
  actor: {
    type: "human-user";
    externalIdentity: ExternalIdentityRef;
  };
  scopes: string[];
};

export type DelegatedAgentPrincipal = {
  kind: "delegated-agent";
  credential: {
    type: "mcp-delegation";
    credentialId: string;
  };
  actor: {
    type: "agent";
    agentId: string;
  };
  onBehalfOf: {
    type: "human-user";
    userId: string;
  };
  scopes: string[];
};

export type ServicePrincipal = {
  kind: "service";
  credential: {
    type: "service-token";
    credentialId: string;
  };
  actor: {
    type: "service";
    serviceId: string;
  };
  scopes: string[];
};

export type Principal =
  | HumanUserPrincipal
  | DelegatedAgentPrincipal
  | ServicePrincipal;
