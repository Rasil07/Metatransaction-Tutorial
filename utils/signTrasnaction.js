//    chainId: 97,

const {
  keccak256,
  defaultAbiCoder,
  toUtf8Bytes,
  solidityPack,
} = require("ethers/lib/utils");

const { ecsign } = require("ethereumjs-util");

function PERMIT_TYPEHASH() {
  return keccak256(
    toUtf8Bytes(
      "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
    )
  );
}

function getDomainSeparator(name, contractAddress, chainId) {
  return keccak256(
    defaultAbiCoder.encode(
      ["bytes32", "bytes32", "bytes32", "uint256", "address"],
      [
        keccak256(
          toUtf8Bytes(
            "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
          )
        ),
        keccak256(toUtf8Bytes(name)),
        keccak256(toUtf8Bytes("1")),
        chainId,
        contractAddress,
      ]
    )
  );
}

const sign = (digest, privateKey) => {
  return ecsign(Buffer.from(digest.slice(2), "hex"), privateKey);
};

const getPermitDigest = async (
  name,
  address,
  chainId,
  approve,
  nonce,
  deadline
) => {
  const DOMAIN_SEPARATOR = getDomainSeparator(name, address, chainId);

  const hash = keccak256(
    solidityPack(
      ["bytes1", "bytes1", "bytes32", "bytes32"],
      [
        "0x19",
        "0x01",
        DOMAIN_SEPARATOR,
        keccak256(
          defaultAbiCoder.encode(
            ["bytes32", "address", "address", "uint256", "uint256", "uint256"],
            [
              PERMIT_TYPEHASH(),
              approve.owner,
              approve.spender,
              approve.value,
              nonce,
              deadline,
            ]
          )
        ),
      ]
    )
  );
  console.log(hash);
  return hash;
};

module.exports = {
  sign,
  PERMIT_TYPEHASH,
  getDomainSeparator,
  getPermitDigest,
};
