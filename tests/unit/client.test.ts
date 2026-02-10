import { expect } from "chai";
import { Connection, Keypair } from "@solana/web3.js";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { PredMarketClient, PROGRAM_ID } from "../../src";

describe("PredMarketClient Construction", () => {
  const dummyConnection = new Connection("http://localhost:8899", "confirmed");
  const dummyWallet = {
    publicKey: Keypair.generate().publicKey,
    signTransaction: async (tx: any) => tx,
    signAllTransactions: async (txs: any) => txs,
  } as Wallet;

  it("throws when neither provider nor connection given", () => {
    expect(() => new PredMarketClient({})).to.throw(
      "PredMarketClient requires either a provider or a connection"
    );
  });

  it("readOnly(connection) creates client with all modules", () => {
    const client = PredMarketClient.readOnly(dummyConnection);
    expect(client).to.be.instanceOf(PredMarketClient);
    expect(client.programId.toBase58()).to.equal(PROGRAM_ID.toBase58());
  });

  it("fromProvider creates client", () => {
    const provider = new AnchorProvider(dummyConnection, dummyWallet, {
      commitment: "confirmed",
    });
    const client = PredMarketClient.fromProvider(provider);
    expect(client).to.be.instanceOf(PredMarketClient);
  });

  it("all 9 module properties exist", () => {
    const client = PredMarketClient.readOnly(dummyConnection);
    expect(client.markets).to.not.be.undefined;
    expect(client.marketInfo).to.not.be.undefined;
    expect(client.trading).to.not.be.undefined;
    expect(client.positions).to.not.be.undefined;
    expect(client.resolution).to.not.be.undefined;
    expect(client.voteResolution).to.not.be.undefined;
    expect(client.admin).to.not.be.undefined;
    expect(client.accounts).to.not.be.undefined;
    expect(client.events).to.not.be.undefined;
  });

  it("accepts custom programId", () => {
    const customId = Keypair.generate().publicKey;
    const client = PredMarketClient.readOnly(dummyConnection, customId);
    expect(client.programId.toBase58()).to.equal(customId.toBase58());
  });

  it("program property is set", () => {
    const client = PredMarketClient.readOnly(dummyConnection);
    expect(client.program).to.not.be.undefined;
  });
});
