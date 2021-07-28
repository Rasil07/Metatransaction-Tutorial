const { expect } = require("chai");

const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");
// @ts-ignore

const {
  PERMIT_TYPEHASH,
  getPermitDigest,
  getDomainSeparator,
  sign,
} = require("../utils/signTrasnaction");

describe("TestERC20", () => {
  let ImportedContract;
  let deployedContract;
  let name;

  const chainId = 97;
  const signerPrivateKey = Buffer.from(
    "a981e2c14fe041b9c0ec1c198fd0f05daf0922b9aa49a2a1c5eaf3eec7099dca",
    "hex"
  );

  let totalSupply = 1000000000;
  let owner;
  let accounts;

  beforeEach(async () => {
    [owner, accounts] = await ethers.getSigners();
    ImportedContract = await ethers.getContractFactory("TestERC20");
    deployedContract = await ImportedContract.deploy(totalSupply, chainId);
    name = await deployedContract.name();
    let chain = await deployedContract.chainId();
    console.log({ name, chain });
  });

  it("contract should be deployed", async () => {
    let supply = BigNumber.from(
      await deployedContract.totalSupply()
    ).toNumber();

    expect(supply).to.equal(totalSupply);
    expect(await owner.getAddress()).to.equal(
      deployedContract.deployTransaction.from
    );
  });

  it("initializes DOMAIN_SEPARATOR and PERMIT_TYPEHASH correctly", async () => {
    expect(await deployedContract.PERMIT_TYPEHASH()).to.equal(
      PERMIT_TYPEHASH()
    );

    expect(await deployedContract.DOMAIN_SEPARATOR()).to.equal(
      getDomainSeparator(name, deployedContract.address, chainId)
    );
  });

  it("permits and emits Approval (replay safe)", async () => {
    // Create the approval request
    const approve = {
      owner: owner.address,
      spender: accounts.address,
      value: 100,
    };

    // deadline as much as you want in the future
    const deadline = 100000000000000;

    // Get the user's nonce
    const nonce = await deployedContract.nonces(owner.address);

    // Get the EIP712 digest
    const digest = await getPermitDigest(
      name,
      deployedContract.address,
      chainId,
      approve,
      nonce,
      deadline
    );

    // Sign it
    // NOTE: Using web3.eth.sign will hash the message internally again which
    // we do not want, so we're manually signing here
    const { v, r, s } = sign(digest, signerPrivateKey);

    let ownerBalance;
    let signerBalance;
    let signer = new ethers.Wallet(signerPrivateKey, owner.provider);
    signerBalance = await signer.getBalance();

    ownerBalance = await owner.getBalance();
    console.log("befre", {
      ownerBalance: ethers.utils.formatEther(ownerBalance),
    });
    console.log({ signerBalance });
    await expect(
      deployedContract.permit(
        approve.owner,
        approve.spender,
        approve.value,
        deadline,
        v,
        r,
        s
      )
    )
      .to.emit(deployedContract, "Approval")
      .withArgs(approve.owner, approve.spender, approve.value);
    ownerBalance = await owner.getBalance();
    signerBalance = await signer.getBalance();

    console.log("after", {
      ownerBalance: ethers.utils.formatEther(ownerBalance),
      signerBalance: ethers.utils.formatEther(signerBalance),
    });

    expect(await deployedContract.nonces(owner.address)).to.equal(1);

    expect(
      await deployedContract.allowance(approve.owner, approve.spender)
    ).to.equal(approve.value);

    expect(
      deployedContract.permit(
        approve.owner,
        approve.spender,
        approve.value,
        deadline,
        v,
        r,
        s
      )
    ).to.be.reverted;

    // invalid ecrecover's return address(0x0), so we must also guarantee that
    // this case fails

    expect(
      deployedContract.permit(
        "0x0000000000000000000000000000000000000000",
        approve.spender,
        approve.value,
        deadline,
        "0x99",
        r,
        s
      ),
      "ERC20Permit: invalid signature"
    );
  });

  // It worked!
  // assert.equal(event.event, "Approval");

  // expect(event.event).to.equal("Approval");
  // assert.equal(await token.nonces(owner), 1);

  // assert.equal(
  //   await token.allowance(approve.owner, approve.spender),
  //   approve.value
  // );

  // Re-using the same sig doesn't work since the nonce has been incremented
  // on the contract level for replay-protection
});
